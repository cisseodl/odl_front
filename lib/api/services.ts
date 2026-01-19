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
  ModuleDto,
  ApprenantCreateRequest,
  ApprenantUpdateRequest,
  Apprenant,
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
   * Le backend retourne CResponse<List<CourseDto>> avec les modules et leçons inclus
   */
  async getAllCourses(): Promise<Course[]> {
    try {
      const response = await apiClient.get<{ data: BackendCourse[] } | BackendCourse[]>(
        API_ENDPOINTS.courses.getAll
      )
      
      if (response.ok && response.data) {
        // Le backend peut retourner soit directement un array, soit dans { data: [...] }
        let courses: BackendCourse[] = []
        
        if (Array.isArray(response.data)) {
          courses = response.data
        } else if (response.data && typeof response.data === 'object') {
          // Si c'est un CResponse, extraire le data
          if ('data' in response.data && Array.isArray((response.data as any).data)) {
            courses = (response.data as any).data
          } else if (Array.isArray((response.data as any))) {
            courses = response.data as BackendCourse[]
          }
        }
        
        console.log("getAllCourses: Nombre de cours récupérés:", courses.length)
        if (courses.length > 0) {
          console.log("getAllCourses: Premier cours:", {
            id: courses[0].id,
            title: courses[0].title,
            hasCurriculum: !!courses[0].curriculum,
            curriculumLength: courses[0].curriculum?.length || 0
          })
        }
        
        return adaptCourses(courses)
      }
      
      console.warn("getAllCourses: Aucun cours trouvé ou réponse invalide", response)
      return []
    } catch (error) {
      console.error("Erreur lors de la récupération des cours:", error)
      return []
    }
  },

  /**
   * Obtenir un cours par ID
   * Le backend retourne CResponse<CourseDto>
   */
  async getCourseById(id: number): Promise<Course | null> {
    try {
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.courses.getById}/${id}`
      )
      
      if (response.ok && response.data) {
        // Le backend retourne CResponse<CourseDto> avec data contenant le cours
        const course = Array.isArray(response.data)
          ? null
          : response.data
        
        if (course) {
          return adaptCourse(course as BackendCourse)
        }
      }
      
      // Logger l'erreur pour le débogage
      if (!response.ok) {
        console.error(`getCourseById(${id}) failed:`, {
          status: response.ko ? "error" : "ok",
          message: response.message,
          data: response.data
        })
      }
      
      return null
    } catch (error) {
      console.error(`Erreur lors de la récupération du cours ${id}:`, error)
      return null
    }
  },

  /**
   * Obtenir les cours par catégorie
   * Le backend retourne CResponse<List<CourseDto>>
   */
  async getCoursesByCategory(catId: number): Promise<Course[]> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.courses.getByCategory}/${catId}`
    )
    
    if (response.ok && response.data) {
      // Le backend retourne CResponse<List<CourseDto>> avec data contenant la liste
      const courses = Array.isArray(response.data)
        ? response.data
        : []
      
      return adaptCourses(courses as BackendCourse[])
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
   * Le backend retourne CResponse<List<Categorie>>
   */
  async getAllCategories(): Promise<BackendCategorie[]> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.categories.getAll)
      
      if (response.ok && response.data) {
        // Le backend retourne CResponse<List<Categorie>> avec data contenant la liste
        // response.data peut être directement un array ou dans response.data.data
        if (Array.isArray(response.data)) {
          return response.data
        }
        // Si c'est un CResponse, extraire le data
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data
        }
        // Si response.data est un objet avec une propriété data qui est un array
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          const data = (response.data as any).data
          if (Array.isArray(data)) {
            return data
          }
        }
      }
      
      console.warn("getAllCategories: Aucune catégorie trouvée ou format de réponse inattendu", response)
      return []
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error)
      return []
    }
  },

  /**
   * Obtenir une catégorie par ID
   * Le backend retourne CResponse<Categorie>
   */
  async getCategoryById(id: number): Promise<BackendCategorie | null> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.categories.getById}/${id}`
    )
    
    if (response.ok && response.data) {
      // Le backend retourne CResponse<Categorie> avec data contenant la catégorie
      return Array.isArray(response.data) ? null : response.data
    }
    
    return null
  },
}

// ============ Module Services ============
export const moduleService = {
  /**
   * Obtenir les modules d'un cours
   * Le backend retourne CResponse<List<ModuleDto>>
   */
  async getModulesByCourse(courseId: number): Promise<ModuleDto[]> {
    try {
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.modules.getByCourse}/${courseId}`
      )
      
      if (response.ok && response.data) {
        // Le backend retourne CResponse<List<ModuleDto>> avec data contenant la liste
        const modules = Array.isArray(response.data) ? response.data : []
        console.log(`getModulesByCourse(${courseId}): ${modules.length} modules récupérés`)
        return modules
      }
      
      // Logger l'erreur pour le débogage
      if (!response.ok) {
        console.error(`getModulesByCourse(${courseId}) failed:`, {
          status: response.ko ? "error" : "ok",
          message: response.message,
          data: response.data
        })
      }
      
      return []
    } catch (error) {
      console.error(`Erreur lors de la récupération des modules pour le cours ${courseId}:`, error)
      return []
    }
  },
}

