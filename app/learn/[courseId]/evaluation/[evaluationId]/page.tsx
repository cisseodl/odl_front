"use client"

import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ClipboardList, Loader2 } from "lucide-react"
import { evaluationService } from "@/lib/api/services"
import { ProtectedRoute } from "@/components/protected-route"
import { ScrollArea } from "@/components/ui/scroll-area"

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
        <div className="container max-w-4xl py-8">
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
        </div>
      </div>
    </ProtectedRoute>
  )
}
