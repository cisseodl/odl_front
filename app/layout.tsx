import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SkipToContent } from "@/components/skip-to-content"
import { AriaLiveRegion } from "@/components/aria-live-region"
import { ReactQueryProvider } from "@/lib/react-query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { StoreProvider } from "@/components/store-provider"
import "./globals.css"

// Using CSS variables for fonts to avoid Turbopack issues
// Fonts are defined in globals.css via @theme inline

export const metadata: Metadata = {
  title: "Orange Digital Learning - Plateforme de Formation en Ligne",
  description:
    "Apprenez de nouvelles compétences avec des cours en ligne de qualité. Développement web, data science, design et plus encore.",
  generator: "v0.app",
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
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <StoreProvider>
            <ReactQueryProvider>
              <SkipToContent />
              <AriaLiveRegion />
              <Header />
              <main
                id="main-content"
                role="main"
                aria-label="Contenu principal"
                className="min-h-screen"
                tabIndex={-1}
              >
                {children}
              </main>
              <Footer />
              <Toaster />
            </ReactQueryProvider>
          </StoreProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
