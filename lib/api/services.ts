/**
 * Services API pour communiquer avec le backend
 */
import { apiClient } from "./client"
import { API_ENDPOINTS } from "./config"
import type {
  SigninRequest,
  JwtAuthenticationResponse,
  BackendCourse,
  BackendCategorie,
  QuizDTO,
  QuizSubmissionDTO,
  LabDefinition,
  LabSession,
  SubmitLabRequest,
  DashboardStatsDTO,
  BackendChapter,
  ApprenantCreateRequest,
  Cohorte,
  ProfileDto,
  CertificateDto,
  PublicStats,
  CourseProgressDto,
} from "./types"
import { adaptCourse, adaptCourses, adaptUser, adaptQuiz, adaptLab } from "./adapters"
import type { Course, User, Quiz, Lab } from "../types"
import type { ApiResponse } from "./client"

// ============ Authentication Services ============
export const authService = {
  /**
   * Se connecter
   */
  async signin(email: string, password: string): Promise<ApiResponse<JwtAuthenticationResponse>> {
    const response = await apiClient.post<JwtAuthenticationResponse>(
      API_ENDPOINTS.auth.signin,
      { email, password } as SigninRequest
    )

    if (response.ok && response.data?.token) {
      apiClient.setToken(response.data.token)
    }

    return response
  },

  /**
   * S'inscrire
   * Le backend attend toujours multipart/form-data, même sans avatar
   */
  async signup(
    userData: string, // JSON stringifié selon l'API
    avatar?: File
  ): Promise<ApiResponse<JwtAuthenticationResponse>> {
    // Toujours utiliser FormData car le backend attend multipart/form-data
    const formData = new FormData()
    formData.append("user", userData) // Le backend attend "user" comme clé
    
    if (avatar) {
      formData.append("avatar", avatar)
    }

    // Le backend attend le userData dans le FormData, pas dans l'URL
    const response = await apiClient.postFormData<JwtAuthenticationResponse>(
      API_ENDPOINTS.auth.signup,
      formData
    )

    if (response.ok && response.data?.token) {
      apiClient.setToken(response.data.token)
    }

    return response
  },

  /**
   * Changer le mot de passe
   */
  async changePassword(
    username: string,
    pass1: string,
    pass2: string
  ): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.auth.changePassword, {
      username,
      pass1,
      pass2,
    })
  },

  /**
   * Mot de passe oublié
   */
  async forgotPassword(username: string): Promise<ApiResponse<any>> {
    return apiClient.get(`${API_ENDPOINTS.auth.forgotPassword}/${username}`)
  },

  /**
   * Vérifier la disponibilité
   */
  async checkAvailability(): Promise<ApiResponse<string>> {
    return apiClient.get(API_ENDPOINTS.auth.checkAvailability)
  },

  /**
   * Déconnexion (supprime le token)
   */
  logout() {
    apiClient.setToken(null)
  },

}

// ============ Course Services ============
export const courseService = {
  /**
   * Obtenir tous les cours
   * Le backend retourne CResponse<List<CourseDto>>
   */
  async getAllCourses(): Promise<Course[]> {
    const response = await apiClient.get<{ data: BackendCourse[] } | BackendCourse[]>(
      API_ENDPOINTS.courses.getAll
    )
    
    if (response.ok && response.data) {
      // Le backend peut retourner soit directement un array, soit dans { data: [...] }
      const courses = Array.isArray(response.data)
        ? response.data
        : (response.data as any).data || []
      
      return adaptCourses(courses)
    }
    
    return []
  },

  /**
   * Obtenir un cours par ID
   * Le backend retourne CResponse<CourseDto>
   */
  async getCourseById(id: number): Promise<Course | null> {
    const response = await apiClient.get<{ data: BackendCourse } | BackendCourse>(
      `${API_ENDPOINTS.courses.getById}/${id}`
    )
    
    if (response.ok && response.data) {
      // Le backend peut retourner soit directement l'objet, soit dans { data: {...} }
      const course = Array.isArray(response.data)
        ? null
        : (response.data as any).data || response.data
      
      return course ? adaptCourse(course as BackendCourse) : null
    }
    
    return null
  },

  /**
   * Obtenir les cours par catégorie
   * Le backend retourne CResponse<List<CourseDto>>
   */
  async getCoursesByCategory(catId: number): Promise<Course[]> {
    const response = await apiClient.get<{ data: BackendCourse[] } | BackendCourse[]>(
      `${API_ENDPOINTS.courses.getByCategory}/${catId}`
    )
    
    if (response.ok && response.data) {
      const courses = Array.isArray(response.data)
        ? response.data
        : (response.data as any).data || []
      
      return adaptCourses(courses)
    }
    
    return []
  },

  /**
   * Obtenir les cours paginés
   */
  async getCoursesByPage(page: number, size: number): Promise<{
    courses: Course[]
    total?: number
  }> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.courses.getByPage}/${page}/${size}`
    )
    
    if (response.ok && response.data) {
      // Adapter selon la structure de réponse réelle
      const courses = Array.isArray(response.data)
        ? response.data
        : response.data.content || response.data.courses || []
      
      return {
        courses: adaptCourses(courses),
        total: response.data.totalElements || response.data.total,
      }
    }
    
    return { courses: [] }
  },

  /**
   * S'inscrire à un cours
   */
  async enrollInCourse(courseId: number): Promise<ApiResponse<any>> {
    return apiClient.post(`${API_ENDPOINTS.courses.enroll}/${courseId}`)
  },
}

// ============ Category Services ============
export const categoryService = {
  /**
   * Obtenir toutes les catégories
   */
  async getAllCategories(): Promise<BackendCategorie[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.categories.getAll)
    
    if (response.ok && response.data) {
      // Adapter selon la structure de réponse réelle
      return Array.isArray(response.data) ? response.data : response.data.data || []
    }
    
    return []
  },

  /**
   * Obtenir une catégorie par ID
   */
  async getCategoryById(id: number): Promise<BackendCategorie | null> {
    const response = await apiClient.get<BackendCategorie>(
      `${API_ENDPOINTS.categories.getById}/${id}`
    )
    
    if (response.ok && response.data) {
      return response.data
    }
    
    return null
  },
}

// ============ Chapter Services ============
export const chapterService = {
  /**
   * Obtenir les chapitres d'un cours
   */
  async getChaptersByCourse(courseId: number): Promise<BackendChapter[]> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.chapters.getByCourse}/${courseId}`
    )
    
    if (response.ok && response.data) {
      return Array.isArray(response.data) ? response.data : response.data.data || []
    }
    
    return []
  },
}

