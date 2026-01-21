"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Mail, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RegistrationResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "success" | "error" | "warning"
  title: string
  description: string
  email?: string
  onContinue?: () => void
}

export function RegistrationResultDialog({
  open,
  onOpenChange,
  type,
  title,
  description,
  email,
  onContinue,
}: RegistrationResultDialogProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-16 w-16 text-green-500" />
      case "error":
        return <XCircle className="h-16 w-16 text-red-500" />
      case "warning":
        return <AlertCircle className="h-16 w-16 text-yellow-500" />
    }
  }

  const getButtonVariant = () => {
    switch (type) {
      case "success":
        return "default"
      case "error":
        return "destructive"
      case "warning":
        return "outline"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className={cn(
              "rounded-full p-4",
              type === "success" && "bg-green-50 dark:bg-green-900/20",
              type === "error" && "bg-red-50 dark:bg-red-900/20",
              type === "warning" && "bg-yellow-50 dark:bg-yellow-900/20"
            )}>
              {getIcon()}
            </div>
            <DialogTitle className="text-2xl text-center">{title}</DialogTitle>
            <DialogDescription className="text-center text-base">
              {description}
            </DialogDescription>
            {email && type === "success" && (
              <div className="flex items-center gap-2 mt-2 p-3 bg-muted rounded-lg">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Un email de bienvenue a été envoyé à <strong className="text-foreground">{email}</strong>
                </span>
              </div>
            )}
          </div>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button
            variant={getButtonVariant()}
            onClick={() => {
              if (onContinue) {
                onContinue()
              } else {
                onOpenChange(false)
              }
            }}
            className="w-full sm:w-auto min-w-[120px]"
          >
            {type === "success" ? "Continuer" : type === "error" ? "Fermer" : "Compris"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
