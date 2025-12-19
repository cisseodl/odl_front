"use client"

import { useState } from "react"
import { Mail, MapPin, Calendar, Award, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { CourseCard } from "@/components/course-card"
import { mockCourses } from "@/lib/data"
import { ProtectedRoute } from "@/components/protected-route"

export default function ProfilePage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [courseUpdates, setCourseUpdates] = useState(true)

  const user = {
    name: "Mody Saidou Barry",
    email: "mody.saidou.barry@example.com",
    location: "Bamako, Mali",
    joinedDate: "Janvier 2024",
    bio: "Étudiant passionné par le développement web et l'apprentissage continu",
    avatar: "/male-student-avatar.jpg",
  }

  const enrolledCourses = mockCourses.slice(0, 4)

  const certificates = [
    {
      id: 1,
      course: "React & TypeScript - Le Guide Complet",
      date: "15 Mars 2024",
      instructor: "Sophie Martin",
    },
    {
      id: 2,
      course: "Next.js 15 - Applications Full-Stack",
      date: "28 Février 2024",
      instructor: "Thomas Dubois",
    },
    {
      id: 3,
      course: "UI/UX Design avec Figma",
      date: "10 Janvier 2024",
      instructor: "Marie Leclerc",
    },
  ]


  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Mon Profil</h1>
        <p className="text-muted-foreground text-lg">Gérez vos informations et préférences</p>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-black border border-gray-800">
          <TabsTrigger 
            value="info"
            className="text-white data-[state=active]:bg-orange-500 data-[state=active]:text-black data-[state=active]:font-semibold"
          >
            Informations
          </TabsTrigger>
          <TabsTrigger 
            value="courses"
            className="text-white data-[state=active]:bg-orange-500 data-[state=active]:text-black data-[state=active]:font-semibold"
          >
            Mes Cours
          </TabsTrigger>
          <TabsTrigger 
            value="certificates"
            className="text-white data-[state=active]:bg-orange-500 data-[state=active]:text-black data-[state=active]:font-semibold"
          >
            Certificats
          </TabsTrigger>
          <TabsTrigger 
            value="preferences"
            className="text-white data-[state=active]:bg-orange-500 data-[state=active]:text-black data-[state=active]:font-semibold"
          >
            Préférences
          </TabsTrigger>
        </TabsList>

        {/* Informations Tab */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1 bg-white">
              <CardContent className="pt-6 text-center space-y-4">
                <Avatar className="h-32 w-32 mx-auto border-4 border-primary/10">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-3xl">{user.name[0]}</AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="text-2xl font-bold text-black">{user.name}</h2>
                  <p className="text-muted-foreground">{user.bio}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Membre depuis {user.joinedDate}</span>
                  </div>
                </div>

                <Button className="w-full">Modifier la Photo</Button>
              </CardContent>
            </Card>

            {/* Edit Form */}
            <Card className="lg:col-span-2 bg-white">
              <CardHeader>
                <CardTitle className="text-black">Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-black">Prénom</Label>
                    <Input id="firstName" defaultValue="Mody" className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-black">Nom</Label>
                    <Input id="lastName" defaultValue="Saidou Barry" className="bg-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} className="bg-white" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-black">Bio</Label>
                  <Input id="bio" defaultValue={user.bio} className="bg-white" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-black">Localisation</Label>
                    <Input id="location" defaultValue={user.location} className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-black">Téléphone</Label>
                    <Input id="phone" type="tel" placeholder="+223 XX XX XX XX" className="bg-white" />
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Button>Enregistrer les modifications</Button>
                  <Button variant="outline">Annuler</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Courses Tab */}
        <TabsContent value="courses">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black">Mes Cours ({enrolledCourses.length})</CardTitle>
                <Button variant="outline" size="sm">
                  Filtrer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-black">
                  <Award className="h-5 w-5 text-warning" />
                  Certificats ({certificates.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-black">{cert.course}</h4>
                        <p className="text-sm text-muted-foreground">Instructeur: {cert.instructor}</p>
                        <p className="text-xs text-muted-foreground">Obtenu le {cert.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                        <Button size="sm">Partager</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-black">Préférences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notifications */}
              <div className="space-y-4">
                <h3 className="font-semibold text-black">Notifications</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifs" className="text-black">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">Recevez des emails sur votre activité</p>
                  </div>
                  <Switch id="email-notifs" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="course-updates" className="text-black">Mises à jour de cours</Label>
                    <p className="text-sm text-muted-foreground">Nouveaux contenus et annonces</p>
                  </div>
                  <Switch id="course-updates" checked={courseUpdates} onCheckedChange={setCourseUpdates} />
                </div>

              </div>

              <Separator />

              {/* Language & Theme */}
              <div className="space-y-4">
                <h3 className="font-semibold text-black">Apparence</h3>

                <div className="space-y-2">
                  <Label className="text-black">Langue</Label>
                  <select className="w-full md:w-64 h-10 px-3 rounded-md border bg-white">
                    <option>Français</option>
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-black">Thème</Label>
                  <select className="w-full md:w-64 h-10 px-3 rounded-md border bg-white">
                    <option>Clair</option>
                    <option>Sombre</option>
                    <option>Automatique</option>
                  </select>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button>Enregistrer les préférences</Button>
                <Button variant="outline">Annuler</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </ProtectedRoute>
  )
}
