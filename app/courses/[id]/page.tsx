"use client"

import { use, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { courseService } from "@/lib/api/services"
import { CourseDetailClient } from "@/components/course-detail-client"
import { CourseAuthGate } from "@/components/course-auth-gate"
import { useAuthStore } from "@/lib/store/auth-store"
import { Loader2 } from "lucide-react"
import { notFound } from "next/navigation"

interface CoursePageProps {
  params: Promise<{ id: string }>
}

export default function CoursePage({ params }: CoursePageProps) {
  const { id } = use(params)
  const courseId = Number.parseInt(id)
  const { isAuthenticated } = useAuthStore()

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const courseData = await courseService.getCourseById(courseId)
      return courseData || null
    },
    enabled: isAuthenticated && !Number.isNaN(courseId),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  const memoizedCourse = useMemo(() => {
    if (!course) return null
    return course
  }, [course])

  if (Number.isNaN(courseId)) {
    notFound()
  }

  // Non connecté : gate "Avez-vous un compte ODL ?"
  if (!isAuthenticated) {
    return <CourseAuthGate courseId={id} />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement du cours...</span>
      </div>
    )
  }

  if (error || !memoizedCourse) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-2">Cours introuvable</p>
          <p className="text-muted-foreground">Le cours demandé n'existe pas ou n'est plus disponible.</p>
        </div>
      </div>
    )
  }

  return <CourseDetailClient course={memoizedCourse} />
}
