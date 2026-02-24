"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, CheckCircle2, XCircle, Flag, Loader2, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/protected-route"
import { useQuery, useMutation } from "@tanstack/react-query"
import { evaluationService, learnerService } from "@/lib/api/services"
import { toast } from "sonner"
import { SatisfactionModal } from "@/components/satisfaction-modal"
import { serializeData } from "@/lib/utils/serialize"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/contexts/language-context"
import { useAuthStore } from "@/lib/store/auth-store"

interface ExamPageProps {
  params: Promise<{ courseId: string; examId: string }>
}

export default function ExamPage({ params }: ExamPageProps) {
  const { courseId, examId } = use(params)
  const router = useRouter()
  const { t } = useLanguage()
  const user = useAuthStore((s) => s.user)
  const examIdNum = Number.parseInt(examId)
  const courseIdNum = Number.parseInt(courseId)

  // Vérifier que toutes les leçons sont terminées avant d'autoriser l'évaluation
  const { data: courseProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["courseProgress", courseIdNum],
    queryFn: () => learnerService.getCourseProgress(courseIdNum),
    enabled: !Number.isNaN(courseIdNum),
  })
  const totalLessons = courseProgress?.totalLessons ?? 0
  const completedLessonsCount = courseProgress?.completedLessons ?? 0
  const allLessonsCompleted = totalLessons > 0 && completedLessonsCount >= totalLessons

  // Charger l'examen depuis l'API (avec examId pour récupérer le bon quiz avec questions)
  const {
    data: exam,
    isLoading: isLoadingExam,
    error: examError,
  } = useQuery({
    queryKey: ["exam", courseIdNum, examIdNum],
    queryFn: async () => {
      const response = await evaluationService.getCourseExam(courseIdNum, examIdNum)
      if (!response.ok) throw new Error(response.message || t("exam.examNotFound"))
      const examPayload = (response as any).data
      if (!examPayload || typeof examPayload !== "object") throw new Error(t("exam.examNotFound"))
      return serializeData(examPayload)
    },
    enabled: !Number.isNaN(examIdNum) && !Number.isNaN(courseIdNum),
  })

  // Si l'apprenant a déjà réussi cet examen, afficher un blocage explicite (pas de repassage)
  const { data: latestAttempt } = useQuery({
    queryKey: ["examLatestAttemptCheck", examIdNum],
    queryFn: async () => {
      const response = await evaluationService.getLatestAttemptForExam(examIdNum)
      if (response.ok && response.data) {
        const data = (response.data as any)?.data ?? response.data
        return data
      }
      return null
    },
    enabled: !!exam && !Number.isNaN(examIdNum),
  })
  const alreadyPassed = (latestAttempt as any)?.status === "PASSED"
  const passedAttemptId = (latestAttempt as any)?.id ?? (latestAttempt as any)?.attemptId

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number[] | string>>({})
  const [markedForReview, setMarkedForReview] = useState<number[]>([])
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false)
  const [submittedAttemptId, setSubmittedAttemptId] = useState<number | null>(null)

  const [examStep, setExamStep] = useState<"form" | "exam">("form")
  const [certificateName, setCertificateName] = useState("")
  const [certificateEmail, setCertificateEmail] = useState("")

  // Ne plus restaurer l'étape "exam" depuis sessionStorage : chaque apprenant doit
  // toujours voir le formulaire (nom complet + email pour le certificat) avant l'évaluation,
  // pour éviter d'afficher le nom/email d'un autre utilisateur (ex. ancienne session).
  useEffect(() => {
    const key = `exam-started-${courseId}-${examId}`
    try {
      const saved = typeof window !== "undefined" ? sessionStorage.getItem(key) : null
      if (saved) {
        const { name } = JSON.parse(saved)
        setCertificateName(name || "")
        // On préremplit uniquement le nom ; l'email est forcé à celui du compte
      }
    } catch (_) {}
  }, [courseId, examId])

  // Forcer l'email de certificat à celui du compte (non modifiable dans le formulaire)
  useEffect(() => {
    if (user?.email) {
      setCertificateEmail(user.email)
    }
  }, [user?.email])

  // Utiliser les questions de l'examen (plusieurs formes possibles selon le backend)
  const questions: any[] = (() => {
    const e = exam as any
    if (!e) return []
    if (Array.isArray(e?.questions)) return e.questions
    if (Array.isArray(e?.questionsList)) return e.questionsList
    if (e?.data && Array.isArray(e.data?.questions)) return e.data.questions
    return []
  })()
  
  const question = questions[currentQuestion]
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0
  const hasNoQuestions = questions.length === 0

  const handleAnswer = (value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleMarkForReview = () => {
    if (markedForReview.includes(currentQuestion)) {
      setMarkedForReview(markedForReview.filter((q) => q !== currentQuestion))
    } else {
      setMarkedForReview([...markedForReview, currentQuestion])
    }
  }

  // Mutation pour soumettre l'examen
  const submitExamMutation = useMutation({
    mutationFn: async () => {
      // Envoyer les réponses avec l'ID de la question comme clé (pas l'index) pour que le backend
      // associe correctement chaque réponse à la question, quel que soit l'ordre.
      const answersMap: Record<number, number | string> = {}
      questions.forEach((q: any, index: number) => {
        const answer = answers[index]
        if (answer === undefined || answer === null) return
        const questionId = q?.id ?? q?.questionId ?? index
        if (Array.isArray(answer)) {
          answersMap[questionId] = (answer[0] as number) ?? 0
        } else if (typeof answer === 'string') {
          // Choix unique (RadioGroup renvoie une string) ou réponse texte
          const qType = q?.type
          if (qType === "SINGLE_CHOICE" || qType === "QCM") {
            const num = Number.parseInt(answer, 10)
            answersMap[questionId] = Number.isNaN(num) ? 0 : num
          } else {
            answersMap[questionId] = answer
          }
        } else {
          answersMap[questionId] = (answer as number) ?? 0
        }
      })

      const response = await evaluationService.submitExam(examIdNum, answersMap, {
        certificateDisplayName: certificateName?.trim() || undefined,
        certificateEmail: certificateEmail?.trim() || undefined,
      })
      if (response.ok && response.data) {
        // La réponse backend est dans CResponse, donc response.data contient les données
        // Si response.data est un objet avec une propriété data, extraire celle-ci
        const attemptData = response.data?.data || response.data
        return attemptData
      }
      throw new Error(response.message || "Erreur lors de la soumission")
    },
    onSuccess: (data: any) => {
      const attemptId = data?.id || data?.data?.id || (data?.data && typeof data.data === 'object' && data.data.id ? data.data.id : null)
      if (attemptId && typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            `exam-certificate-${attemptId}`,
            JSON.stringify({ name: certificateName || "", email: certificateEmail || "" })
          )
        } catch (_) {}
      }
      if (attemptId) {
        setSubmittedAttemptId(attemptId)
        setShowSatisfactionModal(true)
      } else {
        // Essayer de récupérer depuis la structure de réponse CResponse
        const responseData = data?.data || data
        if (responseData?.id) {
          setSubmittedAttemptId(responseData.id)
          setShowSatisfactionModal(true)
        } else {
          toast.error(t("common.error") || "Error", {
            description: t("exam.couldNotGetAttemptId"),
          })
        }
      }
    },
    onError: (error: any) => {
      const msg = error?.message || ""
      const alreadySubmitted = /déjà|already|déjà soumis|already submitted/i.test(msg)
      if (alreadySubmitted) {
        toast.info(t("exam.alreadyPassed") || "Vous avez déjà réussi cet examen", {
          description: t("exam.alreadyPassedCannotRetake") || "Vous ne pouvez pas repasser cette évaluation. Consultez vos résultats.",
          action: {
            label: t("exam.seeResults") || "Voir mes résultats",
            onClick: () => router.push(`/learn/${courseId}/exam/${examId}/results`),
          },
        })
      } else {
        toast.error(t("common.error") || "Error", {
          description: msg || t("exam.submitError"),
        })
      }
    },
  })

  const handleSubmit = () => {
    // Vérifier que toutes les questions ont une réponse
    const unansweredQuestions = questions.filter((_, index) => !answers[index])
    if (unansweredQuestions.length > 0) {
      toast.warning("Questions non répondues", {
        description: `Vous avez ${unansweredQuestions.length} question(s) sans réponse. Voulez-vous continuer ?`,
      })
    }
    submitExamMutation.mutate()
  }

  // Mutation pour soumettre la satisfaction
  const submitSatisfactionMutation = useMutation({
    mutationFn: async (satisfaction: { satisfaction: string; rating?: number }) => {
      if (!submittedAttemptId) throw new Error("ID de tentative manquant")
      const response = await evaluationService.submitSatisfaction(
        submittedAttemptId,
        satisfaction.satisfaction,
        satisfaction.rating
      )
      if (response.ok && response.data) {
        return response.data
      }
      throw new Error(response.message || "Erreur lors de la soumission de la satisfaction")
    },
    onSuccess: (data: any) => {
      toast.success("Satisfaction enregistrée", {
        description: "Vos résultats sont maintenant disponibles.",
      })
      setShowSatisfactionModal(false)
      // Récupérer l'ID de la tentative depuis la réponse ou utiliser celui stocké
      const attemptId = data?.id || data?.data?.id || submittedAttemptId
      if (attemptId) {
        // Rediriger vers la page des résultats avec l'ID de la tentative
        router.push(`/learn/${courseId}/exam/${examId}/results?attemptId=${attemptId}`)
      } else {
        router.push(`/learn/${courseId}/exam/${examId}/results`)
      }
    },
    onError: (error: any) => {
      toast.error("Erreur", {
        description: error?.message || "Erreur lors de la soumission de la satisfaction",
      })
    },
  })

  if (Number.isNaN(examIdNum) || Number.isNaN(courseIdNum)) {
    return <div>Paramètres invalides</div>
  }

  // Attendre la progression avant d'afficher l'examen ou le blocage
  if (isLoadingProgress) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Vérification de votre progression...</span>
      </div>
    )
  }

  // Bloquer l'accès si toutes les leçons ne sont pas terminées
  if (courseProgress && !allLessonsCompleted) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                {t("exam.evaluationUnavailable")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("exam.finishLessons")} ({completedLessonsCount}/{totalLessons} {t("exam.lessonsCompleted")}).
              </p>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push(`/learn/${courseId}`)} className="w-full">
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t("exam.backToCourse")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  if (isLoadingExam) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">{t("exam.loadingEvaluation")}</span>
      </div>
    )
  }

  if (examError || !exam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <XCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">{t("exam.examNotFound")}</h2>
        <p className="text-muted-foreground">{t("exam.examNotAvailable")}</p>
        <Button onClick={() => router.push(`/learn/${courseId}`)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("exam.backToCourse")}
        </Button>
      </div>
    )
  }

  // Déjà réussi : message clair + accès aux résultats (pas de repassage)
  if (alreadyPassed) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-2 border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                {t("exam.alreadyPassed")}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {t("exam.alreadyPassedCannotRetake")}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("exam.redirecting")}
              </p>
              <Button onClick={() => router.push(`/learn/${courseId}/exam/${examId}/results${passedAttemptId ? `?attemptId=${passedAttemptId}` : ""}`)} className="w-full" size="lg">
                {t("exam.seeResults")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  if (examStep === "form") {
    const handleStartExam = () => {
      const name = certificateName.trim()
      const email = certificateEmail.trim()
      if (!name || !email) {
        toast.error(t("exam.pleaseFillNameAndEmail"))
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error(t("exam.pleaseEnterValidEmail"))
        return
      }
      try {
        sessionStorage.setItem(
          `exam-started-${courseId}-${examId}`,
          JSON.stringify({ name, email })
        )
      } catch (_) {}
      setExamStep("exam")
    }

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-muted/30">
          <div className="container max-w-lg mx-auto px-4 py-8">
            <Button
              variant="ghost"
              onClick={() => router.push(`/learn/${courseId}`)}
              className="mb-6"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t("exam.backToCourse")}
            </Button>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  {t("exam.beforeStart")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("exam.certificateIntro")}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="certificate-name">{t("exam.fullName")}</Label>
                  <Input
                    id="certificate-name"
                    type="text"
                    placeholder="Prénom et nom"
                    value={certificateName}
                    onChange={(e) => setCertificateName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificate-email">{t("exam.email")}</Label>
                  <Input
                    id="certificate-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={certificateEmail}
                    readOnly
                    disabled
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Cette adresse est celle de votre compte et ne peut pas être modifiée ici.
                  </p>
                </div>
                <Button onClick={handleStartExam} className="w-full" size="lg">
                  {t("exam.startAssessment")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push(`/learn/${courseId}`)}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t("exam.backToCourse")}
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  {exam.title || t("exam.evaluationOfCourse")}
                </h1>
                <p className="text-muted-foreground mt-1">{exam.description || ""}</p>
              </div>
              <Badge variant="outline" className="text-sm">
                {questions.length > 0 ? `${t("exam.questionLabel")} ${currentQuestion + 1} / ${questions.length}` : t("exam.noQuestions")}
              </Badge>
            </div>
            <Progress value={progress} className="mt-4" />
          </div>

          {/* Aucune question dans cette évaluation */}
          {hasNoQuestions && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  {t("exam.noQuestionsInExam")}
                </p>
                <Button onClick={() => router.push(`/learn/${courseId}`)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {t("exam.backToCourse")}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Question Card */}
          {!hasNoQuestions && question && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Question {currentQuestion + 1}</CardTitle>
                  {markedForReview.includes(currentQuestion) && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Flag className="h-3 w-3" />
                      À revoir
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-base font-medium">{question.title || question.description}</p>
                </div>

                {/* Réponses */}
                {question.type === "QCM" || question.type === "SINGLE_CHOICE" ? (
                  <RadioGroup
                    value={answers[currentQuestion] as string}
                    onValueChange={handleAnswer}
                  >
                    {question.reponses?.map((response: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value={String(response.id)} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {response.title || response.description}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : question.type === "MULTIPLE_CHOICE" ? (
                  <div className="space-y-3">
                    {question.reponses?.map((response: any, index: number) => {
                      const currentAnswers = (answers[currentQuestion] as number[]) || []
                      const isChecked = currentAnswers.includes(response.id)
                      return (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer",
                            isChecked && "bg-primary/5 border-primary"
                          )}
                          onClick={() => {
                            const newAnswers = isChecked
                              ? currentAnswers.filter((id) => id !== response.id)
                              : [...currentAnswers, response.id]
                            handleAnswer(newAnswers)
                          }}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => {
                              const newAnswers = isChecked
                                ? currentAnswers.filter((id) => id !== response.id)
                                : [...currentAnswers, response.id]
                              handleAnswer(newAnswers)
                            }}
                          />
                          <Label className="flex-1 cursor-pointer">
                            {response.title || response.description}
                          </Label>
                          {isChecked && (
                            <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in duration-200" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Votre réponse</Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-lg"
                      value={(answers[currentQuestion] as string) || ""}
                      onChange={(e) => handleAnswer(e.target.value)}
                      placeholder="Tapez votre réponse ici..."
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-6 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                      Précédent
                    </Button>
                    <Button variant="ghost" onClick={handleMarkForReview}>
                      <Flag className={`h-4 w-4 mr-2 ${markedForReview.includes(currentQuestion) ? "fill-current" : ""}`} />
                      Marquer
                    </Button>
                  </div>

                  {currentQuestion === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={submitExamMutation.isPending}
                    >
                      {submitExamMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Soumission...
                        </>
                      ) : (
                        "Soumettre l'évaluation"
                      )}
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>Suivant</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation rapide */}
          {!hasNoQuestions && questions.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={cn(
                      "w-10 h-10 rounded-md border text-sm font-medium transition-colors",
                      currentQuestion === index
                        ? "bg-primary text-primary-foreground border-primary"
                        : answers[index]
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-background border-border hover:bg-muted",
                      markedForReview.includes(index) && "ring-2 ring-yellow-500"
                    )}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          )}
        </div>

        {/* Modal de satisfaction */}
        <SatisfactionModal
          open={showSatisfactionModal}
          onOpenChange={setShowSatisfactionModal}
          onSubmit={(satisfaction, rating) => {
            submitSatisfactionMutation.mutate({ satisfaction, rating })
          }}
          isLoading={submitSatisfactionMutation.isPending}
        />
      </div>
    </ProtectedRoute>
  )
}
