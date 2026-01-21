import type React from "react"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SkipToContent } from "@/components/skip-to-content"
import { AriaLiveRegion } from "@/components/aria-live-region"
import { ReactQueryProvider } from "@/lib/react-query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { StoreProvider } from "@/components/store-provider"
import { LanguageProvider } from "@/lib/contexts/language-context"
import "./globals.css"
import "./globals-tv-fallback.css"

// Conditionner Vercel Analytics uniquement en production Vercel
let Analytics: React.ComponentType | null = null
if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
  try {
    const analyticsModule = require("@vercel/analytics/next")
    Analytics = analyticsModule.Analytics
  } catch (e) {
    // Analytics non disponible, ignorer silencieusement
  }
}

// Using CSS variables for fonts to avoid Turbopack issues
// Fonts are defined in globals.css via @theme inline

export const metadata: Metadata = {
  title: "Orange Digital Learning - Plateforme de Formation en Ligne",
  description:
    "Apprenez de nouvelles compétences avec des cours en ligne de qualité. Développement web, data science, design et plus encore.",
  generator: "v0.app",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  icons: {
    icon: [
      {
        url: "/logo.png",
      },
    ],
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Viewport meta tag pour compatibilité TV et mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        {/* Fallback CSS inline pour les navigateurs TV qui ne supportent pas oklch() */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Fallback pour navigateurs TV - Variables CSS avec couleurs hex */
            :root {
              --background: #FFFFFF;
              --foreground: #000000;
              --primary: #FF7900;
              --primary-foreground: #FFFFFF;
              --secondary: #1A1A1A;
              --secondary-foreground: #FFFFFF;
              --muted: #F5F5F5;
              --muted-foreground: #525252;
              --border: #E5E5E5;
              --card: #FFFFFF;
              --card-foreground: #000000;
            }
            body {
              background-color: var(--background, #FFFFFF) !important;
              color: var(--foreground, #000000) !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            }
          `
        }} />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LanguageProvider>
            <StoreProvider>
              <ReactQueryProvider>
                <SkipToContent />
                <AriaLiveRegion />
                <Header />
              <main
                id="main-content"
                role="main"
                aria-label="Contenu principal"
                className="min-h-screen pt-20"
                tabIndex={-1}
              >
                {children}
              </main>
              <Footer />
              <Toaster />
            </ReactQueryProvider>
          </StoreProvider>
          </LanguageProvider>
        </ThemeProvider>
        {Analytics && <Analytics />}
      </body>
    </html>
  )
}
