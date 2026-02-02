"use client"

import Link from "next/link"
import React, { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { reviewService, courseService, moduleService } from "@/lib/api/services"
import { useAuthStore } from "@/lib/store/auth-store"
import { EnrollmentExpectationsModal } from "@/components/enrollment-expectations-modal"
import { Share2, Bookmark, MoreVertical, Play, Star, Clock, Users, Award, CheckCircle2, FileText, Video, BookOpen, ArrowLeft, Globe, BarChart3, Infinity, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { RatingStars } from "@/components/rating-stars"
import { FadeInView } from "@/components/fade-in-view"
import type { Course } from "@/lib/types"

interface CourseDetailClientProps {
  course: Course
}

// Helper function to get difficulty badge color
const getDifficultyColor = (level: string) => {
  switch (level) {
    case "Débutant":
      return "bg-primary/10 text-primary border-primary/20"
    case "Intermédiaire":
      return "bg-primary/15 text-primary border-primary/30"
    case "Avancé":
      return "bg-primary/20 text-primary border-primary/40"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

// Helper function to calculate total lectures
const getTotalLectures = (curriculum: Course["curriculum"]) => {
  if (!curriculum || !Array.isArray(curriculum)) return 0
  return curriculum.reduce((total, module) => total + (module.lessons?.length || 0), 0)
}

export function CourseDetailClient({ course }: CourseDetailClientProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)

  const courseIdNum = useMemo(() => {
    if (!course?.id) return null
    const id = typeof course.id === 'string' ? parseInt(course.id, 10) : course.id
    return Number.isNaN(id) ? null : id
  }, [course?.id])

  // Vérifier l'inscription en essayant de charger les modules
  const { data: modules, isLoading: isLoadingEnrollment, error: enrollmentError } = useQuery({
    queryKey: ["modules", courseIdNum, "enrollment-check"],
    queryFn: async () => {
      if (!courseIdNum) return null
      try {
        const modulesData = await moduleService.getModulesByCourse(courseIdNum)
        return modulesData || []
      } catch (error: any) {
        const errorMessage = String(error?.message || "")
        const isEnrollmentError = errorMessage.includes("inscrire") || 
                                  errorMessage.includes("inscription") || 
                                  errorMessage.includes("inscrit") ||
                                  errorMessage.includes("authentifié") ||
                                  errorMessage.includes("403") ||
                                  errorMessage.includes("401") ||
                                  errorMessage.includes("Forbidden") ||
                                  errorMessage.includes("Unauthorized")
        if (isEnrollmentError) {
          throw error
        }
        throw error
      }
    },
    enabled: isAuthenticated && !!user && !!courseIdNum,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  })

  // L'utilisateur est inscrit si les modules sont chargés avec succès
  const isEnrolled = useMemo(() => {
    if (!isAuthenticated || !user) return false
    if (isLoadingEnrollment) return false
    if (enrollmentError) return false
    return modules !== undefined && modules !== null && !enrollmentError
  }, [modules, isLoadingEnrollment, enrollmentError, isAuthenticated, user])

  // Redirection automatique si déjà inscrit
  useEffect(() => {
    if (isAuthenticated && user && isEnrolled && !isLoadingEnrollment) {
      router.push(`/learn/${course.id}`)
    }
  }, [isEnrolled, isLoadingEnrollment, isAuthenticated, user, course.id, router])

  // Mutation pour l'inscription
  const enrollMutation = useMutation({
    mutationFn: (expectations: string) => {
      if (!courseIdNum) throw new Error("ID du cours invalide")
      return courseService.enrollInCourse(courseIdNum, expectations)
    },
    onSuccess: () => {
      // Invalider les caches pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: ["modules", courseIdNum] })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      
      toast.success("Inscription réussie", {
        description: "Vous êtes maintenant inscrit à ce cours",
      })
      
      setShowEnrollmentModal(false)
      
      // Rediriger vers la page d'apprentissage
      router.push(`/learn/${course.id}`)
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Une erreur est survenue lors de l'inscription"
        toast.error("Erreur d'inscription", {
          description: errorMessage,
        })
    },
  })

  // Gérer le clic sur "S'inscrire gratuitement"
  const handleEnrollClick = () => {
    if (!isAuthenticated || !user) {
      // Rediriger vers la page de connexion
      router.push(`/auth?redirect=/courses/${course.id}`)
      return
    }

    // Si déjà inscrit, rediriger vers /learn/id
    if (isEnrolled) {
      router.push(`/learn/${course.id}`)
      return
    }

    // Ouvrir le modal d'attentes
    setShowEnrollmentModal(true)
  }

  // Gérer la confirmation d'inscription depuis le modal
  const handleConfirmEnrollment = (expectations: string) => {
    enrollMutation.mutate(expectations)
  }

  // Charger les avis du cours
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", course.id],
    queryFn: () => reviewService.getReviewsByCourse(typeof course.id === 'string' ? parseInt(course.id, 10) : course.id),
    staleTime: 5 * 60 * 1000,
  })

  // Utiliser le curriculum du cours de manière statique
  const curriculum = useMemo(() => {
    if (!course.curriculum || !Array.isArray(course.curriculum)) return []
    return course.curriculum.filter(module => module && module.id)
  }, [course.curriculum])

  const totalLectures = getTotalLectures(curriculum)

  const totalRealDuration = useMemo(() => {
    if (!curriculum || curriculum.length === 0) return 0
    return curriculum.reduce((totalMinutes, module) => {
      const moduleMinutes = (module.lessons || []).reduce((acc, lesson) => {
        const duration = lesson.duration || "0m"
        const minutes = parseInt(duration.replace(/[^0-9]/g, "")) || 0
        return acc + minutes
      }, 0)
      return totalMinutes + moduleMinutes
    }, 0)
  }, [curriculum])

  const formattedTotalRealDuration = useMemo(() => {
    if (totalRealDuration === 0) return "0m"
    const hours = Math.floor(totalRealDuration / 60)
    const minutes = totalRealDuration % 60
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h`
    return `${minutes}m`
  }, [totalRealDuration])

  // Handle tab click with simple scroll - pas de scroll spy, pas de logique automatique
  const handleTabClick = (value: string) => {
    setActiveTab(value)
    
    const element = document.getElementById(value)
    if (element) {
      const offset = 120
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      // Scroll simple sans aucune logique supplémentaire
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  // Extended description
  const fullDescription = `${course.description}\n\nCe cours vous guidera à travers tous les concepts essentiels et avancés. Vous travaillerez sur des projets réels et obtiendrez les compétences nécessaires pour exceller dans votre domaine. Notre approche pratique vous permettra de mettre immédiatement en application ce que vous apprenez.`

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Breadcrumb Navigation */}
        <FadeInView>
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Accueil
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/courses" className="text-muted-foreground hover:text-primary transition-colors">
              Cours
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium line-clamp-1">{course.title}</span>
          </nav>
        </FadeInView>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Header Section */}
            <FadeInView>
              <div className="space-y-4">
                {/* Category Badge */}
                <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
                  {course.category}
                </Badge>

                {/* Title & Subtitle */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground leading-tight">
                    {course.title}
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    {course.subtitle}
                  </p>
                </div>

                {/* Rating & Stats */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">{course.rating.toFixed(1)}</span>
                    <RatingStars rating={course.rating} size="md" />
                    <span className="text-sm text-muted-foreground">
                      ({course.reviewCount.toLocaleString()} avis)
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.enrolledCount.toLocaleString()} étudiants inscrits</span>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Dernière mise à jour : {course.lastUpdated}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success("Lien copié", {
                        description: "Le lien du cours a été copié dans le presse-papier",
                      })
                    }}
                    aria-label="Partager"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all"
                    aria-label="Enregistrer"
                  >
                    <Bookmark className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all"
                        aria-label="Plus d'options"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Signaler un problème</DropdownMenuItem>
                      <DropdownMenuItem>Partager sur les réseaux sociaux</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </FadeInView>

            {/* Tabs Navigation */}
            <FadeInView>
              <Tabs value={activeTab} onValueChange={handleTabClick} className="w-full">
                <TabsList className={`grid w-full ${reviews.length > 0 ? 'grid-cols-4' : 'grid-cols-3'} h-auto p-1 bg-muted/50`}>
                  <TabsTrigger value="overview" className="text-xs sm:text-sm">
                    Aperçu
                  </TabsTrigger>
                  <TabsTrigger value="content" className="text-xs sm:text-sm">
                    Contenu
                  </TabsTrigger>
                  <TabsTrigger value="instructor" className="text-xs sm:text-sm">
                    Instructeur
                  </TabsTrigger>
                  {reviews.length > 0 && (
                    <TabsTrigger value="reviews" className="text-xs sm:text-sm">
                      Avis
                  </TabsTrigger>
                  )}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" id="overview" className="mt-6 space-y-6">
                  {/* Course Description */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-foreground">À propos de ce cours</h2>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <p className="whitespace-pre-line">
                        {showFullDescription ? fullDescription : course.description}
                      </p>
                      {!showFullDescription && (
                        <button
                          onClick={() => setShowFullDescription(true)}
                          className="text-primary hover:underline mt-2 font-medium"
                        >
                          Afficher plus
                        </button>
                      )}
                      {showFullDescription && (
                        <button
                          onClick={() => setShowFullDescription(false)}
                          className="text-primary hover:underline mt-2 font-medium"
                        >
                          Afficher moins
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Objectives */}
                  {course.objectives && course.objectives.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-foreground">Ce que vous apprendrez</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {course.objectives
                              .filter((objective) => objective !== null && objective !== undefined)
                          .map((objective: any, index) => {
                                const objectiveText = typeof objective === 'string' 
                                  ? objective 
                                  : (typeof objective === 'object' && objective !== null
                                  ? String((objective as any).title || (objective as any).text || (objective as any).name || JSON.stringify(objective))
                                  : String(objective || ''))
                                
                            if (!objectiveText || objectiveText.trim() === '') return null
                                
                                return (
                                  <div key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">{objectiveText}</span>
                                  </div>
                            )
                          })}
                      </div>
                    </div>
                  )}

                  {/* Course Features */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground">Ce que vous obtenez</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.features && Array.isArray(course.features) 
                        ? course.features
                            .filter((feature) => feature !== null && feature !== undefined)
                            .map((feature: any, index) => {
                              const featureText = typeof feature === 'string' 
                                ? feature 
                                : (typeof feature === 'object' && feature !== null
                                    ? String((feature as any).title || (feature as any).text || (feature as any).name || JSON.stringify(feature))
                                    : String(feature || ''))
                              
                              if (!featureText || featureText.trim() === '') return null
                              
                              return (
                                <div key={index} className="flex items-center gap-3 p-3 border-2 rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-all">
                                  <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                  </div>
                                  <span className="text-muted-foreground font-medium">{featureText}</span>
                                </div>
                              )
                            })
                        : null}
                  </div>
                  </div>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" id="content" className="mt-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-foreground">Contenu du cours</h2>
                    {curriculum && curriculum.length > 0 ? (
                  <div className="space-y-4">
                        {curriculum
                          .filter(module => module && module.id && typeof module.id === 'string')
                          .map((module, moduleIndex) => {
                            try {
                              const lessons = Array.isArray(module.lessons) 
                                ? module.lessons.filter(lesson => lesson && typeof lesson === 'object')
                                : []
                              const moduleTitle = String(module.title || "").trim()

                              if (!moduleTitle || moduleTitle === "") {
                                return null
                              }

                          return (
                                <div 
                              key={String(module.id)} 
                                  className="border-2 border-border rounded-xl p-4 hover:border-primary/50 transition-all duration-200 bg-card shadow-sm"
                                >
                                  <div className="font-bold text-lg text-foreground mb-3">
                                    {moduleTitle}
                                    </div>
                                  <div className="space-y-2">
                                    {lessons.length > 0 ? (
                                      lessons
                                        .filter(lesson => {
                                          if (!lesson || typeof lesson !== 'object') return false
                                          const id = lesson.id
                                          const title = lesson.title
                                          return id !== null && id !== undefined && 
                                                 title !== null && title !== undefined &&
                                                 String(title).trim() !== ''
                                        })
                                        .map((lesson, lessonIndex) => {
                                          try {
                                            const lessonId = String(lesson.id || "")
                                            const lessonTitle = String(lesson.title || "").trim()
                                            const lessonType = String(lesson.type || "video")
                                            const lessonDuration = lesson.duration ? String(lesson.duration) : undefined
                                            const isVideo = lessonType === "video"
                                            const isQuiz = lessonType === "quiz"
                                            
                                            if (!lessonId || lessonId === "" || !lessonTitle || lessonTitle === "") {
                                              return null
                                            }
                                      
                                      return (
                                  <Link
                                                key={lessonId}
                                                href={`/learn/${course.id}?lesson=${lessonId}`}
                                                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all"
                                              >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center border border-border group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                                              {isVideo ? (
                                                      <Play className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                              ) : isQuiz ? (
                                                      <FileText className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                              ) : (
                                                      <Video className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                              )}
                                            </div>
                                                  <span className="text-sm text-foreground/90 group-hover:text-foreground">
                                                    {lessonTitle}
                                        </span>
                                      </div>
                                                {lessonDuration && (
                                              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                                                    {lessonDuration}
                                              </span>
                                            )}
                                  </Link>
                                      )
                                          } catch (error) {
                                            console.error("Erreur lors du rendu d'une leçon:", error, lesson)
                                            return null
                                          }
                                    })
                                        .filter((item): item is React.ReactElement => item !== null && item !== undefined)
                                  ) : (
                                      <div className="p-2 text-center text-muted-foreground border border-dashed border-border rounded-lg text-sm">
                                      Aucune leçon disponible dans ce module
                                    </div>
                                  )}
                              </div>
                                </div>
                          )
                            } catch (error) {
                              console.error("Erreur lors du rendu d'un module:", error, module)
                              return null
                            }
                        })
                          .filter((item): item is React.ReactElement => item !== null && item !== undefined)}
                      </div>
                      ) : (
                        <div className="p-8 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Aucun contenu disponible pour ce cours</p>
                        </div>
                      )}
                  </div>
                </TabsContent>

                {/* Instructor Tab */}
                <TabsContent value="instructor" id="instructor" className="mt-6">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">Votre instructeur</h2>
                    {course.instructor && (
                      <Card className="border-2">
                      <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 border-2 border-primary/20">
                              <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                                {course.instructor.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-2 text-foreground">{course.instructor.name}</h3>
                              <p className="text-muted-foreground mb-4">{course.instructor.title}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-1.5">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span>{course.instructor.rating.toFixed(1)} Note instructeur</span>
                            </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-4 w-4" />
                                  <span>{(course.instructor as any).students?.toLocaleString() || "0"} Étudiants</span>
                              </div>
                                <div className="flex items-center gap-1.5">
                                  <Award className="h-4 w-4" />
                                  <span>{(course.instructor as any).courses || "0"} Cours</span>
                            </div>
                              </div>
                              <p className="text-muted-foreground">{course.instructor.bio}</p>
                        </div>
                      </div>
                      </CardContent>
                    </Card>
                  )}
                  </div>
                </TabsContent>

                {/* Reviews Tab - Dynamique */}
                {reviews.length > 0 && (
                  <TabsContent value="reviews" id="reviews" className="mt-6">
                  <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-4 text-foreground">Avis des étudiants</h2>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="text-4xl font-bold text-foreground">{course.rating.toFixed(1)}</div>
                          <div>
                            <RatingStars rating={course.rating} size="lg" />
                            <p className="text-sm text-muted-foreground mt-1">
                              Basé sur {course.reviewCount.toLocaleString()} avis
                            </p>
                          </div>
                                </div>
                              </div>
                    <div className="space-y-4">
                        {reviews.map((review: any, index: number) => {
                          const userName = review.user?.fullName || review.user?.name || "Apprenant"
                          const userAvatar = review.user?.avatar || null
                          const rating = review.rating || 0
                          const comment = review.comment || review.content || ""
                          const createdAt = review.createdAt || ""

                          return (
                            <Card key={review.id || index} className="border-2">
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                                    <AvatarImage src={userAvatar} alt={userName} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                      {userName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <p className="font-bold text-foreground">{userName}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <RatingStars rating={rating} size="sm" />
                                          <span className="text-sm text-muted-foreground">{rating.toFixed(1)}</span>
                                        </div>
                                      </div>
                                      {createdAt && (
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(createdAt).toLocaleDateString('fr-FR')}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-muted-foreground mt-2">{comment}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                    </div>
                  </div>
                </TabsContent>
                )}
              </Tabs>
            </FadeInView>
          </div>

          {/* Right Sidebar - Course Info Card */}
          <div className="lg:w-80 flex-shrink-0">
            <FadeInView>
              <Card className="sticky top-24 border-2 shadow-lg">
                <CardContent className="p-6">
                  {/* Course Preview Image */}
                  {(course as any).thumbnail && (
                    <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden border-2 border-border">
                      <img
                        src={(course as any).thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button
                    className="w-full mb-4 h-12 text-base font-semibold"
                    size="lg"
                    onClick={handleEnrollClick}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inscription...
                        </>
                    ) : isEnrolled ? (
                        <>
                        <Play className="mr-2 h-5 w-5" />
                        Continuer le cours
                        </>
                    ) : (
                      "S'inscrire gratuitement"
                      )}
                  </Button>

                  {/* Course Stats */}
                  <div className="space-y-3 mb-4 pb-4 border-b border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Niveau</span>
                      <Badge className={getDifficultyColor((course as any).difficulty || "Débutant")}>
                        {(course as any).difficulty || "Débutant"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Durée totale</span>
                      <span className="font-medium text-foreground">{formattedTotalRealDuration}</span>
                      </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Leçons</span>
                      <span className="font-medium text-foreground">{totalLectures}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Langue</span>
                      <span className="font-medium text-foreground">Français</span>
                    </div>
                  </div>

                  {/* What You Get */}
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-bold text-sm mb-3 text-foreground">Ce que vous obtenez :</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Certificat</span>
                      </div>
                      {course.features && Array.isArray(course.features) 
                        ? course.features
                            .slice(0, 3)
                            .filter((feature) => feature !== null && feature !== undefined)
                            .map((feature: any, index) => {
                              const featureText = typeof feature === 'string' 
                                ? feature 
                                : (typeof feature === 'object' && feature !== null
                                    ? String((feature as any).title || (feature as any).text || (feature as any).name || JSON.stringify(feature))
                                    : String(feature || ''))
                              
                              if (!featureText || featureText.trim() === '') {
                                return null
                              }
                              
                              return (
                                <div key={index} className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground">{featureText}</span>
                                </div>
                              )
                            })
                        : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInView>
          </div>
        </div>
      </div>

      {/* Modal d'attentes d'inscription */}
      <EnrollmentExpectationsModal
        open={showEnrollmentModal}
        onOpenChange={setShowEnrollmentModal}
        onConfirm={handleConfirmEnrollment}
        courseTitle={course.title}
        isLoading={enrollMutation.isPending}
      />
    </div>
  )
}
