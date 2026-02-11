"use client"

import { use, useState, useRef, useMemo, useEffect, Fragment } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Play, FileText, Code, FlaskConical, Menu, Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { courseService, learnerService, moduleService, evaluationService, labService, reviewService, quizService } from "@/lib/api/services"
import { adaptModule } from "@/lib/api/adapters"
import { useRouter } from "next/navigation"
import { FileCheck, Award, GraduationCap, HelpCircle, ClipboardList, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import type { Lesson, Module } from "@/lib/types"
import { CourseActivitiesSection } from "@/components/course-activities-section"
import { ReviewSuccessDialog } from "@/components/review-success-dialog" // New import
import { useAuthStore } from "@/lib/store/auth-store"

interface LearnPageProps {
  params: Promise<{ courseId: string }>
}

export default function LearnPage({ params }: LearnPageProps) {
  const { courseId } = use(params)
  const courseIdNum = Number.parseInt(courseId)
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

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

  // ============================================
  // VÉRIFICATION STRICTE D'INSCRIPTION
  // ============================================
  // CRITIQUE : Chaque apprenant authentifié DOIT s'inscrire au cours AVANT de voir /learn/id
  // Cette requête vérifie l'inscription en essayant de charger les modules
  // Si l'utilisateur n'est pas inscrit, le backend retourne une ERREUR
  // Si l'utilisateur est inscrit, le backend retourne les modules (même vide)
  console.log("🔐 [LEARN PAGE] ===== VÉRIFICATION INSCRIPTION =====")
  console.log("🔐 [LEARN PAGE] Course ID:", courseIdNum)
  console.log("🔐 [LEARN PAGE] Is Authenticated:", isAuthenticated)
  console.log("🔐 [LEARN PAGE] User:", user ? `ID: ${user.id}, Email: ${user.email}` : "null")
  
  const {
    data: modulesFromApi,
    isLoading: isLoadingModules,
    error: modulesError,
  } = useQuery({
    queryKey: ["modules", courseIdNum, "enrollment-check"],
    queryFn: async () => {
      console.log("🔐 [LEARN PAGE] Appel API getModulesByCourse pour vérifier l'inscription...")
      try {
        const modules = await moduleService.getModulesByCourse(courseIdNum)
        console.log("✅ [LEARN PAGE] Modules chargés avec succès:", modules?.length || 0, "modules")
        console.log("✅ [LEARN PAGE] L'utilisateur EST INSCRIT (backend a retourné les modules)")
        // Si on peut charger les modules (même un tableau vide), l'utilisateur est inscrit
        return modules || []
      } catch (error: any) {
        console.error("❌ [LEARN PAGE] ERREUR lors du chargement des modules:", error)
        console.error("❌ [LEARN PAGE] Message d'erreur:", error?.message)
        console.error("❌ [LEARN PAGE] L'utilisateur N'EST PAS INSCRIT (backend a retourné une erreur)")
        // Re-lancer l'erreur pour qu'elle soit détectée par React Query
        throw error
      }
    },
    // CRITIQUE : La requête doit être activée UNIQUEMENT si :
    // 1. courseIdNum est valide
    // 2. course est chargé
    // 3. L'utilisateur est authentifié (JWT présent)
    // 4. user est défini
    // IMPORTANT : Si l'utilisateur n'est pas authentifié, la requête ne doit PAS être faite
    // car le backend retournera les modules publiquement au lieu d'une erreur
    enabled: !Number.isNaN(courseIdNum) && !!course && isAuthenticated && !!user,
    retry: false, // Ne pas réessayer si erreur d'inscription
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
  
  console.log("🔐 [LEARN PAGE] État de la requête modules:")
  console.log("🔐 [LEARN PAGE] - isLoadingModules:", isLoadingModules)
  console.log("🔐 [LEARN PAGE] - modulesError:", modulesError ? modulesError.message : "null")
  console.log("🔐 [LEARN PAGE] - modulesFromApi:", modulesFromApi ? `${modulesFromApi.length} modules` : "null/undefined")

  // ============================================
  // CALCUL isEnrolled - LOGIQUE STRICTE
  // ============================================
  // CRITIQUE : L'utilisateur est inscrit UNIQUEMENT si :
  // 1. L'utilisateur est authentifié (isAuthenticated === true ET user !== null)
  // 2. Le chargement est terminé (isLoadingModules === false)
  // 3. Il n'y a PAS d'erreur (modulesError === null)
  // 4. modulesFromApi est défini ET est un tableau (même vide = inscrit mais cours sans modules)
  // IMPORTANT : Par défaut, TOUJOURS considérer comme NON INSCRIT (sécurité maximale)
  const isEnrolled = useMemo(() => {
    console.log("🔐 [ENROLLMENT CHECK] ===== CALCUL isEnrolled =====")
    
    // ÉTAPE 1 : Vérifier l'authentification
    if (!isAuthenticated || !user) {
      console.log("❌ [ENROLLMENT CHECK] ÉTAPE 1: Utilisateur NON authentifié")
      console.log("❌ [ENROLLMENT CHECK] isAuthenticated:", isAuthenticated)
      console.log("❌ [ENROLLMENT CHECK] user:", user)
      console.log("❌ [ENROLLMENT CHECK] RÉSULTAT: isEnrolled = FALSE")
      return false
    }
    console.log("✅ [ENROLLMENT CHECK] ÉTAPE 1: Utilisateur authentifié (User ID:", user.id, ")")
    
    // ÉTAPE 2 : Vérifier si le chargement est terminé
    if (isLoadingModules) {
      console.log("⏳ [ENROLLMENT CHECK] ÉTAPE 2: Chargement en cours...")
      console.log("⏳ [ENROLLMENT CHECK] RÉSULTAT: isEnrolled = FALSE (en attente)")
      return false
    }
    console.log("✅ [ENROLLMENT CHECK] ÉTAPE 2: Chargement terminé")
    
    // ÉTAPE 3 : Vérifier s'il y a une erreur
    if (modulesError) {
      console.log("❌ [ENROLLMENT CHECK] ÉTAPE 3: ERREUR détectée")
      console.log("❌ [ENROLLMENT CHECK] Type d'erreur:", modulesError.name)
      console.log("❌ [ENROLLMENT CHECK] Message d'erreur:", modulesError.message)
      console.log("❌ [ENROLLMENT CHECK] Stack:", modulesError.stack)
      console.log("❌ [ENROLLMENT CHECK] RÉSULTAT: isEnrolled = FALSE (erreur = non inscrit)")
      return false
    }
    console.log("✅ [ENROLLMENT CHECK] ÉTAPE 3: Pas d'erreur")
    
    // ÉTAPE 4 : Vérifier que modulesFromApi est défini
    if (modulesFromApi === undefined || modulesFromApi === null) {
      console.log("❌ [ENROLLMENT CHECK] ÉTAPE 4: modulesFromApi est undefined/null")
      console.log("❌ [ENROLLMENT CHECK] RÉSULTAT: isEnrolled = FALSE")
      return false
    }
    console.log("✅ [ENROLLMENT CHECK] ÉTAPE 4: modulesFromApi est défini")
    
    // ÉTAPE 5 : Vérifier que modulesFromApi est un tableau
    if (!Array.isArray(modulesFromApi)) {
      console.log("❌ [ENROLLMENT CHECK] ÉTAPE 5: modulesFromApi n'est PAS un tableau")
      console.log("❌ [ENROLLMENT CHECK] Type:", typeof modulesFromApi)
      console.log("❌ [ENROLLMENT CHECK] RÉSULTAT: isEnrolled = FALSE")
      return false
    }
    console.log("✅ [ENROLLMENT CHECK] ÉTAPE 5: modulesFromApi est un tableau (", modulesFromApi.length, "modules)")
    
    // ÉTAPE 6 : Si on arrive ici, l'utilisateur est INSCRIT
    // Un tableau vide signifie que l'utilisateur est inscrit mais le cours n'a pas de modules
    // Un tableau avec des éléments signifie que l'utilisateur est inscrit et le cours a des modules
    console.log("✅ [ENROLLMENT CHECK] ÉTAPE 6: TOUTES LES VÉRIFICATIONS PASSÉES")
    console.log("✅ [ENROLLMENT CHECK] Nombre de modules:", modulesFromApi.length)
    console.log("✅ [ENROLLMENT CHECK] RÉSULTAT FINAL: isEnrolled = TRUE")
    console.log("🔐 [ENROLLMENT CHECK] ===== FIN CALCUL isEnrolled =====")
    return true
  }, [modulesFromApi, isLoadingModules, modulesError, isAuthenticated, user])

  // ============================================
  // REDIRECTION STRICTE - BLOQUER L'ACCÈS SI NON INSCRIT
  // ============================================
  // CRITIQUE : Chaque apprenant authentifié DOIT s'inscrire au cours AVANT de voir /learn/id
  // Si l'utilisateur n'est pas inscrit, rediriger IMMÉDIATEMENT vers /courses/id
  useEffect(() => {
    console.log("🔄 [REDIRECTION] ===== VÉRIFICATION REDIRECTION =====")
    console.log("🔄 [REDIRECTION] Course ID:", courseIdNum)
    console.log("🔄 [REDIRECTION] isAuthenticated:", isAuthenticated)
    console.log("🔄 [REDIRECTION] user:", user ? `ID: ${user.id}` : "null")
    console.log("🔄 [REDIRECTION] isLoadingModules:", isLoadingModules)
    console.log("🔄 [REDIRECTION] courseLoading:", courseLoading)
    console.log("🔄 [REDIRECTION] modulesError:", modulesError ? modulesError.message : "null")
    console.log("🔄 [REDIRECTION] modulesFromApi:", modulesFromApi ? `${modulesFromApi.length} modules` : "null/undefined")
    console.log("🔄 [REDIRECTION] isEnrolled:", isEnrolled)
    
    // ÉTAPE 1 : Attendre que le chargement soit terminé
    if (isLoadingModules || courseLoading) {
      console.log("⏳ [REDIRECTION] En attente du chargement...")
      return
    }
    console.log("✅ [REDIRECTION] Chargement terminé")
    
    // ÉTAPE 2 : Vérifier l'authentification
    if (!isAuthenticated || !user) {
      console.log("❌ [REDIRECTION] Utilisateur NON authentifié")
      console.log("❌ [REDIRECTION] Redirection vers /courses/id")
      router.replace(`/courses/${courseIdNum}`)
      return
    }
    console.log("✅ [REDIRECTION] Utilisateur authentifié (User ID:", user.id, ")")
    
    // ÉTAPE 3 : Vérifier s'il y a une erreur (erreur = utilisateur NON inscrit)
    if (modulesError) {
      const errorMessage = String(modulesError?.message || "")
      console.log("❌ [REDIRECTION] ERREUR détectée lors du chargement des modules")
      console.log("❌ [REDIRECTION] Message d'erreur:", errorMessage)
      console.log("❌ [REDIRECTION] L'utilisateur est authentifié mais NON INSCRIT")
      console.log("❌ [REDIRECTION] Redirection vers /courses/id")
      console.log("❌ [REDIRECTION] L'utilisateur verra la page /courses/id avec le bouton 'S'inscrire gratuitement'")
      router.replace(`/courses/${courseIdNum}`)
      return
    }
    console.log("✅ [REDIRECTION] Pas d'erreur")
    
    // ÉTAPE 4 : Vérifier que modulesFromApi est défini
    if (modulesFromApi === undefined || modulesFromApi === null) {
      console.log("❌ [REDIRECTION] modulesFromApi est undefined/null")
      console.log("❌ [REDIRECTION] L'utilisateur N'EST PAS INSCRIT")
      console.log("❌ [REDIRECTION] Redirection vers /courses/id")
      router.replace(`/courses/${courseIdNum}`)
      return
    }
    console.log("✅ [REDIRECTION] modulesFromApi est défini")
    
    // ÉTAPE 5 : Vérifier isEnrolled (double vérification)
    if (!isEnrolled) {
      console.log("❌ [REDIRECTION] isEnrolled = FALSE")
      console.log("❌ [REDIRECTION] L'utilisateur N'EST PAS INSCRIT")
      console.log("❌ [REDIRECTION] Redirection vers /courses/id")
      router.replace(`/courses/${courseIdNum}`)
      return
    }
    console.log("✅ [REDIRECTION] isEnrolled = TRUE")
    
    // ÉTAPE 6 : Si on arrive ici, l'utilisateur EST INSCRIT
    console.log("✅ [REDIRECTION] TOUTES LES VÉRIFICATIONS PASSÉES")
    console.log("✅ [REDIRECTION] L'utilisateur EST INSCRIT - Accès autorisé à /learn/id")
    console.log("✅ [REDIRECTION] Nombre de modules:", Array.isArray(modulesFromApi) ? modulesFromApi.length : "N/A")
    console.log("🔄 [REDIRECTION] ===== FIN VÉRIFICATION REDIRECTION =====")
  }, [isEnrolled, modulesError, isLoadingModules, courseLoading, courseIdNum, router, isAuthenticated, user, modulesFromApi])

  const [currentLesson, setCurrentLesson] = useState<string | number>(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notes, setNotes] = useState("")
  const [completedLessons, setCompletedLessons] = useState<(string | number)[]>([])
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
  // IMPORTANT : Ne calculer que si l'utilisateur est inscrit (modulesFromApi disponible ou pas d'erreur)
  const curriculum = useMemo(() => {
    // Si l'utilisateur n'est pas inscrit, retourner un tableau vide pour éviter les erreurs
    if (modulesError || !modulesFromApi) {
      return []
    }
    if (course?.curriculum && course.curriculum.length > 0) {
      return course.curriculum
    }
    if (modulesFromApi && modulesFromApi.length > 0) {
      try {
        return modulesFromApi.map(adaptModule)
      } catch (error) {
        console.error("Erreur lors de l'adaptation des modules:", error)
        return []
      }
    }
    return []
  }, [course?.curriculum, modulesFromApi, modulesError])

  // Convertir les modules du cours en leçons pour l'affichage
  // IMPORTANT: Préserver contentUrl depuis les données brutes si l'adapter l'a perdu
  // IMPORTANT : Ne calculer que si l'utilisateur est inscrit
  const lessons = useMemo(() => {
    // Si l'utilisateur n'est pas inscrit, retourner un tableau vide pour éviter les erreurs
    if (modulesError || !modulesFromApi || !curriculum || curriculum.length === 0) {
      return []
    }
    
    try {
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
        if (module.lessons && Array.isArray(module.lessons)) {
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
        }
      })
      
      return allLessons
    } catch (error) {
      console.error("Erreur lors de la conversion des leçons:", error)
      return []
    }
  }, [curriculum, modulesFromApi, modulesError])

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

  // Récupérer les TP (Travaux Pratiques / TD) du cours
  const {
    data: courseTPs,
    isLoading: isLoadingTPs,
  } = useQuery({
    queryKey: ["courseTPs", courseIdNum],
    queryFn: () => evaluationService.getTPsByCourse(courseIdNum),
    enabled: !Number.isNaN(courseIdNum),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // Récupérer les quiz du cours (pour affichage par leçon)
  const {
    data: courseQuizzes,
  } = useQuery({
    queryKey: ["courseQuizzes", courseIdNum],
    queryFn: () => quizService.getQuizzesByCourse(courseIdNum),
    enabled: !Number.isNaN(courseIdNum),
    staleTime: 10 * 60 * 1000,
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

  // Synchroniser la progression depuis le backend (au chargement et après refetch)
  useEffect(() => {
    if (!courseProgress?.lessons || !Array.isArray(courseProgress.lessons)) return
    const completed = (courseProgress.lessons as { lessonId: number; completed: boolean }[])
      .filter((l) => l.completed)
      .map((l) => l.lessonId)
    setCompletedLessons(completed)
  }, [courseProgress])

  // Initialiser currentLesson avec la première leçon si invalide (0 ou id absent de la liste)
  useEffect(() => {
    if (lessons.length === 0) return
    const currentId = String(currentLesson)
    const exists = lessons.some((l) => String(l.id) === currentId)
    if (!exists || currentLesson === 0) {
      setCurrentLesson(lessons[0].id)
    }
  }, [lessons])

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

  const completeLessonMutation = useMutation({
    mutationFn: () => {
      const lessonIdNum = typeof currentLesson === "string" ? parseInt(currentLesson, 10) : Number(currentLesson)
      if (!courseIdNum || Number.isNaN(lessonIdNum)) throw new Error("ID cours ou leçon invalide")
      return learnerService.completeLesson(courseIdNum, lessonIdNum)
    },
    onSuccess: (response) => {
      if (response?.ok !== false) {
        const id = currentLesson
        if (!completedLessons.some((x) => String(x) === String(id))) {
          setCompletedLessons((prev) => [...prev, id])
        }
        queryClient.invalidateQueries({ queryKey: ["courseProgress", courseIdNum] })
        toast.success("Leçon marquée comme terminée")
      } else {
        toast.error(response?.message || "Erreur lors de l'enregistrement")
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Impossible d'enregistrer la progression")
    },
  })

  const handleMarkComplete = () => {
    if (completedLessons.some((id) => String(id) === String(currentLesson))) return
    completeLessonMutation.mutate()
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
          <Button onClick={handleMarkComplete} disabled={completedLessons.some((id) => String(id) === String(currentLesson))}>
            {completedLessons.some((id) => String(id) === String(currentLesson)) ? (
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

  // ============================================
  // VÉRIFICATIONS PRÉCOCES - AVANT TOUT AUTRE CODE
  // ============================================
  // IMPORTANT : Ces vérifications doivent être faites AVANT que le reste du code ne s'exécute
  // pour éviter les erreurs JavaScript qui remontent à l'ErrorBoundary
  
  // 1. Vérifier que courseIdNum est valide
  if (Number.isNaN(courseIdNum)) {
    notFound()
  }

  // 2. Vérifier le chargement du cours
  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement du cours...</span>
      </div>
    )
  }

  // 3. Vérifier les erreurs de chargement du cours
  if (courseError || !course) {
    notFound()
  }

  // 4. Vérifier que le cours a un titre (données valides)
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

  // 5. VÉRIFICATION STRICTE D'INSCRIPTION - BLOQUER TOUT LE RESTE
  // IMPORTANT : L'utilisateur DOIT passer par /courses/id pour s'inscrire avant d'accéder à /learn/id
  // Si l'utilisateur n'est pas inscrit, on bloque TOUT le reste du code pour éviter les erreurs
  if (isLoadingModules || !isEnrolled || modulesError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          {isLoadingModules 
            ? "Vérification de l'inscription..." 
            : modulesError 
              ? "Redirection vers la page d'inscription..." 
              : "Redirection..."}
        </span>
      </div>
    )
  }

  // ============================================
  // CODE NORMAL - SEULEMENT SI L'UTILISATEUR EST INSCRIT
  // ============================================
  // Utiliser les valeurs calculées (ou recalculer si nécessaire)
  const currentLessonData = currentLessonDataForExam
  const progress = progressForExam
  const isCourseCompleted = isCourseCompletedForExam

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
            <span>{completedLessons.length}/{lessons.length} leçons · {Math.round(progress)}%</span>
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
                      completedLessons.some((id) => String(id) === String(lesson.id))
                        ? "text-success"
                        : currentLesson === lesson.id
                          ? "text-primary"
                          : "text-muted-foreground",
                    )}
                  >
                    {completedLessons.some((id) => String(id) === String(lesson.id)) ? (
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

        {/* Évaluation (certification) — sous la liste des leçons */}
        <div className="border-t p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Évaluation (certificat)
          </p>
          <p className="text-xs text-muted-foreground">
            Labs, TD et Quiz sont optionnels. L’évaluation est obligatoire uniquement si vous souhaitez obtenir le certificat.
          </p>
          {course?.certificationMode === "BY_LABS" ? (
            <p className="text-xs text-foreground">
              Votre certificat sera attribué après validation de vos labs par l’instructeur.
            </p>
          ) : (
            <>
              {isCourseCompletedForExam && courseExam?.id ? (
                <Link href={`/learn/${courseId}/exam/${courseExam.id}`}>
                  <Button size="sm" className="w-full mt-2">
                    Passer l’évaluation (70 % min.)
                  </Button>
                </Link>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Terminez toutes les leçons pour accéder à l’évaluation.
                </p>
              )}
            </>
          )}
        </div>
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
            {(() => {
              let currentIndex = lessons.findIndex((l) => String(l.id) === String(currentLesson))
              // Si la leçon courante n'est pas dans la liste (ex. initial 0), considérer la première
              if (currentIndex === -1 && lessons.length > 0) currentIndex = 0
              const hasPrev = currentIndex > 0
              const hasNext = currentIndex >= 0 && currentIndex < lessons.length - 1
              return (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrev}
                    onClick={() => setCurrentLesson(lessons[currentIndex - 1].id)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Précédent</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasNext}
                    onClick={() => {
                      handleMarkComplete()
                      if (hasNext) setCurrentLesson(lessons[currentIndex + 1].id)
                    }}
                  >
                    <span className="hidden sm:inline mr-1">Suivant</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )
            })()}
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

            {/* Rappel : terminer la leçon pour voir les activités */}
            {!completedLessons.some((id) => String(id) => String(currentLesson)) && (
              <p className="text-sm text-muted-foreground mt-6 py-2 px-4 bg-muted/50 rounded-lg border border-border">
                Cliquez sur <strong>Suivant</strong> pour terminer cette leçon et afficher les activités associées (Labs, TD, Quiz — optionnels).
              </p>
            )}
            {/* Activités associées à cette leçon — visibles après avoir terminé la leçon (bouton Suivant) */}
            {completedLessons.some((id) => String(id) === String(currentLesson)) && (() => {
              const currentLessonIdNum = typeof currentLessonData?.id === "string"
                ? parseInt(currentLessonData.id, 10)
                : currentLessonData?.id
              const normalizeId = (id: unknown) =>
                id == null ? null : typeof id === "string" ? parseInt(String(id), 10) : Number(id)
              const matchLesson = (lessonId: unknown) =>
                currentLessonIdNum != null && lessonId != null && normalizeId(lessonId) === currentLessonIdNum

              const lessonLabs = (courseLabs || []).filter((lab: any) => {
                const lid = lab.lessonId ?? lab?.rawData?.lessonId ?? lab?.rawData?.lesson?.id ?? lab.lesson?.id ?? lab.lesson
                return matchLesson(lid)
              })
              const lessonTPs = (courseTPs || []).filter((tp: any) => {
                const lid = tp.lessonId ?? tp.lesson_id ?? tp.lesson?.id ?? tp.lesson
                return matchLesson(lid)
              })
              const lessonQuizzesFiltered = (courseQuizzes || []).filter((q: any) => {
                const lid = q.lessonId ?? (q as any).lesson_id ?? (q as any).lesson?.id ?? (q as any).lessonId
                if (lid == null) return false
                const num = typeof lid === "string" ? parseInt(lid, 10) : Number(lid)
                return !Number.isNaN(num) && normalizeId(lid) === currentLessonIdNum
              })
              const lessonQuizzes = lessonQuizzesFiltered.length > 0 ? lessonQuizzesFiltered : (courseQuizzes || [])

              const hasAny = lessonLabs.length > 0 || lessonTPs.length > 0 || lessonQuizzes.length > 0

              return (
                <div className="mt-8 space-y-6">
                  <Separator />
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Activités associées à cette leçon
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Labs, travaux dirigés et quiz liés à cette leçon.
                  </p>
                  {!hasAny ? (
                    <p className="text-sm text-muted-foreground italic py-4">
                      Aucune activité (Lab, TD ou Quiz) n’est associée à cette leçon pour le moment.
                    </p>
                  ) : (
                  <>
                  {lessonLabs.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FlaskConical className="h-5 w-5 text-orange-500" />
                          Labs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {lessonLabs.map((lab: any) => (
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
                                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{lab.description}</p>
                                  )}
                                </div>
                              </div>
                              <Link href={`/learn/${courseId}/lab/${lab.id}`}>
                                <Button size="sm">
                                  <Play className="h-4 w-4 mr-2" />
                                  Démarrer
                                </Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* TD = Travaux dirigés, associés à la leçon (type TP). Pas les examens de fin de cours. */}
                  {lessonTPs.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-blue-500" />
                          Travaux dirigés (TD)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {lessonTPs.map((tp: any) => (
                            <div
                              key={tp.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="rounded-full bg-blue-100 p-2">
                                  <ClipboardList className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold">{tp.title || "TD sans titre"}</h4>
                                  {tp.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{tp.description}</p>
                                  )}
                                </div>
                              </div>
                              <Link href={`/learn/${courseId}/evaluation/${tp.id}`}>
                                <Button size="sm">Commencer</Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {lessonQuizzes.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-amber-500" />
                          Quiz
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {lessonQuizzes.map((quiz: any) => (
                            <div
                              key={quiz.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="rounded-full bg-amber-100 p-2">
                                  <HelpCircle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold">{quiz.title}</h4>
                                  {quiz.questions?.length != null && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {quiz.questions.length} question{quiz.questions.length > 1 ? "s" : ""}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Link href={`/learn/${courseId}/quiz/${quiz.id}`}>
                                <Button size="sm">Commencer le quiz</Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
                  )}
                </div>
              )
            })()}

            {/* Section Avis — en bas de la page, après les activités */}
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

