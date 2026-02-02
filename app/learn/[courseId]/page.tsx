"use client"

import { use, useState, useRef, useMemo, useEffect, Fragment } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Play, FileText, Code, FlaskConical, Menu, Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { VideoPlayer } from "@/components/video-player"
import { MiniPlayer } from "@/components/mini-player"
import { ContentSearch } from "@/components/content-search"
import { BookmarkButton } from "@/components/bookmark-button"
import { TranscriptWithTimestamps } from "@/components/transcript-with-timestamps"
import { LessonContentViewer } from "@/components/lesson-content-viewer"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/protected-route"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { courseService, learnerService, moduleService, evaluationService, labService, reviewService } from "@/lib/api/services"
import { adaptModule } from "@/lib/api/adapters"
import { useRouter } from "next/navigation"
import { FileCheck, Award, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import type { Lesson, Module } from "@/lib/types"
import { CourseActivitiesSection } from "@/components/course-activities-section"
import { ReviewSuccessDialog } from "@/components/review-success-dialog" // New import

interface LearnPageProps {
  params: Promise<{ courseId: string }>
}

export default function LearnPage({ params }: LearnPageProps) {
  const { courseId } = use(params)
  const courseIdNum = Number.parseInt(courseId)
  const router = useRouter()

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

  // Charger la progression du cours depuis l'API
  const {
    data: courseProgress,
    isLoading: progressLoading,
  } = useQuery({
    queryKey: ["courseProgress", courseIdNum],
    queryFn: () => learnerService.getCourseProgress(courseIdNum),
    enabled: !Number.isNaN(courseIdNum) && !!course,
  })

  // TOUJOURS charger les modules pour vérifier l'inscription (même si le cours a un curriculum)
  // Cela garantit que l'utilisateur est bien inscrit avant d'accéder à /learn/[id]
  const {
    data: modulesFromApi,
    isLoading: isLoadingModules,
    error: modulesError,
  } = useQuery({
    queryKey: ["modules", courseIdNum, "enrollment-check"],
    queryFn: async () => {
      try {
        const modules = await moduleService.getModulesByCourse(courseIdNum)
        return modules || []
      } catch (error: any) {
        // Re-lancer l'erreur pour qu'elle soit détectée par React Query
        throw error
      }
    },
    enabled: !Number.isNaN(courseIdNum) && !!course,
    retry: false, // Ne pas réessayer si erreur d'inscription
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  // Rediriger vers /courses/[id] si l'utilisateur n'est pas inscrit
  // WORKFLOW: /learn/id → Si non inscrit → rediriger vers /courses/id, sinon afficher le contenu
  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (isLoadingModules || courseLoading) return
    
    // Si erreur lors du chargement des modules, vérifier si c'est une erreur d'inscription
    if (modulesError) {
      const errorMessage = String(modulesError?.message || "")
      const isEnrollmentError = errorMessage.includes("inscrire") || 
                                errorMessage.includes("inscription") || 
                                errorMessage.includes("inscrit") ||
                                errorMessage.includes("non inscrit") ||
                                errorMessage.includes("403") ||
                                errorMessage.includes("401") ||
                                errorMessage.includes("Forbidden") ||
                                errorMessage.includes("Unauthorized") ||
                                errorMessage.includes("authentifié")
      
      if (isEnrollmentError) {
        console.log("❌ [ENROLLMENT] Utilisateur non inscrit détecté dans /learn, redirection vers /courses/id")
        router.replace(`/courses/${courseIdNum}`)
        return
      }
    }
    
    // Si aucun module n'a été chargé (même après chargement) et qu'il n'y a pas de curriculum
    // cela signifie probablement que l'utilisateur n'est pas inscrit
    if (!isLoadingModules && !modulesFromApi && (!course?.curriculum || course.curriculum.length === 0)) {
      console.log("⚠️ [ENROLLMENT] Aucun module chargé et pas de curriculum, redirection vers /courses/id")
      router.replace(`/courses/${courseIdNum}`)
      return
    }
  }, [course?.curriculum, modulesFromApi, modulesError, isLoadingModules, courseLoading, courseIdNum, router])

  const [currentLesson, setCurrentLesson] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notes, setNotes] = useState("")
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showMiniPlayer, setShowMiniPlayer] = useState(true)
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" }) // Ajout de l'état pour l'avis
  const [showSuccessDialog, setShowSuccessDialog] = useState(false) // New state for success dialog
  const videoRef = useRef<HTMLVideoElement>(null)
  const queryClient = useQueryClient()

  const addReviewMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string }) => {
      if (!courseIdNum) {
        throw new Error("ID du cours invalide");
      }
      return reviewService.addReview(courseIdNum, { rating, comment });
    },
    onSuccess: (response) => {
      // Vérifier que la réponse est un succès
      if (response.ok && !response.ko) {
        // Afficher le dialog de succès
        setShowSuccessDialog(true);
        // Réinitialiser le formulaire
        setNewReview({ rating: 0, comment: "" });
        // Invalider les queries pour rafraîchir la liste des avis
        queryClient.invalidateQueries({ queryKey: ["reviews", courseIdNum] });
        // Invalider aussi les données du cours pour mettre à jour le nombre d'avis
        queryClient.invalidateQueries({ queryKey: ["course", courseIdNum] });
      } else {
        // Si la réponse indique une erreur, afficher le message d'erreur
        const errorMessage = response.message || "Erreur lors de l'ajout de l'avis";
        toast.error(errorMessage);
      }
    },
    onError: (error: any) => {
      console.error("Erreur lors de l'ajout de l'avis:", error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          error?.data?.message ||
                          "Veuillez réessayer. Assurez-vous d'être inscrit au cours.";
      toast.error("Erreur lors de l'ajout de l'avis", {
        description: errorMessage,
      });
    },
  });

  const handleReviewSubmit = () => {
    if (newReview.rating === 0) {
      toast.error("Veuillez donner une note.");
      return;
    }
    if (newReview.comment.trim() === "") {
      toast.error("Veuillez laisser un commentaire.");
      return;
    }
    addReviewMutation.mutate(newReview);
  };


  // Utiliser le curriculum du cours s'il existe, sinon utiliser les modules chargés dynamiquement
  const curriculum = useMemo(() => {
    if (course?.curriculum && course.curriculum.length > 0) {
      return course.curriculum
    }
    if (modulesFromApi && modulesFromApi.length > 0) {
      return modulesFromApi.map(adaptModule)
    }
    return []
  }, [course?.curriculum, modulesFromApi])

  // Convertir les modules du cours en leçons pour l'affichage
  // IMPORTANT: Préserver contentUrl depuis les données brutes si l'adapter l'a perdu
  const lessons = useMemo(() => {
    if (!curriculum || curriculum.length === 0) return []
    
    const allLessons: Array<Lesson & { moduleTitle: string; moduleId: string }> = []
    
    // Créer un map des leçons brutes depuis modulesFromApi pour récupérer contentUrl
    const rawLessonsMap = new Map<string | number, any>()
    if (modulesFromApi && Array.isArray(modulesFromApi)) {
      modulesFromApi.forEach((module: any) => {
        if (module.lessons && Array.isArray(module.lessons)) {
          module.lessons.forEach((rawLesson: any) => {
            if (rawLesson.id) {
              rawLessonsMap.set(rawLesson.id, rawLesson)
            }
          })
        }
      })
    }
    
    curriculum.forEach((module) => {
      module.lessons.forEach((lesson) => {
        // Récupérer la leçon brute pour préserver contentUrl
        const rawLesson = rawLessonsMap.get(Number(lesson.id))
        const contentUrl = rawLesson?.contentUrl || lesson.contentUrl
        
        allLessons.push({
          ...lesson,
          // Forcer contentUrl depuis les données brutes si disponible
          contentUrl: contentUrl,
          moduleTitle: module.title,
          moduleId: module.id,
        })
      })
    })
    
    return allLessons
  }, [curriculum, modulesFromApi])

  // Calculer currentLessonData et progress pour déterminer si le cours est complété
  // (doit être fait avant le useQuery pour courseExam)
  const currentLessonDataForExam = lessons.find(lesson => String(lesson.id) === String(currentLesson)) || lessons[0]
  const progressForExam = lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0
  const isCourseCompletedForExam = progressForExam === 100 && lessons.length > 0
  
  // DEBUG: Log pour comprendre quelle leçon est sélectionnée
  if (currentLessonDataForExam && (currentLessonDataForExam.type === "document" || currentLessonDataForExam.type === "DOCUMENT")) {
    console.log("📄 [LEARN PAGE] currentLessonDataForExam (document):", {
      id: currentLessonDataForExam.id,
      title: currentLessonDataForExam.title,
      type: currentLessonDataForExam.type,
      contentUrl: currentLessonDataForExam.contentUrl,
      hasContentUrl: !!currentLessonDataForExam.contentUrl,
      allKeys: Object.keys(currentLessonDataForExam)
    })
  }

  // Vérifier si un examen existe pour ce cours (seulement si le cours est complété)
  const {
    data: courseExam,
    isLoading: isLoadingExam,
  } = useQuery({
    queryKey: ["courseExam", courseIdNum],
    queryFn: () => evaluationService.getCourseExam(courseIdNum),
    enabled: isCourseCompletedForExam && !Number.isNaN(courseIdNum),
    retry: false,
  })

  // Récupérer les labs du cours
  const {
    data: courseLabs,
    isLoading: isLoadingLabs,
  } = useQuery({
    queryKey: ["courseLabs", courseIdNum, lessons.length],
    queryFn: () => labService.getLabsByCourse(courseIdNum, lessons),
    enabled: !Number.isNaN(courseIdNum) && lessons.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

  // Récupérer les TP (Travaux Pratiques) du cours
  const {
    data: courseTPs,
    isLoading: isLoadingTPs,
  } = useQuery({
    queryKey: ["courseTPs", courseIdNum],
    queryFn: () => evaluationService.getTPsByCourse(courseIdNum),
    enabled: !Number.isNaN(courseIdNum),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

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
    if (!curriculum || curriculum.length === 0) return []
    
    return curriculum.map((module) => ({
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
  }, [curriculum, searchQuery])

  // Helper functions (doivent être définies avant SidebarContent qui les utilise)
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

  const handleMarkComplete = () => {
    if (!completedLessons.includes(currentLesson)) {
      setCompletedLessons([...completedLessons, currentLesson])
    }
  }

  // Helper function to render video content
  const renderVideoContent = () => {
    const lessonData = currentLessonDataForExam
    if (!lessonData || lessonData.type !== "video") {
      return null
    }

    if (lessonData.contentUrl) {
      return (
        <LessonContentViewer
          contentUrl={lessonData.contentUrl}
          title={lessonData.title || "Vidéo"}
          type="video"
        />
      )
    }

    return (
      <div className="relative">
        <VideoPlayer 
          title={lessonData.title || "Vidéo"}
          src={undefined}
          thumbnail={course?.imageUrl}
          videoRef={videoRef}
        />
        <div className="absolute top-4 right-4 z-10">
          <BookmarkButton
            timestamp={0}
            lessonId={currentLesson}
            onBookmark={(timestamp, lessonId) => {
              console.log("Bookmark added:", { timestamp, lessonId })
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-4">
          <h2 className="text-xl md:text-2xl font-bold">{lessonData.title || "Leçon"}</h2>
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
    )
  }

  // Utiliser les valeurs calculées (ou recalculer si nécessaire)
  const currentLessonData = currentLessonDataForExam
  const progress = progressForExam
  const isCourseCompleted = isCourseCompletedForExam

  // MAINTENANT on peut faire les retours conditionnels
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

  // Si le cours est présent mais incomplet, ne pas boucler sur un "loading" infini
  // (cela arrive quand le backend/adapter renvoie un objet sans titre)
  if (!course?.title) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center max-w-md">
          <p className="font-medium">Impossible de charger les détails du cours.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Veuillez rafraîchir la page. Si le problème persiste, reconnectez-vous.
          </p>
        </div>
      </div>
    )
  }

  // MAINTENANT on peut faire les retours conditionnels
  // Si pas de leçons, afficher un message informatif
  if (lessons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center max-w-md">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune leçon disponible</h3>
          <p className="text-muted-foreground mb-4">
            Ce cours n'a pas encore de contenu disponible. Les modules et leçons seront ajoutés prochainement.
          </p>
          <Link href={`/courses/${courseIdNum}`}>
            <Button variant="outline">Retour au cours</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Si currentLessonData n'existe toujours pas, utiliser la première leçon
  if (!currentLessonData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement de la leçon...</span>
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Course Header */}
      <div className="p-4 border-b">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 px-0"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </Button>
        <h2 className="font-bold line-clamp-2 text-sm leading-tight">{course?.title || "Cours"}</h2>
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
              <h1 className="font-semibold text-sm line-clamp-1">{currentLessonData?.title || "Leçon"}</h1>
              <p className="text-xs text-muted-foreground">{currentLessonData?.moduleTitle || ""}</p>
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
            {currentLessonData?.type === "video" && (
              <div className="space-y-4">
                {renderVideoContent()}
              </div>
            )}

            {/* Quiz */}
            {currentLessonData?.type === "quiz" && (
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
            {currentLessonData?.type === "lab" && (
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
            {currentLessonData?.type === "document" && (() => {
              // Récupérer contentUrl depuis les données brutes si nécessaire
              let finalContentUrl = currentLessonData?.contentUrl
              
              // DEBUG: Log détaillé pour comprendre le problème
              console.log("📄 [LEARN PAGE] Affichage document:", {
                lessonId: currentLessonData?.id,
                lessonTitle: currentLessonData?.title,
                lessonType: currentLessonData?.type,
                contentUrlFromLesson: currentLessonData?.contentUrl,
                hasContentUrl: !!currentLessonData?.contentUrl,
                modulesFromApiLength: modulesFromApi?.length || 0
              })
              
              // Si contentUrl n'est pas dans currentLessonData, chercher dans les données brutes
              if (!finalContentUrl && modulesFromApi && modulesFromApi.length > 0) {
                const allLessonsRaw: any[] = []
                modulesFromApi.forEach((module: any) => {
                  if (module.lessons && Array.isArray(module.lessons)) {
                    allLessonsRaw.push(...module.lessons)
                  }
                })
                
                console.log("📄 [LEARN PAGE] Recherche dans données brutes:", {
                  totalLessonsRaw: allLessonsRaw.length,
                  currentLessonId: currentLessonData?.id,
                  rawLessons: allLessonsRaw.map((l: any) => ({
                    id: l.id,
                    title: l.title,
                    type: l.type,
                    contentUrl: l.contentUrl,
                    content_url: l.content_url,
                    allKeys: Object.keys(l)
                  }))
                })
                
                const rawLesson = allLessonsRaw.find((l: any) => 
                  String(l.id) === String(currentLessonData?.id) || 
                  l.title === currentLessonData?.title
                )
                
                if (rawLesson) {
                  console.log("📄 [LEARN PAGE] Leçon brute trouvée:", {
                    id: rawLesson.id,
                    title: rawLesson.title,
                    contentUrl: rawLesson.contentUrl,
                    content_url: rawLesson.content_url,
                    allKeys: Object.keys(rawLesson),
                    rawData: JSON.stringify(rawLesson).substring(0, 500)
                  })
                  
                  // Essayer toutes les variantes
                  finalContentUrl = rawLesson.contentUrl || 
                                   rawLesson.content_url || 
                                   rawLesson['content-url'] ||
                                   (rawLesson as any).contentUrl
                  
                  if (finalContentUrl) {
                    console.log("✅ [LEARN PAGE] contentUrl récupéré depuis données brutes:", finalContentUrl)
                  } else {
                    console.error("❌ [LEARN PAGE] contentUrl introuvable dans les données brutes")
                  }
                } else {
                  console.error("❌ [LEARN PAGE] Leçon brute non trouvée pour:", {
                    id: currentLessonData?.id,
                    title: currentLessonData?.title
                  })
                }
              }
              
              console.log("📄 [LEARN PAGE] finalContentUrl avant rendu:", finalContentUrl)
              
              return (
                <div className="space-y-4">
                  {finalContentUrl ? (
                    <LessonContentViewer
                      contentUrl={finalContentUrl}
                      title={currentLessonData.title || "Document"}
                      type="document"
                    />
                  ) : (
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="rounded-full bg-muted p-3">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">{currentLessonData?.title || "Document"}</h2>
                          <p className="text-sm text-muted-foreground">Ressource consultable</p>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-6 border border-border">
                        <p className="text-muted-foreground text-center">
                          Ce document est disponible uniquement en lecture. Vous pouvez le consulter directement dans cette section.
                        </p>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          ⚠️ Aucune URL de contenu trouvée pour ce document.
                        </p>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          ID: {currentLessonData?.id} | Type: {currentLessonData?.type}
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              )
            })()}

            {/* Tabs: Transcription (uniquement pour les vidéos) */}
            {currentLessonData?.type === "video" && (
              <Tabs defaultValue="transcript" className="w-full">
                <TabsList>
                  <TabsTrigger value="transcript">Transcription</TabsTrigger>
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
              </Tabs>
            )}

            {/* Section Avis - Affichée après le contenu (vidéo/PDF) mais avant les labs */}
            <div className="mt-8 space-y-4">
              <Separator />
              <Card className="border-2">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Laissez votre avis sur ce cours</h3>
                  <div>
                    <p className="font-medium mb-2">Votre note</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-6 w-6 cursor-pointer transition-colors",
                            star <= newReview.rating
                              ? "fill-primary text-primary"
                              : "text-gray-300 hover:text-gray-400"
                          )}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Votre commentaire</p>
                    <Textarea
                      placeholder="Partagez votre expérience avec ce cours..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleReviewSubmit} disabled={addReviewMutation.isPending}>
                    {addReviewMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer mon avis"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Labs associés à la leçon actuelle */}
            {(() => {
              // Filtrer les labs pour n'afficher que ceux associés à la leçon actuelle
              const currentLessonId = currentLessonData?.id
              const currentLessonLabs = courseLabs?.filter((lab: any) => {
                const rawLab = (lab as any).rawData || lab
                const labLessonId = rawLab.lessonId || 
                                 (rawLab.lesson && (typeof rawLab.lesson.id === 'string' ? parseInt(rawLab.lesson.id, 10) : rawLab.lesson.id)) ||
                                 (rawLab.lesson && rawLab.lesson.id)
                
                // Comparer les IDs (gérer les cas où ils sont des strings ou des numbers)
                const currentId = typeof currentLessonId === 'string' ? parseInt(currentLessonId, 10) : currentLessonId
                const labId = typeof labLessonId === 'string' ? parseInt(labLessonId, 10) : labLessonId
                
                return currentId && labId && currentId === labId
              }) || []

              if (currentLessonLabs.length === 0) {
                return null
              }

              return (
                <div className="mt-8 space-y-4">
                  <Separator />
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <FlaskConical className="h-5 w-5 text-orange-500" />
                      Labs associés à cette leçon
                    </h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {currentLessonLabs.map((lab: any) => (
                            <div
                              key={lab.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="rounded-full bg-orange-100 p-2">
                                  <FlaskConical className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold">{lab.title}</h4>
                                  {lab.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                      {lab.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  // TODO: Implémenter la navigation vers le lab
                                  console.log("Démarrer lab:", lab.id)
                                }}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Démarrer
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Mini Player */}
      {currentLessonData?.type === "video" && showMiniPlayer && (
        <MiniPlayer
          title={currentLessonData?.title || "Leçon"}
          thumbnail={course?.imageUrl}
          videoRef={videoRef}
          onExpand={() => {
            // Scroll to top to show full player
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          onClose={() => setShowMiniPlayer(false)}
        />
      )}
      </div>
      <ReviewSuccessDialog
        isOpen={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
      />
    </ProtectedRoute>
  )
}