// ============ Quiz Services ============
export const quizService = {
  /**
   * Obtenir les quiz d'un cours
   */
  async getQuizzesByCourse(courseId: number): Promise<Quiz[]> {
    const response = await apiClient.get<{ data: QuizDTO[] }>(
      `${API_ENDPOINTS.quiz.getByCourse}/${courseId}`
    )
    
    if (response.ok && response.data) {
      const quizzes = Array.isArray(response.data)
        ? response.data
        : response.data.data || []
      
      return quizzes.map(adaptQuiz)
    }
    
    return []
  },

  /**
   * Créer un quiz
   */
  async createQuiz(quiz: QuizDTO): Promise<ApiResponse<QuizDTO>> {
    return apiClient.post(API_ENDPOINTS.quiz.create, quiz)
  },

  /**
   * Soumettre un quiz
   */
  async submitQuiz(submission: QuizSubmissionDTO): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.quiz.submit, submission)
  },
}

// ============ Lab Services ============
export const labService = {
  /**
   * Obtenir tous les labs
   */
  async getAllLabs(): Promise<Lab[]> {
    const response = await apiClient.get<{ data: LabDefinition[] }>(API_ENDPOINTS.labs.getAll)
    
    if (response.ok && response.data) {
      const labs = Array.isArray(response.data)
        ? response.data
        : response.data.data || []
      
      return labs.map((lab) => adaptLab(lab))
    }
    
    return []
  },

  /**
   * Obtenir mes sessions de lab
   */
  async getMySessions(): Promise<LabSession[]> {
    const response = await apiClient.get<{ data: LabSession[] }>(
      API_ENDPOINTS.labs.getMySessions
    )
    
    if (response.ok && response.data) {
      return Array.isArray(response.data)
        ? response.data
        : response.data.data || []
    }
    
    return []
  },

  /**
   * Démarrer un lab
   */
  async startLab(labId: number): Promise<ApiResponse<LabSession>> {
    return apiClient.post(`${API_ENDPOINTS.labs.start}/${labId}`)
  },

  /**
   * Arrêter un lab
   */
  async stopLab(sessionId: number): Promise<ApiResponse<LabSession>> {
    return apiClient.post(`${API_ENDPOINTS.labs.stop}/${sessionId}`)
  },

  /**
   * Soumettre un lab
   */
  async submitLab(sessionId: number, request: SubmitLabRequest): Promise<ApiResponse<LabSession>> {
    return apiClient.post(`${API_ENDPOINTS.labs.submit}/${sessionId}`, request)
  },
}

