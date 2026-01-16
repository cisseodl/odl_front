"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, User, Eye, EyeOff, Phone, GraduationCap, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/lib/store/auth-store"
import { apprenantService } from "@/lib/api/services"
import { toast } from "sonner"
import type { ApprenantCreateRequest } from "@/lib/api/types"

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [createApprenant, setCreateApprenant] = useState(true) // Option pour créer un profil apprenant
  const { login, register } = useAuthStore()

  // Note: Les cohortes nécessitent une authentification, donc on ne les charge pas dans le formulaire d'inscription
  // L'utilisateur pourra compléter sa cohorte après l'inscription dans son profil
  const cohortes: Array<{ id: number; nom: string }> = [] // Vide car nécessite authentification

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      await login(email, password)
      toast.success("Connexion réussie !", {
        description: "Bienvenue sur Orange Digital Learning",
      })
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast.error("Erreur de connexion", {
        description: error instanceof Error ? error.message : "Veuillez vérifier vos identifiants",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    try {
      // 1. Créer l'utilisateur
      await register(name, email, password)
      
      // 2. Si l'option est activée, créer le profil Apprenant
      if (createApprenant) {
        const numero = formData.get("numero") as string
        const profession = formData.get("profession") as string
        const niveauEtude = formData.get("niveauEtude") as string
        const filiere = formData.get("filiere") as string
        const attentes = formData.get("attentes") as string
        const cohorteId = formData.get("cohorteId") as string
        const satisfaction = formData.get("satisfaction") === "true"

        // Utiliser le "name" du User comme "username" pour l'apprenant
        if (name && numero) {
          const apprenantData: ApprenantCreateRequest = {
            username: name.trim(), // Utiliser le nom complet du User
            numero: numero.trim(),
            profession: profession?.trim() || undefined,
            niveauEtude: niveauEtude || undefined,
            filiere: filiere?.trim() || undefined,
            attentes: attentes?.trim() || undefined,
            satisfaction: satisfaction,
            cohorteId: cohorteId ? Number.parseInt(cohorteId) : undefined,
            activate: true,
          }

          const apprenantResponse = await apprenantService.createApprenant(apprenantData)
          
          if (!apprenantResponse.ok) {
            toast.warning("Compte créé mais erreur lors de la création du profil apprenant", {
              description: "Vous pourrez compléter votre profil plus tard",
            })
          }
        }
      }

      toast.success("Inscription réussie !", {
        description: "Bienvenue sur Orange Digital Learning",
      })
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast.error("Erreur d'inscription", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-white to-muted/30 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Orange Digital Learning</CardTitle>
          <CardDescription>
            Connectez-vous ou créez un compte pour accéder à tous nos cours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/95" disabled={isLoading}>
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Informations de base pour créer le User */}
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nom complet *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      name="name"
                      type="text"
                      placeholder="Votre nom complet"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-10"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Séparateur */}
                <div className="py-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Informations Apprenant (optionnel)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informations pour créer le profil Apprenant */}
                <p className="text-sm text-muted-foreground">
                  Le nom complet que vous avez saisi ci-dessus sera utilisé pour votre profil apprenant.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="register-numero">Numéro de téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-numero"
                      name="numero"
                      type="tel"
                      placeholder="+223 XX XX XX XX"
                      className="pl-10 bg-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-profession">Profession</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-profession"
                        name="profession"
                        type="text"
                        placeholder="Ex: Étudiant, Développeur"
                        className="pl-10 bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-niveauEtude">Niveau d'étude</Label>
                    <Select name="niveauEtude">
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Sélectionnez votre niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bac">Bac</SelectItem>
                        <SelectItem value="Bac+2">Bac+2</SelectItem>
                        <SelectItem value="Licence">Licence</SelectItem>
                        <SelectItem value="Master">Master</SelectItem>
                        <SelectItem value="Doctorat">Doctorat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-filiere">Filière</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-filiere"
                      name="filiere"
                      type="text"
                      placeholder="Ex: Informatique, Commerce"
                      className="pl-10 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-cohorteId">Cohorte</Label>
                  <Input
                    id="register-cohorteId"
                    name="cohorteId"
                    type="number"
                    placeholder="ID de la cohorte (optionnel - peut être complété plus tard)"
                    className="bg-white"
                  />
                  <p className="text-xs text-muted-foreground">
                    Vous pouvez laisser ce champ vide et compléter votre profil apprenant après l'inscription dans votre profil.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-attentes">Attentes</Label>
                  <Textarea
                    id="register-attentes"
                    name="attentes"
                    placeholder="Décrivez vos attentes concernant la formation..."
                    className="bg-white"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="register-satisfaction"
                    name="satisfaction"
                    value="true"
                    defaultChecked
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="register-satisfaction" className="text-sm">
                    Je suis satisfait des conditions d'apprentissage
                  </Label>
                </div>

                <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/95" disabled={isLoading}>
                  {isLoading ? "Inscription..." : "S'inscrire"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  * Champs obligatoires. Les informations apprenant peuvent être complétées plus tard.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}



