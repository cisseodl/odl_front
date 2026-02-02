"use client"

import { useState, useMemo, useEffect } from "react"
import { SlidersHorizontal, X, Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CourseCard } from "@/components/course-card"
import { CourseCardList } from "@/components/course-card-list"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CourseFilters } from "@/components/course-filters"
import { CourseSortSelect } from "@/components/course-sort-select"
import { ViewToggle } from "@/components/view-toggle"
import { EmptyState } from "@/components/empty-state"
import { Search } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { courseService, categoryService } from "@/lib/api/services"
import type { Course } from "@/lib/types"

type SortOption = "popularity" | "rating" | "recent"
type ViewMode = "grid" | "list"

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tous les cours")
  const [selectedLevel, setSelectedLevel] = useState<string[]>([])
  const [selectedDuration, setSelectedDuration] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("popularity")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Charger les cours depuis l'API
  const {
    data: courses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => courseService.getAllCourses(),
    staleTime: 10 * 60 * 1000, // 10 minutes - cache plus long pour performance
    gcTime: 30 * 60 * 1000, // 30 minutes - garder en cache plus longtemps
    refetchOnWindowFocus: false, // Ne pas refetch au focus pour performance
    refetchOnMount: false, // Utiliser le cache si disponible
    retry: 1, // Réessayer 1 fois seulement pour rapidité
  })
  
  // Load view preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("courses-view-mode") as ViewMode | null
      if (savedView === "grid" || savedView === "list") {
        setViewMode(savedView)
      }
    }
  }, [])

  // Save view preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("courses-view-mode", viewMode)
    }
  }, [viewMode])

  // Filter courses
  const filteredCourses = useMemo(() => {
    if (!courses || !Array.isArray(courses)) {
      return []
    }
    let filtered = courses

    // Category filter
    if (selectedCategory !== "Tous les cours") {
      filtered = filtered.filter((course) => course.category === selectedCategory)
    }

    // Level filter
    if (selectedLevel.length > 0) {
      filtered = filtered.filter((course) => selectedLevel.includes(course.level))
    }

    // Duration filter
    if (selectedDuration.length > 0) {
      filtered = filtered.filter((course) => {
        const duration = Number.parseFloat(course.duration)
        return selectedDuration.some((range) => {
          if (range === "0-5") return duration <= 5
          if (range === "5-20") return duration > 5 && duration <= 20
          if (range === "20-40") return duration > 20 && duration <= 40
          if (range === "40+") return duration > 40
          return true
        })
      })
    }

    // Rating filter
    filtered = filtered.filter((course) => course.rating >= minRating)

    // Language filter
    if (selectedLanguage.length > 0) {
      filtered = filtered.filter((course) => selectedLanguage.includes(course.language))
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.category?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [courses, selectedCategory, selectedLevel, selectedDuration, minRating, selectedLanguage, searchQuery])

  // Sort courses
  const sortedCourses = useMemo(() => {
    const sorted = [...filteredCourses]

    switch (sortBy) {
      case "popularity":
        return sorted.sort((a, b) => b.enrolledCount - a.enrolledCount)
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating)
      case "recent":
        return sorted.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
      default:
        return sorted
    }
  }, [filteredCourses, sortBy])

  const resetFilters = () => {
    setSelectedCategory("Tous les cours")
    setSelectedLevel([])
    setSelectedDuration([])
    setMinRating(0)
    setSelectedLanguage([])
    setSearchQuery("")
  }

  // Get active filters for chips display
  const activeFilters = useMemo(() => {
    const filters: Array<{ label: string; onRemove: () => void }> = []
    
    if (selectedCategory !== "Tous les cours") {
      filters.push({
        label: `Catégorie: ${selectedCategory}`,
        onRemove: () => setSelectedCategory("Tous les cours"),
      })
    }
    
    selectedLevel.forEach((level) => {
      filters.push({
        label: `Niveau: ${level}`,
        onRemove: () => setSelectedLevel(selectedLevel.filter((l) => l !== level)),
      })
    })
    
    selectedDuration.forEach((duration) => {
      const label = duration === "0-5" ? "0-5h" : duration === "5-20" ? "5-20h" : duration === "20-40" ? "20-40h" : "40+h"
      filters.push({
        label: `Durée: ${label}`,
        onRemove: () => setSelectedDuration(selectedDuration.filter((d) => d !== duration)),
      })
    })
    
    if (minRating > 0) {
      filters.push({
        label: `Note: ${minRating}+`,
        onRemove: () => setMinRating(0),
      })
    }
    
    selectedLanguage.forEach((language) => {
      filters.push({
        label: `Langue: ${language}`,
        onRemove: () => setSelectedLanguage(selectedLanguage.filter((l) => l !== language)),
      })
    })
    
    return filters
  }, [selectedCategory, selectedLevel, selectedDuration, minRating, selectedLanguage])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Catalogue de Cours</h1>
        <p className="text-muted-foreground text-lg">
          Explorez notre collection de cours pour développer vos compétences
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Chargement des cours...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-destructive font-medium">Erreur lors du chargement des cours</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Une erreur est survenue"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-3"
          >
            Réessayer
          </Button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              <CourseFilters
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
                selectedDuration={selectedDuration}
                onDurationChange={setSelectedDuration}
                minRating={minRating}
                onRatingChange={setMinRating}
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                onReset={resetFilters}
                courses={courses}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Rechercher un cours..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  aria-label="Rechercher un cours"
                />
              </div>
            </div>

            {/* Mobile Filter Button & Sort */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden bg-transparent">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <CourseFilters
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      selectedLevel={selectedLevel}
                      onLevelChange={setSelectedLevel}
                      selectedDuration={selectedDuration}
                      onDurationChange={setSelectedDuration}
                      minRating={minRating}
                      onRatingChange={setMinRating}
                      selectedLanguage={selectedLanguage}
                      onLanguageChange={setSelectedLanguage}
                      onReset={resetFilters}
                      courses={courses}
                    />
                  </div>
                </SheetContent>
              </Sheet>

            {/* Results Count, Sort & View Toggle */}
            <div className="flex items-center gap-4 flex-1 justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{sortedCourses.length}</span> cours trouvés
              </p>
              <div className="flex items-center gap-3">
                <CourseSortSelect value={sortBy} onChange={(value) => setSortBy(value as SortOption)} />
                <ViewToggle view={viewMode} onViewChange={setViewMode} />
              </div>
            </div>
          </div>

          {/* Active Filters Chips */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-sm text-muted-foreground font-medium">Filtres actifs:</span>
              {activeFilters && Array.isArray(activeFilters) ? activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="gap-1.5 pr-1.5 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <span className="text-xs">{filter.label}</span>
                  <button
                    onClick={filter.onRemove}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    aria-label={`Retirer le filtre ${filter.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )) : null}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                Tout effacer
              </Button>
            </div>
          )}

          {/* Course Grid or List */}
          {sortedCourses.length > 0 ? (
            viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedCourses.filter(course => course && course.id).map((course) => (
                <CourseCard key={String(course.id)} course={course} />
              ))}
            </div>
          ) : (
              <div className="space-y-4">
                {sortedCourses.filter(course => course && course.id).map((course) => (
                  <CourseCardList key={String(course.id)} course={course} />
                ))}
            </div>
            )
          ) : (
            <EmptyState
              icon={<Search className="h-8 w-8" />}
              title="Aucun cours trouvé"
              description="Essayez d'ajuster vos filtres pour voir plus de résultats. Vous pouvez également explorer toutes les catégories disponibles."
              action={{
                label: "Réinitialiser les filtres",
                onClick: resetFilters,
              }}
              secondaryAction={{
                label: "Explorer toutes les catégories",
                onClick: () => {
                  setSelectedCategory("Tous les cours")
                  setSelectedLevel([])
                  setSelectedDuration([])
                  setMinRating(0)
                  setSelectedLanguage([])
                },
              }}
            />
          )}
        </div>
      </div>
      )}
    </div>
  )
}
