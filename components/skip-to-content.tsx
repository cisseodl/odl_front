"use client"

import Link from "next/link"

export function SkipToContent() {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:left-4 focus-within:z-50 focus-within:flex focus-within:flex-col focus-within:gap-2">
      <Link
        href="#main-navigation"
        className="focus:not-sr-only focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black font-semibold"
      >
        Aller à la navigation
      </Link>
      <Link
        href="#main-content"
        className="focus:not-sr-only focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black font-semibold"
      >
        Aller au contenu principal
      </Link>
    </div>
  )
}

