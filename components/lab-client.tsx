"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Code2, PlayCircle, Trophy } from "lucide-react"
import { mockLabs } from "@/lib/data"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"

interface LabClientProps {
  courseId: string
  labId: string
}

export function LabClient({ labId }: LabClientProps) {
  const lab = mockLabs.find((l) => l.id === labId)
  const [code, setCode] = useState(lab?.starterCode || "")
  const [checklist, setChecklist] = useState(lab?.objectives.map(() => false) || [])

  if (!lab) {
    return <div className="container py-8">Lab non trouvé</div>
  }

  const handleCheckSolution = () => {
    const allCompleted = checklist.every((item) => item)
    if (allCompleted) {
      toast.success("Félicitations ! Vous avez complété le lab", {
        description: "Vous avez gagné 50 points",
      })
    } else {
      toast.info("Continuez ! Vérifiez tous les objectifs")
    }
  }

  const toggleObjective = (index: number) => {
    const newChecklist = [...checklist]
    newChecklist[index] = !newChecklist[index]
    setChecklist(newChecklist)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold">{lab.title}</h1>
            <p className="text-muted-foreground">{lab.description}</p>
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
              <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">{lab.instructions}</ReactMarkdown>
            </ScrollArea>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Checklist des objectifs</h2>
            <div className="space-y-3">
              {lab.objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleObjective(index)}
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                      checklist[index] ? "border-success bg-success text-success-foreground" : "border-muted-foreground"
                    }`}
                  >
                    {checklist[index] && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                  <span className={checklist[index] ? "line-through opacity-60" : ""}>{objective}</span>
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
                    <code className="text-sm">{lab.solution}</code>
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
