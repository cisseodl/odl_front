import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Course, UserProgress } from "../types"
import { courseService } from "../api/services"

interface CourseStore {
  enrolled: string[] // Course IDs
  favorites: string[] // Course IDs
  progress: Record<string, UserProgress>
  recentlyViewed: string[] // Course IDs
  isLoading: boolean
  
  // Actions
  enroll: (courseId: string) => Promise<void>
  unenroll: (courseId: string) => void
  toggleFavorite: (courseId: string) => void
  updateProgress: (courseId: string, progress: Partial<UserProgress>) => void
  addToRecentlyViewed: (courseId: string) => void
  getEnrolledCourses: () => Course[]
  getFavoriteCourses: () => Course[]
  isEnrolled: (courseId: string) => boolean
  isFavorite: (courseId: string) => boolean
  getProgress: (courseId: string) => UserProgress | null
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      enrolled: [],
      favorites: [],
      progress: {},
      recentlyViewed: [],
      isLoading: false,

      enroll: async (courseId: string) => {
        const courseIdNum = parseInt(courseId, 10)
        
        if (isNaN(courseIdNum)) {
          throw new Error("ID de cours invalide")
        }

        // Vérifier si déjà inscrit
        if (get().enrolled.includes(courseId)) {
          return // Already enrolled
        }

        set({ isLoading: true })

        try {
          const response = await courseService.enrollInCourse(courseIdNum)
          
          if (response.ok) {
            set((state) => ({
              enrolled: [...state.enrolled, courseId],
              progress: {
                ...state.progress,
                [courseId]: {
                  courseId,
                  completedLessons: [],
                  progressPercentage: 0,
                  lastAccessedAt: new Date(),
                  quizScores: {},
                },
              },
              isLoading: false,
            }))
          } else {
            set({ isLoading: false })
            throw new Error(response.message || "Erreur lors de l'inscription au cours")
          }
        } catch (error) {
          set({ isLoading: false })
          throw error instanceof Error ? error : new Error("Erreur lors de l'inscription au cours")
        }
      },

      unenroll: (courseId: string) => {
        set((state) => ({
          enrolled: state.enrolled.filter((id) => id !== courseId),
          progress: Object.fromEntries(
            Object.entries(state.progress).filter(([id]) => id !== courseId)
          ),
        }))
      },

      toggleFavorite: (courseId: string) => {
        if (typeof window === "undefined") return
        
        set((state) => {
          const isFavorite = state.favorites.includes(courseId)
          return {
            favorites: isFavorite
              ? state.favorites.filter((id) => id !== courseId)
              : [...state.favorites, courseId],
          }
        })
      },

      updateProgress: (courseId: string, progressUpdate: Partial<UserProgress>) => {
        set((state) => {
          const currentProgress = state.progress[courseId] || {
            courseId,
            completedLessons: [],
            progressPercentage: 0,
            lastAccessedAt: new Date(),
            quizScores: {},
          }

          return {
            progress: {
              ...state.progress,
              [courseId]: {
                ...currentProgress,
                ...progressUpdate,
                lastAccessedAt: new Date(),
              },
            },
          }
        })
      },

      addToRecentlyViewed: (courseId: string) => {
        set((state) => {
          const filtered = state.recentlyViewed.filter((id) => id !== courseId)
          return {
            recentlyViewed: [courseId, ...filtered].slice(0, 10), // Keep last 10
          }
        })
      },

      getEnrolledCourses: () => {
        // This method should be called from components that have access to courses data
        // Return empty array to avoid importing mockCourses in store
        return []
      },

      getFavoriteCourses: () => {
        // This method should be called from components that have access to courses data
        // Return empty array to avoid importing mockCourses in store
        return []
      },

      isEnrolled: (courseId: string) => {
        return get().enrolled.includes(courseId)
      },

      isFavorite: (courseId: string) => {
        if (typeof window === "undefined") return false
        return get().favorites.includes(courseId)
      },

      getProgress: (courseId: string) => {
        return get().progress[courseId] || null
      },
    }),
    {
      name: "course-storage",
      partialize: (state) => ({
        enrolled: state.enrolled,
        favorites: state.favorites,
        progress: state.progress,
        recentlyViewed: state.recentlyViewed,
      }),
    },
  ),
)

