"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { BookOpen, Clock, Award, TrendingUp, Play, Calendar, Trophy, Target, Sparkles, Zap, Flame, ArrowUpRight, FileText, Star, CheckCircle2, BarChart3, Download, Eye, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts"
import { FadeInView } from "@/components/fade-in-view"
import { StatCardWithComparison } from "@/components/stat-card-with-comparison"
import { MiniPlayer } from "@/components/mini-player"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/protected-route"
import { useQuery } from "@tanstack/react-query"
import { dashboardService, courseService, profileService, certificateService, learnerService, detailsCourseService } from "@/lib/api/services"
import { useAuthStore } from "@/lib/store/auth-store"

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("week")
  const { user } = useAuthStore()

  // Récupérer les statistiques du dashboard
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboardStats", user?.id],
    queryFn: () => dashboardService.getStudentDashboard(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Récupérer le profil pour les cours inscrits
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => profileService.getMyProfile(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Récupérer tous les cours
  const { data: allCourses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => courseService.getAllCourses(),
    staleTime: 5 * 60 * 1000,
  })

  // Récupérer les certificats
  const { data: certificates = [], isLoading: isLoadingCertificates } = useQuery({
    queryKey: ["certificates", user?.id],
    queryFn: () => certificateService.getMyCertificates(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Récupérer l'activité récente
  const { data: recentActivityData = [], isLoading: isLoadingRecentActivity } = useQuery({
    queryKey: ["recentActivity", user?.id],
    queryFn: () => learnerService.getRecentActivity(3),
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  })

  // Récupérer les cours complétés
  const { data: completedCoursesData = [], isLoading: isLoadingCompletedCourses } = useQuery({
    queryKey: ["completedCourses", user?.id],
    queryFn: () => detailsCourseService.getMyCompletedCourses(),
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
    ).slice(0, 3) // Limiter à 3 pour l'affichage
  }, [profile, allCourses])

  // Calculer les statistiques
  const statsData = useMemo(() => {
    const coursesJoined = dashboardStats?.studentStats?.coursesJoined || enrolledCourses.length || 0
    const certificatesObtained = dashboardStats?.studentStats?.certificatesObtained || certificates.length || 0
    const completedCourses = profile?.completedCourses?.length || 0
    
    // Calculer les heures totales (approximation basée sur la durée des cours)
    const totalHours = enrolledCourses.reduce((sum, course) => sum + (course.duration || 0), 0)

    // Valeurs précédentes (pour l'instant, on utilise des valeurs par défaut)
    const previousStats = {
      enrolledCourses: Math.max(0, coursesJoined - 1),
      completedCourses: Math.max(0, completedCourses - 1),
      totalHours: Math.max(0, totalHours - 10),
      certificates: Math.max(0, certificatesObtained - 1),
    }

    return {
      enrolledCourses: coursesJoined,
      completedCourses,
      totalHours: Math.round(totalHours),
      certificates: certificatesObtained,
      previousStats,
    }
  }, [dashboardStats, enrolledCourses, profile, certificates])

  const isLoading = isLoadingStats || isLoadingProfile || isLoadingCourses || isLoadingCertificates

  const stats = [
    {
      title: "Cours en Cours",
      value: statsData.enrolledCourses,
      previousValue: statsData.previousStats.enrolledCourses,
      icon: BookOpen,
      description: "Cours actifs",
      tooltip: "Nombre de cours auxquels vous êtes actuellement inscrit. Comparez avec la période précédente pour voir votre progression.",
    },
    {
      title: "Cours Complétés",
      value: statsData.completedCourses,
      previousValue: statsData.previousStats.completedCourses,
      icon: Trophy,
      description: "Total complété",
      tooltip: "Total des cours que vous avez terminés. Continuez à apprendre pour augmenter ce nombre !",
    },
    {
      title: "Heures d'Apprentissage",
      value: statsData.totalHours,
      previousValue: statsData.previousStats.totalHours,
      icon: Clock,
      description: "Temps total",
      tooltip: "Temps total passé à apprendre. L'objectif est de maintenir une progression constante.",
    },
    {
      title: "Certificats Obtenus",
      value: statsData.certificates,
      previousValue: statsData.previousStats.certificates,
      icon: Award,
      description: "Certifications",
      tooltip: "Nombre de certificats obtenus après avoir complété des cours. Chaque certificat valide vos compétences.",
    },
  ]

  // Get current course for mini player
  const currentCourse = enrolledCourses[0]
  const [showMiniPlayer, setShowMiniPlayer] = useState(false)

  // Calculer la progression pour chaque cours inscrit
  const enrolledCoursesWithProgress = useMemo(() => {
    return enrolledCourses.map((course) => {
      const isCompleted = profile?.completedCourses?.includes(course.title) || false
      const progress = isCompleted ? 100 : Math.floor(Math.random() * 40) + 30 // TODO: Récupérer la vraie progression
      return {
        ...course,
        progress,
      }
    })
  }, [enrolledCourses, profile])

  // Calculer la répartition par catégorie pour le graphique
  const categoryDistribution = useMemo(() => {
    if (!enrolledCourses.length) {
      return []
    }

    // Compter les cours par catégorie
    const categoryCount: Record<string, number> = {}
    
    enrolledCourses.forEach((course) => {
      const category = course.category || "Autre"
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })

    // Convertir en tableau pour le graphique, trier par valeur décroissante
    const distribution = Object.entries(categoryCount)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)

    return distribution
  }, [enrolledCourses])

  // Formater l'activité récente depuis l'API
  const recentActivity = useMemo(() => {
    if (!recentActivityData || recentActivityData.length === 0) {
      return []
    }

    return recentActivityData.map((activity: any) => {
      // Convertir la date en string ISO pour éviter les erreurs de sérialisation
      const completedAtStr = activity.completedAt || new Date().toISOString()
      const completedAt = new Date(completedAtStr)
      const now = new Date()
      const diffMs = now.getTime() - completedAt.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      let dateLabel = "Aujourd'hui"
      let timeLabel = completedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      
      if (diffDays === 1) {
        dateLabel = "Hier"
      } else if (diffDays > 1 && diffDays <= 7) {
        dateLabel = `Il y a ${diffDays} jours`
      } else if (diffDays > 7) {
        dateLabel = completedAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
      }

      // Retourner uniquement des valeurs sérialisables (pas d'objets Date)
      return {
        course: activity.courseTitle || "Cours",
        lesson: activity.lessonTitle || "Leçon",
        progress: activity.progress || 0,
        date: dateLabel, // String sérialisable
        time: timeLabel, // String sérialisable
        icon: Play, // Composant React, mais ne sera pas sérialisé dans le state
      }
    })
  }, [recentActivityData])

  // Récupérer la progression d'apprentissage dynamique
  const { data: learningProgressData = [], isLoading: isLoadingProgress } = useQuery({
    queryKey: ["learningProgress", user?.id, selectedPeriod],
    queryFn: () => learnerService.getLearningProgress(selectedPeriod),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Formater les données de progression pour le graphique
  const chartData = useMemo(() => {
    console.log("learningProgressData:", learningProgressData, "selectedPeriod:", selectedPeriod)
    if (!learningProgressData || learningProgressData.length === 0) {
      // Retourner des données vides si pas de données
      if (selectedPeriod === "week") {
        return [
          { day: "Lun", hours: 0, goal: 3 },
          { day: "Mar", hours: 0, goal: 3 },
          { day: "Mer", hours: 0, goal: 3 },
          { day: "Jeu", hours: 0, goal: 3 },
          { day: "Ven", hours: 0, goal: 3 },
          { day: "Sam", hours: 0, goal: 3 },
          { day: "Dim", hours: 0, goal: 3 },
        ]
      } else if (selectedPeriod === "month") {
        return [
          { week: "Sem 1", hours: 0, goal: 20 },
          { week: "Sem 2", hours: 0, goal: 20 },
          { week: "Sem 3", hours: 0, goal: 20 },
          { week: "Sem 4", hours: 0, goal: 20 },
        ]
      } else {
        return []
      }
    }

    // Mapper les données de l'API vers le format du graphique
    return learningProgressData.map((item: any) => {
      if (selectedPeriod === "week") {
        return {
          day: item.day || "",
          hours: item.hours || 0,
          goal: item.goal || 3,
        }
      } else if (selectedPeriod === "month") {
        return {
          week: item.week || "",
          hours: item.hours || 0,
          goal: item.goal || 20,
        }
      } else {
        return {
          month: item.month || "",
          hours: item.hours || 0,
          goal: item.goal || 80,
        }
      }
    })
  }, [learningProgressData, selectedPeriod])

  const chartDataKey = selectedPeriod === "week" ? "day" : selectedPeriod === "month" ? "week" : "month"


  // Formater les cours complétés pour l'affichage
  const completedCoursesForDisplay = useMemo(() => {
    if (!completedCoursesData || completedCoursesData.length === 0) {
      return []
    }

    return completedCoursesData.slice(0, 6).map((course: any, index: number) => {
      const completedAt = course.completedAt ? new Date(course.completedAt) : new Date()
      const diffMs = new Date().getTime() - completedAt.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      let dateLabel = "Aujourd'hui"
      if (diffDays === 1) {
        dateLabel = "Hier"
      } else if (diffDays > 1 && diffDays <= 7) {
        dateLabel = `Il y a ${diffDays} jours`
      } else if (diffDays > 7) {
        dateLabel = completedAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
      }

      // Icônes basées sur la catégorie ou l'index
      const icons = ["🎯", "🔥", "⭐", "⚛️", "💯", "👑"]
      const icon = icons[index % icons.length]

      return {
        id: course.id || index,
        name: course.title || "Cours",
        icon: icon,
        earned: true,
        date: dateLabel,
        course: course,
      }
    })
  }, [completedCoursesData])

  // Récupérer les échéances à venir
  const { data: upcomingDeadlinesData = [], isLoading: isLoadingDeadlines } = useQuery({
    queryKey: ["upcomingDeadlines", user?.id],
    queryFn: () => learnerService.getUpcomingDeadlines(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Récupérer les prochaines étapes
  const { data: nextStepsData = [], isLoading: isLoadingNextSteps } = useQuery({
    queryKey: ["nextSteps", user?.id],
    queryFn: () => learnerService.getNextSteps(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Formater les échéances
  const upcomingDeadlines = useMemo(() => {
    return upcomingDeadlinesData.map((deadline: any) => ({
      course: deadline.course || "Cours",
      task: deadline.task || "Tâche",
      dueDate: deadline.dueDate || "Bientôt",
      priority: deadline.priority || "medium",
      courseId: deadline.courseId,
      quizId: deadline.quizId,
      taskType: deadline.taskType,
    }))
  }, [upcomingDeadlinesData])

  // Formater les prochaines étapes
  const nextSteps = useMemo(() => {
    console.log("nextStepsData:", nextStepsData)
    if (!nextStepsData || nextStepsData.length === 0) {
      return []
    }
    return nextStepsData.map((step: any) => {
      const formatted = {
        action: step.action || "Action",
        progress: typeof step.progress === 'number' ? step.progress : parseInt(step.progress) || 0,
        link: step.link || "/courses",
        type: step.type || "explore",
      }
      console.log("Formatted step:", formatted)
      return formatted
    })
  }, [nextStepsData])


  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header avec salutation dynamique */}
        <FadeInView>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Tableau de Bord
              </h1>
              <p className="text-muted-foreground text-lg">
                Bienvenue ! Continuez votre parcours d'apprentissage 🚀
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-primary/20">
                <Calendar className="h-4 w-4 mr-2" />
                Voir le calendrier
              </Button>
            </div>
          </div>
        </FadeInView>

        {/* Stats Cards - Design moderne avec animations - Fond Noir, Texte Blanc */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, index) => (
            <StatCardWithComparison
              key={index}
              title={stat.title}
              value={stat.value}
              previousValue={stat.previousValue}
              icon={stat.icon}
              description={stat.description}
              tooltip={stat.tooltip}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-5">
            {/* Continue Learning - Design amélioré */}
            <FadeInView delay={0.2}>
              <Card className="border-2 hover:border-primary/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                        <Play className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Continuer l'Apprentissage</CardTitle>
                        <CardDescription>Reprenez où vous vous êtes arrêté</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/courses" className="text-primary hover:text-primary/80">
                        Voir tout
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Chargement des cours...</span>
                    </div>
                  ) : enrolledCoursesWithProgress.length > 0 ? (
                    enrolledCoursesWithProgress.map((course, index) => (
                      <FadeInView key={course.id} delay={0.3 + index * 0.1}>
                        <div className="group p-4 border-2 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:shadow-lg">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
                                    {course.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {course.category || "Non catégorisé"}
                                    </Badge>
                                    <p className="text-sm text-muted-foreground">
                                      {course.instructor?.name || "Formateur"}
                                    </p>
                                  </div>
                                </div>
                                {(course.progress || 0) === 100 && (
                                <Badge className="bg-primary text-white font-semibold border-0 shadow-sm">
                                    Complété
                                </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setShowMiniPlayer(!showMiniPlayer)}
                                title="Afficher le mini player"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            <Button 
                              size="sm" 
                              className="bg-primary text-white hover:bg-primary/90 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                              asChild
                            >
                              <Link href={`/learn/${course.id}`}>
                                Reprendre
                                <Play className="h-4 w-4 ml-1.5" />
                              </Link>
                            </Button>
                            </div>
                          </div>
                        </div>
                      </FadeInView>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Aucun cours en cours</p>
                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <Link href="/courses">Découvrir des cours</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInView>

            {/* Progression Chart - Graphique interactif moderne */}
            <FadeInView delay={0.4}>
              <Card className="border-2 hover:border-primary/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Progression d'Apprentissage</CardTitle>
                        <CardDescription>Suivez votre évolution dans le temps</CardDescription>
                      </div>
                    </div>
                    <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as "week" | "month" | "year")}>
                      <TabsList className="bg-muted/50">
                        <TabsTrigger value="week" className="text-xs">Semaine</TabsTrigger>
                        <TabsTrigger value="month" className="text-xs">Mois</TabsTrigger>
                        <TabsTrigger value="year" className="text-xs">Année</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingProgress ? (
                    <div className="flex items-center justify-center h-[350px]">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Chargement des données...</span>
                    </div>
                  ) : (
                  <ChartContainer
                    config={{
                      hours: {
                        label: "Heures",
                        color: "hsl(var(--primary))",
                      },
                      goal: {
                        label: "Objectif",
                        color: "hsl(var(--muted-foreground))",
                      },
                    }}
                    className="h-[350px] w-full"
                  >
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                      <XAxis
                        dataKey={chartDataKey}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        className="text-xs font-medium"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        className="text-xs font-medium"
                        domain={[0, "dataMax + 2"]}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <ChartTooltip
                        cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-3 shadow-lg">
                                <div className="grid gap-2">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-medium text-muted-foreground">
                                      {payload[0].payload[chartDataKey]}
                                    </span>
                                    <span className="text-sm font-bold text-primary">
                                      {payload[0].value}h
                                    </span>
                                  </div>
                                  {payload[1] && (
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-xs text-muted-foreground">Objectif</span>
                                      <span className="text-xs font-medium">
                                        {payload[1].value}h
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="hours"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fill="url(#colorHours)"
                        dot={{ fill: "hsl(var(--primary))", r: 5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                        activeDot={{ r: 7, strokeWidth: 3, stroke: "hsl(var(--background))" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="goal"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </AreaChart>
                  </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </FadeInView>

            {/* Achievements - Design amélioré */}
            <FadeInView delay={0.5}>
              <Card className="border-2 hover:border-primary/20 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Réalisations</CardTitle>
                      <CardDescription>Vos cours complétés</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {isLoadingCompletedCourses ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Chargement...</span>
                    </div>
                  ) : completedCoursesForDisplay.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {completedCoursesForDisplay.map((achievement, index) => (
                        <FadeInView key={achievement.id} delay={0.6 + index * 0.05}>
                          <Link href={`/courses/${achievement.course.id}`}>
                            <div
                              className="group relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer border-primary/40 bg-primary/5 hover:bg-primary/10 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                              title={`Complété ${achievement.date}`}
                            >
                            <div className="absolute -top-2 -right-2">
                              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                            </div>
                              <div className="text-4xl transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                                {achievement.icon}
                          </div>
                          <div className="text-center space-y-1">
                                <p className="text-xs font-bold leading-tight line-clamp-2">{achievement.name}</p>
                              <Badge className="bg-primary text-white text-xs border-0">
                                  Complété
                              </Badge>
                                <p className="text-xs text-muted-foreground">{achievement.date}</p>
                              </div>
                          </div>
                          </Link>
                      </FadeInView>
                    ))}
                  </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Aucun cours complété pour le moment</p>
                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <Link href="/courses">Découvrir des cours</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInView>

          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-5">
            {/* Recent Activity - Design amélioré */}
            <FadeInView delay={0.3}>
              <Card className="border-2 hover:border-primary/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Activité Récente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingRecentActivity ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Chargement...</span>
                    </div>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                    <FadeInView key={index} delay={0.4 + index * 0.1}>
                      <div className="group p-3 border rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                              {activity.course}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {activity.lesson}
                            </p>
                          </div>
                          <Badge className="bg-primary text-white text-xs border-0 font-semibold">
                            {activity.progress}%
                          </Badge>
                        </div>
                        <Progress value={activity.progress} className="h-2 mb-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{activity.date}</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </FadeInView>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Aucune activité récente</p>
                      <p className="text-xs mt-1">Commencez à suivre des cours pour voir votre activité</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInView>

            {/* Upcoming Deadlines */}
            <FadeInView delay={0.4}>
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Échéances à Venir
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoadingDeadlines ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Chargement...</span>
                    </div>
                  ) : upcomingDeadlines.length > 0 ? (
                    upcomingDeadlines.map((deadline, index) => (
                    <Link 
                      key={index}
                      href={deadline.taskType === "quiz" && deadline.courseId && deadline.quizId 
                        ? `/learn/${deadline.courseId}/quiz/${deadline.quizId}` 
                        : deadline.courseId 
                        ? `/learn/${deadline.courseId}` 
                        : "/courses"}
                    >
                      <div
                        className={`p-4 border-2 rounded-xl transition-all duration-300 hover:shadow-lg cursor-pointer ${
                        deadline.priority === "high"
                          ? "border-primary/40 bg-primary/10 hover:bg-primary/15"
                          : "border-muted bg-muted/20 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-sm mb-1">{deadline.course}</p>
                          <p className="text-xs text-muted-foreground">{deadline.task}</p>
                        </div>
                        {deadline.priority === "high" && (
                          <Flame className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <Badge
                        className={`text-xs font-semibold ${
                          deadline.priority === "high"
                            ? "bg-primary text-white border-0"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {deadline.dueDate}
                      </Badge>
                    </div>
                    </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Aucune échéance à venir</p>
                      <p className="text-xs mt-1">Vous êtes à jour avec vos cours</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInView>

            {/* Recommended Courses */}
            <FadeInView delay={0.6}>
              <Card className="border-2 hover:border-primary/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Cours Recommandés</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingCourses ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Chargement...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allCourses
                        .filter(course => {
                          // Exclure les cours déjà inscrits
                          const isEnrolled = profile?.enrolledCourses?.includes(course.title) || false
                          return !isEnrolled
                        })
                        .slice(0, 2)
                        .map((course) => (
                          <Link key={course.id} href={`/courses/${course.id}`}>
                            <div className="group p-4 border-2 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:shadow-lg">
                              <p className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                {course.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{course.duration || 0}h</span>
                                <span>•</span>
                                <span>{course.level || "Tous niveaux"}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      {allCourses.filter(course => {
                        const isEnrolled = profile?.enrolledCourses?.includes(course.title) || false
                        return !isEnrolled
                      }).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">Aucun cours recommandé pour le moment</p>
                          <Button variant="outline" size="sm" className="mt-4" asChild>
                            <Link href="/courses">Découvrir tous les cours</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInView>
          </div>
        </div>
        
        {/* Mes Certificats */}
        <FadeInView delay={0.7}>
          <Card className="border-2 hover:border-primary/20 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Mes Certificats</CardTitle>
                    <CardDescription>Vos certifications obtenues</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile" className="text-primary hover:text-primary/80">
                    Voir tout
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCertificates ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Chargement des certificats...</span>
                </div>
              ) : certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {certificates.slice(0, 4).map((cert, index) => {
                    const issuedDate = new Date(cert.issuedDate)
                    const formattedDate = issuedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                    return (
                      <FadeInView key={cert.id} delay={0.9 + index * 0.1}>
                        <div className="group p-4 border-2 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:shadow-lg cursor-pointer">
                          <div className="flex items-start justify-between mb-3">
                            <div className="rounded-lg bg-primary/10 p-2 border border-primary/20 group-hover:scale-110 transition-transform">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <h4 className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                            {cert.course}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">Étudiant: {cert.studentName}</p>
                          <div className="flex items-center justify-between">
                            <Badge className="bg-primary/10 text-primary text-xs border-0">
                              {formattedDate}
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
                              <Link href={cert.certificateUrl} target="_blank">
                                <Eye className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </FadeInView>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Aucun certificat obtenu pour le moment</p>
                  <p className="text-xs mt-2">Complétez des cours pour obtenir vos certificats</p>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeInView>

        {/* Statistiques Détaillées & Cours Complétés */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Derniers Cours Complétés */}
          <FadeInView delay={0.8}>
            <Card className="border-2 hover:border-primary/20 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Derniers Cours Complétés</CardTitle>
                    <CardDescription>Votre historique récent</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Chargement...</span>
                  </div>
                ) : profile?.completedCourses && profile.completedCourses.length > 0 ? (
                  <>
                    {allCourses
                      .filter(course => profile.completedCourses.includes(course.title))
                      .slice(0, 3)
                      .map((course, index) => (
                        <div
                          key={course.id}
                          className="group p-4 border-2 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                                {course.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">Complété</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < (course.rating || 0)
                                      ? "fill-primary text-primary"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{course.duration || 0}h de contenu</span>
                            <span>•</span>
                            <span className="text-primary font-semibold">Complété</span>
                          </div>
                        </div>
                      ))}
                    <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5" asChild>
                      <Link href="/learning">
                        Voir tous mes cours complétés
                        <ArrowUpRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Aucun cours complété pour le moment</p>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <Link href="/courses">Découvrir des cours</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeInView>

          {/* Statistiques par Catégorie */}
          <FadeInView delay={0.9}>
            <Card className="border-2 hover:border-primary/20 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Répartition par Catégorie</CardTitle>
                    <CardDescription>Vos domaines d'apprentissage</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {categoryDistribution.length > 0 ? (
                <ChartContainer
                  config={{
                    value: {
                      label: "Cours",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[300px] w-full"
                >
                    <BarChart data={categoryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis
                      dataKey="category"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                      className="text-xs font-medium"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                      className="text-xs font-medium"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <ChartTooltip
                      cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                              <p className="font-bold text-sm text-primary">
                                {payload[0].value} cours
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {payload[0].payload.category}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-sm">Aucune donnée disponible</p>
                    <p className="text-xs mt-1">Inscrivez-vous à des cours pour voir vos statistiques</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeInView>
        </div>

          {/* Prochaines Étapes */}
          <FadeInView delay={1.2}>
            <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/20 p-2 border border-primary/30">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Prochaines Étapes</CardTitle>
                    <CardDescription>Suggestions pour continuer votre apprentissage</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
              {isLoadingNextSteps ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Chargement...</span>
                </div>
              ) : nextSteps.length > 0 ? (
                nextSteps.map((step, index) => (
                  <Link key={index} href={step.link || "/courses"}>
                    <div
                    className="group p-4 border-2 border-primary/20 rounded-xl hover:border-primary/40 hover:bg-primary/10 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-sm group-hover:text-primary transition-colors">
                          {step.action}
                        </p>
                        {step.progress > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Progression</span>
                              <span className="font-semibold">{step.progress}%</span>
                            </div>
                            <Progress value={step.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </div>
                    </Link>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Aucune suggestion pour le moment</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href="/courses">Explorer les cours</Link>
                  </Button>
                </div>
              )}
              </CardContent>
            </Card>
          </FadeInView>

        {/* Footer CTA - Explorer Plus */}
        <FadeInView delay={1.4}>
          <Card className="border-2 border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
            <CardContent className="p-8 text-center">
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/20 p-4 border-2 border-primary/30">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold">Continuez votre parcours d'apprentissage</h3>
                <p className="text-muted-foreground">
                  Découvrez de nouveaux cours et développez vos compétences avec Orange Digital Learning
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90 font-semibold shadow-lg" asChild>
                    <Link href="/courses">
                      Explorer les cours
                      <ArrowUpRight className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary/40 hover:bg-primary/5" asChild>
                    <Link href="/categories">
                      Parcourir les catégories
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeInView>
      </div>

      {/* Mini Player */}
      {showMiniPlayer && currentCourse && (
        <MiniPlayer
          title={currentCourse.title}
          thumbnail={currentCourse.imageUrl}
          onExpand={() => {
            window.location.href = `/learn/${currentCourse.id}`
          }}
          onClose={() => setShowMiniPlayer(false)}
        />
      )}
    </div>
    </ProtectedRoute>
  )
}
