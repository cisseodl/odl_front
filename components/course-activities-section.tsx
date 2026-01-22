"use client"

import { FlaskConical, FileText, BookOpen, ExternalLink, Clock, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Lab } from "@/lib/types"
import Link from "next/link"

interface CourseActivitiesSectionProps {
  labs: Lab[]
  tps: any[] // Évaluations de type TP
  courseId: string | number
}

export function CourseActivitiesSection({ labs, tps, courseId }: CourseActivitiesSectionProps) {
  const hasLabs = labs && labs.length > 0
  const hasTPs = tps && tps.length > 0
  const hasContent = hasLabs || hasTPs

  if (!hasContent) {
    return null
  }

  return (
    <div className="mt-8 space-y-6">
      <Separator />
      
      <div>
        <h2 className="text-2xl font-bold mb-6">Activités pratiques</h2>
        
        <div className="space-y-6">
          {/* Labs Section */}
          {hasLabs && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-orange-500" />
                  Labs pratiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {labs.map((lab) => (
                    <div
                      key={lab.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="rounded-full bg-orange-100 p-2">
                          <FlaskConical className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{lab.title}</h3>
                          {lab.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {lab.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            {lab.estimatedTime && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {lab.estimatedTime}
                              </div>
                            )}
                            <Badge variant="outline" className="text-xs">
                              Lab pratique
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          // TODO: Implémenter la navigation vers le lab
                          console.log("Démarrer lab:", lab.id)
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Démarrer
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TP Section */}
          {hasTPs && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Travaux pratiques (TP)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tps.map((tp) => (
                    <div
                      key={tp.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="rounded-full bg-blue-100 p-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{tp.title || "TP sans titre"}</h3>
                          {tp.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {tp.description}
                            </p>
                          )}
                          {tp.tpFileUrl && (
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Fichier disponible
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {tp.tpFileUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              window.open(tp.tpFileUrl, "_blank")
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        )}
                        <Link href={`/learn/${courseId}/evaluation/${tp.id}`}>
                          <Button size="sm">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Commencer
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
