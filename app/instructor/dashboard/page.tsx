"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Users, BookOpen, Eye, Star, Plus, Edit } from "lucide-react"
import { AnimatedCounter } from "@/components/animated-counter"
import { FadeInView } from "@/components/fade-in-view"

export default function InstructorDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de Bord Formateur</h1>
            <p className="text-muted-foreground">Gérez vos cours et suivez vos performances</p>
          </div>
          <Button size="lg" className="w-full md:w-auto">
            <Plus className="mr-2 h-5 w-5" />
            Créer un nouveau cours
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <FadeInView delay={0.1}>
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Vues totales</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={125480} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary font-medium">+12.5%</span> vs mois dernier
                </p>
              </CardContent>
            </Card>
          </FadeInView>

          <FadeInView delay={0.2}>
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Étudiants inscrits</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={3245} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary font-medium">+8.2%</span> vs mois dernier
                </p>
              </CardContent>
            </Card>
          </FadeInView>

          <FadeInView delay={0.3}>
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cours actifs</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={8} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">2 en création</p>
              </CardContent>
            </Card>
          </FadeInView>

          <FadeInView delay={0.4}>
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Note moyenne</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-1">
                  4.8 <span className="text-primary text-lg">★</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Sur 1 245 avis</p>
              </CardContent>
            </Card>
          </FadeInView>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Mes Cours</TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
            <TabsTrigger value="earnings">Revenus</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            {/* Courses List */}
            {instructorCourses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full md:w-48 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                          <Badge variant={course.status === "published" ? "default" : "secondary"}>
                            {course.status === "published" ? "Publié" : "Brouillon"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Éditer
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Étudiants</p>
                          <p className="font-semibold">{course.students.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Note</p>
                          <p className="font-semibold flex items-center gap-1">
                            {course.rating} <span className="text-primary">★</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Étudiants</p>
                          <p className="font-semibold">{course.enrolledCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Complétion</p>
                          <p className="font-semibold">{course.completion}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FadeInView>
                <Card>
                  <CardHeader>
                    <CardTitle>Vues par cours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        views: {
                          label: "Vues",
                          color: "hsl(var(--primary))",
                        },
                      }}
                      className="h-[300px] w-full"
                    >
                      <BarChart data={[
                        { name: "React & TS", views: 12450 },
                        { name: "Next.js", views: 8900 },
                        { name: "Node.js", views: 6700 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="views" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </FadeInView>

              <FadeInView delay={0.1}>
                <Card>
                  <CardHeader>
                    <CardTitle>Étudiants inscrits par mois</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        students: {
                          label: "Étudiants",
                          color: "hsl(var(--primary))",
                        },
                      }}
                      className="h-[300px] w-full"
                    >
                      <LineChart data={[
                        { month: "Jan", students: 2470 },
                        { month: "Fév", students: 2800 },
                        { month: "Mar", students: 3340 },
                        { month: "Avr", students: 4450 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                        <Line
                          type="monotone"
                          dataKey="students"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </FadeInView>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {recentReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={review.avatar || "/placeholder.svg"}
                      alt={review.student}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{review.student}</p>
                          <p className="text-sm text-muted-foreground">{review.course}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{review.rating}</span>
                          <span className="text-primary">★</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}

const instructorCourses = [
  {
    id: "1",
    title: "React & TypeScript - Le Guide Complet",
    thumbnail: "/react-typescript-coding-developer.jpg",
    status: "published",
    students: 12500,
    rating: 4.8,
    enrolledCount: 12500,
    completion: 68,
  },
  {
    id: "2",
    title: "Next.js 15 - Applications Full-Stack",
    thumbnail: "/next-js-web-development-laptop.jpg",
    status: "published",
    students: 8900,
    rating: 4.9,
    enrolledCount: 8900,
    completion: 72,
  },
  {
    id: "3",
    title: "Node.js Backend Masterclass",
    thumbnail: "/node-js-backend-coding.jpg",
    status: "draft",
    students: 0,
    rating: 0,
    enrolledCount: 0,
    completion: 45,
  },
]

const recentReviews = [
  {
    id: "1",
    student: "Kadiatou Traoré",
    avatar: "/female-student-avatar.jpg",
    course: "React & TypeScript",
    rating: 5,
    comment: "Excellent cours, très bien structuré et les explications sont claires. Je recommande vivement !",
    date: "Il y a 2 jours",
  },
  {
    id: "2",
    student: "Amadou Keita",
    avatar: "/male-student-avatar.jpg",
    course: "Next.js Full-Stack",
    rating: 5,
    comment: "Le meilleur cours sur Next.js que j'ai suivi. Les projets pratiques sont vraiment utiles.",
    date: "Il y a 5 jours",
  },
  {
    id: "3",
    student: "Awa Diarra",
    avatar: "/female-student-avatar.jpg",
    course: "React & TypeScript",
    rating: 4,
    comment: "Très bon cours dans l'ensemble. Quelques sections pourraient être plus détaillées.",
    date: "Il y a 1 semaine",
  },
]
