import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "../types"
import { authService } from "../api/services"
import { adaptUser } from "../api/adapters"
import { apiClient } from "../api/client"

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<void>
  setUser: (user: User | null) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const response = await authService.signin(email, password)
          
          if (response.ok && response.data?.user) {
            const frontendUser = adaptUser(response.data.user)
            set({
              user: frontendUser,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
            throw new Error(response.message || "Email ou mot de passe incorrect")
          }
        } catch (error) {
          set({ isLoading: false })
          throw error instanceof Error ? error : new Error("Erreur lors de la connexion")
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          // Créer l'objet utilisateur selon le format attendu par l'API
          const userData = {
            fullName: name,
            email: email,
            password: password,
            username: email, // Utiliser l'email comme username
            role: "USER",
          }
          
          const response = await authService.signup(JSON.stringify(userData))
          
          if (response.ok && response.data?.user) {
            const frontendUser = adaptUser(response.data.user)
            set({
              user: frontendUser,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
            throw new Error(response.message || "Erreur lors de l'inscription")
          }
        } catch (error) {
          set({ isLoading: false })
          throw error instanceof Error ? error : new Error("Erreur lors de l'inscription")
        }
      },

      logout: () => {
        authService.logout()
        set({
          user: null,
          isAuthenticated: false,
        })
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        })
      },

      checkAuth: async () => {
        set({ isLoading: true })
        
        try {
          // Vérifier si un token existe
          const token = apiClient.getToken()
          
          if (token) {
            // Le token existe, on considère l'utilisateur comme authentifié
            // Si nécessaire, on peut faire un appel API pour vérifier la validité du token
            const storedUser = get().user
            set({
              isAuthenticated: !!storedUser,
              isLoading: false,
            })
          } else {
            set({
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error) {
          set({
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

