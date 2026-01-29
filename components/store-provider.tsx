"use client"

import { useEffect, useRef } from "react"
import { useAuthStore } from "@/lib/store/auth-store"
import { apiClient } from "@/lib/api/client"

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((s) => s.checkAuth)
  const hasRunInit = useRef(false)

  // Charger le token et vérifier l'authentification une seule fois au démarrage (évite boucle React #185)
  useEffect(() => {
    if (hasRunInit.current) return
    hasRunInit.current = true

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) {
        console.log("🔑 [STORE] Token trouvé au démarrage, synchronisation avec apiClient")
        apiClient.setToken(token)
      }
    }

    checkAuth()
  }, [checkAuth])

  // Stores will hydrate automatically with the storage configuration
  return <>{children}</>
}

