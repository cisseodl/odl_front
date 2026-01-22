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
import { ErrorBoundary } from "@/components/error-boundary"
// Importer globals.css (contient Tailwind, variables oklch avec fallbacks hex, et globals-tv-fallback)
// Tous les styles sont maintenant dans un seul fichier pour éviter les chunks CSS multiples
import "./globals.css"

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
        {/* Ce style est chargé en premier et sert de fallback si oklch() n'est pas supporté */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Fallback pour navigateurs TV - Variables CSS avec couleurs hex */
            /* Ces valeurs sont utilisées si oklch() n'est pas supporté */
            :root {
              --background: #FFFFFF !important;
              --foreground: #000000 !important;
              --primary: #FF7900 !important;
              --primary-foreground: #FFFFFF !important;
              --secondary: #1A1A1A !important;
              --secondary-foreground: #FFFFFF !important;
              --accent: #F16E00 !important;
              --accent-foreground: #FFFFFF !important;
              --muted: #F5F5F5 !important;
              --muted-foreground: #525252 !important;
              --destructive: #000000 !important;
              --destructive-foreground: #FFFFFF !important;
              --success: #FF7900 !important;
              --success-foreground: #FFFFFF !important;
              --warning: #FF7900 !important;
              --warning-foreground: #000000 !important;
              --border: #E5E5E5 !important;
              --input: #E5E5E5 !important;
              --ring: #FF7900 !important;
              --card: #FFFFFF !important;
              --card-foreground: #000000 !important;
              --popover: #FFFFFF !important;
              --popover-foreground: #000000 !important;
              --radius: 0.75rem !important;
            }
            .dark {
              --background: #000000 !important;
              --foreground: #FFFFFF !important;
              --card: #1A1A1A !important;
              --card-foreground: #FFFFFF !important;
              --popover: #1A1A1A !important;
              --popover-foreground: #FFFFFF !important;
              --primary: #FFA64D !important;
              --primary-foreground: #000000 !important;
              --secondary: #FAFAFA !important;
              --secondary-foreground: #000000 !important;
              --muted: #404040 !important;
              --muted-foreground: #B3B3B3 !important;
              --border: #595959 !important;
              --input: #595959 !important;
              --ring: #FFA64D !important;
            }
            body {
              background-color: var(--background) !important;
              color: var(--foreground) !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            }
            /* Test de visibilité - si ce style s'applique, le CSS fonctionne */
            html {
              background-color: var(--background) !important;
            }
          `
        }} />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ErrorBoundary>
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
          </ErrorBoundary>
        </ThemeProvider>
        {Analytics && <Analytics />}
      </body>
    </html>
  )
}
