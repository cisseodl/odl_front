"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface ProfileUpdateDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  isSuccess: boolean
  message?: string
}

export function ProfileUpdateDialog({ isOpen, onOpenChange, isSuccess, message }: ProfileUpdateDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center justify-center text-center p-6">
          {isSuccess ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <DialogTitle className="text-2xl font-bold">Profil Mis à Jour avec Succès !</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                {message || "Vos informations personnelles ont été mises à jour avec succès."}
              </DialogDescription>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <DialogTitle className="text-2xl font-bold">Erreur lors de la Mise à Jour</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                {message || "Une erreur est survenue lors de la mise à jour de votre profil. Veuillez réessayer."}
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        <DialogFooter className="flex justify-center p-4">
          <Button onClick={() => onOpenChange(false)}>
            {isSuccess ? "Fermer" : "Réessayer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
