"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, ExternalLink, Loader2, Settings, List, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthStore } from "@/lib/store/auth-store"
import { rubriqueService, odcFormationService } from "@/lib/api/services"

export default function AdminSettingsPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [isRubriqueDialogOpen, setIsRubriqueDialogOpen] = useState(false)
  const [isOdcFormationDialogOpen, setIsOdcFormationDialogOpen] = useState(false)
  const [editingRubrique, setEditingRubrique] = useState<any>(null)
  const [editingOdcFormation, setEditingOdcFormation] = useState<any>(null)

  // Form states
  const [rubriqueForm, setRubriqueForm] = useState({
    rubrique: "",
    description: "",
    objectifs: "",
    publicCible: "",
    dureeFormat: "",
    lienRessources: "",
    formationsProposees: "",
  })

  const [odcFormationForm, setOdcFormationForm] = useState({
    titre: "",
    description: "",
    lien: "",
  })

  // Form state pour Configuration Générale
  const [generalConfigForm, setGeneralConfigForm] = useState({
    homepageText: "Commencez à prendre avec Orange Digital Learning ODL.",
    homepageImage: null as File | null,
  })

  // Charger les rubriques
  const { data: rubriques = [], isLoading: isLoadingRubriques } = useQuery({
    queryKey: ["rubriques"],
    queryFn: () => rubriqueService.getAllRubriques(),
    staleTime: 5 * 60 * 1000,
  })

  // Charger les formations ODC
  const { data: odcFormations = [], isLoading: isLoadingOdcFormations } = useQuery({
    queryKey: ["odcFormations"],
    queryFn: () => odcFormationService.getAllFormations(),
    staleTime: 5 * 60 * 1000,
  })

  // Mutation pour créer/mettre à jour une rubrique
  const rubriqueMutation = useMutation({
    mutationFn: async (data: any) => {
      // TODO: Implémenter la création/mise à jour de rubrique
      toast.info("Fonctionnalité de gestion des rubriques à implémenter")
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rubriques"] })
      setIsRubriqueDialogOpen(false)
      setEditingRubrique(null)
      setRubriqueForm({
        rubrique: "",
        description: "",
        objectifs: "",
        publicCible: "",
        dureeFormat: "",
        lienRessources: "",
        formationsProposees: "",
      })
    },
  })

  // Mutation pour créer une formation ODC
  const createOdcFormationMutation = useMutation({
    mutationFn: (data: { titre: string; description: string; lien: string }) =>
      odcFormationService.createFormation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["odcFormations"] })
      setIsOdcFormationDialogOpen(false)
      setOdcFormationForm({ titre: "", description: "", lien: "" })
      toast.success("Formation ODC créée avec succès")
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la création de la formation ODC", {
        description: error?.message || "Une erreur est survenue",
      })
    },
  })

  // Mutation pour mettre à jour une formation ODC
  const updateOdcFormationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { titre: string; description: string; lien: string } }) =>
      odcFormationService.updateFormation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["odcFormations"] })
      setIsOdcFormationDialogOpen(false)
      setEditingOdcFormation(null)
      setOdcFormationForm({ titre: "", description: "", lien: "" })
      toast.success("Formation ODC mise à jour avec succès")
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la mise à jour de la formation ODC", {
        description: error?.message || "Une erreur est survenue",
      })
    },
  })

  // Mutation pour supprimer une formation ODC
  const deleteOdcFormationMutation = useMutation({
    mutationFn: (id: number) => odcFormationService.deleteFormation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["odcFormations"] })
      toast.success("Formation ODC supprimée avec succès")
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression de la formation ODC", {
        description: error?.message || "Une erreur est survenue",
      })
    },
  })

  const handleEditRubrique = (rubrique: any) => {
    setEditingRubrique(rubrique)
    setRubriqueForm({
      rubrique: rubrique.rubrique || "",
      description: rubrique.description || "",
      objectifs: rubrique.objectifs || "",
      publicCible: rubrique.publicCible || "",
      dureeFormat: rubrique.dureeFormat || "",
      lienRessources: rubrique.lienRessources || "",
      formationsProposees: rubrique.formationsProposees || "",
    })
    setIsRubriqueDialogOpen(true)
  }

  const handleEditOdcFormation = (formation: any) => {
    setEditingOdcFormation(formation)
    setOdcFormationForm({
      titre: formation.titre || "",
      description: formation.description || "",
      lien: formation.lien || "",
    })
    setIsOdcFormationDialogOpen(true)
  }

  const handleDeleteOdcFormation = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette formation ODC ?")) {
      deleteOdcFormationMutation.mutate(id)
    }
  }

  const handleSubmitOdcFormation = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingOdcFormation) {
      updateOdcFormationMutation.mutate({
        id: editingOdcFormation.id,
        data: odcFormationForm,
      })
    } else {
      createOdcFormationMutation.mutate(odcFormationForm)
    }
  }

  // Vérifier si l'utilisateur est admin
  const isAdmin = (user as any)?.admin !== undefined

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Accès refusé. Cette page est réservée aux administrateurs.
              </p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Paramètres du Site</h1>
          <p className="text-muted-foreground text-lg">Gérez la configuration générale et les sections de contenu de la plateforme.</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap gap-2">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configuration Générale
            </TabsTrigger>
            <TabsTrigger
              value="sections"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              <List className="h-4 w-4 mr-2" />
              Gestion des Sections
            </TabsTrigger>
            <TabsTrigger
              value="odc-formations"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              ODC Formations
            </TabsTrigger>
          </TabsList>

          {/* Onglet Configuration Générale */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle>Configuration Générale du Site</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Mettez à jour les paramètres généraux et images de votre plateforme.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="homepageText">Texte de la Page d'Accueil</Label>
                  <Textarea
                    id="homepageText"
                    value={generalConfigForm.homepageText}
                    onChange={(e) => setGeneralConfigForm({ ...generalConfigForm, homepageText: e.target.value })}
                    placeholder="Texte de la page d'accueil"
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="homepageImage">Image de la Page d'Accueil</Label>
                  <div className="mt-2">
                    <Input
                      id="homepageImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setGeneralConfigForm({ ...generalConfigForm, homepageImage: file })
                        }
                      }}
                      className="cursor-pointer"
                    />
                    {generalConfigForm.homepageImage && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Fichier sélectionné : {generalConfigForm.homepageImage.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => {
                    // TODO: Implémenter la sauvegarde de la configuration générale
                    toast.info("Fonctionnalité de sauvegarde de la configuration générale à implémenter")
                  }}>
                    Enregistrer les modifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Gestion des Sections (Rubriques) */}
          <TabsContent value="sections" className="space-y-6">

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gestion des Rubriques</CardTitle>
                  <Dialog open={isRubriqueDialogOpen} onOpenChange={setIsRubriqueDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingRubrique(null)
                        setRubriqueForm({
                          rubrique: "",
                          description: "",
                          objectifs: "",
                          publicCible: "",
                          dureeFormat: "",
                          lienRessources: "",
                          formationsProposees: "",
                        })
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une rubrique
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingRubrique ? "Modifier la rubrique" : "Nouvelle rubrique"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="rubrique">Rubrique</Label>
                          <Input
                            id="rubrique"
                            value={rubriqueForm.rubrique}
                            onChange={(e) => setRubriqueForm({ ...rubriqueForm, rubrique: e.target.value })}
                            placeholder="Nom de la rubrique"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={rubriqueForm.description}
                            onChange={(e) => setRubriqueForm({ ...rubriqueForm, description: e.target.value })}
                            placeholder="Description de la rubrique"
                            rows={4}
                          />
                        </div>
                        {/* Autres champs de la rubrique */}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRubriqueDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={() => rubriqueMutation.mutate(rubriqueForm)}>
                          {editingRubrique ? "Modifier" : "Créer"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingRubriques ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : rubriques.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune rubrique trouvée</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rubrique</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rubriques.map((rubrique: any) => (
                        <TableRow key={rubrique.id}>
                          <TableCell className="font-medium">{rubrique.rubrique}</TableCell>
                          <TableCell className="max-w-md truncate">{rubrique.description}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditRubrique(rubrique)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet ODC Formations */}
          <TabsContent value="odc-formations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gestion des Formations ODC</CardTitle>
                  <Dialog open={isOdcFormationDialogOpen} onOpenChange={setIsOdcFormationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingOdcFormation(null)
                        setOdcFormationForm({ titre: "", description: "", lien: "" })
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une formation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingOdcFormation ? "Modifier la formation ODC" : "Nouvelle formation ODC"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmitOdcFormation} className="space-y-4">
                        <div>
                          <Label htmlFor="titre">Titre *</Label>
                          <Input
                            id="titre"
                            value={odcFormationForm.titre}
                            onChange={(e) => setOdcFormationForm({ ...odcFormationForm, titre: e.target.value })}
                            placeholder="Titre de la formation"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={odcFormationForm.description}
                            onChange={(e) => setOdcFormationForm({ ...odcFormationForm, description: e.target.value })}
                            placeholder="Description de la formation"
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lien">Lien *</Label>
                          <Input
                            id="lien"
                            type="url"
                            value={odcFormationForm.lien}
                            onChange={(e) => setOdcFormationForm({ ...odcFormationForm, lien: e.target.value })}
                            placeholder="https://..."
                            required
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsOdcFormationDialogOpen(false)
                              setEditingOdcFormation(null)
                              setOdcFormationForm({ titre: "", description: "", lien: "" })
                            }}
                          >
                            Annuler
                          </Button>
                          <Button
                            type="submit"
                            disabled={createOdcFormationMutation.isPending || updateOdcFormationMutation.isPending}
                          >
                            {(createOdcFormationMutation.isPending || updateOdcFormationMutation.isPending) ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {editingOdcFormation ? "Modification..." : "Création..."}
                              </>
                            ) : (
                              editingOdcFormation ? "Modifier" : "Créer"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingOdcFormations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : odcFormations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune formation ODC trouvée</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Lien</TableHead>
                        <TableHead>Créé par</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {odcFormations.map((formation: any) => (
                        <TableRow key={formation.id}>
                          <TableCell className="font-medium">{formation.titre}</TableCell>
                          <TableCell className="max-w-md truncate">{formation.description || "-"}</TableCell>
                          <TableCell>
                            <a
                              href={formation.lien}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              Lien
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TableCell>
                          <TableCell>{formation.adminName || formation.adminEmail || "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditOdcFormation(formation)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteOdcFormation(formation.id)}
                                disabled={deleteOdcFormationMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
