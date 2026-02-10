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
  console.log(`🟢 [ADAPTER] ===== DÉBUT adaptLesson =====`)
  console.log(`🟢 [ADAPTER] lessonDto reçu:`, lessonDto)
  
  // Le backend retourne les entités Lesson directement (pas des DTOs)
  // contentUrl est présent dans l'entité Lesson
  // Vérifier plusieurs propriétés possibles pour être sûr de récupérer contentUrl
  let contentUrl: string | undefined = undefined
  
  // DEBUG: Log pour les documents
  const isDocument = lessonDto?.type === "DOCUMENT" || lessonDto?.type === "document" || 
                     (lessonDto?.type && lessonDto.type.toLowerCase() === "document")
  
  if (isDocument) {
    console.log("📄 [ADAPTER] ===== LEÇON DOCUMENT DÉTECTÉE =====")
    console.log("📄 [ADAPTER] adaptLesson pour document:", {
      id: lessonDto?.id,
      title: lessonDto?.title,
      type: lessonDto?.type,
      allKeys: lessonDto ? Object.keys(lessonDto) : [],
      rawData: lessonDto,
      rawDataJSON: JSON.stringify(lessonDto, null, 2)
    })
  }
  
  // Essayer différentes façons de récupérer contentUrl
  if (lessonDto) {
    // Log détaillé pour le débogage
    if (isDocument) {
      console.log("📄 [ADAPTER] adaptLesson - Début extraction contentUrl:", {
        lessonId: lessonDto.id,
        lessonTitle: lessonDto.title,
        lessonType: lessonDto.type,
        allKeys: Object.keys(lessonDto),
        rawLessonDto: lessonDto,
        rawLessonDtoJSON: JSON.stringify(lessonDto, null, 2)
      })
    }
    
    // Méthode 1: Propriété directe (camelCase)
    contentUrl = (lessonDto as any).contentUrl || lessonDto.contentUrl
    console.log(`🟢 [ADAPTER] Méthode 1 (camelCase): contentUrl =`, contentUrl)
    
    // Méthode 2: Propriété snake_case
    if (!contentUrl) {
      contentUrl = (lessonDto as any).content_url
      console.log(`🟢 [ADAPTER] Méthode 2 (snake_case): contentUrl =`, contentUrl)
    }
    
    // Méthode 3: Propriété kebab-case
    if (!contentUrl) {
      contentUrl = (lessonDto as any)['content-url']
      console.log(`🟢 [ADAPTER] Méthode 3 (kebab-case): contentUrl =`, contentUrl)
    }
    
    // Méthode 4: Vérifier si c'est dans un objet imbriqué
    if (!contentUrl && (lessonDto as any).lesson) {
      contentUrl = (lessonDto as any).lesson.contentUrl || 
                   (lessonDto as any).lesson.content_url ||
                   (lessonDto as any).lesson['content-url']
    }
    
    // Méthode 5: Vérifier toutes les clés pour trouver contentUrl (recherche flexible)
    if (!contentUrl) {
      const allKeys = Object.keys(lessonDto)
      for (const key of allKeys) {
        const lowerKey = key.toLowerCase()
        if ((lowerKey.includes('content') && lowerKey.includes('url')) ||
            lowerKey === 'contenturl' ||
            lowerKey === 'content_url' ||
            lowerKey === 'content-url') {
          contentUrl = (lessonDto as any)[key]
          if (contentUrl) break
        }
      }
    }
    
    // Méthode 6: Recherche récursive dans les objets imbriqués
    if (!contentUrl) {
      const searchInObject = (obj: any, depth = 0): string | undefined => {
        if (depth > 3 || !obj || typeof obj !== 'object') return undefined
        for (const key in obj) {
          if (key.toLowerCase().includes('content') && key.toLowerCase().includes('url')) {
            const value = obj[key]
            if (typeof value === 'string' && value.trim()) {
              return value.trim()
            }
          }
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            const found = searchInObject(obj[key], depth + 1)
            if (found) return found
          }
        }
        return undefined
      }
      contentUrl = searchInObject(lessonDto)
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
      console.log("📄 [ADAPTER] adaptLesson - Résultat extraction contentUrl:", {
        lessonId: lessonDto.id,
        contentUrl: contentUrl,
        hasContentUrl: !!contentUrl,
        contentUrlType: typeof contentUrl,
        contentUrlLength: contentUrl ? contentUrl.length : 0
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
  console.log(`🟡 [ADAPTER] ===== DÉBUT adaptModule =====`)
  console.log(`🟡 [ADAPTER] moduleDto reçu:`, moduleDto)
  
  // Le backend peut retourner les entités Module directement avec les leçons
  // Vérifier si lessons est présent et adapter chaque leçon
  const rawLessons = moduleDto.lessons || (moduleDto as any).lessons || []
  
  console.log(`🟡 [ADAPTER] Leçons brutes trouvées:`, {
    count: rawLessons.length,
    rawLessons: rawLessons
  })
  
  // IMPORTANT: Préserver contentUrl depuis les données brutes AVANT l'adaptation
  // Créer un objet simple (pas un Map) pour éviter les erreurs React #185
  const rawLessonsMap: Record<string | number, any> = {}
  rawLessons.forEach((rawLesson: any) => {
    if (rawLesson && rawLesson.id) {
      rawLessonsMap[rawLesson.id] = rawLesson
      // Log pour chaque leçon brute
      if (rawLesson.type === "DOCUMENT" || rawLesson.type === "document") {
        console.log(`🟡 [ADAPTER] Leçon brute (document) ajoutée au map:`, {
          id: rawLesson.id,
          title: rawLesson.title,
          type: rawLesson.type,
          contentUrl: rawLesson.contentUrl,
          allKeys: Object.keys(rawLesson),
          rawLesson: rawLesson
        })
      }
    }
  })
  
  // Adapter les leçons
  const adaptedLessons = rawLessons.map((rawLesson: any) => {
    console.log(`🟡 [ADAPTER] Adaptation de la leçon:`, {
      id: rawLesson?.id,
      title: rawLesson?.title,
      type: rawLesson?.type,
      contentUrlBefore: rawLesson?.contentUrl
    })
    
    const adapted = adaptLesson(rawLesson)
    
    // Si l'adapter n'a pas trouvé contentUrl, le récupérer directement depuis les données brutes
    if (!adapted.contentUrl && rawLesson) {
      console.log(`🟡 [ADAPTER] contentUrl manquant après adaptation, recherche dans données brutes...`)
      // Essayer toutes les variantes possibles
      const contentUrl = rawLesson.contentUrl || 
                        (rawLesson as any).content_url || 
                        (rawLesson as any)['content-url'] ||
                        rawLesson.contentUrl
      
      console.log(`🟡 [ADAPTER] Tentative de récupération contentUrl:`, {
        contentUrl: contentUrl,
        rawLessonContentUrl: rawLesson.contentUrl,
        rawLessonContent_url: (rawLesson as any).content_url,
        rawLessonContentDashUrl: (rawLesson as any)['content-url']
      })
      
      if (contentUrl && typeof contentUrl === 'string' && contentUrl.trim()) {
        adapted.contentUrl = contentUrl.trim()
        console.log(`✅ [ADAPTER] adaptModule - contentUrl récupéré depuis données brutes:`, {
          lessonId: rawLesson.id,
          lessonTitle: rawLesson.title,
          contentUrl: adapted.contentUrl
        })
      } else {
        // DOCUMENT sans URL : mettre null explicitement, warning uniquement en dev
        if (rawLesson.type === "DOCUMENT" || rawLesson.type === "document") {
          ;(adapted as any).contentUrl = null
          if (process.env.NODE_ENV === "development") {
            console.warn(`[ADAPTER] Leçon ${rawLesson.id} (DOCUMENT): contentUrl absent - le document ne sera pas téléchargeable`)
          }
        }
      }
    } else if (adapted.contentUrl) {
      console.log(`✅ [ADAPTER] adaptModule - contentUrl déjà présent après adaptation:`, {
        lessonId: rawLesson.id,
        contentUrl: adapted.contentUrl
      })
    }
    
    return adapted
  })
  
  // Log pour déboguer les modules avec documents
  if (adaptedLessons.length > 0) {
    const documentLessons = adaptedLessons.filter((l: any) => 
      l.type === "document" || l.type === "DOCUMENT"
    )
    if (documentLessons.length > 0) {
      console.log("📚 [ADAPTER] ===== LEÇONS DOCUMENT ADAPTÉES =====")
      console.log("📚 [ADAPTER] adaptModule - Leçons document adaptées:", {
        moduleId: moduleDto.id,
        moduleTitle: moduleDto.title,
        documentLessons: documentLessons.map((l: any) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          contentUrl: l.contentUrl,
          hasContentUrl: !!l.contentUrl
        }))
      })
    }
  }
  
  const adaptedModule = {
    id: String(moduleDto.id),
    title: moduleDto.title,
    duration: moduleDto.duration || "0h 0m",
    lessons: adaptedLessons,
  }
  
  console.log(`🟡 [ADAPTER] ===== FIN adaptModule =====`)
  console.log(`🟡 [ADAPTER] Module adapté:`, adaptedModule)
  
  return adaptedModule
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
  
  // Gérer la catégorie - le backend retourne toujours une string (ou "Non catégorisé" si null)
  let category: string = "Non catégorisé"
  
  // Log détaillé pour déboguer
  if (process.env.NODE_ENV === 'development') {
    console.log("🔍 [ADAPTER] adaptCourse - Catégorie brute:", {
      courseId: backendCourse.id,
      courseTitle: backendCourse.title,
      rawCategory: backendCourse.category,
      categoryType: typeof backendCourse.category,
      categoryValue: backendCourse.category
    })
  }
  
  if (backendCourse.category) {
    if (typeof backendCourse.category === 'string') {
      // Si c'est une string, vérifier qu'elle n'est pas vide
      const trimmedCategory = backendCourse.category.trim()
      if (trimmedCategory !== "" && trimmedCategory.toLowerCase() !== "null" && trimmedCategory !== "Non catégorisé") {
        category = trimmedCategory
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ [ADAPTER] Catégorie extraite (string):", category)
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log("⚠️ [ADAPTER] Catégorie string invalide:", trimmedCategory)
        }
      }
    } else if (typeof backendCourse.category === 'object') {
      // Si c'est un objet, essayer d'extraire le titre
      const categoryTitle = (backendCourse.category as any).title || 
                           (backendCourse.category as any).name || 
                           (backendCourse.category as any).label ||
                           String(backendCourse.category)
      if (categoryTitle && typeof categoryTitle === 'string' && categoryTitle.trim() !== "" && categoryTitle.toLowerCase() !== "null" && categoryTitle !== "Non catégorisé") {
        category = categoryTitle.trim()
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ [ADAPTER] Catégorie extraite (objet):", category)
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log("⚠️ [ADAPTER] Catégorie objet invalide:", categoryTitle)
        }
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log("⚠️ [ADAPTER] Type de catégorie inattendu:", typeof backendCourse.category)
      }
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log("⚠️ [ADAPTER] backendCourse.category est null/undefined")
    }
  }
  
  // Log final
  if (process.env.NODE_ENV === 'development') {
    console.log("📊 [ADAPTER] Catégorie finale pour cours", backendCourse.id, ":", category)
  }
  
  // Curriculum : accepter curriculum ou modules, ignorer les entrées invalides pour éviter de casser l'affichage
  const rawCurriculum = (backendCourse.curriculum?.length ? backendCourse.curriculum : backendCourse.modules) ?? [];
  const curriculum = Array.isArray(rawCurriculum)
    ? rawCurriculum
        .filter((m: any) => m && (m.id != null || m.id !== undefined))
        .map((m: any) => {
          try {
            return adaptModule(m);
          } catch {
            return null;
          }
        })
        .filter((m): m is Module => m != null)
    : [];

  return {
    id: courseId,
    title: backendCourse.title,
    subtitle: backendCourse.subtitle || backendCourse.description?.substring(0, 100) || "",
    description: backendCourse.description || "",
    imageUrl: backendCourse.imageUrl || "/placeholder.jpg",
    instructor: adaptInstructor(backendCourse?.instructor),
    category: category,
    level: levelMapping[backendCourse.level] || "Intermédiaire",
    rating: backendCourse.rating ?? 0,
    reviewCount: backendCourse.reviewCount ?? 0,
    duration: parseDuration(backendCourse.duration),
    language: backendCourse.language || "Français",
    lastUpdated: backendCourse.lastUpdated || "Date inconnue",
    bestseller: backendCourse.bestseller || false,
    objectives: backendCourse.objectives || [],
    curriculum,
    enrolledCount: backendCourse.enrolledCount ?? 0,
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
  const raw = quizDTO as QuizDTO & { lessonId?: number | null; lesson?: { id?: number } }
  const lessonId = raw.lessonId ?? raw.lesson?.id ?? null
  return {
    id: String(quizDTO.id),
    courseId: String(quizDTO.courseId),
    title: quizDTO.title, // Backend utilise "title" (pas "titre")
    lessonId: lessonId ?? undefined,
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
export function adaptLab(labDefinition: LabDefinition & { lesson?: { id?: number }; lessonId?: number }, courseId?: string): Lab {
  const raw = labDefinition as any
  const lessonId = raw.lesson?.id ?? raw.lessonId ?? undefined
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
    lessonId: lessonId != null ? lessonId : undefined,
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






