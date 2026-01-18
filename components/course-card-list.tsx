"use client"

import Link from "next/link"
import Image from "next/image"
import { Clock, Users, Heart, Share2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RatingStars } from "@/components/rating-stars"
import { formatNumber } from "@/lib/utils"
import { useCourseStore } from "@/lib/store/course-store"
import { useState, useEffect } from "react"
import type { Course } from "@/lib/types"

interface CourseCardListProps {
  course: Course
}

export function CourseCardList({ course }: CourseCardListProps) {
  const { toggleFavorite, isFavorite } = useCourseStore()
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const isFav = isMounted ? isFavorite(course.id) : false
  
  // Check if course is new (less than 30 days old)
  const isNew = course.lastUpdated && 
    (new Date().getTime() - new Date(course.lastUpdated).getTime()) < 30 * 24 * 60 * 60 * 1000

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isMounted) {
      toggleFavorite(course.id)
    }
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.subtitle,
        url: `${window.location.origin}/courses/${course.id}`,
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/courses/${course.id}`)
    }
  }

  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border border-border hover:border-primary bg-white">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden bg-black/5">
            <Image
              src={course.imageUrl || "/placeholder.svg"}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-white/95 backdrop-blur-sm text-black text-xs font-semibold border border-black/10 shadow-sm">
                {course.category}
              </Badge>
            </div>
            {course.bestseller && (
              <Badge className="absolute top-3 right-3 z-10 bg-primary text-white font-bold text-xs shadow-lg border-0">
                Nouveau
              </Badge>
            )}
          </div>

          {/* Content */}
          <CardContent className="flex-1 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {course.subtitle}
                  </p>
                </div>
                
                {/* Quick Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={handleFavoriteClick}
                    aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={handleShareClick}
                    aria-label="Partager"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{course.instructor?.name || "Formateur"}</span>
                </div>
              )}

              {/* Rating & Stats */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <RatingStars rating={course.rating} size="sm" />
                  <span className="text-sm font-semibold text-foreground">{course.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatNumber(course.reviewCount)})
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{formatNumber(course.enrolledCount)} étudiants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{course.duration}h</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <Badge variant="outline" className={course.level === "Débutant" ? "border-green-500 text-green-700" : course.level === "Intermédiaire" ? "border-primary text-primary" : "border-orange-600 text-orange-700"}>
                {course.level}
              </Badge>
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                Gratuit
              </Badge>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}

