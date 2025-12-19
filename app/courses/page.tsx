"use client"

import { useState, useMemo, useEffect } from "react"
import { SlidersHorizontal, X } from "lucide-react"
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
import { mockCourses } from "@/lib/mock-data"

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
    let filtered = mockCourses

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

    return filtered
  }, [selectedCategory, selectedLevel, selectedDuration, minRating, selectedLanguage])

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
          Explorez notre collection de {mockCourses.length} cours pour développer vos compétences
        </p>
      </div>

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
              courses={mockCourses}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
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
                    courses={mockCourses}
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
              {activeFilters.map((filter, index) => (
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
              ))}
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
              {sortedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
              <div className="space-y-4">
                {sortedCourses.map((course) => (
                  <CourseCardList key={course.id} course={course} />
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
    </div>
  )
}
