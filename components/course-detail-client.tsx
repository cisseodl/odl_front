"use client"

import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Share2, Bookmark, MoreVertical, Play, Plus, Star, Clock, Users, Award, CheckCircle2, FileText, Video, BookOpen, HelpCircle, ArrowLeft, Globe, BarChart3, Infinity, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { VideoPlayer } from "@/components/video-player"
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
import { useScrollSpy } from "@/hooks/use-scroll-spy"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { moduleService, courseService } from "@/lib/api/services"
import { adaptModule } from "@/lib/api/adapters"
import { CourseSidebar } from "@/components/course-sidebar"
import { useAuthStore } from "@/lib/store/auth-store"
import { EnrollmentExpectationsModal } from "@/components/enrollment-expectations-modal"
import type { Course, Module } from "@/lib/types"

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
  return curriculum.reduce((total, module) => total + module.lessons.length, 0)
}

export function CourseDetailClient({ course }: CourseDetailClientProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState("content") // Par défaut, afficher l'onglet "Contenu" pour voir les modules/leçons
  const [dynamicCurriculum, setDynamicCurriculum] = useState<Module[] | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [showExpectationsModal, setShowExpectationsModal] = useState(false)
  const queryClient = useQueryClient()

  // Convertir course.id en nombre de manière sécurisée
  // Utiliser une valeur stable pour éviter les re-renders infinis
  const courseIdNum = useMemo(() => {
    if (!course || course.id === undefined || course.id === null) {
      return null
    }
    
    // Essayer de convertir en nombre
    let numId: number | null = null
    
    // Si c'est déjà un nombre
    if (typeof course.id === 'number') {
      numId = Number.isNaN(course.id) ? null : course.id
    }
    // Si c'est une string
    else if (typeof course.id === 'string') {
      const parsed = parseInt(course.id, 10)
      numId = Number.isNaN(parsed) ? null : parsed
    }
    // Si c'est un objet, essayer d'extraire la valeur
    else if (typeof course.id === 'object' && course.id !== null) {
      const idObj = course.id as any
      // Essayer différentes propriétés possibles
      const idValue = idObj.id || idObj.value || idObj.toString?.() || JSON.stringify(idObj)
      const parsed = parseInt(String(idValue), 10)
      numId = Number.isNaN(parsed) ? null : parsed
    }
    // Sinon, essayer de convertir en string puis en nombre
    else {
      const strId = String(course.id)
      const parsed = parseInt(strId, 10)
      numId = Number.isNaN(parsed) ? null : parsed
    }
    
    return numId
  }, [course?.id]) // Ne dépendre que de course.id, pas de tout l'objet course

  // Vérifier si l'utilisateur a un profil apprenant
  const hasLearnerProfile = useMemo(() => {
    if (!user) return false
    // Vérifier si l'utilisateur a un profil apprenant
    const learner = (user as any)?.learner
    return !!learner
  }, [user])

  // Handler pour l'inscription - ouvre le modal d'attentes
  const handleEnroll = () => {
    // Vérifier l'authentification
    // Si l'utilisateur n'est PAS connecté, rediriger vers le login
    if (!isAuthenticated || !user) {
      toast.error("Authentification requise", {
        description: "Vous devez être connecté pour vous inscrire à un cours.",
      })
      router.push("/auth?redirect=/courses/" + course.id)
      return
    }

    // Si l'utilisateur est connecté (même sans profil apprenant), ouvrir directement le modal d'attentes
    // Le backend gérera la vérification du profil apprenant lors de l'inscription
    setShowExpectationsModal(true)
  }

  // Handler pour confirmer l'inscription avec les attentes
  const handleConfirmEnrollment = (expectations: string) => {
    console.log("🟡 [ENROLLMENT] handleConfirmEnrollment appelé:", { 
      courseIdNum, 
      expectationsLength: expectations?.length,
      isPending: enrollMutation.isPending 
    })
    
    // Vérifier l'authentification et le token
    if (!isAuthenticated || !user) {
      console.error("🔴 [ENROLLMENT] Utilisateur non authentifié")
      toast.error("Authentification requise", { description: "Veuillez vous connecter pour vous inscrire." })
      router.push("/auth?redirect=/courses/" + course.id)
      return
    }
    
    // Vérifier que le token existe
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      console.log("🔑 [ENROLLMENT] Token dans localStorage:", token ? `présent (${token.length} caractères)` : "absent")
      if (!token) {
        console.error("🔴 [ENROLLMENT] Aucun token trouvé dans localStorage")
        toast.error("Session expirée", { description: "Veuillez vous reconnecter." })
        router.push("/auth?redirect=/courses/" + course.id)
        return
      }
    }
    
    // Vérifier que courseIdNum est valide
    if (!courseIdNum) {
      console.error("🔴 [ENROLLMENT] courseIdNum est null ou undefined", {
        courseId: course.id,
        courseIdType: typeof course.id,
        courseIdNum,
        course: course
      })
      // Essayer de récupérer l'ID depuis l'URL si disponible
      const urlPath = window.location.pathname
      const urlMatch = urlPath.match(/\/courses\/(\d+)/)
      if (urlMatch && urlMatch[1]) {
        const urlCourseId = parseInt(urlMatch[1], 10)
        console.log("🟢 [ENROLLMENT] ID récupéré depuis l'URL:", urlCourseId)
        if (!Number.isNaN(urlCourseId)) {
          enrollMutation.mutate({ courseId: urlCourseId, expectations })
          return
        }
      }
      toast.error("Erreur", { description: "ID du cours invalide. Veuillez rafraîchir la page." })
      return
    }
    
    // Empêcher les appels multiples
    if (enrollMutation.isPending) {
      console.warn("🟡 [ENROLLMENT] Mutation déjà en cours, ignore la nouvelle demande")
      return
    }
    
    console.log("🟢 [ENROLLMENT] Appel de enrollMutation.mutate avec:", { courseId: courseIdNum, expectations })
    enrollMutation.mutate({ courseId: courseIdNum, expectations })
  }

  // Mutation pour s'inscrire au cours avec attentes
  const enrollMutation = useMutation({
    mutationFn: async ({ courseId, expectations }: { courseId: number; expectations: string }) => {
      console.log("🔵 [ENROLLMENT] Début de l'inscription:", { courseId, expectationsLength: expectations?.length })
      
      // Vérifier que les attentes sont bien fournies
      if (!expectations || expectations.trim().length < 10) {
        throw new Error("Les attentes doivent contenir au moins 10 caractères")
      }
      
      try {
        // Ajouter un timeout pour éviter un blocage infini
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout: La requête a pris trop de temps")), 30000) // 30 secondes
        })
        
        const enrollmentPromise = courseService.enrollInCourse(courseId, expectations.trim())
        
        const response = await Promise.race([enrollmentPromise, timeoutPromise]) as any
        console.log("🟢 [ENROLLMENT] Réponse de l'API:", { 
          ok: response.ok, 
          message: response.message,
          hasData: !!response.data 
        })
        
        // Si la réponse indique une erreur (ok: false), lancer une erreur pour déclencher onError
        if (!response.ok) {
          const errorMessage = response.message || "Erreur lors de l'inscription"
          console.error("🔴 [ENROLLMENT] Erreur de l'API:", errorMessage)
          throw new Error(errorMessage)
        }
        
        console.log("✅ [ENROLLMENT] Inscription réussie, données:", response.data)
        return response
      } catch (error: any) {
        console.error("🔴 [ENROLLMENT] Erreur lors de l'inscription:", error)
        // S'assurer que l'erreur est bien propagée
        throw error instanceof Error ? error : new Error(String(error))
      }
    },
    onSuccess: (response: any) => {
      console.log("enrollMutation.onSuccess appelé avec:", response)
      
      // Fermer le modal immédiatement
      setShowExpectationsModal(false)
      
      // Afficher le message de succès
      toast.success("Inscription réussie !", {
        description: "Vous êtes maintenant inscrit au cours. Redirection vers le contenu...",
      })
      
      // Mettre à jour l'état local
      setIsEnrolled(true)
      
      // Invalider les caches pour recharger les données
      queryClient.invalidateQueries({ queryKey: ["modules", courseIdNum] })
      queryClient.invalidateQueries({ queryKey: ["course", courseIdNum] })
      
      // Rediriger immédiatement vers la page d'apprentissage du cours (modules/leçons)
      if (courseIdNum) {
        router.push(`/learn/${courseIdNum}`)
      }
    },
    onError: (error: any) => {
      console.log("enrollMutation.onError appelé avec:", error)
      setShowExpectationsModal(false)
      const errorMessage = error?.message || error?.response?.data?.message || "Erreur lors de l'inscription"
      console.log("errorMessage:", errorMessage)
      
      // Si l'erreur indique que l'utilisateur est déjà inscrit, on considère qu'il est inscrit
      if (errorMessage.includes("déjà inscrit") || errorMessage.includes("déjà inscrit")) {
        setIsEnrolled(true)
        toast.info("Vous êtes déjà inscrit à ce cours", {
          description: "Vous pouvez accéder aux modules et leçons.",
        })
        queryClient.invalidateQueries({ queryKey: ["modules", courseIdNum] })
        // Rediriger vers la page d'apprentissage du cours
        if (courseIdNum) {
          setTimeout(() => {
            router.push(`/learn/${courseIdNum}`)
          }, 500)
        }
      } else if (errorMessage.includes("non authentifié") || errorMessage.includes("401") || errorMessage.includes("403")) {
        // Erreur d'authentification, rediriger vers la page d'authentification
        toast.error("Authentification requise", {
          description: "Vous devez être connecté pour vous inscrire à un cours.",
        })
        router.push("/auth?redirect=/courses/" + course.id)
      } else {
        toast.error("Erreur d'inscription", {
          description: errorMessage,
        })
      }
    },
  })

  // Vérifier l'inscription en essayant de charger les modules (même si on pense ne pas être inscrit)
  // Cela permet de détecter si l'utilisateur est déjà inscrit au chargement de la page
  const { data: modulesFromApi, isLoading: isLoadingModules, error: modulesError } = useQuery({
    queryKey: ["modules", courseIdNum],
    queryFn: () => moduleService.getModulesByCourse(courseIdNum!),
    enabled: courseIdNum !== null && !Number.isNaN(courseIdNum!),
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
    retry: 1, // Réessayer 1 fois en cas d'erreur
    onError: (error: any) => {
      console.error("Erreur lors du chargement des modules:", error)
      // Si l'erreur indique qu'il faut s'inscrire, l'utilisateur n'est pas inscrit
      const errorMessage = error?.message || ""
      if (errorMessage.includes("inscrire") || errorMessage.includes("inscription") || errorMessage.includes("inscrit")) {
        setIsEnrolled(false)
      } else {
        // Autre erreur, on considère que l'utilisateur n'est pas inscrit
        setIsEnrolled(false)
      }
    },
    onSuccess: () => {
      // Si les modules se chargent, l'utilisateur est inscrit
      setIsEnrolled(true)
    }
  })

  // Vérifier l'inscription au chargement initial
  useEffect(() => {
    if (courseIdNum && !isLoadingModules) {
      if (modulesFromApi && Array.isArray(modulesFromApi) && modulesFromApi.length > 0) {
        setIsEnrolled(true)
      } else if (modulesError) {
        // Si erreur, vérifier si c'est une erreur d'inscription
        const errorMessage = modulesError?.message || ""
        if (!errorMessage.includes("inscrire") && !errorMessage.includes("inscription") && !errorMessage.includes("inscrit")) {
          // Si ce n'est pas une erreur d'inscription, on considère que l'utilisateur est inscrit mais qu'il n'y a pas de modules
          setIsEnrolled(true)
        }
      }
    }
  }, [courseIdNum, isLoadingModules, modulesFromApi, modulesError])

  // Adapter les modules de l'API si nécessaire
  useEffect(() => {
    if (modulesFromApi) {
      if (modulesFromApi.length > 0) {
        const adaptedModules = modulesFromApi.map(adaptModule)
        setDynamicCurriculum(adaptedModules)
      } else {
        // Si l'API retourne un tableau vide, réinitialiser
        setDynamicCurriculum([])
      }
    } else if (modulesFromApi === null || modulesFromApi === undefined) {
      // Si la requête n'a pas encore été exécutée ou a échoué, ne pas réinitialiser
      // On garde dynamicCurriculum tel quel
    }
  }, [modulesFromApi])

  // Utiliser le curriculum du cours s'il existe et n'est pas vide, sinon utiliser les modules chargés dynamiquement
  // Priorité : modules chargés dynamiquement > curriculum du cours (pour avoir les données les plus récentes)
  const curriculum = useMemo(() => {
    // Priorité 1 : Utiliser les modules chargés dynamiquement depuis l'API (données les plus récentes)
    if (dynamicCurriculum && Array.isArray(dynamicCurriculum) && dynamicCurriculum.length > 0) {
      return dynamicCurriculum
    }
    // Priorité 2 : Utiliser le curriculum du cours s'il existe
    if (course.curriculum && Array.isArray(course.curriculum) && course.curriculum.length > 0) {
      return course.curriculum
    }
    // Si aucun des deux n'est disponible, retourner un tableau vide
    return []
  }, [course.curriculum, dynamicCurriculum])
  const totalLectures = getTotalLectures(curriculum)

  // Scroll spy for tabs
  const sectionIds = ["overview", "content", "instructor", "reviews", "faq"]
  const activeSection = useScrollSpy({ sectionIds, offset: 150 })

  // Update active tab based on scroll position
  useEffect(() => {
    if (activeSection) {
      setActiveTab(activeSection)
    }
  }, [activeSection])

  // Handle tab click with smooth scroll
  const handleTabClick = (value: string) => {
    setActiveTab(value)
    const element = document.getElementById(value)
    if (element) {
      const offset = 120 // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  // Extended description
  const fullDescription = `${course.description}\n\nCe cours vous guidera à travers tous les concepts essentiels et avancés. Vous travaillerez sur des projets réels et obtiendrez les compétences nécessaires pour exceller dans votre domaine. Notre approche pratique vous permettra de mettre immédiatement en application ce que vous apprenez.`

  // Mock reviews data
  const reviews = [
    {
      id: "1",
      user: "Kadiatou Traoré",
      avatar: "/woman-developer-smiling.jpg",
      rating: 5,
      date: "Il y a 2 jours",
      comment: "Excellent cours ! Les explications sont très claires et les projets pratiques sont vraiment utiles. Je recommande vivement.",
      helpful: 12,
    },
    {
      id: "2",
      user: "Amadou Keita",
      avatar: "/man-data-scientist-portrait.jpg",
      rating: 5,
      date: "Il y a 5 jours",
      comment: "Le meilleur cours que j'ai suivi sur ce sujet. Le formateur est très pédagogue et le contenu est à jour.",
      helpful: 8,
    },
    {
      id: "3",
      user: "Mariam Sangaré",
      avatar: "/woman-designer-happy.jpg",
      rating: 4,
      date: "Il y a 1 semaine",
      comment: "Très bon cours dans l'ensemble. Quelques sections pourraient être plus détaillées, mais globalement c'est excellent.",
      helpful: 5,
    },
  ]

  // Mock FAQ data
  const faqs = [
    {
      question: "Quels sont les prérequis pour ce cours ?",
      answer: "Ce cours est conçu pour les développeurs ayant une connaissance de base en JavaScript. Aucune expérience préalable avec React n'est nécessaire.",
    },
    {
      question: "Puis-je accéder au cours à vie ?",
      answer: "Oui, une fois inscrit, vous avez un accès à vie au contenu du cours, y compris toutes les mises à jour futures.",
    },
    {
      question: "Y a-t-il un certificat à la fin du cours ?",
      answer: "Oui, vous recevrez un certificat de complétion une fois que vous aurez terminé tous les modules et les projets pratiques.",
    },
    {
      question: "Puis-je poser des questions au formateur ?",
      answer: "Oui, vous pouvez poser des questions dans la section Q&A du cours et le formateur répondra dans les 24-48 heures.",
    },
  ]

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

        {/* Main Content - Two Column Layout avec Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Main Content (70%) */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Sidebar pour les modules/leçons - Style Udemy */}
            {isEnrolled && curriculum.length > 0 && (
              <div className="lg:hidden mb-6">
                <CourseSidebar 
                  modules={curriculum} 
                  courseId={course.id}
                  isLoading={isLoadingModules}
                />
              </div>
            )}
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
                    aria-label="Favoris"
                  >
                    <Bookmark className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-foreground/80 hover:bg-primary/10" aria-label="Plus d'options">
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

            {/* Video Preview */}
            <FadeInView delay={0.1}>
              <Card className="border-2 hover:border-primary/20 transition-all duration-300 overflow-hidden">
                <VideoPlayer
                  thumbnail={course.imageUrl}
                  title={course.title}
                  className="w-full"
                />
              </Card>
            </FadeInView>

            {/* Tabs Section */}
            <FadeInView delay={0.2}>
              <Tabs value={activeTab} onValueChange={handleTabClick} className="w-full">
                <div className="course-detail-tabs sticky top-0 md:top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
                  <TabsList className="bg-transparent border-0 h-auto p-0 w-full justify-start gap-0 overflow-x-auto">
                    <TabsTrigger 
                      value="overview" 
                      className="px-6 py-4 text-sm font-medium text-gray-600 hover:text-black transition-all duration-200 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:bg-transparent min-w-fit whitespace-nowrap"
                    >
                    Aperçu
                  </TabsTrigger>
                    <TabsTrigger 
                      value="content" 
                      className="px-6 py-4 text-sm font-medium text-gray-600 hover:text-black transition-all duration-200 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:bg-transparent min-w-fit whitespace-nowrap"
                    >
                    Contenu
                  </TabsTrigger>
                    <TabsTrigger 
                      value="instructor" 
                      className="px-6 py-4 text-sm font-medium text-gray-600 hover:text-black transition-all duration-200 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:bg-transparent min-w-fit whitespace-nowrap"
                    >
                    Formateur
                  </TabsTrigger>
                    <TabsTrigger 
                      value="reviews" 
                      className="px-6 py-4 text-sm font-medium text-gray-600 hover:text-black transition-all duration-200 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:bg-transparent min-w-fit whitespace-nowrap"
                    >
                      <span className="flex items-center gap-2">
                        Avis
                        <span className="text-xs font-normal text-gray-500 data-[state=active]:text-primary/70">
                          ({course.reviewCount.toLocaleString()})
                        </span>
                      </span>
                  </TabsTrigger>
                    <TabsTrigger 
                      value="faq" 
                      className="px-6 py-4 text-sm font-medium text-gray-600 hover:text-black transition-all duration-200 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:bg-transparent min-w-fit whitespace-nowrap"
                    >
                    FAQ
                  </TabsTrigger>
                </TabsList>
                </div>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div id="overview" className="scroll-mt-24">
                  {/* Description */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground">À propos de ce cours</h3>
                    <div className="text-muted-foreground leading-relaxed space-y-4">
                      {showFullDescription ? (
                        <div className="whitespace-pre-line">{fullDescription}</div>
                      ) : (
                        <p>{course.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-primary hover:text-primary/80 hover:bg-primary/10"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                    >
                      <Plus className={`h-4 w-4 mr-1 transition-transform duration-200 ${showFullDescription ? "rotate-45" : ""}`} />
                      {showFullDescription ? "Voir moins" : "Voir plus"}
                    </Button>
                  </div>

                  {/* Objectives */}
                  {course.objectives && course.objectives.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-foreground">Ce que vous apprendrez</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {course.objectives && Array.isArray(course.objectives) ? course.objectives.map((objective, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{objective}</span>
                          </div>
                        )) : null}
                      </div>
                    </div>
                  )}

                  {/* Course Features */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-foreground">Ce que vous obtenez</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.features && Array.isArray(course.features) ? course.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border-2 rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-all">
                          <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{feature}</span>
                        </div>
                      )) : null}
                    </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="mt-6">
                  <div id="content" className="scroll-mt-24">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-foreground">Contenu du cours</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{curriculum.length} sections</span>
                        <span>•</span>
                        <span>{totalLectures || 398} leçons</span>
                        <span>•</span>
                        <span>{course.duration}h de contenu</span>
                      </div>
                    </div>
                    <Accordion type="multiple" className="w-full space-y-3" defaultValue={curriculum.length > 0 && curriculum[0]?.id ? [String(curriculum[0].id)] : []}>
                      {!isEnrolled ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <BookOpen className="h-12 w-12 text-primary/50" />
                            <p className="font-medium text-lg">Inscrivez-vous pour accéder aux modules et leçons</p>
                            <p className="text-sm">Cliquez sur le bouton "S'inscrire gratuitement" ci-dessus pour commencer</p>
                          </div>
                        </div>
                      ) : isLoadingModules ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <div className="flex items-center justify-center gap-3">
                            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="font-medium">Chargement des modules et leçons...</span>
                          </div>
                        </div>
                      ) : curriculum.length > 0 ? (
                        curriculum.filter(module => module && module.id).map((module, moduleIndex) => {
                          const totalLessons = module.lessons?.length || 0
                          const totalDuration = module.lessons?.reduce((acc, lesson) => {
                            const duration = lesson.duration || "0m"
                            const minutes = parseInt(duration.replace(/[^0-9]/g, "")) || 0
                            return acc + minutes
                          }, 0) || 0
                          const formattedDuration = totalDuration > 60 
                            ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`
                            : `${totalDuration}m`

                          return (
                            <AccordionItem 
                              key={String(module.id)} 
                              value={String(module.id)} 
                              className="border-2 border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-200 bg-card shadow-sm"
                            >
                              <AccordionTrigger className="hover:no-underline px-6 py-5">
                                <div className="flex items-start justify-between w-full pr-6">
                                  <div className="flex items-start gap-4 flex-1">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                      <span className="text-sm font-bold text-primary">{moduleIndex + 1}</span>
                                    </div>
                                <div className="flex-1 text-left">
                                      <div className="font-bold text-lg text-foreground mb-1.5">
                                        {module.title}
                                  </div>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                          <BookOpen className="h-4 w-4" />
                                          {totalLessons} leçon{totalLessons > 1 ? "s" : ""}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                          <Clock className="h-4 w-4" />
                                          {formattedDuration}
                                        </span>
                                      </div>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                              <AccordionContent className="px-6 pb-5 pt-0">
                                <div className="space-y-1.5 mt-3 ml-14">
                                  {module.lessons && Array.isArray(module.lessons) && module.lessons.length > 0 ? (
                                    module.lessons.filter(lesson => lesson && lesson.id).map((lesson, lessonIndex) => {
                                      const lessonNumber = lessonIndex + 1
                                      const isVideo = lesson.type === "video"
                                      const isQuiz = lesson.type === "quiz"
                                      
                                      return (
                                  <Link
                                    key={String(lesson.id)}
                                    href={`/learn/${course.id}?lesson=${lesson.id}`}
                                          className="flex items-center justify-between p-4 rounded-lg hover:bg-primary/5 hover:border-l-4 hover:border-primary transition-all duration-200 group border border-transparent hover:border-primary/20 bg-muted/30"
                                        >
                                          <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-colors">
                                              {isVideo ? (
                                                <Play className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                                              ) : isQuiz ? (
                                                <FileText className="h-3.5 w-3.5 text-primary" />
                                              ) : (
                                                <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary">
                                                  {lessonNumber}
                                      </span>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {isVideo && <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                                                {isQuiz && <FileText className="h-4 w-4 text-primary flex-shrink-0" />}
                                                <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground truncate">
                                          {lesson.title}
                                        </span>
                                      </div>
                                              {isQuiz && (
                                                <Badge className="bg-primary/10 text-primary text-xs border-primary/20 font-medium flex-shrink-0">
                                          Quiz
                                        </Badge>
                                      )}
                                    </div>
                                          </div>
                                          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                            {lesson.duration && (
                                              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                                                {lesson.duration}
                                              </span>
                                            )}
                                            <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-colors">
                                              <Play className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                            </div>
                                    </div>
                                  </Link>
                                      )
                                    })
                                  ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground bg-muted/50 rounded-lg">
                                      Aucune leçon disponible dans ce module
                                    </div>
                                  )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          )
                        })
                      ) : (
                        <div className="p-8 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-base font-medium text-foreground mb-2">Aucun module disponible pour ce cours</p>
                          <p className="text-sm text-muted-foreground">Les modules et leçons seront ajoutés prochainement.</p>
                        </div>
                      )}
                    </Accordion>
                  </div>
                  </div>
                </TabsContent>

                {/* Instructor Tab */}
                <TabsContent value="instructor" className="mt-6">
                  <div id="instructor" className="scroll-mt-24">
                  {course.instructor ? (
                    <Card className="border-2 hover:border-primary/20 transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <Avatar className="h-24 w-24 border-2 border-primary/30">
                            <AvatarImage src={course.instructor?.avatar || "/placeholder-user.jpg"} alt={course.instructor?.name || "Instructeur"} />
                            <AvatarFallback className="bg-primary text-white font-bold text-xl">
                              {(course.instructor?.name || "I")[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-4">
                            <div>
                              <h3 className="text-2xl font-bold mb-2 text-foreground">{course.instructor?.name || "Instructeur"}</h3>
                              <p className="text-muted-foreground font-medium">{course.instructor?.title || "Formateur"}</p>
                            </div>
                            {course.instructor?.bio && (
                              <p className="text-muted-foreground leading-relaxed">{course.instructor.bio}</p>
                            )}
                          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-sm font-bold text-foreground">{((course.instructor?.rating || 0)).toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">Note moyenne</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-sm font-bold text-foreground">{((course.instructor?.studentCount || 0)).toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Étudiants</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-sm font-bold text-foreground">{course.instructor?.courseCount || 0}</p>
                                <p className="text-xs text-muted-foreground">Cours</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ) : (
                    <Card className="border-2 hover:border-primary/20 transition-all">
                      <CardContent className="p-6">
                        <p className="text-muted-foreground text-center">Informations de l'instructeur non disponibles</p>
                      </CardContent>
                    </Card>
                  )}
                  </div>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-6">
                  <div id="reviews" className="scroll-mt-24">
                  <div className="space-y-6">
                    {/* Review Summary */}
                    <Card className="border-2">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="text-center">
                            <p className="text-5xl font-bold text-foreground mb-2">{course.rating.toFixed(1)}</p>
                            <RatingStars rating={course.rating} size="lg" />
                            <p className="text-sm text-muted-foreground mt-2">
                              Basé sur {course.reviewCount.toLocaleString()} avis
                            </p>
                          </div>
                          <Separator orientation="vertical" className="hidden md:block h-20" />
                          <div className="flex-1 grid grid-cols-5 gap-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <div key={rating} className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{rating}</span>
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${Math.random() * 30 + 50}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {reviews && Array.isArray(reviews) ? reviews.filter(review => review && review.id).map((review) => (
                        <Card key={String(review.id)} className="border-2 hover:border-primary/20 transition-all">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12 border-2 border-primary/30">
                                <AvatarImage src={review.avatar} alt={review.user} />
                                <AvatarFallback className="bg-primary text-white font-bold">
                                  {review.user[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="font-bold text-sm text-foreground">{review.user}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <RatingStars rating={review.rating} size="sm" />
                                      <span className="text-xs text-muted-foreground">{review.date}</span>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                                <div className="flex items-center gap-4 pt-2">
                                  <Button variant="ghost" size="sm" className="text-xs h-7">
                                    Utile ({review.helpful})
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )) : null}
                    </div>
                    </div>
                  </div>
                </TabsContent>

                {/* FAQ Tab */}
                <TabsContent value="faq" className="mt-6">
                  <div id="faq" className="scroll-mt-24">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold mb-4 text-foreground">Questions fréquemment posées</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {faqs && Array.isArray(faqs) ? faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`faq-${index}`} className="border-2 rounded-lg mb-3 px-4 hover:border-primary/40 transition-all">
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3 text-left">
                              <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                              <span className="font-semibold text-foreground">{faq.question}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4 pl-8">
                            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      )) : null}
                    </Accordion>
                  </div>
                  </div>
                </TabsContent>
              </Tabs>
            </FadeInView>
          </div>

          {/* Right Column - Sticky Sidebar (30%) */}
          <div className="lg:w-80 lg:sticky lg:top-20 lg:self-start space-y-6">
            {/* Sidebar Modules/Leçons - Style Udemy (Desktop) */}
            {isEnrolled && curriculum.length > 0 && (
              <FadeInView delay={0.2}>
                <CourseSidebar 
                  modules={curriculum} 
                  courseId={course.id}
                  isLoading={isLoadingModules}
                />
              </FadeInView>
            )}
            
            {/* Card d'inscription - Afficher uniquement si l'utilisateur n'est pas inscrit */}
            {!isEnrolled && (
            <FadeInView delay={0.3}>
              <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-transparent to-transparent shadow-xl">
                <CardHeader className="pb-4 border-b border-border">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Accéder au cours
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* CTA Button */}
                  <Button
                    size="lg"
                    className="w-full bg-primary text-white hover:bg-primary/90 font-bold text-lg h-14 shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={handleEnroll}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Inscription en cours...
                        </>
                      ) : (
                        <>
                      S'inscrire gratuitement
                      <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
                        </>
                      )}
                  </Button>

                  {/* Course Info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Niveau</span>
                      <Badge className={getDifficultyColor(course.level)}>
                        {course.level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Langue</span>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{course.language}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Durée</span>
                      <span className="text-sm font-medium text-foreground">{course.duration}h</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Leçons</span>
                      <span className="text-sm font-medium text-foreground">{totalLectures || 398}</span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-bold text-sm mb-3 text-foreground">Garanties</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="rounded-full bg-green-500 p-1.5">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-900">100% Gratuit</p>
                          <p className="text-xs text-green-700">Accès complet sans frais</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="rounded-full bg-primary p-1.5">
                          <Infinity className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">Accès à vie</p>
                          <p className="text-xs text-muted-foreground">Mises à jour incluses</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="rounded-full bg-orange-500 p-1.5">
                          <Award className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-orange-900">Certificat inclus</p>
                          <p className="text-xs text-orange-700">Reconnu professionnellement</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* What You Get */}
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-bold text-sm mb-3 text-foreground">Ce que vous obtenez :</h4>
                    <div className="space-y-2">
                      {course.features && Array.isArray(course.features) ? course.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      )) : null}
                    </div>
                  </div>

                  {/* Share Section */}
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-bold text-sm mb-3 text-foreground">Partager ce cours</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-primary/20 hover:bg-primary/10 hover:text-primary"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href)
                          toast.success("Lien copié")
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Copier le lien
                      </Button>
                    </div>
                  </div>

                  {/* Instructor Preview */}
                  {course.instructor && (
                    <div className="pt-4 border-t border-border">
                      <h4 className="font-bold text-sm mb-3 text-foreground">Instructeur</h4>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/30">
                          <AvatarImage src={course.instructor?.avatar || "/placeholder-user.jpg"} alt={course.instructor?.name || "Instructeur"} />
                          <AvatarFallback className="bg-primary text-white font-bold">
                            {(course.instructor?.name || "I")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">{course.instructor?.name || "Instructeur"}</p>
                          <p className="text-xs text-muted-foreground truncate">{course.instructor?.title || "Formateur"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInView>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'attentes d'inscription */}
      <EnrollmentExpectationsModal
        open={showExpectationsModal}
        onOpenChange={(open) => {
          setShowExpectationsModal(open)
          // Si le modal se ferme et que la mutation est en cours, annuler la mutation
          if (!open && enrollMutation.isPending) {
            enrollMutation.reset()
          }
        }}
        onConfirm={handleConfirmEnrollment}
        courseTitle={course.title}
        isLoading={enrollMutation.isPending}
      />
    </div>
  )
}
