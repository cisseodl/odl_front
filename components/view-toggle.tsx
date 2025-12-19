"use client"

import { Grid3x3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list"

interface ViewToggleProps {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  className?: string
}

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center gap-1 border border-border rounded-md p-1 bg-white", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange("grid")}
        className={cn(
          "h-8 px-3 transition-all",
          view === "grid"
            ? "bg-primary text-white hover:bg-primary/90"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Vue grille"
      >
        <Grid3x3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange("list")}
        className={cn(
          "h-8 px-3 transition-all",
          view === "list"
            ? "bg-primary text-white hover:bg-primary/90"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Vue liste"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}

