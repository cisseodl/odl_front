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
      console.log("📚 [COURSES] Début de getAllCourses, endpoint:", API_ENDPOINTS.courses.getAll)
      const response = await apiClient.get<{ data: BackendCourse[] } | BackendCourse[]>(
        API_ENDPOINTS.courses.getAll
      )
      
      console.log("📚 [COURSES] Réponse reçue:", {
        ok: response.ok,
        ko: response.ko,
        message: response.message,
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : null
      })
      
      if (response.ok && response.data) {
        // Le backend retourne CResponse<List<CourseDto>> avec la structure { ok: true, data: [...], message: "..." }
        let courses: BackendCourse[] = []
        
        // Cas 1: response.data est directement un array
        if (Array.isArray(response.data)) {
          courses = response.data
          console.log("📚 [COURSES] Données trouvées directement dans response.data (array)")
        } 
        // Cas 2: response.data est un objet CResponse avec une propriété data
        else if (response.data && typeof response.data === 'object') {
          // Vérifier si c'est un CResponse avec { data: [...] }
          if ('data' in response.data && Array.isArray((response.data as any).data)) {
            courses = (response.data as any).data
            console.log("📚 [COURSES] Données trouvées dans response.data.data (CResponse)")
          } 
          // Vérifier si response.data est un objet avec une propriété qui est un array
          else {
            // Chercher toutes les propriétés qui sont des arrays
            for (const key in response.data) {
              if (Array.isArray((response.data as any)[key])) {
                courses = (response.data as any)[key]
                console.log(`📚 [COURSES] Données trouvées dans response.data.${key}`)
                break
              }
            }
          }
        }
        
        console.log("📚 [COURSES] Nombre de cours récupérés:", courses.length)
        if (courses.length > 0) {
          console.log("📚 [COURSES] Premier cours:", {
            id: courses[0].id,
            title: courses[0].title,
            hasCurriculum: !!courses[0].curriculum,
            curriculumLength: courses[0].curriculum?.length || 0
          })
        } else {
          console.warn("📚 [COURSES] Aucun cours dans le tableau extrait")
        }
        
        const adaptedCourses = adaptCourses(courses)
        console.log("📚 [COURSES] Cours adaptés:", adaptedCourses.length)
        return adaptedCourses
      }
      
      console.warn("📚 [COURSES] Réponse invalide ou erreur:", {
        ok: response.ok,
        ko: response.ko,
        message: response.message,
        data: response.data
      })
      return []
    } catch (error) {
      console.error("📚 [COURSES] Erreur lors de la récupération des cours:", error)
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
        // Le backend peut retourner:
        // - CourseDto directement dans response.data
        // - CResponse<CourseDto> dans response.data (avec le cours dans response.data.data)
        // - CResponse enveloppé dans response.data.data (double enveloppe)
        let rawCourse: any = null

        // Cas 1: response.data.data est présent (CResponse)
        if (response.data && typeof response.data === "object" && (response.data as any).data) {
          rawCourse = (response.data as any).data
        } else {
          // Cas 2: response.data est directement le cours
          rawCourse = response.data
        }

        // Cas 3: double enveloppe (data.data)
        if (rawCourse && typeof rawCourse === "object" && (rawCourse as any).data) {
          rawCourse = (rawCourse as any).data
        }

        // Éviter les tableaux inattendus
        if (rawCourse && !Array.isArray(rawCourse)) {
          const adapted = adaptCourse(rawCourse as BackendCourse)
          // Log minimal pour vérifier la cohérence
          console.log(`getCourseById(${id}): cours adapté`, {
            id: adapted.id,
            title: adapted.title,
            curriculumLength: adapted.curriculum?.length || 0,
          })
          return adapted
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
   * S'inscrire à un cours avec attentes
   */
  async enrollInCourse(courseId: number, expectations?: string): Promise<ApiResponse<any>> {
    console.log("📡 [API] enrollInCourse appelé:", { courseId, expectations, expectationsLength: expectations?.length })
    const body = expectations ? { expectations } : {}
    console.log("📡 [API] Body de la requête:", body)
    const endpoint = `${API_ENDPOINTS.courses.enroll}/${courseId}`
    console.log("📡 [API] Endpoint:", endpoint)
    const response = await apiClient.post(endpoint, body)
    console.log("📡 [API] Réponse reçue:", { ok: response.ok, message: response.message, hasData: !!response.data })
    return response
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
        // Le backend retourne CResponse<List<Module>> avec data contenant la liste
        // Les entités Module sont sérialisées directement, donc contentUrl est présent dans les leçons
        const modules = Array.isArray(response.data) ? response.data : []
        
        // Log pour vérifier si contentUrl est présent dans les leçons
        if (modules.length > 0 && modules[0]?.lessons?.length > 0) {
          const firstLesson = modules[0].lessons[0]
          console.log(`getModulesByCourse(${courseId}): Exemple de leçon brute:`, {
            title: firstLesson.title,
            type: firstLesson.type,
            contentUrl: firstLesson.contentUrl,
            allKeys: Object.keys(firstLesson)
          })
        }
        
        console.log(`getModulesByCourse(${courseId}): ${modules.length} modules récupérés`)
        return modules
      }
      
      // Si la réponse indique une erreur, vérifier si c'est une erreur d'inscription
      if (!response.ok && response.message) {
        const errorMessage = String(response.message)
        const isEnrollmentError = errorMessage.includes("inscrire") || 
                                  errorMessage.includes("inscription") || 
                                  errorMessage.includes("inscrit") ||
                                  errorMessage.includes("authentifié")
        
        console.error(`getModulesByCourse(${courseId}) failed:`, {
          status: response.ko ? "error" : "ok",
          message: response.message,
          isEnrollmentError: isEnrollmentError
        })
        
        // Si c'est une erreur d'inscription, lancer une erreur pour que React Query la gère
        if (isEnrollmentError) {
          throw new Error(response.message || "Vous devez vous inscrire à ce cours pour accéder aux modules")
        }
      }
      
      // Si ce n'est pas une erreur d'inscription, retourner un tableau vide
      return []
    } catch (error: any) {
      // Si c'est une erreur d'inscription, la re-lancer
      const errorMessage = String(error?.message || "")
      const isEnrollmentError = errorMessage.includes("inscrire") || 
                                errorMessage.includes("inscription") || 
                                errorMessage.includes("inscrit") ||
                                errorMessage.includes("authentifié")
      
      if (isEnrollmentError) {
        console.error(`getModulesByCourse(${courseId}): Erreur d'inscription détectée`)
        throw error
      }
      
      // Autre erreur, logger et retourner un tableau vide
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

// ============ ODC Formations Services ============
// ============ Evaluation (Exam) Services ============
export const evaluationService = {
  /**
   * Obtenir l'examen d'un cours
   * GET /api/evaluations/course/{courseId}
   */
  async getCourseExam(courseId: number): Promise<ApiResponse<any>> {
    return apiClient.get(`${API_ENDPOINTS.evaluations.getByCourse}/${courseId}`)
  },

  /**
   * Soumettre une tentative d'examen
   * POST /api/evaluations/submit
   */
  async submitExam(evaluationId: number, answers: Record<number, number | string>): Promise<ApiResponse<any>> {
    // Convertir les réponses au format attendu par le backend (Map<Long, Long> et Map<Long, String>)
    const answersMap: Record<string, number> = {}
    const textAnswersMap: Record<string, string> = {}
    
    Object.entries(answers).forEach(([questionId, answer]) => {
      const qId = Number.parseInt(questionId)
      if (typeof answer === 'number') {
        answersMap[qId.toString()] = answer
      } else {
        textAnswersMap[qId.toString()] = answer
      }
    })

    return apiClient.post(API_ENDPOINTS.evaluations.submit, {
      evaluationId,
      answers: answersMap,
      textAnswers: textAnswersMap,
    })
  },

  /**
   * Soumettre la satisfaction après l'examen
   * POST /api/evaluations/attempts/{attemptId}/satisfaction
   */
  async submitSatisfaction(attemptId: number, satisfaction: string, rating?: number): Promise<ApiResponse<any>> {
    const body: { satisfaction: string; rating?: number } = { satisfaction }
    if (rating !== undefined) {
      body.rating = rating
    }
    return apiClient.post(`${API_ENDPOINTS.evaluations.submitSatisfaction}/${attemptId}/satisfaction`, body)
  },

  /**
   * Récupérer les résultats d'un examen
   * GET /api/evaluations/attempts/{attemptId}/results
   */
  async getExamResults(attemptId: number): Promise<ApiResponse<any>> {
    return apiClient.get(`${API_ENDPOINTS.evaluations.getResults}/${attemptId}/results`)
  },
}

export const odcFormationService = {
  /**
   * Obtenir toutes les formations ODC
   * GET /api/odc-formations
   */
  async getAllFormations(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.odcFormations.getAll)
      
      if (response.ok && response.data) {
        // Le backend retourne CResponse<List<OdcFormationDto>>
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data
        }
        if (Array.isArray(response.data)) {
          return response.data
        }
      }
      
      // Toujours retourner un tableau pour éviter les erreurs .filter() sur undefined
      return []
    } catch (error) {
      console.error("Erreur lors de la récupération des formations ODC:", error)
      // Toujours retourner un tableau vide en cas d'erreur
      return []
    }
  },

  /**
   * Obtenir une formation ODC par ID
   * GET /api/odc-formations/{id}
   */
  async getFormationById(id: number): Promise<any | null> {
    try {
      const response = await apiClient.get<any>(`${API_ENDPOINTS.odcFormations.getById}/${id}`)
      
      if (response.ok && response.data) {
        if (response.data.data) {
          return response.data.data
        }
        return response.data
      }
      
      return null
    } catch (error) {
      console.error("Erreur lors de la récupération de la formation ODC:", error)
      return null
    }
  },

  /**
   * Créer une nouvelle formation ODC
   * POST /api/odc-formations
   */
  async createFormation(data: { titre: string; description: string; lien: string }): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.odcFormations.create, data)
  },

  /**
   * Mettre à jour une formation ODC
   * PUT /api/odc-formations/{id}
   */
  async updateFormation(id: number, data: { titre: string; description: string; lien: string }): Promise<ApiResponse<any>> {
    return apiClient.put(`${API_ENDPOINTS.odcFormations.update}/${id}`, data)
  },

  /**
   * Supprimer une formation ODC
   * DELETE /api/odc-formations/{id}
   */
  async deleteFormation(id: number): Promise<ApiResponse<any>> {
    return apiClient.delete(`${API_ENDPOINTS.odcFormations.delete}/${id}`)
  },

  /**
   * Obtenir les formations créées par l'admin actuel
   * GET /api/odc-formations/my-formations
   */
  async getMyFormations(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.odcFormations.myFormations)
      
      if (response.ok && response.data) {
        if (Array.isArray(response.data)) {
          return response.data
        }
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data
        }
      }
      
      return []
    } catch (error) {
      console.error("Erreur lors de la récupération de mes formations ODC:", error)
      return []
    }
  },
}

