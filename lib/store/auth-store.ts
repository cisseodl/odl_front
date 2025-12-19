import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "../types"

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

// Mock user data for frontend-only implementation
const mockUser: User = {
  id: "user-1",
  name: "Mody Saidou Barry",
  email: "mody.saidou.barry@example.com",
  avatar: "/male-student-avatar.jpg",
  enrolledCourses: ["course-1", "course-2", "course-3"],
  completedCourses: ["course-1"],
  certificates: ["cert-1"],
  achievements: [],
  userProgress: [],
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        // Mock authentication - accept any email/password for demo
        if (email && password) {
          set({
            user: {
              ...mockUser,
              email,
              name: email.split("@")[0] || "Utilisateur",
            },
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          set({ isLoading: false })
          throw new Error("Email et mot de passe requis")
        }
      },

      register: async (name: string, email: string, _password: string) => {
        set({ isLoading: true })
        
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        // Mock registration
        set({
          user: {
            ...mockUser,
            name,
            email,
          },
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: () => {
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
        
        // Simulate checking auth status
        await new Promise((resolve) => setTimeout(resolve, 200))
        
        const storedUser = get().user
        set({
          isAuthenticated: !!storedUser,
          isLoading: false,
        })
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

