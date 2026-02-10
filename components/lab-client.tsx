"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Code2, PlayCircle, Trophy, ArrowLeft, FileText, ExternalLink, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import { useQuery } from "@tanstack/react-query"
import { labService } from "@/lib/api/services"

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

  const fileUrls = lab.uploadedFiles?.length ? lab.uploadedFiles : []
  const links = lab.resourceLinks?.length ? lab.resourceLinks : []

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
          {(fileUrls.length > 0 || links.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Ressources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {fileUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url.startsWith("http") ? url : url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Document {fileUrls.length > 1 ? i + 1 : ""} (PDF / fichier)
                  </a>
                ))}
                {links.map((url, i) => (
                  <a
                    key={i}
                    href={url.startsWith("http") ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Lien ressource {links.length > 1 ? i + 1 : ""}
                  </a>
                ))}
              </CardContent>
            </Card>
          )}

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
        </div>
      </div>
    </div>
  )
}
