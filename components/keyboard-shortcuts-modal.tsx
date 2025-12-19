"use client"

import { useState, useEffect } from "react"
import { Keyboard } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const shortcuts = [
  {
    category: "Lecteur Vidéo",
    items: [
      { keys: ["Espace"], description: "Play/Pause" },
      { keys: ["M"], description: "Mute/Unmute" },
      { keys: ["F"], description: "Plein écran" },
      { keys: ["←"], description: "Reculer de 10 secondes" },
      { keys: ["→"], description: "Avancer de 10 secondes" },
    ],
  },
  {
    category: "Navigation",
    items: [
      { keys: ["/"], description: "Rechercher" },
      { keys: ["G", "H"], description: "Aller à l'accueil" },
      { keys: ["G", "C"], description: "Aller aux cours" },
      { keys: ["G", "D"], description: "Aller au dashboard" },
    ],
  },
  {
    category: "Général",
    items: [
      { keys: ["?"], description: "Afficher cette aide" },
      { keys: ["Esc"], description: "Fermer les modals" },
    ],
  },
]

export function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden sm:flex" title="Raccourcis clavier (?)">
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Raccourcis Clavier
          </DialogTitle>
          <DialogDescription>
            Utilisez ces raccourcis pour naviguer plus rapidement dans l'application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcuts.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <div key={keyIndex} className="flex items-center gap-1">
                          {keyIndex > 0 && <span className="text-muted-foreground">+</span>}
                          <Badge variant="outline" className="font-mono text-xs px-2 py-1">
                            {key}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {categoryIndex < shortcuts.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Appuyez sur <Badge variant="outline" className="font-mono text-xs">?</Badge> à tout moment pour
            afficher cette aide
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

