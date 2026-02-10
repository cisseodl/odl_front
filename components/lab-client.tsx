"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Code2, FileUp, PlayCircle, Send, Trophy, ArrowLeft, Loader2, Type } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { labService, uploadFile } from "@/lib/api/services"

interface LabClientProps {
  courseId: string
  labId: string
}

export function LabClient({ courseId, labId }: LabClientProps) {
  const labIdNum = typeof labId === "string" ? parseInt(labId, 10) : labId
  const { data: lab, isLoading, error } = useQuery({
    queryKey: ["lab", labIdNum],
    queryFn: () => labService.getLabById(labIdNum),
    enabled: !Number.isNaN(labIdNum),
  })

  const [code, setCode] = useState("")
  const [checklist, setChecklist] = useState<boolean[]>([])
  const [reportMode, setReportMode] = useState<"file" | "text">("file")
  const [reportFile, setReportFile] = useState<File | null>(null)
  const [reportText, setReportText] = useState("")
  const queryClient = useQueryClient()

  const submitReportMutation = useMutation({
    mutationFn: async () => {
      let reportUrl: string
      if (reportMode === "file" && reportFile) {
        const url = await uploadFile(reportFile, "lab-reports")
        if (!url) throw new Error("Échec de l'upload du fichier")
        reportUrl = url
      } else if (reportMode === "text" && reportText.trim()) {
        const blob = new Blob([reportText.trim()], { type: "text/plain;charset=utf-8" })
        const file = new File([blob], "rapport-lab.txt", { type: "text/plain" })
        const url = await uploadFile(file, "lab-reports")
        if (!url) throw new Error("Échec de l'upload du rapport")
        reportUrl = url
      } else {
        throw new Error("Choisissez un fichier ou saisissez votre rapport")
      }
      const res = await labService.submitLabReport(labIdNum, reportUrl)
      if (!res.ok) throw new Error(res.message || "Erreur lors de la soumission")
    },
    onSuccess: () => {
      toast.success("Votre rapport de lab a été soumis avec succès.")
      setReportFile(null)
      setReportText("")
      queryClient.invalidateQueries({ queryKey: ["lab", labIdNum] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors de la soumission")
    },
  })

  const canSubmitReport =
    (reportMode === "file" && reportFile) || (reportMode === "text" && reportText.trim().length > 0)

  const handleSubmitReport = () => {
    if (!canSubmitReport) {
      toast.error("Déposez un fichier ou rédigez votre rapport.")
      return
    }
    submitReportMutation.mutate()
  }

  useEffect(() => {
    if (lab?.objectives?.length) setChecklist(lab.objectives.map(() => false))
    else if (lab) setChecklist([false])
  }, [lab?.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement du lab...</span>
      </div>
    )
  }

  if (error || !lab) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container flex items-center justify-between py-4">
            <Link href={`/learn/${courseId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au cours
              </Button>
            </Link>
          </div>
        </div>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground mb-4">Lab non trouvé.</p>
          <Link href={`/learn/${courseId}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au cours
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const objectives = lab.objectives?.length ? lab.objectives : ["Compléter les instructions du lab"]
  const checklistState = checklist.length === objectives.length ? checklist : objectives.map(() => false)

  const handleCheckSolution = () => {
    const allCompleted = checklistState.every((item) => item)
    if (allCompleted) {
      toast.success("Félicitations ! Vous avez complété le lab")
    } else {
      toast.info("Continuez ! Vérifiez tous les objectifs")
    }
  }

  const toggleObjective = (index: number) => {
    const next = [...checklistState]
    next[index] = !next[index]
    setChecklist(next)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href={`/learn/${courseId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au cours
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{lab.title}</h1>
              <p className="text-muted-foreground">{lab.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              <Trophy className="mr-1 inline-block h-4 w-4" />
              {lab.difficulty === "easy" && "Facile"}
              {lab.difficulty === "medium" && "Moyen"}
              {lab.difficulty === "hard" && "Difficile"}
            </span>
            <span className="text-sm text-muted-foreground">{lab.estimatedTime}</span>
          </div>
        </div>
      </div>

      <div className="container grid gap-6 py-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Instructions</h2>
            <ScrollArea className="h-[400px] pr-4">
              {lab.instructions ? (
                <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                  {lab.instructions}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">Aucune instruction pour ce lab.</p>
              )}
            </ScrollArea>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Checklist des objectifs</h2>
            <div className="space-y-3">
              {objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleObjective(index)}
                    className={`h-5 w-5 shrink-0 rounded border-2 transition-colors flex items-center justify-center ${
                      checklistState[index] ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                    }`}
                  >
                    {checklistState[index] && <CheckCircle2 className="h-3 w-3" />}
                  </button>
                  <span className={checklistState[index] ? "line-through opacity-60" : ""}>{objective}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <Tabs defaultValue="editor" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="editor">
                  <Code2 className="mr-2 h-4 w-4" />
                  Éditeur
                </TabsTrigger>
                <TabsTrigger value="solution">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Solution
                </TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="space-y-4">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="Écrivez votre code ici..."
                />
                <Button onClick={handleCheckSolution} className="w-full">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Vérifier ma solution
                </Button>
              </TabsContent>
              <TabsContent value="solution">
                <ScrollArea className="h-[500px]">
                  <pre className="rounded-lg bg-muted p-4">
                    <code className="text-sm">{lab.solution || "Aucune solution fournie."}</code>
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Carte Ma réalisation : fichier ou texte selon les instructions de l'instructeur */}
          <Card className="p-6">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="h-5 w-5" />
                Ma réalisation
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Déposez un fichier (document, image) ou rédigez votre rapport en texte, selon les consignes de l'instructeur.
              </p>
            </CardHeader>
            <CardContent>
              <Tabs value={reportMode} onValueChange={(v) => setReportMode(v as "file" | "text")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file" className="flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    Fichier / Document / Image
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Texte
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="file" className="mt-4 space-y-4">
                  <label className="block text-sm font-medium">Déposer votre rapport</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt"
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground"
                    onChange={(e) => setReportFile(e.target.files?.[0] ?? null)}
                  />
                  {reportFile && (
                    <p className="text-sm text-muted-foreground">
                      Fichier sélectionné : {reportFile.name}
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="text" className="mt-4 space-y-4">
                  <label className="block text-sm font-medium">Votre rapport (texte)</label>
                  <Textarea
                    placeholder="Saisissez votre rapport ici..."
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    rows={8}
                    className="resize-y"
                  />
                </TabsContent>
              </Tabs>
              <Button
                className="mt-4 w-full"
                disabled={!canSubmitReport || submitReportMutation.isPending}
                onClick={handleSubmitReport}
              >
                {submitReportMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Soumettre mon rapport
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
