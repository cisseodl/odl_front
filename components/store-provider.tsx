"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/store/auth-store"
import { apiClient } from "@/lib/api/client"

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore()

  // Charger le token et vérifier l'authentification au démarrage
  useEffect(() => {
    // Synchroniser le token depuis localStorage avec apiClient
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) {
        console.log("🔑 [STORE] Token trouvé au démarrage, synchronisation avec apiClient")
        apiClient.setToken(token)
      }
    }
    
    // Vérifier l'authentification
    checkAuth()
  }, [checkAuth])

  // Stores will hydrate automatically with the storage configuration
  return <>{children}</>
}

