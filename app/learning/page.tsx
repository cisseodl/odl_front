"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, MoreVertical, Star, X, Share2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ProtectedRoute } from "@/components/protected-route"
import { useQuery } from "@tanstack/react-query"
import { courseService, profileService, learnerService } from "@/lib/api/services"
import { useAuthStore } from "@/lib/store/auth-store"
import type { Course } from "@/lib/types"

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showShareBanner, setShowShareBanner] = useState(true)
  const { user } = useAuthStore()

  // Charger tous les cours depuis l'API
  const {
    data: allCourses = [],
    isLoading: isLoadingCourses,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => courseService.getAllCourses(),
    staleTime: 5 * 60 * 1000,
  })

  // Charger le profil pour obtenir les cours inscrits
  const {
    data: profile,
    isLoading: isLoadingProfile,
  } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => profileService.getMyProfile(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Filtrer les cours inscrits
  const enrolledCourses = useMemo(() => {
    if (!profile?.enrolledCourses || !allCourses.length) {
      return []
    }
    return allCourses.filter(course => 
      profile.enrolledCourses.includes(course.title)
    )
  }, [profile, allCourses])

  // Récupérer la progression pour chaque cours inscrit
  // Pour l'instant, on utilise les données du profil (completedCourses)
  // La progression détaillée peut être récupérée individuellement si nécessaire
  const enrolledCoursesWithProgress = useMemo(() => {
    return enrolledCourses.map((course) => {
      const isCompleted = profile?.completedCourses?.includes(course.title) || false
      // Utiliser une progression par défaut basée sur le statut de complétion
      // La progression réelle peut être récupérée depuis l'API si nécessaire
      const progress = isCompleted ? 100 : 0
      
      return {
        ...course,
        progress,
        userRating: null, // TODO: Récupérer depuis les reviews
        lastAccessed: "Récemment", // TODO: Récupérer depuis les données de progression
        completed: isCompleted,
      }
    })
  }, [enrolledCourses, profile])

  const isLoading = isLoadingCourses || isLoadingProfile

  const filteredCourses = useMemo(() => {
    // Filtrer selon l'onglet actif
    let coursesToFilter = enrolledCoursesWithProgress
    
    if (activeTab === "all") {
      coursesToFilter = enrolledCoursesWithProgress
    } else if (activeTab === "collections") {
      // Collections - pour l'instant, retourner tous les cours
      coursesToFilter = enrolledCoursesWithProgress
    } else if (activeTab === "wishlist") {
      // Liste de souhaits - pour l'instant vide (à implémenter)
      coursesToFilter = []
    } else if (activeTab === "archived") {
      // Archivés - pour l'instant vide (à implémenter)
      coursesToFilter = []
    }

    // Filtrer par recherche
    return coursesToFilter.filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [enrolledCoursesWithProgress, searchQuery, activeTab])

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Chargement de vos cours...</span>
          </div>
        ) : (
          <>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Mon Apprentissage</h1>
            {showShareBanner && (
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-4 py-2.5 shadow-sm">
                <Share2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-primary">Partager Orange Digital Learning avec des amis</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1 text-primary hover:text-primary/80 hover:bg-primary/20 transition-colors"
                  onClick={() => setShowShareBanner(false)}
                  aria-label="Fermer la bannière"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filter and Tabs Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 flex-1 w-full lg:w-auto overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
            {/* Filter Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 whitespace-nowrap flex-shrink-0">
                  <Filter className="h-4 w-4" />
                  Filtrer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem>Tous les cours</DropdownMenuItem>
                <DropdownMenuItem>En cours</DropdownMenuItem>
                <DropdownMenuItem>Complétés</DropdownMenuItem>
                <DropdownMenuItem>Non commencés</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Par date d'inscription</DropdownMenuItem>
                <DropdownMenuItem>Par progression</DropdownMenuItem>
                <DropdownMenuItem>Par titre</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-w-0">
              <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold rounded-none pb-3 px-4 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 whitespace-nowrap"
                  title="Tous les cours auxquels vous êtes inscrit"
                >
                  Tous les cours
                </TabsTrigger>
                <TabsTrigger
                  value="collections"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold rounded-none pb-3 px-4 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 whitespace-nowrap"
                  title="Vos collections personnalisées de cours organisés par thème"
                >
                  Collections
                </TabsTrigger>
                <TabsTrigger
                  value="wishlist"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold rounded-none pb-3 px-4 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 whitespace-nowrap"
                  title="Cours que vous avez marqués comme favoris pour les consulter plus tard"
                >
                  Liste de souhaits
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold rounded-none pb-3 px-4 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 whitespace-nowrap"
                  title="Cours que vous avez archivés pour les retrouver facilement"
                >
                  Archivés
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Tab Descriptions */}
          {activeTab === "collections" && (
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Collections :</strong> Organisez vos cours en collections personnalisées par thème ou projet pour un accès rapide.
              </p>
            </div>
          )}
          {activeTab === "wishlist" && (
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Liste de souhaits :</strong> Retrouvez tous les cours que vous avez marqués comme favoris pour les consulter plus tard.
              </p>
            </div>
          )}
          {activeTab === "archived" && (
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Archivés :</strong> Accédez aux cours que vous avez archivés pour les retrouver facilement sans encombrer votre liste principale.
              </p>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative w-full lg:w-64 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Rechercher mes cours"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              aria-label="Rechercher dans mes cours"
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl hover:border-primary transition-all duration-300 hover:-translate-y-1"
            >
              {/* Course Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <Image
                  src={course.imageUrl || "/placeholder.svg"}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Three-dot menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white/90 hover:bg-white backdrop-blur-sm"
                        aria-label="Options du cours"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/learn/${course.id}`}>Continuer l'apprentissage</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/courses/${course.id}`}>Voir les détails</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Marquer comme complété</DropdownMenuItem>
                      <DropdownMenuItem>Archiver</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Retirer de ma liste</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-5 space-y-3">
                {/* Course Title */}
                <Link href={`/learn/${course.id}`} className="block">
                  <h3 className="font-bold text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors cursor-pointer min-h-[2.5rem] text-black">
                    {course.title}
                  </h3>
                </Link>

                {/* Formateur */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                    <AvatarFallback className="text-xs">{course.instructor.name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-gray-600 line-clamp-1">{course.instructor.name}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-semibold">{course.progress || 0}% complété</span>
                    {(course.progress || 0) === 100 && (
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30 font-medium">
                        Complété
                      </Badge>
                    )}
                  </div>
                  <Progress value={course.progress || 0} className="h-2.5" />
                </div>

                {/* Rating or Leave Rating */}
                <div className="pt-3 border-t border-border">
                  {course.userRating ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 transition-colors ${
                              i < course.userRating!
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-muted-foreground font-medium">
                        {course.userRating}/5 (Votre avis)
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs h-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                      asChild
                    >
                      <Link href={`/courses/${course.id}#reviews`}>Laisser un avis</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Aucun cours trouvé</h3>
                <p className="text-muted-foreground mb-6">Essayez de modifier vos filtres ou votre recherche</p>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/courses">Découvrir des cours</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
    </ProtectedRoute>
  )
}
