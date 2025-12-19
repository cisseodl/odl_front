"use client"

import { useState } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  timestamp: number
  lessonId: string | number
  onBookmark?: (timestamp: number, lessonId: string | number) => void
  className?: string
}

export function BookmarkButton({ timestamp, lessonId, onBookmark, className }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleClick = () => {
    setIsBookmarked(!isBookmarked)
    if (onBookmark) {
      onBookmark(timestamp, lessonId)
    }
    toast.success(isBookmarked ? "Marque-page supprimé" : `Marque-page ajouté à ${formatTime(timestamp)}`)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn("h-8 w-8", className)}
      aria-label={isBookmarked ? "Retirer le marque-page" : "Ajouter un marque-page"}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 text-primary fill-primary" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  )
}

