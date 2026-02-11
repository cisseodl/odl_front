"use client"

import { use, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, CheckCircle2, XCircle, Award, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ProtectedRoute } from "@/components/protected-route"
import { useQuery } from "@tanstack/react-query"
import { evaluationService, certificateService } from "@/lib/api/services"
import { toast } from "sonner"
import Link from "next/link"
import { serializeData } from "@/lib/utils/serialize"

interface ExamResultsPageProps {
  params: Promise<{ courseId: string; examId: string }>
}

export default function ExamResultsPage({ params }: ExamResultsPageProps) {
  const { courseId, examId } = use(params)
  const router = useRouter()
  const examIdNum = Number.parseInt(examId)
  const searchParams = useSearchParams()
  const attemptIdFromUrl = searchParams?.get("attemptId")
  const attemptId = attemptIdFromUrl ? Number.parseInt(attemptIdFromUrl) : examIdNum

  const [certificateDisplayName, setCertificateDisplayName] = useState<string>("")
  useEffect(() => {
    if (typeof window === "undefined" || Number.isNaN(attemptId)) return
    try {
      const raw = sessionStorage.getItem(`exam-certificate-${attemptId}`)
      if (raw) {
        const { name } = JSON.parse(raw)
        setCertificateDisplayName(name || "")
      }
    } catch (_) {}
  }, [attemptId])

  // Récupérer les résultats de l'examen
  const {
    data: attempt,
    isLoading: isLoadingResults,
    error: resultsError,
  } = useQuery({
    queryKey: ["examResults", attemptId],
    queryFn: async () => {
      const response = await evaluationService.getExamResults(attemptId)
      if (response.ok && response.data) {
        // Sérialiser les données pour éviter les erreurs React #185
        return serializeData(response.data)
      }
      throw new Error(response.message || "Résultats non disponibles")
    },
    enabled: !Number.isNaN(attemptId),
  })

  // Récupérer les certificats de l'utilisateur
  const {
    data: certificates = [],
  } = useQuery({
    queryKey: ["certificates"],
    queryFn: () => certificateService.getMyCertificates(),
  })

  const score = attempt?.score || 0
  const isPassed = score >= 70
  const certificate = certificates.find((cert: any) => cert.courseId === Number.parseInt(courseId))

  if (Number.isNaN(examIdNum)) {
    return <div>Paramètres invalides</div>
  }

  if (isLoadingResults) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement des résultats...</span>
      </div>
    )
  }

  if (resultsError || !attempt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <XCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Résultats non disponibles</h2>
        <p className="text-muted-foreground">
          {resultsError?.message || "Vous devez d'abord soumettre votre satisfaction pour voir les résultats."}
        </p>
        <Button onClick={() => router.push(`/learn/${courseId}`)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour au cours
        </Button>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push(`/learn/${courseId}`)}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour au cours
            </Button>
            <h1 className="text-3xl font-bold">Résultats de l'évaluation</h1>
          </div>

          {/* Message principal : succès (certificat envoyé sous 72h) ou échec */}
          <Card className="mb-6 border-2 border-primary/20">
            <CardContent className="pt-6">
              {isPassed ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-lg font-semibold text-green-700">
                      Félicitations{certificateDisplayName ? ` ${certificateDisplayName}` : ""}, vous avez réussi !
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Votre certificat vous sera envoyé dans les 72h qui suivent via votre email.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <XCircle className="h-8 w-8 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-lg font-semibold text-destructive">Échec</p>
                    <p className="text-muted-foreground mt-1">
                      Vous n'avez pas atteint le score minimum de 70% pour réussir. Vous pouvez réessayer l'évaluation.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Votre score</span>
                <Badge
                  variant={isPassed ? "default" : "destructive"}
                  className="text-lg px-4 py-1"
                >
                  {score.toFixed(1)}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={score} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Score minimum requis : 70%
              </p>
            </CardContent>
          </Card>

          {/* Certificat Card (téléchargement si déjà disponible) */}
          {isPassed && certificate?.certificateUrl && (
            <Card className="mb-6 border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Certificat disponible
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Votre certificat est également disponible au téléchargement ci-dessous (il vous sera en plus envoyé par email).
                </p>
                <Button
                  onClick={() => window.open(certificate.certificateUrl, "_blank")}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le certificat
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de la tentative</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut :</span>
                <Badge variant={isPassed ? "default" : "destructive"}>
                  {attempt.status === "PASSED" ? "Réussi" : attempt.status === "FAILED" ? "Échoué" : "En attente"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score :</span>
                <span className="font-semibold">{score.toFixed(1)}%</span>
              </div>
              {attempt.createdAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date de soumission :</span>
                  <span>
                    {typeof attempt.createdAt === 'string' 
                      ? new Date(attempt.createdAt).toLocaleDateString("fr-FR")
                      : attempt.createdAt instanceof Date
                        ? attempt.createdAt.toLocaleDateString("fr-FR")
                        : String(attempt.createdAt)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/learn/${courseId}`)}
              className="flex-1"
            >
              Retour au cours
            </Button>
            {!isPassed && (
              <Button
                onClick={() => router.push(`/learn/${courseId}/exam/${examId}`)}
                className="flex-1"
              >
                Réessayer l'évaluation
              </Button>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
