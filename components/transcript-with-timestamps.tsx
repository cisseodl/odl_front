"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TranscriptSegment {
  timestamp: number
  text: string
}

interface TranscriptWithTimestampsProps {
  segments: TranscriptSegment[]
  videoRef?: React.RefObject<HTMLVideoElement>
  onTimestampClick?: (timestamp: number) => void
  className?: string
}

export function TranscriptWithTimestamps({
  segments,
  videoRef,
  onTimestampClick,
  className,
}: TranscriptWithTimestampsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleTimestampClick = (timestamp: number) => {
    if (videoRef?.current) {
      videoRef.current.currentTime = timestamp
      videoRef.current.play()
    }
    if (onTimestampClick) {
      onTimestampClick(timestamp)
    }
  }

  // Mock transcript data if none provided
  const defaultSegments: TranscriptSegment[] = segments.length > 0
    ? segments
    : [
        { timestamp: 0, text: "Bienvenue dans cette leçon. Nous allons explorer les concepts fondamentaux." },
        { timestamp: 30, text: "Commençons par comprendre les bases de ce sujet important." },
        { timestamp: 60, text: "Maintenant, voyons comment appliquer ces concepts dans des situations réelles." },
        { timestamp: 90, text: "Cette partie est cruciale pour votre compréhension." },
        { timestamp: 120, text: "N'hésitez pas à revenir en arrière si nécessaire." },
      ]

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {defaultSegments.map((segment, index) => (
          <div key={index} className="flex gap-3 group">
            <button
              onClick={() => handleTimestampClick(segment.timestamp)}
              className="text-sm font-mono text-primary hover:text-primary/80 hover:underline transition-colors flex-shrink-0 min-w-[60px] text-left"
              aria-label={`Aller à ${formatTime(segment.timestamp)}`}
            >
              {formatTime(segment.timestamp)}
            </button>
            <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors flex-1">
              {segment.text}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}

