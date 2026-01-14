"use client"

import { use, useState, useRef, useMemo } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Play, FileText, Code, FlaskConical, Menu, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { VideoPlayer } from "@/components/video-player"
import { MiniPlayer } from "@/components/mini-player"
import { ContentSearch } from "@/components/content-search"
import { BookmarkButton } from "@/components/bookmark-button"
import { TranscriptWithTimestamps } from "@/components/transcript-with-timestamps"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/protected-route"
import { useQuery } from "@tanstack/react-query"
import { courseService, chapterService } from "@/lib/api/services"
import type { Lesson } from "@/lib/types"

interface LearnPageProps {
  params: Promise<{ courseId: string }>
}

export default function LearnPage({ params }: LearnPageProps) {
  const { courseId } = use(params)
  const courseIdNum = Number.parseInt(courseId)

  // Charger le cours depuis l'API
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useQuery({
    queryKey: ["course", courseIdNum],
    queryFn: () => courseService.getCourseById(courseIdNum),
    enabled: !Number.isNaN(courseIdNum),
  })

  // Charger les chapitres depuis l'API
  const {
    data: chapters = [],
    isLoading: chaptersLoading,
  } = useQuery({
    queryKey: ["chapters", courseIdNum],
    queryFn: () => chapterService.getChaptersByCourse(courseIdNum),
    enabled: !Number.isNaN(courseIdNum) && !!course,
  })

  const [currentLesson, setCurrentLesson] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notes, setNotes] = useState("")
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showMiniPlayer, setShowMiniPlayer] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Convertir les modules du cours en leçons pour l'affichage
  const lessons = useMemo(() => {
    if (!course?.curriculum) return []
    
    const allLessons: Array<Lesson & { moduleTitle: string; moduleId: string }> = []
    
    course.curriculum.forEach((module) => {
      module.lessons.forEach((lesson) => {
        allLessons.push({
          ...lesson,
          moduleTitle: module.title,
          moduleId: module.id,
        })
      })
    })
    
    return allLessons
  }, [course])

  if (Number.isNaN(courseIdNum)) {
    notFound()
  }

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement du cours...</span>
      </div>
    )
  }

  if (courseError || !course) {
    notFound()
  }

  const currentLessonData = lessons[currentLesson]
  const progress = lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0

  // Filter lessons based on search query
  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons

    const query = searchQuery.toLowerCase()
    return lessons.filter(
      (lesson) =>
        lesson.title.toLowerCase().includes(query) ||
        lesson.moduleTitle.toLowerCase().includes(query)
    )
  }, [lessons, searchQuery])

  // Group lessons by module for display
  const groupedLessons = useMemo(() => {
    if (!course?.curriculum) return []
    
    return course.curriculum.map((module) => ({
      module: module.title,
      lessons: module.lessons.filter((lesson) => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase()
        return (
          lesson.title.toLowerCase().includes(query) ||
          module.title.toLowerCase().includes(query)
        )
      }),
    }))
  }, [course, searchQuery])

  const handleMarkComplete = () => {
    if (!completedLessons.includes(currentLesson)) {
      setCompletedLessons([...completedLessons, currentLesson])
    }
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4" />
      case "quiz":
        return <CheckCircle2 className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "lab":
        return <Code className="h-4 w-4" />
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Course Header */}
      <div className="p-4 border-b">
        <Link
          href={`/courses/${courseId}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour au cours
        </Link>
        <h2 className="font-bold line-clamp-2 text-sm leading-tight">{course.title}</h2>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <ContentSearch
          onSearch={setSearchQuery}
          placeholder="Rechercher dans le contenu..."
        />
      </div>

      {/* Lessons List */}
      <div className="flex-1 overflow-y-auto">
        {groupedLessons.length > 0 ? (
          groupedLessons.map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className="sticky top-0 bg-muted/50 backdrop-blur-sm px-4 py-2 border-b">
                <p className="text-xs font-semibold">{group.module}</p>
              </div>
              {group.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLesson(lesson.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors flex items-center gap-3",
                    currentLesson === lesson.id && "bg-primary/10 border-l-4 border-l-primary",
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0",
                      completedLessons.includes(lesson.id)
                        ? "text-success"
                        : currentLesson === lesson.id
                          ? "text-primary"
                          : "text-muted-foreground",
                    )}
                  >
                    {completedLessons.includes(lesson.id) ? (
                      <CheckCircle2 className="h-5 w-5 fill-success" />
                    ) : (
                      getLessonIcon(lesson.type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                  </div>
                </button>
              ))}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Aucun résultat trouvé pour "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  )

  return (
    <ProtectedRoute>
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block border-r bg-background transition-all duration-300",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b px-4 py-3 flex items-center justify-between gap-4 bg-background">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden sm:block">
              <h1 className="font-semibold text-sm line-clamp-1">{currentLessonData.title}</h1>
              <p className="text-xs text-muted-foreground">{currentLessonData.moduleTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentLesson === 0}
              onClick={() => setCurrentLesson(currentLesson - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Précédent</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentLesson === lessons.length - 1}
              onClick={() => {
                handleMarkComplete()
                setCurrentLesson(currentLesson + 1)
              }}
            >
              <span className="hidden sm:inline mr-1">Suivant</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
            {/* Video Player */}
            {currentLessonData.type === "video" && (
              <div className="space-y-4">
                <div className="relative">
                  <VideoPlayer 
                    title={currentLessonData.title}
                    src={undefined}
                    thumbnail={course.imageUrl}
                    videoRef={videoRef}
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <BookmarkButton
                      timestamp={0}
                      lessonId={currentLesson}
                      onBookmark={(timestamp, lessonId) => {
                        // Handle bookmark logic here
                        console.log("Bookmark added:", { timestamp, lessonId })
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-bold">{currentLessonData.title}</h2>
                  <Button onClick={handleMarkComplete} disabled={completedLessons.includes(currentLesson)}>
                    {completedLessons.includes(currentLesson) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Terminé
                      </>
                    ) : (
                      "Marquer comme terminé"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Quiz */}
            {currentLessonData.type === "quiz" && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Quiz de Validation</h2>
                    <p className="text-sm text-muted-foreground">Testez vos connaissances</p>
                  </div>
                </div>
                <Link href={`/learn/${courseId}/quiz/${currentLesson}`}>
                  <Button size="lg" className="w-full md:w-auto">
                    Commencer le Quiz
                  </Button>
                </Link>
              </Card>
            )}

            {/* Lab */}
            {currentLessonData.type === "lab" && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-full bg-secondary/10 p-3">
                    <FlaskConical className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Lab Pratique</h2>
                    <p className="text-sm text-muted-foreground">Mettez en pratique vos compétences</p>
                  </div>
                </div>
                <Link href={`/learn/${courseId}/lab/${currentLesson}`}>
                  <Button size="lg" className="w-full md:w-auto">
                    Ouvrir le Lab
                  </Button>
                </Link>
              </Card>
            )}

            {/* Document */}
            {currentLessonData.type === "document" && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-full bg-muted p-3">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{currentLessonData.title}</h2>
                    <p className="text-sm text-muted-foreground">Ressource consultable</p>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-6 border border-border">
                  <p className="text-muted-foreground text-center">
                    Ce document est disponible uniquement en lecture. Vous pouvez le consulter directement dans cette section.
                  </p>
                </div>
              </Card>
            )}

            {/* Tabs: Transcription, Resources, Notes */}
            <Tabs defaultValue="transcript" className="w-full">
              <TabsList>
                <TabsTrigger value="transcript">Transcription</TabsTrigger>
                <TabsTrigger value="resources">Ressources</TabsTrigger>
                <TabsTrigger value="notes">Mes Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="transcript" className="mt-4">
                <TranscriptWithTimestamps
                  segments={[]}
                  videoRef={videoRef}
                  onTimestampClick={(timestamp) => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = timestamp
                      videoRef.current.play()
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="resources" className="mt-4">
                <Card className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">Slides de présentation</p>
                          <p className="text-xs text-muted-foreground">PDF • 2.4 MB</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Télécharger
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Code className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">Code source</p>
                          <p className="text-xs text-muted-foreground">ZIP • 156 KB</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Télécharger
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <Card className="p-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Vos notes personnelles</label>
                    <Textarea
                      placeholder="Écrivez vos notes ici..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[200px]"
                    />
                    <Button size="sm">Enregistrer</Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Mini Player */}
      {currentLessonData.type === "video" && showMiniPlayer && (
        <MiniPlayer
          title={currentLessonData.title}
          thumbnail={course.imageUrl}
          videoRef={videoRef}
          onExpand={() => {
            // Scroll to top to show full player
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          onClose={() => setShowMiniPlayer(false)}
        />
      )}
    </div>
    </ProtectedRoute>
  )
}

