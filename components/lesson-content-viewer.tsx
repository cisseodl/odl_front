"use client"

import { useState, useEffect } from "react"
import { FileText, Download, Loader2, AlertCircle, ExternalLink, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LessonContentViewerProps {
  contentUrl: string
  title: string
  type: "video" | "document" | "quiz" | "lab"
  className?: string
}

export function LessonContentViewer({ contentUrl, title, type, className }: LessonContentViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!contentUrl || contentUrl.trim() === "") {
      setError("Aucune URL fournie pour le contenu")
      setIsLoading(false)
      return
    }

    // Construire l'URL complète si nécessaire
    let fullUrl = contentUrl
    if (!contentUrl.startsWith("http://") && !contentUrl.startsWith("https://")) {
      // Si l'URL est relative, l'ajouter à l'URL de l'API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.smart-odc.com"
      fullUrl = `${apiBaseUrl}/awsodclearning${contentUrl.startsWith("/") ? contentUrl : `/${contentUrl}`}`
    }

    setIsLoading(false)
  }, [contentUrl])

  const handleDownload = () => {
    if (contentUrl) {
      const fullUrl = contentUrl.startsWith("http") 
        ? contentUrl 
        : `${process.env.NEXT_PUBLIC_API_URL || "https://api.smart-odc.com"}/awsodclearning${contentUrl.startsWith("/") ? contentUrl : `/${contentUrl}`}`
      window.open(fullUrl, "_blank")
    }
  }

  const handleOpenInNewTab = () => {
    if (contentUrl) {
      const fullUrl = contentUrl.startsWith("http") 
        ? contentUrl 
        : `${process.env.NEXT_PUBLIC_API_URL || "https://api.smart-odc.com"}/awsodclearning${contentUrl.startsWith("/") ? contentUrl : `/${contentUrl}`}`
      window.open(fullUrl, "_blank")
    }
  }

  // Construire l'URL complète pour l'affichage
  const getFullUrl = () => {
    if (!contentUrl) return ""
    if (contentUrl.startsWith("http://") || contentUrl.startsWith("https://")) {
      return contentUrl
    }
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.smart-odc.com"
    return `${apiBaseUrl}/awsodclearning${contentUrl.startsWith("/") ? contentUrl : `/${contentUrl}`}`
  }

  const fullUrl = getFullUrl()

  // Détecter le type de fichier
  const lowerUrl = contentUrl.toLowerCase()
  const isPDF = lowerUrl.endsWith('.pdf') || lowerUrl.includes('.pdf')
  const isWord = lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx') || 
                lowerUrl.includes('.doc') || lowerUrl.includes('.docx')
  const isImage = lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || 
                  lowerUrl.endsWith('.png') || lowerUrl.endsWith('.gif') ||
                  lowerUrl.endsWith('.webp')
  const isVideo = lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || 
                  lowerUrl.endsWith('.ogg') || lowerUrl.includes('video') ||
                  type === "video"

  // Pour les fichiers Word et PDF, utiliser Google Docs Viewer pour forcer l'affichage
  const getViewerUrl = () => {
    if (isWord) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`
    }
    if (isPDF) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`
    }
    return fullUrl
  }

  if (error) {
    return (
      <Card className={`p-6 ${className || ""}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={`p-6 ${className || ""}`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className || ""}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              {type === "video" ? (
                <Play className="h-6 w-6 text-primary" />
              ) : (
                <FileText className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-sm text-muted-foreground">
                {type === "video" ? "Vidéo" : "Ressource consultable"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir
            </Button>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="border rounded-lg overflow-hidden bg-muted/30">
          {isVideo ? (
            <video
              src={fullUrl}
              controls
              className="w-full h-auto max-h-[75vh] rounded-lg"
              onLoadStart={() => setIsLoading(true)}
              onLoadedData={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false)
                setError("Impossible de charger la vidéo")
              }}
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          ) : isImage ? (
            <img
              src={fullUrl}
              alt={title}
              className="w-full h-auto max-h-[75vh] rounded-lg object-contain"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false)
                setError("Impossible de charger l'image")
              }}
            />
          ) : isPDF ? (
            <iframe
              src={getViewerUrl()}
              title={title}
              className="w-full h-[600px] md:h-[800px] border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false)
                setError("Impossible de charger le document PDF")
              }}
              allow="fullscreen"
              type="application/pdf"
            />
          ) : isWord ? (
            <div className="w-full h-[600px] flex flex-col items-center justify-center bg-muted rounded-lg p-8">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fichier Word détecté</h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                Les fichiers Word (.doc, .docx) ne peuvent pas être affichés directement dans le navigateur.
                Veuillez utiliser l'un des boutons ci-dessus pour ouvrir ou télécharger le fichier.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleOpenInNewTab} variant="default" size="lg">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir dans un nouvel onglet
                </Button>
                <Button onClick={handleDownload} variant="outline" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le fichier
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              src={fullUrl}
              title={title}
              className="w-full h-[600px] md:h-[800px] border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false)
                setError("Impossible de charger le document")
              }}
              allow="fullscreen"
            />
          )}
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  )
}
