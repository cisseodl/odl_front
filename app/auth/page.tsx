"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, User, Eye, EyeOff, Phone, GraduationCap, Briefcase, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuthStore } from "@/lib/store/auth-store"
import { apprenantService, cohorteService } from "@/lib/api/services"
import { toast } from "sonner"
import type { ApprenantCreateRequest } from "@/lib/api/types"
import { useQuery } from "@tanstack/react-query"
import { RegistrationResultDialog } from "@/components/registration-result-dialog"

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [apprenantType, setApprenantType] = useState<"new" | "existing">("new") // Type d'apprenant : nouveau ou ancien
  const { login, register } = useAuthStore()
  
  // État pour le dialogue de résultat d'inscription
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [resultDialogType, setResultDialogType] = useState<"success" | "error" | "warning">("success")
  const [resultDialogTitle, setResultDialogTitle] = useState("")
  const [resultDialogDescription, setResultDialogDescription] = useState("")

  // État pour le dialogue d'erreur de connexion
  const [showLoginErrorDialog, setShowLoginErrorDialog] = useState(false)
  const [loginErrorTitle, setLoginErrorTitle] = useState("")
  const [loginErrorDescription, setLoginErrorDescription] = useState("")

  // Charger les cohortes pour le formulaire (nécessite authentification, mais on peut les charger publiquement si l'endpoint le permet)
  const { data: cohortes = [] } = useQuery({
    queryKey: ["cohortes"],
    queryFn: () => cohorteService.getAllCohortes(),
    staleTime: 10 * 60 * 1000,
    retry: false, // Ne pas réessayer si ça échoue (peut nécessiter auth)
  })

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      console.log("⚡️ [AUTH PAGE] Appel de la fonction login du store..."); // Nouveau log
      await login(email, password)
      toast.success("Connexion réussie !", {
        description: "Bienvenue sur Orange Digital Learning",
      })
      router.push("/")
      router.refresh()
    } catch (error) {
      // Afficher le dialog d'erreur au lieu du toast
      const errorMessage = error instanceof Error ? error.message : "Veuillez vérifier vos identifiants"
      
      // Déterminer le message d'erreur spécifique
      let errorTitle = "Erreur de connexion"
      let errorDescription = errorMessage
      
      // Messages d'erreur plus spécifiques selon le type d'erreur
      if (errorMessage.toLowerCase().includes("bad credentials") || 
          errorMessage.toLowerCase().includes("invalid") ||
          errorMessage.toLowerCase().includes("incorrect")) {
        errorTitle = "Identifiants incorrects"
        errorDescription = "L'email ou le mot de passe que vous avez saisi est incorrect. Veuillez vérifier vos identifiants et réessayer."
      } else if (errorMessage.toLowerCase().includes("not found") ||
                 errorMessage.toLowerCase().includes("utilisateur")) {
        errorTitle = "Compte introuvable"
        errorDescription = "Aucun compte n'est associé à cet email. Veuillez vérifier votre adresse email ou créer un nouveau compte."
      } else if (errorMessage.toLowerCase().includes("disabled") ||
                 errorMessage.toLowerCase().includes("désactivé")) {
        errorTitle = "Compte désactivé"
        errorDescription = "Votre compte a été désactivé. Veuillez contacter le support pour plus d'informations."
      } else if (errorMessage.toLowerCase().includes("network") ||
                 errorMessage.toLowerCase().includes("timeout") ||
                 errorMessage.toLowerCase().includes("fetch")) {
        errorTitle = "Erreur de connexion"
        errorDescription = "Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez."
      } else {
        errorTitle = "Erreur de connexion"
        errorDescription = errorMessage || "Une erreur est survenue lors de la connexion. Veuillez réessayer."
      }
      
      setLoginErrorTitle(errorTitle)
      setLoginErrorDescription(errorDescription)
      setShowLoginErrorDialog(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Handler pour nouveau apprenant (formulaire complet)
  const handleRegisterNew = async (e: React.FormEvent<HTMLFormElement>) => {
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
      
          // 2. Créer le profil Apprenant avec toutes les informations (sans cohorte pour nouveau apprenant)
      const numero = formData.get("numero") as string
      const profession = formData.get("profession") as string
      const niveauEtude = formData.get("niveauEtude") as string
      const filiere = formData.get("filiere") as string
      const attentes = formData.get("attentes") as string
      const conditionsAccepted = formData.get("conditionsAccepted") === "true" || formData.get("satisfaction") === "true" // Compatibilité avec l'ancien nom

      // Utiliser le "name" du User comme "username" pour l'apprenant
      // Note: cohorteId n'est pas inclus pour les nouveaux apprenants
      if (name && numero) {
        const apprenantData: ApprenantCreateRequest = {
          username: name.trim(), // Utiliser le nom complet du User
          numero: numero.trim(),
          profession: profession?.trim() || undefined,
          niveauEtude: niveauEtude || undefined,
          filiere: filiere?.trim() || undefined,
          attentes: attentes?.trim() || undefined,
          conditionsAccepted: conditionsAccepted,
          satisfaction: conditionsAccepted, // Compatibilité avec l'ancien nom
          // cohorteId n'est pas inclus pour les nouveaux apprenants
          activate: true,
        }

        const apprenantResponse = await apprenantService.createApprenant(apprenantData)
        
        if (!apprenantResponse.ok) {
          setResultDialogType("warning")
          setResultDialogTitle("Inscription partielle")
          setResultDialogDescription("Votre compte a été créé avec succès, mais une erreur est survenue lors de la création de votre profil apprenant. Vous pourrez compléter votre profil plus tard depuis votre espace personnel.")
          setShowResultDialog(true)
          setIsLoading(false)
          return
        }
      }

      // Succès complet
      setResultDialogType("success")
      setResultDialogTitle("Inscription réussie !")
      setResultDialogDescription("Bienvenue sur Orange Digital Learning ! Votre compte apprenant a été créé avec succès. Un email de bienvenue vous a été envoyé. Vous pouvez maintenant accéder à tous nos cours et commencer votre parcours d'apprentissage.")
      setShowResultDialog(true)
    } catch (error) {
      // Erreur
      setResultDialogType("error")
      setResultDialogTitle("Erreur d'inscription")
      setResultDialogDescription(error instanceof Error ? error.message : "Une erreur est survenue lors de votre inscription. Veuillez réessayer ou contacter le support si le problème persiste.")
      setShowResultDialog(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Handler pour étudiant des cohortes passées (formulaire complet avec cohorte obligatoire)
  const handleRegisterExisting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const cohorteId = formData.get("cohorteId") as string

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    if (!cohorteId) {
      toast.error("Veuillez sélectionner une cohorte")
      setIsLoading(false)
      return
    }

    try {
      // 1. Créer l'utilisateur
      await register(name, email, password)
      
      // 2. Créer le profil Apprenant avec toutes les informations (cohorte obligatoire pour étudiant des cohortes passées)
      const numero = formData.get("numero") as string
      const profession = formData.get("profession") as string
      const niveauEtude = formData.get("niveauEtude") as string
      const filiere = formData.get("filiere") as string
      const attentes = formData.get("attentes") as string
      const conditionsAccepted = formData.get("conditionsAccepted") === "true" || formData.get("satisfaction") === "true" // Compatibilité avec l'ancien nom

      // Utiliser le "name" du User comme "username" pour l'apprenant
      if (name && numero) {
        const apprenantData: ApprenantCreateRequest = {
          username: name.trim(), // Utiliser le nom complet du User
          numero: numero.trim(),
          profession: profession?.trim() || undefined,
          niveauEtude: niveauEtude || undefined,
          filiere: filiere?.trim() || undefined,
          attentes: attentes?.trim() || undefined,
          conditionsAccepted: conditionsAccepted,
          satisfaction: conditionsAccepted, // Compatibilité avec l'ancien nom
          cohorteId: Number.parseInt(cohorteId), // Cohorte obligatoire pour étudiant des cohortes passées
          activate: true,
        }

        const apprenantResponse = await apprenantService.createApprenant(apprenantData)
        
        if (!apprenantResponse.ok) {
          setResultDialogType("warning")
          setResultDialogTitle("Inscription partielle")
          setResultDialogDescription("Votre compte a été créé avec succès, mais une erreur est survenue lors de la création de votre profil apprenant. Vous pourrez compléter votre profil plus tard depuis votre espace personnel.")
          setShowResultDialog(true)
          setIsLoading(false)
          return
        }
      }

      // Succès complet
      setResultDialogType("success")
      setResultDialogTitle("Inscription réussie !")
      setResultDialogDescription("Bienvenue sur Orange Digital Learning ! Votre compte apprenant a été créé avec succès. Un email de bienvenue vous a été envoyé. Vous pouvez maintenant accéder à tous nos cours et commencer votre parcours d'apprentissage.")
      setShowResultDialog(true)
    } catch (error) {
      // Erreur
      setResultDialogType("error")
      setResultDialogTitle("Erreur d'inscription")
      setResultDialogDescription(error instanceof Error ? error.message : "Une erreur est survenue lors de votre inscription. Veuillez réessayer ou contacter le support si le problème persiste.")
      setShowResultDialog(true)
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
                      autoComplete="username"
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
                      autoComplete="current-password"
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
              {/* Sélecteur de type d'apprenant */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Type d'apprenant</Label>
                <RadioGroup value={apprenantType} onValueChange={(value) => setApprenantType(value as "new" | "existing")} className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-accent" onClick={() => setApprenantType("new")}>
                    <RadioGroupItem value="new" id="new-apprenant" />
                    <Label htmlFor="new-apprenant" className="cursor-pointer flex-1">
                      <div className="font-medium">Nouveau apprenant</div>
                      <div className="text-xs text-muted-foreground">Première inscription</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-accent" onClick={() => setApprenantType("existing")}>
                    <RadioGroupItem value="existing" id="existing-apprenant" />
                    <Label htmlFor="existing-apprenant" className="cursor-pointer flex-1">
                      <div className="font-medium">Étudiant des cohortes passées</div>
                      <div className="text-xs text-muted-foreground">Déjà inscrit</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Formulaire pour nouveau apprenant */}
              {apprenantType === "new" && (
                <form onSubmit={handleRegisterNew} className="space-y-4">
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
                      autoComplete="new-password"
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
                      autoComplete="new-password"
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
                      required
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
                    id="register-conditionsAccepted"
                    name="conditionsAccepted"
                    value="true"
                    defaultChecked
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="register-conditionsAccepted" className="text-sm">
                    J'accepte les conditions
                  </Label>
                </div>

                  <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/95" disabled={isLoading}>
                    {isLoading ? "Inscription..." : "S'inscrire"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    * Champs obligatoires. Les informations apprenant peuvent être complétées plus tard.
                  </p>
                </form>
              )}

              {/* Formulaire pour étudiant des cohortes passées */}
              {apprenantType === "existing" && (
                <form onSubmit={handleRegisterExisting} className="space-y-4">
                {/* Informations de base pour créer le User */}
                <div className="space-y-2">
                  <Label htmlFor="existing-name">Nom complet *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="existing-name"
                      name="name"
                      type="text"
                      placeholder="Votre nom complet"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="existing-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="existing-email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="existing-password">Mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="existing-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      autoComplete="new-password"
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
                  <Label htmlFor="existing-confirm-password">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="existing-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      autoComplete="new-password"
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
                  <Label htmlFor="existing-numero">Numéro de téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="existing-numero"
                      name="numero"
                      type="tel"
                      placeholder="+223 XX XX XX XX"
                      className="pl-10 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="existing-profession">Profession</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="existing-profession"
                        name="profession"
                        type="text"
                        placeholder="Ex: Étudiant, Développeur"
                        className="pl-10 bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="existing-niveauEtude">Niveau d'étude</Label>
                    <Select name="niveauEtude">
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
                  <Label htmlFor="existing-filiere">Filière</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="existing-filiere"
                      name="filiere"
                      type="text"
                      placeholder="Ex: Informatique, Commerce"
                      className="pl-10 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existing-cohorteId">Cohorte *</Label>
                  <Select name="cohorteId" required>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Sélectionnez votre cohorte" />
                    </SelectTrigger>
                    <SelectContent>
                      {cohortes.length > 0 ? (
                        cohortes.map((cohorte) => (
                          <SelectItem key={cohorte.id} value={cohorte.id.toString()}>
                            {cohorte.nom}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Aucune cohorte disponible
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Sélectionnez la cohorte à laquelle vous appartenez
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existing-attentes">Attentes</Label>
                  <Textarea
                    id="existing-attentes"
                    name="attentes"
                    placeholder="Décrivez vos attentes concernant la formation..."
                    className="bg-white"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="existing-conditionsAccepted"
                    name="conditionsAccepted"
                    value="true"
                    defaultChecked
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="existing-conditionsAccepted" className="text-sm">
                    J'accepte les conditions
                  </Label>
                </div>

                  <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/95" disabled={isLoading}>
                    {isLoading ? "Inscription..." : "S'inscrire"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    * Champs obligatoires. Les informations apprenant peuvent être complétées plus tard.
                  </p>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogue de résultat d'inscription */}
      <RegistrationResultDialog
        open={showResultDialog}
        onOpenChange={setShowResultDialog}
        type={resultDialogType}
        title={resultDialogTitle}
        description={resultDialogDescription}
        onContinue={() => {
          setShowResultDialog(false)
          if (resultDialogType === "success") {
            router.push("/dashboard")
            router.refresh()
          }
        }}
      />

      {/* Dialogue d'erreur de connexion */}
      <RegistrationResultDialog
        open={showLoginErrorDialog}
        onOpenChange={setShowLoginErrorDialog}
        type="error"
        title={loginErrorTitle}
        description={loginErrorDescription}
        onContinue={() => {
          setShowLoginErrorDialog(false)
        }}
      />
    </div>
  )
}



