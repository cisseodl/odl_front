"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ClipboardList, FileUp, Loader2, Send, Type } from "lucide-react"
import { evaluationService, uploadFile } from "@/lib/api/services"
import { ProtectedRoute } from "@/components/protected-route"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface EvaluationPageProps {
  params: Promise<{ courseId: string; evaluationId: string }>
}

export default function EvaluationPage({ params }: EvaluationPageProps) {
  const { courseId, evaluationId } = use(params)
  const courseIdNum = parseInt(courseId, 10)
  const evaluationIdNum = parseInt(evaluationId, 10)

  const { data: evaluations, isLoading } = useQuery({
    queryKey: ["evaluationsByCourse", courseIdNum],
    queryFn: () => evaluationService.getEvaluationsByCourse(courseIdNum),
    enabled: !Number.isNaN(courseIdNum),
  })

  const td = evaluations?.find(
    (e: any) =>
      (Number(e.id) === evaluationIdNum || String(e.id) === evaluationId) &&
      (e.type === "TP" || e.type === "tp" || e.evaluationType === "TP")
  )

  const [submissionMode, setSubmissionMode] = useState<"file" | "text">("file")
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [submissionText, setSubmissionText] = useState("")
  const queryClient = useQueryClient()

  const submitTPMutation = useMutation({
    mutationFn: async () => {
      let submittedFileUrl: string | undefined
      if (submissionMode === "file" && submissionFile) {
        const url = await uploadFile(submissionFile, "td-submissions")
        if (!url) throw new Error("Échec de l'upload du fichier")
        submittedFileUrl = url
      }
      const res = await evaluationService.submitTP(evaluationIdNum, {
        submittedFileUrl,
        submittedText: submissionMode === "text" && submissionText.trim() ? submissionText.trim() : undefined,
      })
      if (!res.ok) throw new Error(res.message || "Erreur lors de la soumission")
      return res
    },
    onSuccess: () => {
      toast.success("Votre travail a été soumis avec succès.")
      setSubmissionFile(null)
      setSubmissionText("")
      queryClient.invalidateQueries({ queryKey: ["evaluationsByCourse", courseIdNum] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors de la soumission")
    },
  })

  const canSubmit =
    (submissionMode === "file" && submissionFile) || (submissionMode === "text" && submissionText.trim().length > 0)

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Chargement...</span>
        </div>
      </ProtectedRoute>
    )
  }

  if (!td) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <div className="container py-12 text-center">
            <p className="text-muted-foreground mb-4">Travail dirigé non trouvé.</p>
            <Link href={`/learn/${courseId}`}>
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au cours
              </Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
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
        <div className="container max-w-6xl py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Carte 1 : Instructions et document du TD */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  {td.title || "Travail dirigé"}
                </CardTitle>
                {td.description && (
                  <p className="text-sm text-muted-foreground mt-1">{td.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {td.tpInstructions ? (
                  <ScrollArea className="h-[40vh] pr-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                      {td.tpInstructions}
                    </div>
                  </ScrollArea>
                ) : null}
                {td.tpFileUrl && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Document du TD</h3>
                    <div className="border rounded-lg overflow-hidden bg-muted/30">
                      <iframe
                        src={`${td.tpFileUrl.startsWith("http") ? td.tpFileUrl : `${process.env.NEXT_PUBLIC_API_FRONT || "https://api.smart-odc.com"}/awsodclearning${td.tpFileUrl.startsWith("/") ? td.tpFileUrl : `/${td.tpFileUrl}`}`}#toolbar=0`}
                        title="Document TD"
                        className="w-full h-[70vh] min-h-[500px] border-0"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
                {!td.tpInstructions && !td.tpFileUrl && (
                  <p className="text-muted-foreground">Aucun contenu pour ce TD.</p>
                )}
              </CardContent>
            </Card>

            {/* Carte 2 : Ma réalisation — fichier ou texte selon les instructions de l'instructeur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Ma réalisation
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choisissez de déposer un fichier (document, image) ou de rédiger votre réponse en texte, selon les consignes de l'instructeur.
                </p>
              </CardHeader>
              <CardContent>
                <Tabs value={submissionMode} onValueChange={(v) => setSubmissionMode(v as "file" | "text")}>
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
                    <label className="block text-sm font-medium">Déposer votre fichier</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt"
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground"
                      onChange={(e) => setSubmissionFile(e.target.files?.[0] ?? null)}
                    />
                    {submissionFile && (
                      <p className="text-sm text-muted-foreground">
                        Fichier sélectionné : {submissionFile.name}
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="text" className="mt-4 space-y-4">
                    <label className="block text-sm font-medium">Votre réponse (texte)</label>
                    <Textarea
                      placeholder="Saisissez votre réponse ici..."
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      rows={10}
                      className="resize-y"
                    />
                  </TabsContent>
                </Tabs>
                <Button
                  className="mt-4 w-full"
                  disabled={!canSubmit || submitTPMutation.isPending}
                  onClick={() => submitTPMutation.mutate()}
                >
                  {submitTPMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Soumettre mon travail
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
