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
 * Note: Le backend retourne parfois les entités Lesson directement (pas des DTOs),
 * donc contentUrl peut être présent même s'il n'est pas dans le type LessonDto
 */
export function adaptLesson(lessonDto: LessonDto | any): Lesson {
  // Le backend retourne les entités Lesson directement (pas des DTOs)
  // contentUrl est présent dans l'entité Lesson
  // Vérifier plusieurs propriétés possibles pour être sûr de récupérer contentUrl
  let contentUrl: string | undefined = undefined
  
  // DEBUG: Log pour les documents
  const isDocument = lessonDto?.type === "DOCUMENT" || lessonDto?.type === "document" || 
                     (lessonDto?.type && lessonDto.type.toLowerCase() === "document")
  
  if (isDocument) {
    console.log("📄 [ADAPTER] adaptLesson pour document:", {
      id: lessonDto?.id,
      title: lessonDto?.title,
      type: lessonDto?.type,
      allKeys: lessonDto ? Object.keys(lessonDto) : [],
      rawData: lessonDto
    })
  }
  
  // Essayer différentes façons de récupérer contentUrl
  if (lessonDto) {
    // Méthode 1: Propriété directe
    contentUrl = (lessonDto as any).contentUrl || lessonDto.contentUrl
    
    // Méthode 2: Vérifier si c'est dans un objet imbriqué
    if (!contentUrl && (lessonDto as any).lesson) {
      contentUrl = (lessonDto as any).lesson.contentUrl
    }
    
    // Méthode 3: Vérifier toutes les clés pour trouver contentUrl
    if (!contentUrl) {
      const allKeys = Object.keys(lessonDto)
      for (const key of allKeys) {
        if (key.toLowerCase().includes('content') && key.toLowerCase().includes('url')) {
          contentUrl = (lessonDto as any)[key]
          break
        }
      }
    }
    
    // Nettoyer l'URL si elle existe (enlever les espaces, etc.)
    if (contentUrl && typeof contentUrl === 'string') {
      contentUrl = contentUrl.trim()
      if (contentUrl === '' || contentUrl === 'null' || contentUrl === 'undefined') {
        contentUrl = undefined
      }
    }
    
    // DEBUG: Log le résultat pour les documents
    if (isDocument) {
      console.log("📄 [ADAPTER] contentUrl extrait:", {
        contentUrl: contentUrl,
        hasContentUrl: !!contentUrl
      })
    }
  }
  
  return {
    id: String(lessonDto.id),
    title: lessonDto.title,
    type: lessonTypeMapping[lessonDto.type] || "video",
    // Récupérer contentUrl depuis la réponse brute
    contentUrl: contentUrl,
    duration: lessonDto.duration || "0 min",
    completed: lessonDto.completed || false,
    locked: lessonDto.locked || false,
  }
}

/**
 * Convertir un ModuleDto backend en Module frontend
 */
export function adaptModule(moduleDto: ModuleDto | any): Module {
  // Le backend peut retourner les entités Module directement avec les leçons
  // Vérifier si lessons est présent et adapter chaque leçon
  const lessons = moduleDto.lessons || (moduleDto as any).lessons || []
  
  // Log pour déboguer les modules avec documents
  if (lessons.length > 0) {
    const documentLessons = lessons.filter((l: any) => 
      l.type === "DOCUMENT" || l.type === "document" || 
      (l.type && l.type.toLowerCase() === "document")
    )
    if (documentLessons.length > 0) {
      console.log("📚 [ADAPTER] adaptModule - Leçons document trouvées:", {
        moduleId: moduleDto.id,
        moduleTitle: moduleDto.title,
        documentLessons: documentLessons.map((l: any) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          contentUrl: l.contentUrl || (l as any).contentUrl,
          allKeys: Object.keys(l)
        }))
      })
    }
  }
  
  return {
    id: String(moduleDto.id),
    title: moduleDto.title,
    duration: moduleDto.duration || "0h 0m",
    lessons: lessons.map(adaptLesson),
  }
}

/**
 * Convertir un cours backend en cours frontend
 * Utilise maintenant la structure complète du CourseDto
 */
export function adaptCourse(backendCourse: BackendCourse | any): Course {
  // Gérer différents formats d'ID (number, string, ou objet)
  let courseId: string
  if (typeof backendCourse.id === 'number') {
    courseId = String(backendCourse.id)
  } else if (typeof backendCourse.id === 'string') {
    courseId = backendCourse.id
  } else if (backendCourse.id && typeof backendCourse.id === 'object') {
    // Si l'ID est un objet, essayer d'extraire la valeur
    const idValue = (backendCourse.id as any).id || (backendCourse.id as any).value || (backendCourse.id as any)
    courseId = String(idValue)
  } else {
    // Fallback
    courseId = String(backendCourse.id || '')
  }
  
  // Gérer la catégorie - peut être une string, un objet avec title, ou null/undefined
  let category: string = "Non catégorisé"
  
  if (backendCourse.category) {
    if (typeof backendCourse.category === 'string') {
      // Si c'est une string, vérifier qu'elle n'est pas vide
      const trimmedCategory = backendCourse.category.trim()
      if (trimmedCategory !== "" && trimmedCategory.toLowerCase() !== "null") {
        category = trimmedCategory
      }
    } else if (typeof backendCourse.category === 'object') {
      // Si c'est un objet, essayer d'extraire le titre
      const categoryTitle = (backendCourse.category as any).title || 
                           (backendCourse.category as any).name || 
                           (backendCourse.category as any).label ||
                           String(backendCourse.category)
      if (categoryTitle && typeof categoryTitle === 'string' && categoryTitle.trim() !== "" && categoryTitle.toLowerCase() !== "null") {
        category = categoryTitle.trim()
      }
    }
  }
  
  // Catégorie gérée : le backend retourne toujours une string (ou "Non catégorisé" si null)
  // Plus besoin de logs pour améliorer les performances
  
  return {
    id: courseId,
    title: backendCourse.title,
    subtitle: backendCourse.subtitle || backendCourse.description?.substring(0, 100) || "",
    description: backendCourse.description || "",
    imageUrl: backendCourse.imageUrl || "/placeholder.jpg",
    instructor: adaptInstructor(backendCourse.instructor),
    category: category,
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
export function adaptQuestion(questionDTO: QuestionDTO): QuizQuestion & { optionToIdMap?: Record<string, number> } {
  const isQCM = questionDTO.type === "SINGLE_CHOICE" || questionDTO.type === "MULTIPLE_CHOICE"
  const reponses = questionDTO.reponses || []

  // Créer un mapping option texte -> ID de réponse (utiliser un objet au lieu d'un Map pour éviter l'erreur React #185)
  const optionToIdMap: Record<string, number> = {}
  reponses.forEach((r) => {
    optionToIdMap[r.text] = r.id
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
    // Mapping pour convertir option texte -> ID de réponse (objet sérialisable)
    optionToIdMap: optionToIdMap,
  } as QuizQuestion & { optionToIdMap?: Record<string, number> }
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






