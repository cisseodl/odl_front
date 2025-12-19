"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Subtitles, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  src?: string
  thumbnail?: string
  title?: string
  className?: string
  videoRef?: React.RefObject<HTMLVideoElement>
}

export function VideoPlayer({ src, thumbnail, title, className, videoRef: externalVideoRef }: VideoPlayerProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null)
  const videoRef = externalVideoRef || internalVideoRef
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState([75])
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState("1080p")
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Update progress
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current
      const updateProgress = () => {
        if (video.duration) {
          setCurrentTime(video.currentTime)
          setProgress((video.currentTime / video.duration) * 100)
        }
      }
      video.addEventListener("timeupdate", updateProgress)
      video.addEventListener("loadedmetadata", () => {
        setDuration(video.duration)
      })
      return () => {
        video.removeEventListener("timeupdate", updateProgress)
      }
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement) && document.activeElement?.tagName !== "INPUT") {
        return
      }

      switch (e.key) {
        case " ":
          e.preventDefault()
          togglePlay()
          break
        case "ArrowLeft":
          e.preventDefault()
          if (videoRef.current) {
            videoRef.current.currentTime -= 10
          }
          break
        case "ArrowRight":
          e.preventDefault()
          if (videoRef.current) {
            videoRef.current.currentTime += 10
          }
          break
        case "m":
        case "M":
          e.preventDefault()
          toggleMute()
          break
        case "f":
        case "F":
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const handleProgressChange = (value: number[]) => {
    const newProgress = value[0]
    setProgress(newProgress)
    if (videoRef.current && duration) {
      videoRef.current.currentTime = (newProgress / 100) * duration
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume([newVolume])
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100
      if (newVolume === 0) {
        setIsMuted(true)
        videoRef.current.muted = true
      } else if (isMuted) {
        setIsMuted(false)
        videoRef.current.muted = false
      }
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
    setShowSpeedMenu(false)
  }

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
  const qualities = ["360p", "720p", "1080p"]

  return (
    <div
      ref={containerRef}
      className={cn("relative aspect-video bg-slate-900 rounded-lg overflow-hidden group", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video Element */}
      {src ? (
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          poster={thumbnail}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration)
            }
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-white/50">
              <Play className="h-16 w-16 mx-auto mb-2" />
              <p className="text-sm">Aperçu vidéo</p>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar with Thumbnail Preview on Hover */}
      <div className="absolute bottom-16 left-0 right-0 px-4">
        <div className="relative group/progress">
          <Slider
            value={[progress]}
            onValueChange={handleProgressChange}
            max={100}
            className="w-full cursor-pointer"
          />
          {/* Thumbnail preview could be added here on hover */}
        </div>
      </div>

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  className="w-24"
                  aria-label="Volume"
                />
              </div>

              <span className="text-white text-sm ml-2 min-w-[100px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Speed */}
              <DropdownMenu open={showSpeedMenu} onOpenChange={setShowSpeedMenu}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Gauge className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  {speeds.map((speed) => (
                    <DropdownMenuItem
                      key={speed}
                      onClick={() => handlePlaybackRateChange(speed)}
                      className={playbackRate === speed ? "bg-primary/10" : ""}
                    >
                      {speed}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quality */}
              <DropdownMenu open={showQualityMenu} onOpenChange={setShowQualityMenu}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                    Qualité
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {qualities.map((q) => (
                    <DropdownMenuItem
                      key={q}
                      onClick={() => {
                        setQuality(q)
                        setShowQualityMenu(false)
                      }}
                      className={quality === q ? "bg-primary/10" : ""}
                    >
                      {q}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Subtitles */}
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" aria-label="Subtitles">
                <Subtitles className="h-5 w-5" />
              </Button>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
