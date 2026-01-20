"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, CheckCircle2, XCircle, Flag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CircularProgress } from "@/components/circular-progress"
import { QuizMinimap } from "@/components/quiz-minimap"
import { QuizTimer } from "@/components/quiz-timer"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/protected-route"
import { useQuery } from "@tanstack/react-query"
import { quizService } from "@/lib/api/services"
import { adaptQuiz, adaptQuestion } from "@/lib/api/adapters"
import type { Quiz, QuizQuestion } from "@/lib/types"
import { toast } from "sonner"

interface QuizPageProps {
  params: Promise<{ courseId: string; quizId: string }>
}

export default function QuizPage({ params }: QuizPageProps) {
  const { courseId, quizId } = use(params)
  const router = useRouter()
  const quizIdNum = Number.parseInt(quizId)

  // Charger le quiz depuis l'API
  const {
    data: quiz,
    isLoading: isLoadingQuiz,
    error: quizError,
  } = useQuery({
    queryKey: ["quiz", quizIdNum],
    queryFn: () => quizService.getQuizById(quizIdNum),
    enabled: !Number.isNaN(quizIdNum),
  })

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number[] | string>>({}) // IDs de réponses ou texte
  const [markedForReview, setMarkedForReview] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes par défaut
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  // Utiliser les questions du quiz chargé depuis l'API
  const questions: QuizQuestion[] = quiz?.questions || []
  
  // Mettre à jour le timer avec la durée du quiz
  useEffect(() => {
    if (quiz?.timeLimit) {
      setTimeRemaining(quiz.timeLimit)
    }
  }, [quiz])

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleTimeUp = () => {
    handleSubmit()
  }

  // Timer countdown
  useEffect(() => {
    if (showResults || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [showResults, timeRemaining])

  const handleAnswer = (value: string | string[]) => {
    // Pour les QCM, on stocke les IDs des réponses sélectionnées
    // Pour les questions texte, on stocke le texte directement
    const question = questions[currentQuestion]
    if (question.type === "code" || question.type === "text") {
      setAnswers({ ...answers, [currentQuestion]: value as string })
    } else {
      // Pour single/multiple choice, on stocke les IDs des réponses
      setAnswers({ ...answers, [currentQuestion]: value })
    }
    setSelectedOption(null)
    // Animation feedback
    setTimeout(() => setSelectedOption(null), 300)
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

  const handleSubmit = async () => {
    if (!quiz) return
    
    // Préparer les réponses au format attendu par le backend
    const submissionAnswers = questions.map((q, index) => {
      const answer = answers[index]
      
      if (q.type === "single" || q.type === "multiple") {
        // Pour QCM, convertir les options sélectionnées (textes) en IDs de réponses
        let selectedIds: number[] = []
        
        if (q.optionToIdMap) {
          if (Array.isArray(answer)) {
            // Multiple choice: convertir chaque option texte en ID
            selectedIds = answer
              .map((optionText) => q.optionToIdMap?.[optionText])
              .filter((id): id is number => id !== undefined)
          } else if (typeof answer === "string") {
            // Single choice: convertir l'option texte en ID
            const id = q.optionToIdMap[answer]
            if (id !== undefined) {
              selectedIds = [id]
            }
          }
        }
        
        return {
          questionId: Number.parseInt(q.id),
          reponseIds: selectedIds.length > 0 ? selectedIds : undefined,
          texteReponse: undefined,
        }
      } else {
        // Pour TEXTE, utiliser texteReponse
        return {
          questionId: Number.parseInt(q.id),
          reponseIds: undefined,
          texteReponse: typeof answer === "string" ? answer : "",
        }
      }
    })
    
    try {
      const response = await quizService.submitQuiz({
        quizId: quizIdNum,
        answers: submissionAnswers,
      })
      
      if (response.ok) {
        setShowResults(true)
        toast.success("Quiz soumis avec succès !")
      } else {
        toast.error(response.message || "Erreur lors de la soumission du quiz")
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast.error("Erreur lors de la soumission du quiz")
    }
  }

  const calculateScore = () => {
    if (!quiz) return 0
    
    let correct = 0
    questions.forEach((q, index) => {
      const answer = answers[index]
      if (q.type === "single") {
        // Pour single choice, comparer avec correctAnswers[0]
        if (q.correctAnswers && q.correctAnswers.length > 0) {
          const correctId = q.correctAnswers[0]
          if (String(answer) === correctId) correct++
        }
      } else if (q.type === "multiple") {
        // Pour multiple choice, vérifier que tous les correctAnswers sont sélectionnés
        const answerArray = Array.isArray(answer) ? answer.map(String) : [String(answer)]
        const correctArray = q.correctAnswers || []
        if (
          answerArray.length === correctArray.length &&
          correctArray.every((a) => answerArray.includes(a))
        ) {
          correct++
        }
      }
    })
    return correct
  }
  
  // Afficher un loader pendant le chargement
  if (isLoadingQuiz) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Chargement du quiz...</span>
        </div>
      </ProtectedRoute>
    )
  }
  
  // Afficher une erreur si le quiz n'a pas pu être chargé
  if (quizError || !quiz) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Erreur lors du chargement du quiz</p>
            <Button onClick={() => router.push(`/learn/${courseId}`)}>
              Retourner au cours
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }
  
  if (questions.length === 0) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Ce quiz ne contient aucune question</p>
            <Button onClick={() => router.push(`/learn/${courseId}`)}>
              Retourner au cours
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (showResults) {
    const score = calculateScore()
    const percentage = (score / questions.length) * 100

    return (
      <ProtectedRoute>
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-3xl mx-auto px-4">
          <Card className="border-2">
            <CardHeader className="text-center space-y-4 pb-8">
              <div
                className={`mx-auto rounded-full p-6 w-24 h-24 flex items-center justify-center ${
                  percentage >= 70 ? "bg-success/10" : "bg-warning/10"
                }`}
              >
                {percentage >= 70 ? (
                  <CheckCircle2 className="h-12 w-12 text-success" />
                ) : (
                  <XCircle className="h-12 w-12 text-warning" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {percentage >= 70 ? "Félicitations !" : "Continuez vos efforts"}
                </h1>
                <p className="text-muted-foreground">Vous avez terminé le quiz</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {score}/{questions.length}
                </div>
                <p className="text-muted-foreground">Questions correctes</p>
                <Badge className="mt-3" variant={percentage >= 70 ? "default" : "secondary"}>
                  {Math.round(percentage)}% de réussite
                </Badge>
              </div>

              <div className="space-y-3 pt-6 border-t">
                {questions.map((q, index) => {
                  const answer = answers[index]
                  let isCorrect = false

                  if (q.type === "single") {
                    isCorrect = answer === q.correct
                  } else if (q.type === "multiple") {
                    const answerArray = answer as string[]
                    const correctArray = q.correct as string[]
                    isCorrect =
                      answerArray &&
                      answerArray.length === correctArray.length &&
                      answerArray.every((a) => correctArray.includes(a))
                  }

                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">Question {index + 1}</span>
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={() => router.push(`/learn/${courseId}`)}>
                  Retourner au cours
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setShowResults(false)
                    setCurrentQuestion(0)
                    setAnswers({})
                    setMarkedForReview([])
                  }}
                >
                  Refaire le quiz
                </Button>
              </div>
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
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/learn/${courseId}`)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Quitter le quiz
            </Button>

            <QuizTimer
              timeRemaining={timeRemaining}
              onTimeUp={handleTimeUp}
              totalTime={600}
              showWarning={true}
              warningThreshold={60}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-black">
                Question {currentQuestion + 1} sur {questions.length}
              </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progression
                  </span>
                  <span className="text-base font-bold text-orange-500 tabular-nums">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
              <Progress 
                value={progress} 
                className="h-3 bg-gray-100 rounded-full overflow-hidden [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-orange-400 [&>div]:transition-all [&>div]:duration-500 [&>div]:ease-out" 
              />
            </div>
            <div className="flex flex-col items-center gap-1.5 px-2">
              <CircularProgress
                value={currentQuestion + 1}
                max={questions.length}
                size={80}
                strokeWidth={8}
                showPercentage={false}
                showValue={true}
                className="shrink-0"
              />
              <div className="text-center">
                <span className="text-[11px] font-semibold text-black uppercase tracking-wider block">
                  Question
                </span>
                <span className="text-[10px] font-medium text-gray-500 block mt-0.5">
                  {questions.length} au total
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{question.type === "single" ? "Choix unique" : "Choix multiples"}</Badge>
                  {markedForReview.includes(currentQuestion) && (
                    <Badge variant="secondary">
                      <Flag className="h-3 w-3 mr-1" />À revoir
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-bold leading-relaxed">{question.question}</h2>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Single Choice */}
            {question.type === "single" && question.options && (
              <RadioGroup 
                value={(() => {
                  // Trouver l'option correspondant à la réponse stockée (qui est un texte)
                  const currentAnswer = answers[currentQuestion] as string
                  return currentAnswer || ""
                })()}
                onValueChange={(value) => {
                  // Stocker le texte de l'option (sera converti en ID lors de la soumission)
                  handleAnswer(value)
                }}
              >
                <div className="space-y-3">
                  {question.options.map((option, index) => {
                    const currentAnswer = answers[currentQuestion] as string
                    const isSelected = currentAnswer === option
                    return (
                    <div
                      key={index}
                        className={cn(
                          "flex items-center space-x-3 p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer",
                          "hover:bg-muted/50 hover:border-primary/50 hover:shadow-sm",
                          isSelected && "border-primary bg-primary/5 shadow-md scale-[1.02]",
                          selectedOption === option && "animate-pulse"
                        )}
                        onClick={() => setSelectedOption(option)}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-normal">
                        {option}
                      </Label>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in duration-200" />
                        )}
                    </div>
                    )
                  })}
                </div>
              </RadioGroup>
            )}

            {/* Multiple Choice */}
            {question.type === "multiple" && (
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const currentAnswers = (answers[currentQuestion] as string[]) || []
                  const isChecked = currentAnswers.includes(option)

                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center space-x-3 p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer",
                        "hover:bg-muted/50 hover:border-primary/50 hover:shadow-sm",
                        isChecked && "border-primary bg-primary/5 shadow-md scale-[1.02]"
                      )}
                      onClick={() => {
                        const newAnswers = isChecked
                          ? currentAnswers.filter((a) => a !== option)
                          : [...currentAnswers, option]
                        handleAnswer(newAnswers)
                        setSelectedOption(option)
                        setTimeout(() => setSelectedOption(null), 300)
                      }}
                    >
                      <Checkbox
                        id={`option-${index}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const newAnswers = checked
                            ? [...currentAnswers, option]
                            : currentAnswers.filter((a) => a !== option)
                          handleAnswer(newAnswers)
                        }}
                      />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-normal">
                        {option}
                      </Label>
                      {isChecked && (
                        <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in duration-200" />
                      )}
                    </div>
                  )
                })}
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
                <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== questions.length}>
                  Terminer le quiz
                </Button>
              ) : (
                <Button onClick={handleNext}>Suivant</Button>
              )}
            </div>
          </CardContent>
        </Card>
            </div>

          {/* Mini-map Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <QuizMinimap
                  questions={questions}
                  currentQuestion={currentQuestion}
                  answers={answers}
                  markedForReview={markedForReview}
                  onQuestionClick={setCurrentQuestion}
                />
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
