"use client"

import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface ReviewSuccessDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function ReviewSuccessDialog({ isOpen, onOpenChange }: ReviewSuccessDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center justify-center text-center p-6">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <DialogTitle className="text-2xl font-bold">Avis Soumis avec Succès !</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Merci d'avoir partagé votre expérience. Votre avis est précieux et aide les autres apprenants.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center p-4">
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}