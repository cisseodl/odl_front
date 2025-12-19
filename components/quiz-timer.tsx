"use client"

import { useState, useEffect } from "react"
import { Clock, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface QuizTimerProps {
  timeRemaining: number
  onTimeUp?: () => void
  totalTime?: number
  showWarning?: boolean
  warningThreshold?: number
  className?: string
}

export function QuizTimer({
  timeRemaining,
  onTimeUp,
  totalTime = 600,
  showWarning = true,
  warningThreshold = 60,
  className,
}: QuizTimerProps) {
  const [hasWarned, setHasWarned] = useState(false)
  const [localTime, setLocalTime] = useState(timeRemaining)

  useEffect(() => {
    setLocalTime(timeRemaining)
  }, [timeRemaining])

  useEffect(() => {
    if (localTime <= 0 && onTimeUp) {
      onTimeUp()
    }
  }, [localTime, onTimeUp])

  useEffect(() => {
    if (showWarning && localTime <= warningThreshold && !hasWarned && localTime > 0) {
      toast.warning("Attention !", {
        description: `Il vous reste moins d'une minute.`,
        duration: 5000,
      })
      setHasWarned(true)
    }
  }, [localTime, warningThreshold, hasWarned, showWarning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = (localTime / totalTime) * 100
  const isWarning = localTime <= warningThreshold && localTime > 0
  const isCritical = localTime <= 30 && localTime > 0

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={cn("h-4 w-4", isWarning && "text-warning animate-pulse", isCritical && "text-destructive")} />
          <span
            className={cn(
              "font-mono text-sm font-semibold",
              isWarning && "text-warning",
              isCritical && "text-destructive animate-pulse"
            )}
          >
            {formatTime(localTime)}
          </span>
          {isWarning && (
            <AlertTriangle className="h-4 w-4 text-warning animate-pulse" />
          )}
        </div>
      </div>
      <Progress
        value={progress}
        className={cn(
          "h-2",
          isWarning && "bg-warning/20 [&>div]:bg-warning",
          isCritical && "bg-destructive/20 [&>div]:bg-destructive"
        )}
      />
    </div>
  )
}

