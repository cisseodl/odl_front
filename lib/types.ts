export interface Course {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  instructor: Instructor
  category: string
  level: "Débutant" | "Intermédiaire" | "Avancé"
  rating: number
  reviewCount: number
  duration: string // en heures
  language: string
  lastUpdated: string
  bestseller: boolean
  objectives: string[]
  curriculum: Module[]
  enrolledCount: number
  features: string[]
}

export interface Instructor {
  id: string
  name: string
  avatar: string
  title: string
  bio: string
  studentCount: number
  courseCount: number
  rating: number
}

export interface Module {
  id: string
  title: string
  duration: string
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  type: "video" | "quiz" | "document" | "lab"
  contentUrl?: string // URL du contenu stocké sur S3
  duration: string
  completed?: boolean
  locked?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  enrolledCourses: string[]
  completedCourses: string[]
  certificates: string[]
  achievements: Achievement[]
  userProgress: UserProgress[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
}

export interface Lab {
  id: string
  courseId: string
  title: string
  description: string
  instructions: string
  starterCode: string
  solution: string
  objectives: string[]
  difficulty: "easy" | "medium" | "hard"
  estimatedTime: string
  /** ID de la leçon associée (rempli depuis le backend) */
  lessonId?: number | null
}

export interface Quiz {
  id: string
  courseId: string
  title: string
  lessonId?: number | null // Leçon associée (optionnel)
  questions: QuizQuestion[]
  timeLimit?: number
  passingScore: number
}

export interface QuizQuestion {
  id: string
  question: string
  type: "single" | "multiple" | "boolean" | "code"
  options?: string[]
  correctAnswers: string[] // IDs des réponses correctes
  explanation: string
  points: number
  optionToIdMap?: Record<string, number> // Mapping option texte -> ID de réponse (objet sérialisable)
}

export interface UserProgress {
  courseId: string
  completedLessons: string[]
  currentLesson?: string
  progressPercentage: number
  lastAccessedAt: Date
  quizScores: Record<string, number>
}
