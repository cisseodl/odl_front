"use client"

import type React from "react"
import Link from "next/link"
import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { categories } from "@/lib/constants"
import { ArrowRight, BookOpen, Users, TrendingUp, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { courseService } from "@/lib/api/services"

export default function CategoriesPage() {
  // Charger les cours depuis l'API
  const {
    data: courses = [],
    isLoading,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => courseService.getAllCourses(),
    staleTime: 5 * 60 * 1000,
  })

  // Calculate stats for each category
  const categoryStats = useMemo(() => {
    return categories.slice(1).map((category) => {
      const coursesInCategory = courses.filter((course) => course.category === category)
      const totalStudents = coursesInCategory.reduce((acc, course) => acc + course.enrolledCount, 0)
      const avgRating = coursesInCategory.length > 0
        ? coursesInCategory.reduce((acc, course) => acc + course.rating, 0) / coursesInCategory.length
        : 0

      return {
        name: category,
        courseCount: coursesInCategory.length,
        studentCount: totalStudents,
        avgRating: avgRating.toFixed(1),
        description: getCategoryDescription(category),
        icon: getCategoryIcon(category),
        color: getCategoryColor(category),
      }
    })
  }, [courses])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">Chargement des catégories...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="border-b bg-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              Explorez nos catégories
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Trouvez votre prochaine{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">passion</span>
            </h1>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Découvrez des cours de qualité dans les domaines les plus demandés. Plus de 250 000 étudiants nous font
              confiance pour développer leurs compétences.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryStats.map((category) => (
            <Card
              key={category.name}
              className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/50"
            >
              <CardContent className="p-6">
                {/* Icon & Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${category.color} transition-transform group-hover:scale-110`}>
                    {category.icon}
                  </div>
                  {category.courseCount > 3 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Populaire
                    </Badge>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{category.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span className="text-xs">Cours</span>
                    </div>
                    <p className="text-lg font-bold">{category.courseCount}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-xs">Étudiants</span>
                    </div>
                    <p className="text-lg font-bold">{formatNumber(category.studentCount)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <span className="text-xs">Note</span>
                    </div>
                    <p className="text-lg font-bold flex items-center gap-1">
                      {category.avgRating}
                      <span className="text-primary">★</span>
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href={`/courses?category=${encodeURIComponent(category.name)}`}>
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                    Explorer les cours
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-2">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Vous ne trouvez pas ce que vous cherchez ?
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              Parcourez notre catalogue complet de cours avec des filtres avancés pour trouver exactement ce dont vous
              avez besoin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" className="min-w-[200px]">
                  Voir tous les cours
                </Button>
              </Link>
              <Link href="/instructor/dashboard">
                <Button size="lg" variant="outline" className="min-w-[200px] bg-transparent">
                  Devenir formateur
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    "Développement": "Créez des sites et applications web modernes avec les dernières technologies",
    "Business": "Développez vos compétences en gestion, entrepreneuriat et stratégie d'entreprise",
    "Finance & Comptabilité": "Maîtrisez la finance, la comptabilité et l'analyse financière",
    "IT & Logiciels": "Apprenez les technologies informatiques et les logiciels professionnels",
    "Productivité Bureautique": "Optimisez votre travail avec les outils bureautiques essentiels",
    "Développement Personnel": "Développez vos compétences personnelles et professionnelles",
    "Design": "Concevez des interfaces utilisateur magnifiques et intuitives",
    "Marketing": "Maîtrisez le marketing digital, la publicité et la communication",
    "Santé & Fitness": "Améliorez votre santé et votre forme physique",
    "Musique": "Apprenez la musique, la production et les instruments",
    "Photographie": "Maîtrisez l'art de la photographie et du traitement d'images",
  }
  return descriptions[category] || "Développez vos compétences dans ce domaine passionnant"
}

function getCategoryIcon(category: string): React.ReactNode {
  const iconClass = "h-6 w-6 text-primary"
  const icons: Record<string, React.ReactNode> = {
    "Développement Web": (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    "Data Science": (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    "Intelligence Artificielle": (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    Design: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
    DevOps: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      </svg>
    ),
    Mobile: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  }
  return icons[category] || <BookOpen className={iconClass} />
}

function getCategoryColor(category: string): string {
  // Palette Orange Mali Stricte - Uniquement Noir, Blanc, Orange, Gris
  // Utiliser l'orange pour maximiser l'impact, gris modérément
  const colors: Record<string, string> = {
    "Développement": "bg-primary/10", // Orange Digital
    "Business": "bg-primary/12", // Orange Digital (variante)
    "Finance & Comptabilité": "bg-primary/10", // Orange Digital
    "IT & Logiciels": "bg-primary/15", // Orange Digital (variante)
    "Productivité Bureautique": "bg-primary/10", // Orange Digital
    "Développement Personnel": "bg-primary/12", // Orange Digital (variante)
    "Design": "bg-primary/15", // Orange Digital (variante)
    "Marketing": "bg-primary/10", // Orange Digital
    "Santé & Fitness": "bg-primary/12", // Orange Digital (variante)
    "Musique": "bg-primary/10", // Orange Digital
    "Photographie": "bg-primary/12", // Orange Digital (variante)
  }
  return colors[category] || "bg-primary/10"
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}
