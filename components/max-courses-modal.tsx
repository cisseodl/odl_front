"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import Link from "next/link"

interface MaxCoursesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MaxCoursesModal({ open, onOpenChange }: MaxCoursesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-3">
              <BookOpen className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <DialogTitle className="text-center">
            Limite de 3 cours en cours
          </DialogTitle>
          <DialogDescription className="text-center">
            Vous êtes déjà inscrit à 3 cours. Pour vous inscrire à un nouveau cours,
            terminez d&apos;abord l&apos;un de vos cours en cours (le marquer comme terminé ou
            avancer jusqu&apos;au bout), puis revenez ici.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="default">
            <Link href="/dashboard" onClick={() => onOpenChange(false)}>
              Voir mes cours
            </Link>
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
