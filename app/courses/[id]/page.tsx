"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { courseService } from "@/lib/api/services"
import { CourseDetailClient } from "@/components/course-detail-client"
import { Loader2 } from "lucide-react"
import { notFound } from "next/navigation"

interface CoursePageProps {
  params: Promise<{ id: string }>
}

export default function CoursePage({ params }: CoursePageProps) {
  const { id } = use(params)
  const courseId = Number.parseInt(id)

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => courseService.getCourseById(courseId),
    enabled: !Number.isNaN(courseId),
    retry: 1, // Réessayer une fois en cas d'erreur
    onError: (error) => {
      console.error("Erreur lors du chargement du cours:", error)
    }
  })

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
    // Créer un cours minimal pour permettre l'affichage des modules
    const minimalCourse = {
      id: String(courseId),
      title: "Cours",
      subtitle: "",
      description: "",
      imageUrl: "/placeholder.svg",
      instructor: { id: "0", name: "Instructeur", avatar: "/placeholder-user.jpg" },
      category: "Non catégorisé",
      level: "Intermédiaire",
      rating: 0,
      reviewCount: 0,
      duration: "0h",
      language: "Français",
      lastUpdated: "",
      bestseller: false,
      objectives: [],
      curriculum: [],
      enrolledCount: 0,
      features: [],
    }
    return <CourseDetailClient course={minimalCourse} />
  }

  return <CourseDetailClient course={course} />
}
