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
import { StatusDialog } from "./status-dialog" // New import

import { testimonialService } from "@/lib/api/services" // Import the real testimonial service

interface TestimonialModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function TestimonialModal({ isOpen, onOpenChange }: TestimonialModalProps) {
  const [content, setContent] = useState("")
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [statusDialogProps, setStatusDialogProps] = useState({
    title: "",
    description: "",
    status: "success" as "success" | "error",
  })
  const queryClient = useQueryClient()

  const addTestimonialMutation = useMutation({
    mutationFn: testimonialService.addTestimonial,
    onSuccess: (data) => {
      onOpenChange(false) // Close the testimonial input modal
      setShowStatusDialog(true)
      setStatusDialogProps({
        title: "Témoignage Soumis avec Succès !",
        description: data.message,
        status: "success",
      })
      setContent("") // Réinitialiser le champ
    },
    onError: (error: any) => {
      onOpenChange(false) // Close the testimonial input modal
      setShowStatusDialog(true)
      setStatusDialogProps({
        title: "Erreur lors de la Soumission",
        description: error.message || "Une erreur est survenue lors de l'envoi de votre témoignage.",
        status: "error",
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
      <StatusDialog
        isOpen={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        title={statusDialogProps.title}
        description={statusDialogProps.description}
        status={statusDialogProps.status}
      />
    </Dialog>
  )
}
