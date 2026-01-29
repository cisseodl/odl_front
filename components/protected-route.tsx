"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const checkAuth = useAuthStore((s) => s.checkAuth)
  const logout = useAuthStore((s) => s.logout)
  const checkAuthRan = useRef(false)

  // Vérifier l'auth une seule fois au montage pour éviter une boucle de re-renders (React #185)
  useEffect(() => {
    if (checkAuthRan.current) return
    checkAuthRan.current = true
    checkAuth()
  }, [checkAuth])

  // Écouter les événements de déconnexion (quand le token est invalide)
  useEffect(() => {
    const handleLogout = () => {
      logout()
      router.push("/auth")
    }

    window.addEventListener("auth:logout", handleLogout)
    return () => {
      window.removeEventListener("auth:logout", handleLogout)
    }
  }, [logout, router])

  // Rediriger vers /auth si non authentifié (une fois le chargement terminé). Ne pas dépendre de router pour éviter boucle lors de la navigation.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- router exclu volontairement pour éviter Maximum update depth
  }, [isAuthenticated, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}



