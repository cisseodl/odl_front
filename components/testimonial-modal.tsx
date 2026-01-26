"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Simuler un service API pour les témoignages
const testimonialService = {
  addTestimonial: async (content: string) => {
    console.log("Submitting testimonial:", content)
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (content.trim().length < 10) {
      throw new Error("Le témoignage doit contenir au moins 10 caractères.")
    }
    // Simuler une réponse de succès
    return { success: true, message: "Témoignage ajouté avec succès !" }
  },
}

interface TestimonialModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function TestimonialModal({ isOpen, onOpenChange }: TestimonialModalProps) {
  const [content, setContent] = useState("")
  const queryClient = useQueryClient()

  const addTestimonialMutation = useMutation({
    mutationFn: testimonialService.addTestimonial,
    onSuccess: (data) => {
      toast.success(data.message)
      // Invalider les requêtes pour rafraîchir les données si nécessaire
      queryClient.invalidateQueries({ queryKey: ["testimonials"] })
      onOpenChange(false) // Fermer le modal
      setContent("") // Réinitialiser le champ
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la soumission", {
        description: error.message || "Une erreur est survenue.",
      })
    },
  })

  const handleSubmit = () => {
    if (content.trim()) {
      addTestimonialMutation.mutate(content)
    } else {
      toast.warning("Veuillez écrire votre témoignage.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Laissez votre témoignage</DialogTitle>
          <DialogDescription>
            Partagez votre expérience avec la communauté. Votre avis est précieux.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="testimonial-content">Votre témoignage</Label>
            <Textarea
              id="testimonial-content"
              placeholder="J'ai trouvé les cours très enrichissants..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={addTestimonialMutation.isPending}
          >
            {addTestimonialMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              "Envoyer mon témoignage"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
