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
    },
  ),
)
