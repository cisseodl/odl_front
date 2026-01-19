"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, Play, FileText, CheckCircle2, Clock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Module } from "@/lib/types"

interface CourseSidebarProps {
  modules: Module[]
  courseId: string | number
  currentLessonId?: string | number
  isLoading?: boolean
}

export function CourseSidebar({ modules, courseId, currentLessonId, isLoading }: CourseSidebarProps) {
  // Utiliser un tableau au lieu d'un Set pour éviter les problèmes de sérialisation React
  const [expandedModules, setExpandedModules] = useState<(string | number)[]>([])

  const toggleModule = (moduleId: string | number) => {
    setExpandedModules((prev) => {
      const moduleIdStr = String(moduleId)
      if (prev.includes(moduleIdStr) || prev.includes(moduleId)) {
        return prev.filter(id => String(id) !== moduleIdStr && id !== moduleId)
      } else {
        return [...prev, moduleId]
      }
    })
  }

  // Calculer le nombre total de leçons
  const totalLessons = modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0)

  // Calculer la durée totale
  const totalDuration = modules.reduce((acc, module) => {
    const moduleDuration = module.lessons?.reduce((lessonAcc, lesson) => {
      const duration = lesson.duration || "0m"
      const minutes = parseInt(duration.replace(/[^0-9]/g, "")) || 0
      return lessonAcc + minutes
    }, 0) || 0
    return acc + moduleDuration
  }, 0)

  const formattedDuration = totalDuration > 60 
    ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`
    : `${totalDuration}m`

  if (isLoading) {
    return (
      <div className="w-full lg:w-80 bg-card border-2 border-border rounded-lg p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium text-muted-foreground">Chargement...</span>
        </div>
      </div>
    )
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="w-full lg:w-80 bg-card border-2 border-border rounded-lg p-6">
        <div className="text-center text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-primary/50" />
          <p className="font-medium">Aucun module disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full lg:w-80 bg-card border-2 border-border rounded-lg overflow-hidden flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <h3 className="font-bold text-lg text-foreground mb-2">Contenu du cours</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{modules.length} section{modules.length > 1 ? "s" : ""}</span>
          <span>•</span>
          <span>{totalLessons} leçon{totalLessons > 1 ? "s" : ""}</span>
          <span>•</span>
          <span>{formattedDuration}</span>
        </div>
      </div>

      {/* Modules List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {modules.map((module, moduleIndex) => {
            const moduleIdStr = String(module.id)
            const isExpanded = expandedModules.some(id => String(id) === moduleIdStr || id === module.id)
            const moduleLessons = module.lessons || []
            const moduleDuration = moduleLessons.reduce((acc, lesson) => {
              const duration = lesson.duration || "0m"
              const minutes = parseInt(duration.replace(/[^0-9]/g, "")) || 0
              return acc + minutes
            }, 0)
            const formattedModuleDuration = moduleDuration > 60 
              ? `${Math.floor(moduleDuration / 60)}h ${moduleDuration % 60}m`
              : `${moduleDuration}m`

            return (
              <div key={String(module.id)} className="mb-2">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <span className="text-xs font-bold text-primary">{moduleIndex + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate">
                        {module.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {moduleLessons.length} leçon{moduleLessons.length > 1 ? "s" : ""} • {formattedModuleDuration}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {/* Module Lessons */}
                {isExpanded && (
                  <div className="ml-11 mt-1 space-y-1">
                    {moduleLessons.map((lesson, lessonIndex) => {
                      const isActive = String(lesson.id) === String(currentLessonId)
                      const isVideo = lesson.type === "video"
                      const isQuiz = lesson.type === "quiz"

                      return (
                        <Link
                          key={String(lesson.id)}
                          href={`/learn/${courseId}?lesson=${lesson.id}`}
                          className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                            isActive
                              ? "bg-primary/10 border-l-2 border-primary"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {isVideo ? (
                              <Play className="h-4 w-4 text-muted-foreground" />
                            ) : isQuiz ? (
                              <FileText className="h-4 w-4 text-primary" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                                <span className="text-[10px] text-muted-foreground">{lessonIndex + 1}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${
                              isActive ? "text-primary" : "text-foreground"
                            }`}>
                              {lesson.title}
                            </div>
                            {lesson.duration && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" />
                                {lesson.duration}
                              </div>
                            )}
                          </div>
                          {isQuiz && (
                            <Badge className="bg-primary/10 text-primary text-xs border-primary/20 flex-shrink-0">
                              Quiz
                            </Badge>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
