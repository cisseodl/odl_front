"use client"

import { useState, useEffect } from "react"
import { Play, Pause, X, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MiniPlayerProps {
  title: string
  thumbnail?: string
  videoRef?: React.RefObject<HTMLVideoElement>
  onExpand?: () => void
  onClose?: () => void
  className?: string
}

export function MiniPlayer({ title, thumbnail, videoRef, onExpand, onClose, className }: MiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      // Show mini player after scrolling 300px
      setIsVisible(scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (videoRef?.current) {
      const video = videoRef.current
      const handlePlay = () => setIsPlaying(true)
      const handlePause = () => setIsPlaying(false)

      video.addEventListener("play", handlePlay)
      video.addEventListener("pause", handlePause)

      return () => {
        video.removeEventListener("play", handlePlay)
        video.removeEventListener("pause", handlePause)
      }
    }
  }, [videoRef])

  const togglePlay = () => {
    if (videoRef?.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 w-80 bg-black rounded-lg shadow-2xl overflow-hidden transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        className
      )}
    >
      <div className="relative aspect-video bg-slate-900">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-12 w-12 rounded-full"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
        </div>

        {/* Controls */}
        <div className="absolute top-2 right-2 flex gap-2">
          {onExpand && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
              onClick={onExpand}
              aria-label="Agrandir"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
              onClick={onClose}
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Title */}
      <div className="p-3 bg-black/90">
        <p className="text-sm font-medium text-white line-clamp-2">{title}</p>
      </div>
    </div>
  )
}

