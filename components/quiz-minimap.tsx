"use client"

import { Flag, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface QuizMinimapProps {
  questions: Array<{ id: number; question: string }>
  currentQuestion: number
  answers: Record<number, string | string[]>
  markedForReview: number[]
  onQuestionClick: (index: number) => void
  className?: string
}

export function QuizMinimap({
  questions,
  currentQuestion,
  answers,
  markedForReview,
  onQuestionClick,
  className,
}: QuizMinimapProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Questions
      </h3>
      <div className="space-y-1.5">
        {questions.map((q, index) => {
          const isAnswered = answers[index] !== undefined
          const isMarked = markedForReview.includes(index)
          const isCurrent = currentQuestion === index

          return (
            <TooltipProvider key={q.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onQuestionClick(index)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all duration-200",
                      isCurrent
                        ? "bg-primary text-primary-foreground shadow-md"
                        : isAnswered
                          ? "bg-success/10 text-success hover:bg-success/20 border border-success/20"
                          : "bg-muted/50 hover:bg-muted border border-border",
                      isMarked && "ring-2 ring-warning ring-offset-1"
                    )}
                    aria-label={`Question ${index + 1}: ${q.question.substring(0, 50)}...`}
                  >
                    <div className="flex-shrink-0">
                      {isAnswered ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-xs font-medium flex-1 truncate">
                      Q{index + 1}
                    </span>
                    {isMarked && (
                      <Flag className="h-3 w-3 text-warning flex-shrink-0" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-sm">{q.question}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    </div>
  )
}

