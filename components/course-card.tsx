"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Share2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useCourseStore } from "@/lib/store/course-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { useQuery } from "@tanstack/react-query"
import { profileService, moduleService } from "@/lib/api/services"
import type { Course } from "@/lib/types"
import { formatNumber } from "@/lib/utils"

interface CourseCardProps {
  course: Course
  showPreview?: boolean
}

export function CourseCard({ course, showPreview = true }: CourseCardProps) {
  const { toggleFavorite, isFavorite } = useCourseStore()
  const { user, isAuthenticated } = useAuthStore()
  const [isMounted, setIsMounted] = useState(false)
  
  // IMPORTANT: useEffect doit être appelé AVANT les hooks qui dépendent de isMounted
  // pour respecter les règles des hooks React (même ordre à chaque rendu)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Vérifier l'inscription DIRECTEMENT via les modules (plus fiable que profile.enrolledCourses)
  // Cette méthode garantit que si l'utilisateur peut charger les modules, il est inscrit
  const courseIdNum = useMemo(() => {
    if (!course?.id) return null
    const id = typeof course.id === 'number' ? course.id : parseInt(String(course.id), 10)
    return Number.isNaN(id) ? null : id
  }, [course?.id])

  // Vérifier l'inscription en essayant de charger les modules
  // Si les modules sont chargés avec succès (même vide), l'utilisateur est inscrit
  const { data: modules, isLoading: isLoadingEnrollment } = useQuery({
    queryKey: ["modules", courseIdNum, "enrollment-check"],
    queryFn: async () => {
      if (!courseIdNum) return null
      try {
        const modulesData = await moduleService.getModulesByCourse(courseIdNum)
        // Si on peut charger les modules (même vide), l'utilisateur est inscrit
        return modulesData || []
      } catch (error: any) {
        // Si erreur d'inscription, l'utilisateur n'est pas inscrit
        const errorMessage = String(error?.message || "")
        const isEnrollmentError = errorMessage.includes("inscrire") || 
                                  errorMessage.includes("inscription") || 
                                  errorMessage.includes("inscrit") ||
                                  errorMessage.includes("authentifié") ||
                                  errorMessage.includes("403") ||
                                  errorMessage.includes("401")
        if (isEnrollmentError) {
          return null // Pas inscrit
        }
        // Autre erreur, considérer comme non inscrit par sécurité
        return null
      }
    },
    enabled: isAuthenticated && !!user && isMounted && !!courseIdNum,
    staleTime: 10 * 60 * 1000, // 10 minutes - cache plus long
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Ne pas refetch au focus
    retry: false, // Ne pas réessayer pour éviter les délais
  })
  
  // L'utilisateur est inscrit si les modules sont chargés avec succès (même vide)
  const isEnrolled = useMemo(() => {
    // Si on charge encore, ne pas considérer comme inscrit (éviter redirection prématurée)
    if (isLoadingEnrollment) return false
    // Si modules est défini (même tableau vide), l'utilisateur est inscrit
    return modules !== undefined && modules !== null
  }, [modules, isLoadingEnrollment])
  
  // Déterminer l'URL de redirection
  // Si inscrit → /learn/id, sinon → /courses/id
  // IMPORTANT: Si on charge encore, rediriger vers /courses/id par défaut (sécurité)
  const courseUrl = useMemo(() => {
    // Si on charge encore l'inscription, rediriger vers /courses/id par sécurité
    // Cela évite de rediriger vers /learn/id si l'utilisateur n'est pas inscrit
    if (isLoadingEnrollment) {
      return `/courses/${course.id}`
    }
    return isEnrolled ? `/learn/${course.id}` : `/courses/${course.id}`
  }, [isEnrolled, isLoadingEnrollment, course.id])
  
  const isFav = isMounted ? isFavorite(course.id) : false
  
  // Check if course is new (less than 30 days old or bestseller indicates new course)
  const isNew = course.bestseller || (course.lastUpdated && 
    (new Date().getTime() - new Date(course.lastUpdated).getTime()) < 30 * 24 * 60 * 60 * 1000)

  return (
    <Link href={courseUrl} className="block h-full group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl border border-border hover:border-primary hover:-translate-y-1 bg-white">
        <div className="relative h-32 overflow-hidden bg-black/5">
          <Image
            src={course.imageUrl || "/placeholder.svg"}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Overlay gradient - Style Orange Mali */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge catégorie (top-left) - Style Orange Mali */}
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-white/95 backdrop-blur-sm text-black text-xs font-semibold border border-black/10 shadow-sm">
              {course.category}
            </Badge>
          </div>

          {/* Badge Nouveau (top-right) - Orange Impact Maximum */}
          {isNew && (
            <Badge className="absolute top-3 right-3 z-10 bg-primary text-white font-bold text-xs shadow-lg border-0">
              Nouveau
            </Badge>
          )}

          {/* Quick Actions on Hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full"
              onClick={(e) => {
                e.preventDefault()
                toggleFavorite(course.id)
              }}
            >
              <Heart className={`h-5 w-5 ${isFav ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full"
              onClick={(e) => {
                e.preventDefault()
                // Share functionality
                if (navigator.share) {
                  navigator.share({
                    title: course.title,
                    text: course.subtitle,
                    url: window.location.origin + `/courses/${course.id}`,
                  })
                }
              }}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <CardContent className="p-3 pb-3">
          {/* Titre - Style Orange Mali - Hauteur réduite */}
          <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors text-balance leading-tight text-black">
            {course.title}
          </h3>
        </CardContent>
      </Card>
    </Link>
  )
}
