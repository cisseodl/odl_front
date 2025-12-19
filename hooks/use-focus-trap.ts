"use client"

import { useEffect, useRef } from "react"

interface UseFocusTrapOptions {
  enabled?: boolean
  initialFocus?: boolean
}

export function useFocusTrap({ enabled = true, initialFocus = true }: UseFocusTrapOptions = {}) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus initial
    if (initialFocus && firstElement) {
      firstElement.focus()
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener("keydown", handleTabKey)

    return () => {
      container.removeEventListener("keydown", handleTabKey)
    }
  }, [enabled, initialFocus])

  return containerRef
}