// ============ Quiz Services ============
export const quizService = {
  /**
   * Obtenir les quiz d'un cours
   */
  async getQuizzesByCourse(courseId: number): Promise<Quiz[]> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.quiz.getByCourse}/${courseId}`
    )
    
    if (response.ok && response.data) {
      // Le backend retourne CResponse<List<QuizDTO>>
      const data = (response.data as any).data || response.data
      const quizzes = Array.isArray(data) ? data : []
      
      return quizzes.map(adaptQuiz)
    }
    
    return []
  },

  /**
   * Obtenir un quiz par ID
   */
  async getQuizById(quizId: number): Promise<Quiz | null> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.quiz.getById}/${quizId}`
    )
    
    if (response.ok && response.data) {
      const data = (response.data as any).data || response.data
      return adaptQuiz(data as QuizDTO)
    }
    
    return null
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
   * Le backend retourne CResponse<List<LabDefinition>>
   */
  async getAllLabs(): Promise<Lab[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.labs.getAll)
    
    if (response.ok && response.data) {
      // Le backend retourne CResponse<List<LabDefinition>> avec data contenant la liste
      const labs = Array.isArray(response.data) ? response.data : []
      
      return labs.map((lab) => adaptLab(lab as LabDefinition))
    }
    
    return []
  },

  /**
   * Obtenir mes sessions de lab
   * Le backend retourne CResponse<List<LabSession>>
   */
  async getMySessions(): Promise<LabSession[]> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.labs.getMySessions
    )
    
    if (response.ok && response.data) {
      // Le backend retourne CResponse<List<LabSession>> avec data contenant la liste
      return Array.isArray(response.data) ? response.data : []
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

// ============ Rubrique Services ============
export const rubriqueService = {
  /**
   * Obtenir toutes les rubriques (piliers)
   * Le backend retourne CResponse<List<Rubrique>>
   */
  async getAllRubriques(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.rubriques.getAll)
      
      if (response.ok && response.data) {
        // Le backend retourne CResponse<List<Rubrique>> avec data contenant la liste
        if (Array.isArray(response.data)) {
          return response.data
        }
        // Si c'est un CResponse, extraire le data
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data
        }
        // Si response.data est un objet avec une propriété data qui est un array
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          const data = (response.data as any).data
          if (Array.isArray(data)) {
            return data
          }
        }
      }
      
      console.warn("getAllRubriques: Aucune rubrique trouvée ou format de réponse inattendu", response)
      return []
    } catch (error) {
      console.error("Erreur lors de la récupération des rubriques:", error)
      return []
    }
  },

  /**
   * Obtenir une rubrique par ID
   */
  async getRubriqueById(id: number): Promise<any | null> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.rubriques.getById}/${id}`
    )
    
    if (response.ok && response.data) {
      // Le backend retourne CResponse<Rubrique> avec data contenant la rubrique
      return Array.isArray(response.data) ? null : response.data
    }
    
    return null
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
  
  /**
   * Obtenir le dashboard étudiant
   * Le backend retourne CResponse<DashboardStatsDTO>
   */
  async getStudentDashboard(): Promise<DashboardStatsDTO | null> {
    const response = await apiClient.get<any>(API_ENDPOINTS.dashboard.student)
    if (response.ok && response.data) {
      // Le backend retourne CResponse<DashboardStatsDTO> avec data contenant les stats
      return response.data as DashboardStatsDTO
    }
    return null
  },
  
  /**
   * Obtenir le dashboard instructeur
   * Le backend retourne CResponse<DashboardStatsDTO>
   */
  async getInstructorDashboard(): Promise<DashboardStatsDTO | null> {
    const response = await apiClient.get<any>(API_ENDPOINTS.dashboard.instructor)
    if (response.ok && response.data) {
      // Le backend retourne CResponse<DashboardStatsDTO> avec data contenant les stats
      return response.data as DashboardStatsDTO
    }
    return null
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
   * Le backend retourne CResponse<List<ApprenantWithUserDto>>
   */
  async getAllApprenants(): Promise<Apprenant[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.apprenants.getAll)
    
    if (response.ok && response.data) {
      // Le backend retourne CResponse<List<ApprenantWithUserDto>> avec data contenant la liste
      return Array.isArray(response.data) ? response.data : []
    }
    
    return []
  },

  /**
   * Obtenir un apprenant par ID
   * Le backend retourne CResponse<ApprenantWithUserDto>
   */
  async getApprenantById(id: number): Promise<Apprenant | null> {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.apprenants.getById}/${id}`)
    
    if (response.ok && response.data) {
      // Le backend retourne CResponse<ApprenantWithUserDto> avec data contenant l'apprenant
      return response.data as Apprenant
    }
    
    return null
  },

  /**
   * Mettre à jour un apprenant
   * Le backend attend un @RequestBody User et des @RequestParam pour les champs apprenant
   */
  async updateApprenant(
    id: number,
    data: ApprenantUpdateRequest
  ): Promise<ApiResponse<any>> {
    const { userDetails, ...apprenantParams } = data
    
    // Préparer les query params pour les champs apprenant
    const params: Record<string, any> = {}
    if (apprenantParams.username !== undefined) params.username = apprenantParams.username
    if (apprenantParams.numero !== undefined) params.numero = apprenantParams.numero
    if (apprenantParams.profession !== undefined) params.profession = apprenantParams.profession
    if (apprenantParams.niveauEtude !== undefined) params.niveauEtude = apprenantParams.niveauEtude
    if (apprenantParams.filiere !== undefined) params.filiere = apprenantParams.filiere
    if (apprenantParams.attentes !== undefined) params.attentes = apprenantParams.attentes
    if (apprenantParams.satisfaction !== undefined) params.satisfaction = apprenantParams.satisfaction
    if (apprenantParams.cohorteId !== undefined) params.cohorteId = apprenantParams.cohorteId

    // Envoyer userDetails dans le body et les autres champs en query params
    return apiClient.put(
      `${API_ENDPOINTS.apprenants.update}/${id}`,
      userDetails || {},
      params
    )
  },

  /**
   * Supprimer un apprenant (admin seulement)
   */
  async deleteApprenant(id: number): Promise<ApiResponse<any>> {
    return apiClient.delete(`${API_ENDPOINTS.apprenants.delete}/${id}`)
  },

  /**
   * Obtenir les apprenants par cohorte avec pagination
   */
  async getApprenantsByCohorte(
    cohorteId: number,
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<any>> {
    return apiClient.get(
      `${API_ENDPOINTS.apprenants.getByCohorte}/${cohorteId}/${page}/${size}`
    )
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
   * Le backend retourne CResponse<Cohorte>
   */
  async getCohorteById(id: number): Promise<Cohorte | null> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.cohortes.getById}/${id}`
    )
    
    if (response.ok && response.data) {
      // Le backend retourne CResponse<Cohorte> avec data contenant la cohorte
      return Array.isArray(response.data) ? null : response.data
    }
    
    return null
  },
}

// ============ Profile Services ============
export const profileService = {
  /**
   * Obtenir le profil de l'utilisateur authentifié
   * Le backend retourne ResponseEntity<ProfileDto> (pas CResponse)
   */
  async getMyProfile(): Promise<ProfileDto | null> {
    const response = await apiClient.get<any>(API_ENDPOINTS.profile.me)
    
    if (response.ok && response.data) {
      // Le backend retourne directement ProfileDto dans ResponseEntity
      return response.data as ProfileDto
    }
    
    return null
  },
}

// ============ Certificate Services ============
export const certificateService = {
  /**
   * Obtenir les certificats de l'utilisateur authentifié
   * Le backend retourne CResponse<List<CertificateDto>>
   */
  async getMyCertificates(): Promise<CertificateDto[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.certificates.myCertificates)
    
    if (response.ok && response.data) {
      // Le backend retourne CResponse<List<CertificateDto>> avec data contenant la liste
      const data = Array.isArray(response.data) ? response.data : []
      return data as CertificateDto[]
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
   * POST /api/learn/{courseId}/lessons/{lessonId}/complete
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






