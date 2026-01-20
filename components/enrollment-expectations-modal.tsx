"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface EnrollmentExpectationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (expectations: string) => void
  courseTitle?: string
  isLoading?: boolean
}

export function EnrollmentExpectationsModal({
  open,
  onOpenChange,
  onConfirm,
  courseTitle,
  isLoading = false,
}: EnrollmentExpectationsModalProps) {
  const [expectations, setExpectations] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Réinitialiser le state quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setExpectations("")
      setError("")
      setIsSubmitting(false)
    }
  }, [open])

  const handleSubmit = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    // Empêcher les clics multiples
    if (isSubmitting || isLoading) {
      return
    }
    
    console.log("handleSubmit appelé, expectations:", expectations)
    
    if (!expectations.trim()) {
      setError("Veuillez remplir vos attentes concernant ce cours")
      return
    }

    if (expectations.trim().length < 10) {
      setError("Veuillez fournir au moins 10 caractères pour vos attentes")
      return
    }

    setIsSubmitting(true)
    setError("")
    console.log("Appel de onConfirm avec:", expectations.trim())
    onConfirm(expectations.trim())
  }

  const handleClose = () => {
    if (!isLoading && !isSubmitting) {
      setExpectations("")
      setError("")
      setIsSubmitting(false)
      onOpenChange(false)
    }
  }

  // Réinitialiser isSubmitting quand isLoading change
  useEffect(() => {
    console.log("🔄 [MODAL] isLoading changed:", isLoading)
    if (isLoading) {
      setIsSubmitting(true)
    } else {
      // Délai pour permettre à la mutation de se terminer
      const timer = setTimeout(() => {
        setIsSubmitting(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Vos attentes concernant ce cours</DialogTitle>
          <DialogDescription>
            {courseTitle && (
              <span className="font-semibold text-foreground">{courseTitle}</span>
            )}
            <br />
            Avant de vous inscrire, veuillez nous indiquer vos attentes concernant ce cours.
            Cette information est obligatoire.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="expectations">
              Quelles sont vos attentes ? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="expectations"
              placeholder="Exemple : J'aimerais apprendre les bases de Kotlin pour développer des applications Android..."
              value={expectations}
              onChange={(e) => {
                setExpectations(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => {
                // Permettre la soumission avec Ctrl+Enter ou Cmd+Enter
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              rows={6}
              className="resize-none"
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum 10 caractères requis ({expectations.trim().length}/10)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={(e) => {
              console.log("Bouton cliqué, expectations:", expectations)
              handleSubmit(e)
            }}
            disabled={isLoading || isSubmitting || !expectations.trim() || expectations.trim().length < 10}
            type="button"
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inscription en cours...
              </>
            ) : (
              "S'inscrire au cours"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
