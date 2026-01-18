"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, MapPin, Calendar, Award, Download, UserPlus, LogOut } from "lucide-react"
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
import { useQuery } from "@tanstack/react-query"
import { apprenantService, cohorteService, profileService, certificateService, courseService } from "@/lib/api/services"
import { useAuthStore } from "@/lib/store/auth-store"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ApprenantCreateRequest, Cohorte, CertificateDto, Apprenant } from "@/lib/api/types"

export default function ProfilePage() {
  const router = useRouter()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [courseUpdates, setCourseUpdates] = useState(true)
  const { user, logout } = useAuthStore()

  // Charger les cohortes pour le formulaire
  const { data: cohortes = [] } = useQuery({
    queryKey: ["cohortes"],
    queryFn: () => cohorteService.getAllCohortes(),
    staleTime: 10 * 60 * 1000,
  })

  // État du formulaire apprenant
  const [apprenantForm, setApprenantForm] = useState<ApprenantCreateRequest>({
    username: "",
    numero: "",
    profession: "",
    niveauEtude: "",
    filiere: "",
    attentes: "",
    satisfaction: true,
    cohorteId: undefined,
    activate: true,
  })

  const [isCreatingApprenant, setIsCreatingApprenant] = useState(false)

  // Charger le profil complet depuis le backend
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => profileService.getMyProfile(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Charger les certificats depuis le backend
  const { data: certificates = [], isLoading: isLoadingCertificates } = useQuery({
    queryKey: ["certificates", user?.id],
    queryFn: () => certificateService.getMyCertificates(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Charger tous les cours pour mapper les noms aux objets Course
  const { data: allCourses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: () => courseService.getAllCourses(),
    staleTime: 10 * 60 * 1000,
  })

  // Mapper les noms de cours inscrits aux objets Course complets
  const enrolledCourses = profile?.enrolledCourses
    ? allCourses.filter(course => 
        profile.enrolledCourses.some(name => name === course.title)
      )
    : []

  const handleCreateApprenant = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation des champs requis
    if (!apprenantForm.username || !apprenantForm.username.trim()) {
      toast.error("Le nom complet est requis")
      return
    }
    
    if (!apprenantForm.numero || !apprenantForm.numero.trim()) {
      toast.error("Le numéro de téléphone est requis")
      return
    }
    
    setIsCreatingApprenant(true)

    try {
      // Préparer les données en nettoyant les chaînes vides
      const dataToSend: ApprenantCreateRequest = {
        username: apprenantForm.username.trim(),
        numero: apprenantForm.numero.trim(),
        profession: apprenantForm.profession?.trim() || undefined,
        niveauEtude: apprenantForm.niveauEtude || undefined,
        filiere: apprenantForm.filiere?.trim() || undefined,
        attentes: apprenantForm.attentes?.trim() || undefined,
        satisfaction: apprenantForm.satisfaction,
        cohorteId: apprenantForm.cohorteId,
        activate: apprenantForm.activate ?? true,
      }
      
      const response = await apprenantService.createApprenant(dataToSend)
      
      if (response.ok) {
        toast.success("Profil apprenant créé avec succès !")
        // Recharger les données utilisateur
        window.location.reload()
      } else {
        toast.error(response.message || "Erreur lors de la création du profil")
      }
    } catch (error) {
      toast.error("Erreur lors de la création du profil apprenant")
      console.error(error)
    } finally {
      setIsCreatingApprenant(false)
    }
  }

  // Récupérer les données de l'apprenant depuis l'utilisateur
  // Le backend retourne l'apprenant dans user.learner lors de la connexion
  const learner = (user as any)?.learner as Apprenant | undefined
  
  // Charger les données de l'apprenant si elles ne sont pas déjà présentes
  const { data: apprenantData } = useQuery({
    queryKey: ["apprenant", user?.id],
    queryFn: async () => {
      // Si l'utilisateur a un learner, on l'utilise directement
      if (learner) {
        return learner
      }
      // Sinon, on pourrait charger depuis l'API si nécessaire
      return null
    },
    enabled: !!user && !learner,
    staleTime: 10 * 60 * 1000,
  })
  
  // Utiliser les données de l'apprenant (depuis user.learner ou depuis la query)
  const finalLearner = learner || apprenantData

  // Fonction pour calculer la durée depuis la création du compte
  const calculateMemberSince = (createdAt?: string): string => {
    if (!createdAt) return "Non spécifié"
    
    try {
      const createdDate = new Date(createdAt)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - createdDate.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 30) {
        return `${diffDays} jour${diffDays > 1 ? 's' : ''}`
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return `${months} mois`
      } else {
        const years = Math.floor(diffDays / 365)
        const remainingMonths = Math.floor((diffDays % 365) / 30)
        if (remainingMonths > 0) {
          return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`
        }
        return `${years} an${years > 1 ? 's' : ''}`
      }
    } catch {
      return "Non spécifié"
    }
  }

  // Utiliser les données de l'utilisateur authentifié et du profil
  // Le backend retourne ApprenantWithUserDto avec username (pas nom/prenom séparés)
  const displayUser = {
    name: user?.name || profile?.fullName || finalLearner?.fullName || "Utilisateur",
    email: user?.email || profile?.email || finalLearner?.userEmail || "",
    location: finalLearner?.cohorteNom || "Non spécifié",
    joinedDate: calculateMemberSince((user as any)?.createdAt || finalLearner?.createdAt),
    bio: finalLearner?.profession || finalLearner?.attentes || (profile?.enrolledCourses?.length 
      ? `${profile.enrolledCourses.length} cours inscrits` 
      : "Non spécifié"),
    avatar: user?.avatar || profile?.avatar || finalLearner?.avatar || "/placeholder.svg",
    username: finalLearner?.username || user?.name || "",
    phone: finalLearner?.phone || finalLearner?.numero || (user as any)?.phone || "",
    profession: finalLearner?.profession || "",
    niveauEtude: finalLearner?.niveauEtude || "",
    filiere: finalLearner?.filiere || "",
    attentes: finalLearner?.attentes || "",
  }


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
          {!user?.enrolledCourses && (
            <TabsTrigger 
              value="apprenant"
              className="text-white data-[state=active]:bg-orange-500 data-[state=active]:text-black data-[state=active]:font-semibold"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Devenir Apprenant
            </TabsTrigger>
          )}
        </TabsList>

        {/* Informations Tab */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1 bg-white">
              <CardContent className="pt-6 text-center space-y-4">
                {isLoadingProfile ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-32 w-32 mx-auto bg-gray-200 rounded-full" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                  </div>
                ) : (
                  <>
                    <Avatar className="h-32 w-32 mx-auto border-4 border-primary/10">
                      <AvatarImage src={displayUser.avatar || "/placeholder.svg"} alt={displayUser.name} />
                      <AvatarFallback className="text-3xl">{displayUser.name[0]}</AvatarFallback>
                    </Avatar>

                    <div>
                      <h2 className="text-2xl font-bold text-black">{displayUser.name}</h2>
                      <p className="text-muted-foreground">
                        {displayUser.niveauEtude || displayUser.profession || displayUser.bio}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{displayUser.email}</span>
                      </div>
                      {displayUser.location !== "Non spécifié" && (
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{displayUser.location}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Membre depuis {displayUser.joinedDate}</span>
                      </div>
                    </div>
                  </>
                )}

                <Button className="w-full mb-2">Modifier la Photo</Button>
                <Button 
                  variant="outline" 
                  className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    logout()
                    router.push("/auth")
                    router.refresh()
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </CardContent>
            </Card>

            {/* Edit Form */}
            <Card className="lg:col-span-2 bg-white">
              <CardHeader>
                <CardTitle className="text-black">Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-black">Nom complet (Prénom Nom)</Label>
                  <Input 
                    id="username" 
                    defaultValue={displayUser.username} 
                    className="bg-white" 
                    placeholder="Ex: Amadou Diallo"
                  />
                  <p className="text-xs text-muted-foreground">
                    Entrez votre prénom suivi de votre nom
                  </p>
                </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue={displayUser.email} 
                  className="bg-white" 
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession" className="text-black">Profession</Label>
                <Input 
                  id="profession" 
                  defaultValue={displayUser.profession} 
                  className="bg-white" 
                  placeholder="Ex: Étudiant, Entrepreneur, Développeur..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="niveauEtude" className="text-black">Niveau d'étude</Label>
                  <Input 
                    id="niveauEtude" 
                    defaultValue={displayUser.niveauEtude} 
                    className="bg-white" 
                    placeholder="Ex: Licence, Master..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filiere" className="text-black">Filière</Label>
                  <Input 
                    id="filiere" 
                    defaultValue={displayUser.filiere} 
                    className="bg-white" 
                    placeholder="Ex: Informatique, Commerce..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attentes" className="text-black">Attentes</Label>
                <Textarea 
                  id="attentes" 
                  defaultValue={displayUser.attentes} 
                  className="bg-white" 
                  placeholder="Décrivez vos attentes concernant la formation..."
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cohorte" className="text-black">Cohorte</Label>
                  <Input 
                    id="cohorte" 
                    defaultValue={displayUser.location !== "Non spécifié" ? displayUser.location : ""} 
                    className="bg-white" 
                    placeholder="Votre cohorte"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-black">Téléphone</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    defaultValue={displayUser.phone} 
                    placeholder="+223 XX XX XX XX" 
                    className="bg-white" 
                  />
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
              {isLoadingProfile ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg" />
                  ))}
                </div>
              ) : enrolledCourses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Aucun cours inscrit pour le moment.</p>
                  <Button className="mt-4" onClick={() => window.location.href = "/courses"}>
                    Explorer les cours
                  </Button>
                </div>
              )}
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
              {isLoadingCertificates ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
                  ))}
                </div>
              ) : certificates.length > 0 ? (
                <div className="space-y-4">
                  {certificates.map((cert: CertificateDto) => (
                    <div key={cert.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors bg-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold text-black">{cert.course}</h4>
                          <p className="text-sm text-muted-foreground">Code: {cert.uniqueCode}</p>
                          <p className="text-xs text-muted-foreground">
                            Obtenu le {new Date(cert.issuedDate).toLocaleDateString("fr-FR", { 
                              day: "numeric", 
                              month: "long", 
                              year: "numeric" 
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Statut: <span className={cert.status === "Valide" ? "text-green-600" : "text-red-600"}>{cert.status}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(cert.certificateUrl, "_blank")}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun certificat obtenu pour le moment.</p>
                  <p className="text-sm mt-2">Complétez des cours et réussissez les quiz pour obtenir des certificats.</p>
                </div>
              )}
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

        {/* Devenir Apprenant Tab */}
        <TabsContent value="apprenant">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Créer votre profil Apprenant
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Complétez votre profil pour accéder à tous les cours et fonctionnalités d'apprentissage
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateApprenant} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-black">Nom complet (Prénom Nom) *</Label>
                  <Input
                    id="username"
                    value={apprenantForm.username}
                    onChange={(e) => setApprenantForm({ ...apprenantForm, username: e.target.value })}
                    className="bg-white"
                    placeholder="Ex: Amadou Diallo"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Entrez votre prénom suivi de votre nom
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero" className="text-black">Numéro de téléphone *</Label>
                  <Input
                    id="numero"
                    value={apprenantForm.numero}
                    onChange={(e) => setApprenantForm({ ...apprenantForm, numero: e.target.value })}
                    className="bg-white"
                    placeholder="+223 XX XX XX XX"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profession" className="text-black">Profession</Label>
                    <Input
                      id="profession"
                      value={apprenantForm.profession}
                      onChange={(e) => setApprenantForm({ ...apprenantForm, profession: e.target.value })}
                      className="bg-white"
                      placeholder="Ex: Étudiant, Développeur, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="niveauEtude" className="text-black">Niveau d'étude</Label>
                    <Select
                      value={apprenantForm.niveauEtude || ""}
                      onValueChange={(value) => setApprenantForm({ ...apprenantForm, niveauEtude: value })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Sélectionnez votre niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bac">Bac</SelectItem>
                        <SelectItem value="Bac+2">Bac+2</SelectItem>
                        <SelectItem value="Licence">Licence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filiere" className="text-black">Filière</Label>
                  <Input
                    id="filiere"
                    value={apprenantForm.filiere}
                    onChange={(e) => setApprenantForm({ ...apprenantForm, filiere: e.target.value })}
                    className="bg-white"
                    placeholder="Ex: Informatique, Commerce, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cohorteId" className="text-black">Cohorte</Label>
                  <Select
                    value={apprenantForm.cohorteId?.toString() || ""}
                    onValueChange={(value) => setApprenantForm({ ...apprenantForm, cohorteId: value ? Number(value) : undefined })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Sélectionnez une cohorte (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      {cohortes.map((cohorte) => (
                        <SelectItem key={cohorte.id} value={cohorte.id.toString()}>
                          {cohorte.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attentes" className="text-black">Attentes</Label>
                  <Textarea
                    id="attentes"
                    value={apprenantForm.attentes}
                    onChange={(e) => setApprenantForm({ ...apprenantForm, attentes: e.target.value })}
                    className="bg-white"
                    placeholder="Décrivez vos attentes concernant la formation..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="satisfaction"
                    checked={apprenantForm.satisfaction ?? true}
                    onCheckedChange={(checked) => setApprenantForm({ ...apprenantForm, satisfaction: checked })}
                  />
                  <Label htmlFor="satisfaction" className="text-black">
                    Je suis satisfait des conditions d'apprentissage
                  </Label>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Button type="submit" disabled={isCreatingApprenant} className="bg-primary">
                    {isCreatingApprenant ? "Création..." : "Créer mon profil Apprenant"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setApprenantForm({
                    username: "",
                    numero: "",
                    profession: "",
                    niveauEtude: "",
                    filiere: "",
                    attentes: "",
                    satisfaction: true,
                    cohorteId: undefined,
                    activate: true,
                  })}>
                    Réinitialiser
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </ProtectedRoute>
  )
}
