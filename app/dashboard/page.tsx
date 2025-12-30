"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Clock, Award, TrendingUp, Play, Calendar, Trophy, Target, Sparkles, Zap, Flame, ArrowUpRight, FileText, Users, Star, CheckCircle2, BarChart3, MessageSquare, Share2, Download, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts"
import { mockCourses } from "@/lib/data"
import { FadeInView } from "@/components/fade-in-view"
import { StatCardWithComparison } from "@/components/stat-card-with-comparison"
import { MiniPlayer } from "@/components/mini-player"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("week")
  
  // Mock user data
  const enrolledCourses = mockCourses.slice(0, 3)
  const completedCourses = 12
  const totalHours = 148
  const certificates = 8

  // Previous period values for comparison
  const previousStats = {
    enrolledCourses: enrolledCourses.length - 2,
    completedCourses: 9,
    totalHours: 136,
    certificates: 6,
  }

  const stats = [
    {
      title: "Cours en Cours",
      value: enrolledCourses.length,
      previousValue: previousStats.enrolledCourses,
      icon: BookOpen,
      description: "Cours actifs",
      tooltip: "Nombre de cours auxquels vous êtes actuellement inscrit. Comparez avec la période précédente pour voir votre progression.",
    },
    {
      title: "Cours Complétés",
      value: completedCourses,
      previousValue: previousStats.completedCourses,
      icon: Trophy,
      description: "Total complété",
      tooltip: "Total des cours que vous avez terminés. Continuez à apprendre pour augmenter ce nombre !",
    },
    {
      title: "Heures d'Apprentissage",
      value: totalHours,
      previousValue: previousStats.totalHours,
      icon: Clock,
      description: "Temps total",
      tooltip: "Temps total passé à apprendre. L'objectif est de maintenir une progression constante.",
    },
    {
      title: "Certificats Obtenus",
      value: certificates,
      previousValue: previousStats.certificates,
      icon: Award,
      description: "Certifications",
      tooltip: "Nombre de certificats obtenus après avoir complété des cours. Chaque certificat valide vos compétences.",
    },
  ]

  // Get current course for mini player
  const currentCourse = enrolledCourses[0]
  const [showMiniPlayer, setShowMiniPlayer] = useState(false)

  const recentActivity = [
    {
      course: "React & TypeScript",
      lesson: "Hooks avancés",
      progress: 75,
      date: "Aujourd'hui",
      time: "14:30",
      icon: Play,
    },
    {
      course: "Next.js 15",
      lesson: "Server Actions",
      progress: 45,
      date: "Hier",
      time: "16:15",
      icon: Play,
    },
    {
      course: "UI/UX Design",
      lesson: "Principes de design",
      progress: 90,
      date: "Il y a 2 jours",
      time: "10:20",
      icon: Play,
    },
  ]

  const weeklyProgress = [
    { day: "Lun", hours: 2.5, goal: 3 },
    { day: "Mar", hours: 3.2, goal: 3 },
    { day: "Mer", hours: 1.8, goal: 3 },
    { day: "Jeu", hours: 4.0, goal: 3 },
    { day: "Ven", hours: 2.0, goal: 3 },
    { day: "Sam", hours: 5.5, goal: 3 },
    { day: "Dim", hours: 3.0, goal: 3 },
  ]

  const monthlyProgress = [
    { week: "Sem 1", hours: 18.5, goal: 20 },
    { week: "Sem 2", hours: 22.3, goal: 20 },
    { week: "Sem 3", hours: 19.8, goal: 20 },
    { week: "Sem 4", hours: 24.1, goal: 20 },
  ]


  const badges = [
    { id: 1, name: "Première Leçon", icon: "🎯", earned: true, date: "Il y a 2 semaines" },
    { id: 2, name: "Marathon 7 jours", icon: "🔥", earned: true, date: "Il y a 1 semaine" },
    { id: 3, name: "5 Cours Complétés", icon: "⭐", earned: true, date: "Il y a 3 jours" },
    { id: 4, name: "Expert React", icon: "⚛️", earned: true, date: "Hier" },
    { id: 5, name: "100 Heures", icon: "💯", earned: false, progress: 85 },
    { id: 6, name: "Top Étudiant", icon: "👑", earned: false, progress: 60 },
  ]

  const upcomingDeadlines = [
    { course: "React & TypeScript", task: "Projet Final", dueDate: "Dans 3 jours", priority: "high" },
    { course: "Next.js 15", task: "Quiz Module 5", dueDate: "Dans 5 jours", priority: "medium" },
  ]

  const chartData = selectedPeriod === "week" ? weeklyProgress : monthlyProgress
  const chartDataKey = selectedPeriod === "week" ? "day" : "week"

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
                  {enrolledCourses.map((course, index) => {
                    const progress = Math.floor(Math.random() * 40) + 30
                    return (
                      <FadeInView key={course.id} delay={0.3 + index * 0.1}>
                        <div className="group p-4 border-2 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:shadow-lg">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
                                    {course.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Module 3: Concepts avancés
                                  </p>
                                </div>
                                <Badge className="bg-primary text-white font-semibold border-0 shadow-sm">
                                  {progress}%
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>Progression</span>
                                  <span className="font-semibold">{progress}% complété</span>
                                </div>
                                <Progress 
                                  value={progress} 
                                  className="h-2.5 bg-muted"
                                />
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
                    )
                  })}
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
                      <CardTitle className="text-xl">Badges & Réalisations</CardTitle>
                      <CardDescription>Vos accomplissements et défis</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {badges.map((badge, index) => (
                      <FadeInView key={badge.id} delay={0.6 + index * 0.05}>
                        <div
                          className={`group relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                            badge.earned
                              ? "border-primary/40 bg-primary/5 hover:bg-primary/10 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                              : "border-muted bg-muted/20 opacity-60 hover:opacity-80"
                          }`}
                          title={badge.earned ? `Débloqué ${badge.date}` : `Progression: ${badge.progress}%`}
                        >
                          {badge.earned && (
                            <div className="absolute -top-2 -right-2">
                              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                            </div>
                          )}
                          <div className={`text-4xl transition-transform duration-300 ${
                            badge.earned ? "group-hover:scale-125 group-hover:rotate-12" : "grayscale"
                          }`}>
                            {badge.icon}
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-xs font-bold leading-tight">{badge.name}</p>
                            {badge.earned ? (
                              <Badge className="bg-primary text-white text-xs border-0">
                                Débloqué
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                <Progress value={badge.progress} className="h-1.5" />
                                <p className="text-xs text-muted-foreground">{badge.progress}%</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </FadeInView>
                    ))}
                  </div>
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
                  {recentActivity.map((activity, index) => (
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
                  ))}
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
                  {upcomingDeadlines.map((deadline, index) => (
                    <div
                      key={index}
                      className={`p-4 border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${
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
                  ))}
                </CardContent>
              </Card>
            </FadeInView>

            {/* Learning Goal */}
            <FadeInView delay={0.5}>
              <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Objectif de la Semaine
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold">20 heures d'apprentissage</span>
                      <span className="text-sm font-bold text-primary">22/20h</span>
                    </div>
                    <Progress value={110} className="h-3 bg-muted" />
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-xs font-bold text-primary">
                      Objectif dépassé ! Excellent travail 🎉
                    </p>
                  </div>
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
                  <div className="space-y-3">
                    {mockCourses.slice(3, 5).map((course) => (
                      <Link key={course.id} href={`/courses/${course.id}`}>
                        <div className="group p-4 border-2 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:shadow-lg">
                          <p className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {course.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{course.duration}h</span>
                            <span>•</span>
                            <span>{course.level}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "React & TypeScript", date: "Mars 2024", instructor: "Aissata Traoré", formateur: "Aissata Traoré" },
                  { title: "Next.js 15", date: "Février 2024", instructor: "Amadou Keita", formateur: "Amadou Keita" },
                  { title: "UI/UX Design", date: "Janvier 2024", instructor: "Fatoumata Sangaré", formateur: "Fatoumata Sangaré" },
                  { title: "Python Data Science", date: "Décembre 2023", instructor: "Moussa Diarra", formateur: "Moussa Diarra" },
                ].map((cert, index) => (
                  <FadeInView key={index} delay={0.9 + index * 0.1}>
                    <div className="group p-4 border-2 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:shadow-lg cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="rounded-lg bg-primary/10 p-2 border border-primary/20 group-hover:scale-110 transition-transform">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <h4 className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {cert.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">Formateur: {cert.instructor}</p>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-primary/10 text-primary text-xs border-0">
                          {cert.date}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </FadeInView>
                ))}
              </div>
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
                {[
                  { title: "React & TypeScript", completed: "15 Mars 2024", rating: 5, hours: 32.5 },
                  { title: "Next.js 15", completed: "8 Mars 2024", rating: 5, hours: 28 },
                  { title: "UI/UX Design", completed: "28 Février 2024", rating: 4, hours: 24 },
                ].map((course, index) => (
                  <div
                    key={index}
                    className="group p-4 border-2 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                          {course.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">{course.completed}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < course.rating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{course.hours}h de contenu</span>
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
                <ChartContainer
                  config={{
                    value: {
                      label: "Cours",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <BarChart data={[
                    { category: "Développement", value: 8 },
                    { category: "Design", value: 3 },
                    { category: "Data Science", value: 2 },
                    { category: "DevOps", value: 1 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis
                      dataKey="category"
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
              </CardContent>
            </Card>
          </FadeInView>
        </div>

        {/* Prochaines Étapes & Communauté */}
        <div className="grid lg:grid-cols-2 gap-6">
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
                {[
                  { action: "Compléter le cours React & TypeScript", progress: 75, link: "/learn/1" },
                  { action: "Passer le quiz Next.js Module 5", progress: 0, link: "/learn/2" },
                  { action: "Explorer les nouveaux cours disponibles", progress: 0, link: "/courses" },
                ].map((step, index) => (
                  <div
                    key={index}
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
                ))}
              </CardContent>
            </Card>
          </FadeInView>

          {/* Communauté & Interactions */}
          <FadeInView delay={1.3}>
            <Card className="border-2 hover:border-primary/20 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Communauté</CardTitle>
                    <CardDescription>Interactions et partages</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Questions posées", value: 24, icon: MessageSquare },
                    { label: "Réponses données", value: 18, icon: CheckCircle2 },
                    { label: "Cours partagés", value: 12, icon: Share2 },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="p-4 border-2 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-center"
                    >
                      <div className="flex justify-center mb-2">
                        <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                          <stat.icon className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold mb-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <Button className="w-full bg-primary text-white hover:bg-primary/90 font-semibold" asChild>
                    <Link href="/courses">
                      Rejoindre la communauté
                      <Users className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeInView>
        </div>

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
