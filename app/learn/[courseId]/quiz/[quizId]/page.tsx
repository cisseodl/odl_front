"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, CheckCircle2, XCircle, Flag } from "lucide-react"
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

interface QuizPageProps {
  params: Promise<{ courseId: string; quizId: string }>
}

export default function QuizPage({ params }: QuizPageProps) {
  const { courseId } = use(params)
  const router = useRouter()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [markedForReview, setMarkedForReview] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  // Mock quiz data
  const questions = [
    {
      id: 0,
      type: "single",
      question: "Qu'est-ce que React ?",
      options: ["Une bibliothèque JavaScript", "Un langage de programmation", "Un framework CSS", "Un éditeur de code"],
      correct: "Une bibliothèque JavaScript",
    },
    {
      id: 1,
      type: "multiple",
      question: "Quels sont les hooks React les plus courants ? (Sélectionnez plusieurs réponses)",
      options: ["useState", "useEffect", "useQuery", "useContext"],
      correct: ["useState", "useEffect", "useContext"],
    },
    {
      id: 2,
      type: "single",
      question: "Quel est le rôle de JSX dans React ?",
      options: [
        "Compiler le code JavaScript",
        "Créer des styles CSS",
        "Écrire du HTML dans du JavaScript",
        "Gérer les états",
      ],
      correct: "Écrire du HTML dans du JavaScript",
    },
    {
      id: 3,
      type: "single",
      question: "Comment passe-t-on des données d'un composant parent à un composant enfant ?",
      options: ["Via les props", "Via les hooks", "Via le state global", "Via le context"],
      correct: "Via les props",
    },
    {
      id: 4,
      type: "multiple",
      question: "Quelles sont les bonnes pratiques en React ?",
      options: [
        "Garder les composants petits et réutilisables",
        "Éviter les effets de bord dans le rendu",
        "Tout mettre dans un seul fichier",
        "Utiliser des noms de variables descriptifs",
      ],
      correct: [
        "Garder les composants petits et réutilisables",
        "Éviter les effets de bord dans le rendu",
        "Utiliser des noms de variables descriptifs",
      ],
    },
  ]

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
    setAnswers({ ...answers, [currentQuestion]: value })
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

  const handleSubmit = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q, index) => {
      const answer = answers[index]
      if (q.type === "single") {
        if (answer === q.correct) correct++
      } else if (q.type === "multiple") {
        const answerArray = answer as string[]
        const correctArray = q.correct as string[]
        if (
          answerArray &&
          answerArray.length === correctArray.length &&
          answerArray.every((a) => correctArray.includes(a))
        ) {
          correct++
        }
      }
    })
    return correct
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
            {question.type === "single" && (
              <RadioGroup value={answers[currentQuestion] as string} onValueChange={handleAnswer}>
                <div className="space-y-3">
                  {question.options.map((option, index) => {
                    const isSelected = answers[currentQuestion] === option
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
