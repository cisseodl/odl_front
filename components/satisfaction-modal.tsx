"use client"

import { useState } from "react"
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
import { Loader2, Star } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface SatisfactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (satisfaction: string, rating?: number) => void
  isLoading?: boolean
}

export function SatisfactionModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: SatisfactionModalProps) {
  const [satisfaction, setSatisfaction] = useState("")
  const [rating, setRating] = useState<number | undefined>(undefined)
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!satisfaction.trim()) {
      setError("Veuillez remplir votre impression concernant ce cours")
      return
    }

    if (satisfaction.trim().length < 10) {
      setError("Veuillez fournir au moins 10 caractères pour votre impression")
      return
    }

    setError("")
    onSubmit(satisfaction.trim(), rating)
  }

  const handleClose = () => {
    if (!isLoading) {
      setSatisfaction("")
      setRating(undefined)
      setError("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Votre impression sur ce cours</DialogTitle>
          <DialogDescription>
            Avant de voir vos résultats d'examen, veuillez nous donner votre impression sur ce cours.
            Cette information est obligatoire.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="satisfaction">
              Qu'avez-vous pensé de ce cours ? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="satisfaction"
              placeholder="Exemple : Ce cours m'a permis d'acquérir de solides bases en Kotlin. Les explications étaient claires et les exercices pratiques très utiles..."
              value={satisfaction}
              onChange={(e) => {
                setSatisfaction(e.target.value)
                setError("")
              }}
              rows={6}
              className="resize-none"
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum 10 caractères requis
            </p>
          </div>

          <div className="space-y-2">
            <Label>Note de satisfaction (optionnel)</Label>
            <RadioGroup
              value={rating?.toString()}
              onValueChange={(value) => setRating(Number.parseInt(value))}
              className="flex gap-4"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value.toString()} id={`rating-${value}`} />
                  <Label htmlFor={`rating-${value}`} className="cursor-pointer flex items-center gap-1">
                    <Star className={`h-4 w-4 ${rating && rating >= value ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    {value}
                  </Label>
                </div>
              ))}
            </RadioGroup>
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
            onClick={handleSubmit}
            disabled={isLoading || !satisfaction.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              "Soumettre et voir mes résultats"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
