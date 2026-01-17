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
  InstructorDto,
  ModuleDto,
  LessonDto,
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
 * Mapping des niveaux backend vers frontend
 */
const levelMapping: Record<string, "Débutant" | "Intermédiaire" | "Avancé"> = {
  DEBUTANT: "Débutant",
  INTERMEDIAIRE: "Intermédiaire",
  AVANCE: "Avancé",
}

/**
 * Mapping des types de leçons backend vers frontend
 */
const lessonTypeMapping: Record<string, "video" | "quiz" | "document" | "lab"> = {
  VIDEO: "video",
  QUIZ: "quiz",
  DOCUMENT: "document",
  LAB: "lab",
}

/**
 * Parser la durée depuis le format backend "23h 45min" vers "23" (heures)
 */
function parseDuration(duration: string): string {
  if (!duration) return "0"
  const match = duration.match(/(\d+)h/)
  return match ? match[1] : "0"
}

/**
 * Convertir un InstructorDto backend en Instructor frontend
 */
export function adaptInstructor(instructorDto?: InstructorDto): Instructor {
  if (!instructorDto) {
    return {
      id: "default",
      name: "Instructeur",
      avatar: "/placeholder-user.jpg",
      title: "Formateur",
      bio: "",
      studentCount: 0,
      courseCount: 0,
      rating: 0,
    }
  }

  return {
    id: String(instructorDto.id),
    name: instructorDto.name || "Instructeur",
    avatar: instructorDto.avatar || "/placeholder-user.jpg",
    title: instructorDto.title || "Formateur",
    bio: instructorDto.bio || "",
    studentCount: instructorDto.studentCount || 0,
    courseCount: instructorDto.courseCount || 0,
    rating: instructorDto.rating || 0,
  }
}

/**
 * Convertir un LessonDto backend en Lesson frontend
 */
export function adaptLesson(lessonDto: LessonDto): Lesson {
  return {
    id: String(lessonDto.id),
    title: lessonDto.title,
    type: lessonTypeMapping[lessonDto.type] || "video",
    duration: lessonDto.duration || "0 min",
    completed: lessonDto.completed || false,
    locked: lessonDto.locked || false,
  }
}

/**
 * Convertir un ModuleDto backend en Module frontend
 */
export function adaptModule(moduleDto: ModuleDto): Module {
  return {
    id: String(moduleDto.id),
    title: moduleDto.title,
    duration: moduleDto.duration || "0h 0m",
    lessons: moduleDto.lessons?.map(adaptLesson) || [],
  }
}

/**
 * Convertir un cours backend en cours frontend
 * Utilise maintenant la structure complète du CourseDto
 */
export function adaptCourse(backendCourse: BackendCourse): Course {
  return {
    id: String(backendCourse.id),
    title: backendCourse.title,
    subtitle: backendCourse.subtitle || backendCourse.description?.substring(0, 100) || "",
    description: backendCourse.description || "",
    imageUrl: backendCourse.imageUrl || "/placeholder.jpg",
    instructor: adaptInstructor(backendCourse.instructor),
    category: backendCourse.category || "Non catégorisé",
    level: levelMapping[backendCourse.level] || "Intermédiaire",
    rating: backendCourse.rating || 0,
    reviewCount: backendCourse.reviewCount || 0,
    duration: parseDuration(backendCourse.duration),
    language: backendCourse.language || "Français",
    lastUpdated: backendCourse.lastUpdated || "Date inconnue",
    bestseller: backendCourse.bestseller || false,
    objectives: backendCourse.objectives || [],
    curriculum: backendCourse.curriculum?.map(adaptModule) || [],
    enrolledCount: backendCourse.enrolledCount || 0,
    features: backendCourse.features || [],
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
 * Note: Les données de l'apprenant (learner) sont préservées dans l'objet user
 */
export function adaptUser(backendUser: BackendUser): User & { learner?: any } {
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
    // Préserver les données de l'apprenant si présentes
    learner: backendUser.learner,
  } as User & { learner?: any }
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
    title: quizDTO.title, // Backend utilise "title" (pas "titre")
    questions: quizDTO.questions?.map(adaptQuestion) || [],
    timeLimit: quizDTO.durationMinutes ? quizDTO.durationMinutes * 60 : undefined, // Convertir minutes en secondes
    passingScore: quizDTO.scoreMinimum || 0,
  }
}

/**
 * Convertir une question backend en question frontend
 * Note: Les options sont les textes des réponses, mais correctAnswers contient les IDs des réponses correctes
 */
export function adaptQuestion(questionDTO: QuestionDTO): QuizQuestion & { optionToIdMap?: Map<string, number> } {
  const isQCM = questionDTO.type === "SINGLE_CHOICE" || questionDTO.type === "MULTIPLE_CHOICE"
  const reponses = questionDTO.reponses || []

  // Créer un mapping option texte -> ID de réponse
  const optionToIdMap = new Map<string, number>()
  reponses.forEach((r) => {
    optionToIdMap.set(r.text, r.id)
  })

  return {
    id: String(questionDTO.id),
    question: questionDTO.content, // Backend utilise "content" (pas "contenu")
    type: questionDTO.type === "MULTIPLE_CHOICE" ? "multiple" : 
          questionDTO.type === "SINGLE_CHOICE" ? "single" : 
          questionDTO.type === "TEXT" ? "code" : "boolean",
    options: isQCM ? reponses.map((r) => r.text) : undefined, // Backend utilise "text" (pas "texte")
    correctAnswers: reponses.filter((r) => r.isCorrect).map((r) => String(r.id)), // IDs des réponses correctes
    explanation: "",
    points: questionDTO.points || 1,
    // Mapping pour convertir option texte -> ID de réponse
    optionToIdMap: optionToIdMap,
  } as QuizQuestion & { optionToIdMap?: Map<string, number> }
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






