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
   */
  async signup(
    userData: string, // JSON stringifié selon l'API
    avatar?: File
  ): Promise<ApiResponse<JwtAuthenticationResponse>> {
    if (avatar) {
      const formData = new FormData()
      formData.append("avatar", avatar)
      formData.append("user", userData)

      const response = await apiClient.postFormData<JwtAuthenticationResponse>(
        `${API_ENDPOINTS.auth.signup}?user=${encodeURIComponent(userData)}`,
        formData
      )

      if (response.ok && response.data?.token) {
        apiClient.setToken(response.data.token)
      }

      return response
    } else {
      const response = await apiClient.post<JwtAuthenticationResponse>(
        `${API_ENDPOINTS.auth.signup}?user=${encodeURIComponent(userData)}`,
        {}
      )

      if (response.ok && response.data?.token) {
        apiClient.setToken(response.data.token)
      }

      return response
    }
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
   */
  async getAllCourses(): Promise<Course[]> {
    const response = await apiClient.get<BackendCourse[]>(API_ENDPOINTS.courses.getAll)
    
    if (response.ok && response.data) {
      return adaptCourses(response.data)
    }
    
    return []
  },

  /**
   * Obtenir un cours par ID
   */
  async getCourseById(id: number): Promise<Course | null> {
    const response = await apiClient.get<BackendCourse>(`${API_ENDPOINTS.courses.getById}/${id}`)
    
    if (response.ok && response.data) {
      return adaptCourse(response.data)
    }
    
    return null
  },

  /**
   * Obtenir les cours par catégorie
   */
  async getCoursesByCategory(catId: number): Promise<Course[]> {
    const response = await apiClient.get<BackendCourse[]>(
      `${API_ENDPOINTS.courses.getByCategory}/${catId}`
    )
    
    if (response.ok && response.data) {
      return adaptCourses(response.data)
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
   * Obtenir les statistiques du dashboard
   */
  async getSummary(): Promise<DashboardStatsDTO | null> {
    const response = await apiClient.get<{ data: DashboardStatsDTO }>(
      API_ENDPOINTS.dashboard.summary
    )
    
    if (response.ok && response.data) {
      return Array.isArray(response.data)
        ? null
        : response.data.data || response.data
    }
    
    return null
  },
}




