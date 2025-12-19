"use client"

import { Star } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { categories } from "@/lib/mock-data"
import type { Course } from "@/lib/types"

interface CourseFiltersProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedLevel: string[]
  onLevelChange: (levels: string[]) => void
  selectedDuration: string[]
  onDurationChange: (durations: string[]) => void
  minRating: number
  onRatingChange: (rating: number) => void
  selectedLanguage: string[]
  onLanguageChange: (languages: string[]) => void
  onReset: () => void
  courses?: Course[] // For dynamic counts
}

export function CourseFilters({
  selectedCategory,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  selectedDuration,
  onDurationChange,
  minRating,
  onRatingChange,
  selectedLanguage,
  onLanguageChange,
  onReset,
  courses = [],
}: CourseFiltersProps) {
  const levels = ["Débutant", "Intermédiaire", "Avancé"]
  const durations = [
    { label: "0-5 heures", value: "0-5" },
    { label: "5-20 heures", value: "5-20" },
    { label: "20-40 heures", value: "20-40" },
    { label: "40+ heures", value: "40+" },
  ]
  const languages = ["Français", "Anglais", "Espagnol"]

  // Calculate dynamic counts
  const getCategoryCount = (category: string) => {
    if (!courses.length) return 0
    if (category === "Tous les cours") return courses.length
    return courses.filter((c) => c.category === category).length
  }

  const getLevelCount = (level: string) => {
    if (!courses.length) return 0
    return courses.filter((c) => c.level === level).length
  }

  const getDurationCount = (duration: string) => {
    if (!courses.length) return 0
    return courses.filter((c) => {
      const d = Number.parseFloat(c.duration)
      if (duration === "0-5") return d <= 5
      if (duration === "5-20") return d > 5 && d <= 20
      if (duration === "20-40") return d > 20 && d <= 40
      if (duration === "40+") return d > 40
      return true
    }).length
  }

  const getLanguageCount = (language: string) => {
    if (!courses.length) return 0
    return courses.filter((c) => c.language === language).length
  }

  const handleLevelToggle = (level: string) => {
    if (selectedLevel.includes(level)) {
      onLevelChange(selectedLevel.filter((l) => l !== level))
    } else {
      onLevelChange([...selectedLevel, level])
    }
  }

  const handleDurationToggle = (duration: string) => {
    if (selectedDuration.includes(duration)) {
      onDurationChange(selectedDuration.filter((d) => d !== duration))
    } else {
      onDurationChange([...selectedDuration, duration])
    }
  }

  const handleLanguageToggle = (language: string) => {
    if (selectedLanguage.includes(language)) {
      onLanguageChange(selectedLanguage.filter((l) => l !== language))
    } else {
      onLanguageChange([...selectedLanguage, language])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filtres</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Réinitialiser
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={[]} className="w-full">
      {/* Category Filter */}
        <AccordionItem value="category" className="border-b">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Catégorie
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={selectedCategory} onValueChange={onCategoryChange} className="space-y-2">
              {categories.map((category) => {
                const count = getCategoryCount(category)
                return (
                  <div key={category} className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 flex-1">
              <RadioGroupItem value={category} id={category} />
                      <Label htmlFor={category} className="font-normal cursor-pointer text-sm flex-1">
                {category}
              </Label>
            </div>
                    {count > 0 && (
                      <span className="text-xs text-muted-foreground">({count})</span>
                    )}
                  </div>
                )
              })}
        </RadioGroup>
          </AccordionContent>
        </AccordionItem>

      {/* Level Filter */}
        <AccordionItem value="level" className="border-b">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Niveau
          </AccordionTrigger>
          <AccordionContent>
        <div className="space-y-2">
              {levels.map((level) => {
                const count = getLevelCount(level)
                return (
                  <div key={level} className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 flex-1">
              <Checkbox
                id={`level-${level}`}
                checked={selectedLevel.includes(level)}
                onCheckedChange={() => handleLevelToggle(level)}
              />
                      <Label htmlFor={`level-${level}`} className="font-normal cursor-pointer text-sm flex-1">
                {level}
              </Label>
            </div>
                    {count > 0 && (
                      <span className="text-xs text-muted-foreground">({count})</span>
                    )}
        </div>
                )
              })}
      </div>
          </AccordionContent>
        </AccordionItem>

      {/* Duration Filter */}
        <AccordionItem value="duration" className="border-b">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Durée
          </AccordionTrigger>
          <AccordionContent>
        <div className="space-y-2">
              {durations.map((duration) => {
                const count = getDurationCount(duration.value)
                return (
                  <div key={duration.value} className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 flex-1">
              <Checkbox
                id={`duration-${duration.value}`}
                checked={selectedDuration.includes(duration.value)}
                onCheckedChange={() => handleDurationToggle(duration.value)}
              />
                      <Label htmlFor={`duration-${duration.value}`} className="font-normal cursor-pointer text-sm flex-1">
                {duration.label}
              </Label>
            </div>
                    {count > 0 && (
                      <span className="text-xs text-muted-foreground">({count})</span>
                    )}
        </div>
                )
              })}
      </div>
          </AccordionContent>
        </AccordionItem>

      {/* Rating Filter */}
        <AccordionItem value="rating" className="border-b">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Note minimale
          </AccordionTrigger>
          <AccordionContent>
        <div className="space-y-2">
          {[4.5, 4, 3.5, 3].map((rating) => (
            <button
              key={rating}
              onClick={() => onRatingChange(rating)}
              className={`flex items-center gap-2 w-full p-2 rounded-md transition-colors ${
                minRating === rating
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-accent text-foreground/80 hover:text-foreground"
              }`}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.floor(rating)
                        ? "fill-warning text-warning"
                        : i < rating
                          ? "fill-warning text-warning"
                          : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm">{rating} & plus</span>
            </button>
          ))}
          {minRating > 0 && (
            <button
              onClick={() => onRatingChange(0)}
              className="text-sm text-primary hover:underline w-full text-left p-2"
            >
              Toutes les notes
            </button>
          )}
        </div>
          </AccordionContent>
        </AccordionItem>

      {/* Language Filter */}
        <AccordionItem value="language" className="border-b">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Langue
          </AccordionTrigger>
          <AccordionContent>
        <div className="space-y-2">
              {languages.map((language) => {
                const count = getLanguageCount(language)
                return (
                  <div key={language} className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 flex-1">
              <Checkbox
                id={`language-${language}`}
                checked={selectedLanguage.includes(language)}
                onCheckedChange={() => handleLanguageToggle(language)}
              />
                      <Label htmlFor={`language-${language}`} className="font-normal cursor-pointer text-sm flex-1">
                {language}
              </Label>
            </div>
                    {count > 0 && (
                      <span className="text-xs text-muted-foreground">({count})</span>
                    )}
        </div>
                )
              })}
      </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