// ============ Dashboard Services ============
export const dashboardService = {

  /**
   * Obtenir les statistiques publiques pour la page d'accueil
   * Calcule les stats à partir des données disponibles
   */
  /**
   * Obtenir les statistiques publiques pour la page d'accueil
   * GET /api/dashboard/public-stats
   * Le backend retourne CResponse<Map<String, Object>>
   */
  async getPublicStats(): Promise<PublicStats> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.dashboard.publicStats)
      
      console.log("getPublicStats - Response complète:", response)
      
      if (response.ok && response.data) {
        // Le backend retourne CResponse<Map<String, Object>>
        let stats: any = {}
        
        if (response.data.data && typeof response.data.data === 'object') {
          // Si c'est un CResponse, extraire le data
          stats = response.data.data
        } else if (typeof response.data === 'object' && 'totalStudents' in response.data) {
          // Si response.data est directement l'objet stats
          stats = response.data
        }
        
        console.log("getPublicStats - Stats extraites:", stats)
        
        const result = {
          totalStudents: stats.totalStudents || 0,
          totalCourses: stats.totalCourses || 0,
          mostViewedCourses: stats.mostViewedCourses || 0,
          satisfactionRate: stats.satisfactionRate || 98,
        }
        
        console.log("getPublicStats - Résultat final:", result)
        return result
      }
      
      // Valeurs par défaut en cas d'erreur
      return {
        totalStudents: 0,
        totalCourses: 0,
        mostViewedCourses: 0,
        satisfactionRate: 98,
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques publiques:", error)
      // Valeurs par défaut en cas d'erreur
      return {
        totalStudents: 0,
        totalCourses: 0,
        mostViewedCourses: 0,
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

  /**
   * Obtenir l'activité récente de l'utilisateur (dernières leçons complétées)
   * GET /api/learn/recent-activity
   */
  /**
   * Obtenir l'activité récente de l'apprenant
   * GET /api/learn/recent-activity?limit={limit}
   * Le backend retourne CResponse<List<Map<String, Object>>>
   */
  async getRecentActivity(limit: number = 3): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.learner.getRecentActivity}?limit=${limit}`
      )
      
      if (response.ok && response.data) {
        // Le backend retourne CResponse<List<Map<String, Object>>>
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
          return Array.isArray(data) ? data : []
        }
      }
      
      return []
    } catch (error) {
      console.error("Erreur lors de la récupération de l'activité récente:", error)
      return []
    }
  },

  /**
   * Obtenir la progression d'apprentissage par période (week, month, year)
   * GET /api/learn/learning-progress?period=week|month|year
   * Le backend retourne CResponse<List<Map<String, Object>>>
   */
  async getLearningProgress(period: "week" | "month" | "year" = "week"): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.learner.getLearningProgress}?period=${period}`
      )
      
      if (response.ok && response.data) {
        // Le backend retourne CResponse<List<Map<String, Object>>>
        // Les données peuvent être dans response.data (si c'est directement un array)
        // ou dans response.data.data (si c'est une CResponse)
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
          return Array.isArray(data) ? data : []
        }
      }
      
      return []
    } catch (error) {
      console.error("Erreur lors de la récupération de la progression:", error)
      return []
    }
  },

  /**
   * Obtenir les échéances à venir (quiz non complétés)
   * GET /api/learn/upcoming-deadlines
   * Le backend retourne CResponse<List<Map<String, Object>>>
   */
  async getUpcomingDeadlines(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.learner.getUpcomingDeadlines
      )
      
      if (response.ok && response.data) {
        // Le backend retourne CResponse<List<Map<String, Object>>>
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
          return Array.isArray(data) ? data : []
        }
      }
      
      return []
    } catch (error) {
      console.error("Erreur lors de la récupération des échéances:", error)
      return []
    }
  },

  /**
   * Obtenir les prochaines étapes suggérées
   * GET /api/learn/next-steps
   * Le backend retourne CResponse<List<Map<String, Object>>>
   */
  async getNextSteps(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.learner.getNextSteps
      )
      
      if (response.ok && response.data) {
        // Le backend retourne CResponse<List<Map<String, Object>>>
        let data: any[] = []
        
        if (Array.isArray(response.data)) {
          data = response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Si c'est un CResponse, extraire le data
          data = response.data.data
        } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          // Si response.data est un objet avec une propriété data qui est un array
          const extractedData = (response.data as any).data
          data = Array.isArray(extractedData) ? extractedData : []
        }
        
        console.log("getNextSteps: Données récupérées:", data)
        return data
      }
      
      console.warn("getNextSteps: Aucune donnée dans la réponse")
      return []
    } catch (error) {
      console.error("Erreur lors de la récupération des prochaines étapes:", error)
      return []
    }
  },
}

// ============ Details Course Services ============
export const detailsCourseService = {
  /**
   * Obtenir les cours complétés de l'utilisateur authentifié
   * GET /details-course/my-completed-courses
   */
  async getMyCompletedCourses(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.detailsCourse.getMyCompletedCourses
      )
      
      if (response.ok && response.data) {
        const data = Array.isArray(response.data) ? response.data : []
        return data
      }
      
      return []
    } catch (error) {
      console.error("Erreur lors de la récupération des cours complétés:", error)
      return []
    }
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






