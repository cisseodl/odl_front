/**
 * Adaptateurs pour convertir les types backend vers les types frontend
 */
import type {
  BackendCourse,
  BackendUser,
  BackendCategorie,
  QuizDTO,
  QuestionDTO,
  LabDefinition,
  LabSession,
} from "./types"
import type {
  Course,
  User,
  Instructor,
  Module,
  Lesson,
  Quiz,
  QuizQuestion,
  Lab,
} from "../types"

/**
 * Convertir un cours backend en cours frontend
 */
export function adaptCourse(backendCourse: BackendCourse): Course {
  return {
    id: String(backendCourse.id),
    title: backendCourse.title,
    subtitle: backendCourse.description?.substring(0, 100) || "",
    description: backendCourse.description || "",
    imageUrl: backendCourse.imagePath || "/placeholder.jpg",
    instructor: {
      id: "default",
      name: "Instructeur",
      avatar: "/placeholder-user.jpg",
      title: "Formateur",
      bio: "",
      studentCount: 0,
      courseCount: 0,
      rating: 0,
    },
    category: backendCourse.categorie?.title || "Non catégorisé",
    level: "Intermédiaire", // Par défaut, peut être ajusté selon les données
    rating: 0,
    reviewCount: 0,
    duration: backendCourse.duration ? String(backendCourse.duration / 60) : "0", // Convertir minutes en heures
    language: "Français",
    lastUpdated: backendCourse.lastModifiedAt
      ? new Date(backendCourse.lastModifiedAt).toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        })
      : "Date inconnue",
    bestseller: false,
    objectives: [],
    curriculum: [],
    enrolledCount: 0,
    features: [],
  }
}

/**
 * Convertir une liste de cours backend en cours frontend
 */
export function adaptCourses(backendCourses: BackendCourse[]): Course[] {
  return backendCourses.map(adaptCourse)
}

/**
 * Convertir un utilisateur backend en utilisateur frontend
 */
export function adaptUser(backendUser: BackendUser): User {
  return {
    id: String(backendUser.id),
    name: backendUser.fullName || backendUser.username || "Utilisateur",
    email: backendUser.email,
    avatar: backendUser.avatar || "/placeholder-user.jpg",
    enrolledCourses: [],
    completedCourses: [],
    certificates: [],
    achievements: [],
    userProgress: [],
  }
}

/**
 * Convertir une catégorie backend en string (nom de catégorie)
 */
export function adaptCategory(backendCategorie: BackendCategorie): string {
  return backendCategorie.title
}

/**
 * Convertir un quiz backend en quiz frontend
 */
export function adaptQuiz(quizDTO: QuizDTO): Quiz {
  return {
    id: String(quizDTO.id),
    courseId: String(quizDTO.courseId),
    title: quizDTO.titre,
    questions: quizDTO.questions?.map(adaptQuestion) || [],
    timeLimit: quizDTO.dureeMinutes ? quizDTO.dureeMinutes * 60 : undefined, // Convertir minutes en secondes
    passingScore: quizDTO.scoreMinimum || 0,
  }
}

/**
 * Convertir une question backend en question frontend
 */
export function adaptQuestion(questionDTO: QuestionDTO): QuizQuestion {
  const isQCM = questionDTO.type === "QCM"
  const reponses = questionDTO.reponses || []

  return {
    id: String(questionDTO.id),
    question: questionDTO.contenu,
    type: isQCM ? (reponses.filter((r) => r.estCorrecte).length > 1 ? "multiple" : "single") : "boolean",
    options: isQCM ? reponses.map((r) => r.texte) : undefined,
    correctAnswers: reponses.filter((r) => r.estCorrecte).map((r) => String(r.id)),
    explanation: "",
    points: questionDTO.points || 1,
  }
}

/**
 * Convertir un lab backend en lab frontend
 */
export function adaptLab(labDefinition: LabDefinition, courseId?: string): Lab {
  return {
    id: String(labDefinition.id),
    courseId: courseId || "",
    title: labDefinition.title,
    description: labDefinition.description || "",
    instructions: labDefinition.instructions || "",
    starterCode: "",
    solution: "",
    objectives: [],
    difficulty: "medium",
    estimatedTime: labDefinition.estimatedDurationMinutes
      ? `${labDefinition.estimatedDurationMinutes} min`
      : "Non spécifié",
  }
}

/**
 * Convertir une session de lab backend en informations de lab frontend
 */
export function adaptLabSession(labSession: LabSession): {
  id: string
  status: string
  containerUrl?: string
  startTime?: Date
  endTime?: Date
  grade?: string
  reportUrl?: string
} {
  return {
    id: String(labSession.id),
    status: labSession.status || "STOPPED",
    containerUrl: labSession.containerUrl,
    startTime: labSession.startTime ? new Date(labSession.startTime) : undefined,
    endTime: labSession.endTime ? new Date(labSession.endTime) : undefined,
    grade: labSession.grade,
    reportUrl: labSession.reportUrl,
  }
}




