"use client"

import { use, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { courseService, moduleService } from "@/lib/api/services"
import { CourseDetailClient } from "@/components/course-detail-client"
import { Loader2 } from "lucide-react"
import { notFound } from "next/navigation"
import { serializeData } from "@/lib/utils/serialize"

interface CoursePageProps {
  params: Promise<{ id: string }>
}

export default function CoursePage({ params }: CoursePageProps) {
  const { id } = use(params)
  const courseId = Number.parseInt(id)
  const router = useRouter()

  // Charger la liste des cours pour récupérer le titre si le détail ne charge pas
  const { data: allCourses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: () => courseService.getAllCourses(),
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const courseData = await courseService.getCourseById(courseId)
      // Sérialiser le cours pour éviter les erreurs React #185
      return courseData ? serializeData(courseData) : null
    },
    enabled: !Number.isNaN(courseId),
    retry: 1, // Réessayer une fois en cas d'erreur
    onError: (error) => {
      console.error("Erreur lors du chargement du cours:", error)
    }
  })

  // Vérifier si l'utilisateur est inscrit au cours en essayant de charger les modules
  const { data: modulesFromApi, error: modulesError, isLoading: isLoadingModules } = useQuery({
    queryKey: ["modules", courseId],
    queryFn: async () => {
      try {
        const modules = await moduleService.getModulesByCourse(courseId)
        console.log("📚 [ENROLLMENT] Modules chargés avec succès:", modules?.length || 0)
        // Si les modules sont chargés (même tableau vide), l'utilisateur est inscrit
        return modules || []
      } catch (error: any) {
        const errorMessage = String(error?.message || error?.response?.data?.message || "")
        console.log("📚 [ENROLLMENT] Erreur lors du chargement des modules:", errorMessage)
        
        // Si l'erreur indique qu'il faut s'inscrire, l'utilisateur n'est pas inscrit
        const isEnrollmentError = errorMessage.includes("inscrire") || 
                                  errorMessage.includes("inscription") || 
                                  errorMessage.includes("inscrit") ||
                                  errorMessage.includes("authentifié") ||
                                  errorMessage.includes("403") ||
                                  errorMessage.includes("401")
        
        if (isEnrollmentError) {
          console.log("❌ [ENROLLMENT] Erreur d'inscription détectée, l'utilisateur n'est pas inscrit")
          throw error // Re-lancer l'erreur pour que React Query la gère
        }
        
        // Autre erreur, peut-être que l'utilisateur est inscrit mais qu'il y a un problème technique
        console.log("⚠️ [ENROLLMENT] Erreur non liée à l'inscription, considérer comme inscrit")
        return [] // Retourner un tableau vide pour indiquer que l'utilisateur est peut-être inscrit
      }
    },
    enabled: !Number.isNaN(courseId) && !!course,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  // Rediriger vers /learn UNIQUEMENT si l'utilisateur est inscrit
  // Si l'utilisateur n'est pas inscrit, afficher la page d'inscription (CourseDetailClient)
  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (isLoadingModules) return
    
    // Si les modules sont chargés avec succès (même tableau vide), l'utilisateur est inscrit
    if (modulesFromApi !== undefined && Array.isArray(modulesFromApi) && !modulesError) {
      // L'utilisateur est inscrit, rediriger vers la page d'apprentissage
      console.log("✅ [ENROLLMENT] Utilisateur inscrit détecté (modules chargés), redirection vers /learn")
      router.replace(`/learn/${courseId}`)
      return
    }
    
    // Si erreur, vérifier si c'est une erreur d'inscription
    if (modulesError) {
      const errorMessage = String(modulesError?.message || "")
      const isEnrollmentError = errorMessage.includes("inscrire") || 
                                errorMessage.includes("inscription") || 
                                errorMessage.includes("inscrit") ||
                                errorMessage.includes("non inscrit") ||
                                errorMessage.includes("403") ||
                                errorMessage.includes("401") ||
                                errorMessage.includes("Forbidden") ||
                                errorMessage.includes("Unauthorized")
      
      if (isEnrollmentError) {
        // L'utilisateur n'est PAS inscrit, afficher la page d'inscription (CourseDetailClient)
        console.log("❌ [ENROLLMENT] Erreur d'inscription détectée, l'utilisateur n'est pas inscrit - Affichage de la page d'inscription")
        // Ne pas rediriger, laisser CourseDetailClient s'afficher avec le bouton "S'inscrire gratuitement"
        return
      } else {
        // Ce n'est pas une erreur d'inscription, peut-être une erreur technique
        // Dans ce cas, on ne redirige pas vers /learn pour éviter les boucles
        console.log("⚠️ [ENROLLMENT] Erreur technique non liée à l'inscription, ne pas rediriger")
      }
    }
  }, [modulesFromApi, modulesError, isLoadingModules, courseId, router])

  if (Number.isNaN(courseId)) {
    notFound()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement du cours...</span>
      </div>
    )
  }

  // Si le cours ne charge pas mais qu'on a un ID valide, créer un cours minimal pour permettre l'affichage des modules
  if (error || !course) {
    console.warn(`Impossible de charger le cours ${courseId}, utilisation d'un cours minimal`)
    
    // Essayer de récupérer le titre depuis la liste des cours
    const courseFromList = allCourses.find(c => {
      const cId = typeof c.id === 'string' ? parseInt(c.id, 10) : (typeof c.id === 'number' ? c.id : null)
      return cId === courseId
    })
    const courseTitle = courseFromList?.title || `Cours ${courseId}`
    const courseCategory = courseFromList?.category || "Non catégorisé"
    const courseLevel = courseFromList?.level || "Intermédiaire"
    const courseImage = courseFromList?.imageUrl || "/placeholder.svg"
    const courseInstructor = courseFromList?.instructor || { id: "0", name: "Instructeur", avatar: "/placeholder-user.jpg" }
    
    // Créer un cours minimal avec les informations disponibles depuis la liste
    const minimalCourse = serializeData({
      id: String(courseId),
      title: courseTitle,
      subtitle: courseFromList?.subtitle || "",
      description: courseFromList?.description || "",
      imageUrl: courseImage,
      instructor: courseInstructor,
      category: courseCategory,
      level: courseLevel,
      rating: courseFromList?.rating || 0,
      reviewCount: courseFromList?.reviewCount || 0,
      duration: courseFromList?.duration || "0h",
      language: courseFromList?.language || "Français",
      lastUpdated: courseFromList?.lastUpdated || "",
      bestseller: courseFromList?.bestseller || false,
      objectives: courseFromList?.objectives || [],
      curriculum: courseFromList?.curriculum || [],
      enrolledCount: courseFromList?.enrolledCount || 0,
      features: courseFromList?.features || [],
    })
    return <CourseDetailClient course={minimalCourse} />
  }

  // S'assurer que le cours est sérialisé avant de le passer au composant
  const serializedCourse = serializeData(course)
  return <CourseDetailClient course={serializedCourse} />
}
