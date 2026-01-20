import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Achievement, UserProgress } from "../types"

interface UserStore {
  userId: string | null
  achievements: Achievement[]
  progress: Record<string, UserProgress>
  totalPoints: number
  streak: number
  lastLoginDate: Date | null

  // Actions
  unlockAchievement: (achievement: Achievement) => void
  updateProgress: (courseId: string, progress: Partial<UserProgress>) => void
  addPoints: (points: number) => void
  updateStreak: () => void
  completeLesson: (courseId: string, lessonId: string) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userId: "user-1",
      achievements: [],
      progress: {},
      totalPoints: 0,
      streak: 0,
      lastLoginDate: null,

      unlockAchievement: (achievement) => {
        set((state) => ({
          achievements: [...state.achievements, { ...achievement, unlockedAt: new Date() }],
        }))
      },

      updateProgress: (courseId, progressUpdate) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [courseId]: {
              ...state.progress[courseId],
              ...progressUpdate,
            },
          },
        }))
      },

      addPoints: (points) => {
        set((state) => ({ totalPoints: state.totalPoints + points }))
      },

      updateStreak: () => {
        const today = new Date()
        const lastLogin = get().lastLoginDate

        if (!lastLogin) {
          set({ streak: 1, lastLoginDate: today })
          return
        }

        const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff === 1) {
          set((state) => ({ streak: state.streak + 1, lastLoginDate: today }))
        } else if (daysDiff > 1) {
          set({ streak: 1, lastLoginDate: today })
        }
      },

      completeLesson: (courseId, lessonId) => {
        const currentProgress = get().progress[courseId] || {
          courseId,
          completedLessons: [],
          progressPercentage: 0,
          lastAccessedAt: new Date(),
          quizScores: {},
        }

        const completedLessons = [...currentProgress.completedLessons, lessonId]

        set((state) => ({
          progress: {
            ...state.progress,
            [courseId]: {
              ...currentProgress,
              completedLessons,
              lastAccessedAt: new Date(),
            },
          },
        }))
      },
    }),
    {
      name: "user-storage",
      // Sérialiser les Dates en strings pour éviter l'erreur React #185
      partialize: (state) => ({
        ...state,
        lastLoginDate: state.lastLoginDate ? state.lastLoginDate.toISOString() : null,
        achievements: state.achievements.map(achievement => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt instanceof Date 
            ? achievement.unlockedAt.toISOString() 
            : achievement.unlockedAt,
        })),
        progress: Object.fromEntries(
          Object.entries(state.progress).map(([courseId, progress]) => [
            courseId,
            {
              ...progress,
              lastAccessedAt: progress.lastAccessedAt instanceof Date
                ? progress.lastAccessedAt.toISOString()
                : progress.lastAccessedAt,
            },
          ])
        ),
      }),
      // Désérialiser les strings en Dates
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convertir lastLoginDate
          if (state.lastLoginDate && typeof state.lastLoginDate === 'string') {
            state.lastLoginDate = new Date(state.lastLoginDate)
          }
          // Convertir achievements.unlockedAt
          state.achievements = state.achievements.map(achievement => ({
            ...achievement,
            unlockedAt: achievement.unlockedAt && typeof achievement.unlockedAt === 'string'
              ? new Date(achievement.unlockedAt)
              : achievement.unlockedAt,
          }))
          // Convertir progress.lastAccessedAt
          state.progress = Object.fromEntries(
            Object.entries(state.progress).map(([courseId, progress]) => [
              courseId,
              {
                ...progress,
                lastAccessedAt: progress.lastAccessedAt && typeof progress.lastAccessedAt === 'string'
                  ? new Date(progress.lastAccessedAt)
                  : progress.lastAccessedAt,
              },
            ])
          )
        }
      },
    },
  ),
)
