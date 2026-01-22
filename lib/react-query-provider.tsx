"use client"

import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - cache par défaut plus long
            gcTime: 30 * 60 * 1000, // 30 minutes - garder en mémoire plus longtemps
            refetchOnWindowFocus: false, // Ne pas refetch automatiquement au focus
            refetchOnMount: false, // Utiliser le cache si disponible
            retry: 1, // Réessayer 1 fois seulement pour rapidité
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
