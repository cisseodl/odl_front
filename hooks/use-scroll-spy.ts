"use client"

import { useState, useEffect } from "react"

interface UseScrollSpyOptions {
  sectionIds: string[]
  offset?: number
  rootMargin?: string
}

export function useScrollSpy({ sectionIds, offset = 100, rootMargin = "0px" }: UseScrollSpyOptions) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || "")

  useEffect(() => {
    if (sectionIds.length === 0) return

    const observerOptions = {
      root: null,
      rootMargin: `-${offset}px 0px -50% 0px`,
      threshold: 0,
    }

    const observers: IntersectionObserver[] = []
    const elements: Map<string, Element> = new Map()

    // Create observers for each section
    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (!element) return

      elements.set(id, element)

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id)
            }
          })
        },
        observerOptions
      )

      observer.observe(element)
      observers.push(observer)
    })

    // Fallback: check scroll position
    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i]
        const element = elements.get(id)
        if (!element) continue

        const elementTop = element.getBoundingClientRect().top + window.scrollY
        if (scrollPosition >= elementTop) {
          setActiveSection(id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => {
      observers.forEach((observer) => observer.disconnect())
      window.removeEventListener("scroll", handleScroll)
    }
  }, [sectionIds, offset, rootMargin])

  return activeSection
}

