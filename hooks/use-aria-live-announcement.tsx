"use client"

import { useState } from "react"
import { AriaLiveRegion } from "@/components/aria-live-region"

// Hook pour annoncer des changements aux lecteurs d'écran
export function useAriaLiveAnnouncement() {
  const [announcement, setAnnouncement] = useState<string>("")

  const announce = (message: string, _priority: "polite" | "assertive" = "polite") => {
    setAnnouncement(message)
    // Clear after announcement is read
    setTimeout(() => setAnnouncement(""), 1000)
  }

  return {
    announce,
    AriaLiveRegion: () => <AriaLiveRegion message={announcement} priority="polite" />,
  }
}