// ============ Dashboard Services ============
export const dashboardService = {

  /**
   * Obtenir les statistiques publiques pour la page d'accueil
   * Calcule les stats à partir des données disponibles
   */
  async getPublicStats(): Promise<PublicStats> {
    try {
      // Récupérer tous les cours pour calculer les stats
      const courses = await courseService.getAllCourses()
      
      // Calculer les statistiques
      const totalCourses = courses.length
      
      // Cours les plus consultés = cours avec le plus d'inscriptions
      const mostViewedCourses = Math.max(...courses.map(c => c.enrolledCount || 0), 0)
      
      // Taux de satisfaction = moyenne des ratings
      const totalRating = courses.reduce((sum, c) => sum + (c.rating || 0), 0)
      const satisfactionRate = courses.length > 0 
        ? Math.round((totalRating / courses.length) * 20) // Convertir de 0-5 à 0-100
        : 98 // Valeur par défaut
      
      // Pour le total d'étudiants, on peut utiliser la somme des inscriptions
      // ou essayer de récupérer depuis l'API admin si disponible
      const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0)
      
      return {
        totalStudents: totalStudents || 250000, // Fallback si pas de données
        totalCourses: totalCourses || 5000,
        mostViewedCourses: mostViewedCourses || 1200,
        satisfactionRate: satisfactionRate || 98,
      }
    } catch (error) {
      console.error("Error fetching public stats:", error)
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        totalStudents: 250000,
        totalCourses: 5000,
        mostViewedCourses: 1200,
        satisfactionRate: 98,
      }
    }
  },
  
  async getStudentDashboard(): Promise<DashboardStatsDTO | null> {
    const response = await apiClient.get<any>(API_ENDPOINTS.dashboard.student)
    return response.ok && response.data ? (response.data as any).data || response.data : null
  },
  
  async getInstructorDashboard(): Promise<DashboardStatsDTO | null> {
    const response = await apiClient.get<any>(API_ENDPOINTS.dashboard.instructor)
    return response.ok && response.data ? (response.data as any).data || response.data : null
  },
}

// ============ Apprenant Services ============
export const apprenantService = {
  /**
   * Créer un profil apprenant pour l'utilisateur authentifié
   */
  async createApprenant(data: ApprenantCreateRequest): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.apprenants.create, data)
  },

  /**
   * Obtenir tous les apprenants
   */
  async getAllApprenants(): Promise<any[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.apprenants.getAll)
    
    if (response.ok && response.data) {
      return Array.isArray(response.data)
        ? response.data
        : (response.data as any).data || []
    }
    
    return []
  },

  /**
   * Obtenir le profil apprenant de l'utilisateur authentifié
   * Note: Le backend retourne l'apprenant dans le User lors de la connexion
   */
  async getMyApprenant(): Promise<any | null> {
    // L'apprenant est déjà inclus dans les données utilisateur après connexion
    // On peut aussi essayer de récupérer depuis l'endpoint si nécessaire
    return null // Sera récupéré depuis user.learner
  },
}

// ============ Cohorte Services ============
export const cohorteService = {
  /**
   * Obtenir toutes les cohortes
   */
  async getAllCohortes(): Promise<Cohorte[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.cohortes.getAll)
    
    if (response.ok && response.data) {
      return Array.isArray(response.data)
        ? response.data
        : (response.data as any).data || []
    }
    
    return []
  },

  /**
   * Obtenir une cohorte par ID
   */
  async getCohorteById(id: number): Promise<Cohorte | null> {
    const response = await apiClient.get<Cohorte>(
      `${API_ENDPOINTS.cohortes.getById}/${id}`
    )
    
    if (response.ok && response.data) {
      return Array.isArray(response.data)
        ? null
        : (response.data as any).data || response.data
    }
    
    return null
  },
}

// ============ Profile Services ============
export const profileService = {
  /**
   * Obtenir le profil de l'utilisateur authentifié
   */
  async getMyProfile(): Promise<ProfileDto | null> {
    const response = await apiClient.get<any>(API_ENDPOINTS.profile.me)
    
    if (response.ok && response.data) {
      // Le backend peut retourner directement ProfileDto ou dans CResponse
      return (response.data as any).data || response.data
    }
    
    return null
  },
}

// ============ Certificate Services ============
export const certificateService = {
  /**
   * Obtenir les certificats de l'utilisateur authentifié
   */
  async getMyCertificates(): Promise<CertificateDto[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.certificates.myCertificates)
    
    if (response.ok && response.data) {
      const data = (response.data as any).data || response.data
      return Array.isArray(data) ? data : []
    }
    
    return []
  },
}

// ============ Learner Services ============
export const learnerService = {
  /**
   * Obtenir la progression d'un cours pour l'utilisateur authentifié
   */
  async getCourseProgress(courseId: number): Promise<CourseProgressDto | null> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.learner.getCourseProgress}/${courseId}`
    )
    
    if (response.ok && response.data) {
      const data = (response.data as any).data || response.data
      return data as CourseProgressDto
    }
    
    return null
  },

  /**
   * Marquer une leçon comme complétée
   */
  async completeLesson(courseId: number, lessonId: number): Promise<ApiResponse<any>> {
    return apiClient.post(
      `${API_ENDPOINTS.learner.completeLesson}/${courseId}/lessons/${lessonId}/complete`,
      {}
    )
  },
}

// ============ Contact Services ============
export const contactService = {
  /**
   * Envoyer un message de contact
   */
  async sendMessage(data: {
    name: string
    email: string
    subject: string
    message: string
  }): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.contact.send, data)
  },
}






