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
import { serializeData } from "../utils/serialize"
import type { Course, User, Quiz, Lab } from "../types"
import type { ApiResponse } from "./client"
import { logger } from "../utils/logger"

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
        // Le backend retourne CResponse<List<CourseDto>> avec la structure { ok: true, data: [...], message: "..." }
        let courses: BackendCourse[] = []
        
        // Cas 1: response.data est directement un array
        if (Array.isArray(response.data)) {
          courses = response.data
        } 
        // Cas 2: response.data est un objet CResponse avec une propriété data
        else if (response.data && typeof response.data === 'object') {
          // Vérifier si c'est un CResponse avec { data: [...] }
          if ('data' in response.data && Array.isArray((response.data as any).data)) {
            courses = (response.data as any).data
          } 
          // Vérifier si response.data est un objet avec une propriété qui est un array
          else {
            // Chercher toutes les propriétés qui sont des arrays
            for (const key in response.data) {
              if (Array.isArray((response.data as any)[key])) {
                courses = (response.data as any)[key]
                break
              }
            }
          }
        }
        
        // Filtrer pour ne garder que les cours publiés (pour le frontend apprenant)
        const publishedCourses = courses.filter((course: any) => {
          // Si le statut n'est pas défini, considérer le cours comme publié (pour compatibilité)
          // Sinon, ne garder que les cours avec le statut "PUBLIE"
          return !course.status || course.status === "PUBLIE"
        })
        
        // Adapter les cours avec gestion optimisée des catégories
        const adaptedCourses = adaptCourses(publishedCourses)
        return adaptedCourses
      }
      
      logger.warn("Réponse invalide ou erreur", {
        ok: response.ok,
        ko: response.ko,
        message: response.message,
      })
      return []
    } catch (error) {
      logger.error("Erreur lors de la récupération des cours", error)
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
          logger.debug(`getCourseById(${id}): cours adapté`, {
            id: adapted.id,
            title: adapted.title,
            curriculumLength: adapted.curriculum?.length || 0,
          })
          return adapted
        }
      }
      
      // Logger l'erreur pour le débogage
      if (!response.ok) {
        logger.error(`getCourseById(${id}) failed:`, {
          status: response.ko ? "error" : "ok",
          message: response.message,
          data: response.data
        })
      }
      
      return null
    } catch (error) {
      logger.error(`Erreur lors de la récupération du cours ${id}:`, error)
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
    logger.debug("enrollInCourse appelé", { courseId, expectationsLength: expectations?.length })
    const body = expectations ? { expectations } : {}
    const endpoint = `${API_ENDPOINTS.courses.enroll}/${courseId}`
    const response = await apiClient.post(endpoint, body)
    logger.debug("Réponse reçue", { ok: response.ok, message: response.message })
    return response
  },

  /**
   * Ajouter un avis à un cours
   * POST /reviews/add/{courseId}
   * Body: { rating: number, comment: string }
   */
  async addReview(courseId: number, review: { rating: number; comment: string }): Promise<ApiResponse<any>> {
    const endpoint = `${API_ENDPOINTS.reviews.add}/${courseId}`;
    return apiClient.post(endpoint, { rating: review.rating, comment: review.comment });
  },
}

// ============ Review Services ============
export const reviewService = {
  async getReviewsByCourse(courseId: number): Promise<any[]> { // Return type should be more specific, e.g., Review[]
    try {
      const response = await apiClient.get<any>(`${API_ENDPOINTS.reviews.getByCourse}/${courseId}`);

      if (response.ok && response.data) {
        // Backend peut renvoyer la liste directement (response.data) ou dans .data / .content
        const raw = response.data as any
        let reviews = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.content)
              ? raw.content
              : [];
        
        // Normaliser les données pour éviter les erreurs de rendu
        reviews = reviews
          .filter((review: any) => review && typeof review === 'object' && review !== null)
          .map((review: any) => {
            // S'assurer que toutes les valeurs sont des primitives
            const normalizedId = review?.id !== null && review?.id !== undefined
              ? (typeof review.id === 'number' ? review.id : (typeof review.id === 'string' ? parseInt(review.id, 10) : null))
              : null;
            
            const normalizedRating = typeof review?.rating === 'number' && !isNaN(review.rating)
              ? Math.max(0, Math.min(5, review.rating))
              : 0;
            
            const normalizedComment = typeof review?.comment === 'string'
              ? review.comment
              : (review?.comment ? String(review.comment) : "");
            
            const normalizedCreatedAt = review?.createdAt !== null && review?.createdAt !== undefined
              ? (typeof review.createdAt === 'string' 
                  ? review.createdAt 
                  : (review.createdAt instanceof Date 
                      ? review.createdAt.toISOString() 
                      : String(review.createdAt)))
              : null;
            
            // Normaliser user - s'assurer que toutes les propriétés sont des primitives
            let normalizedUser = null;
            if (review?.user && typeof review.user === 'object' && review.user !== null) {
              normalizedUser = {
                id: review.user.id !== null && review.user.id !== undefined
                  ? (typeof review.user.id === 'number' ? review.user.id : (typeof review.user.id === 'string' ? parseInt(review.user.id, 10) : null))
                  : null,
                fullName: typeof review.user.fullName === 'string'
                  ? review.user.fullName
                  : (review.user.fullName ? String(review.user.fullName) : null),
                email: typeof review.user.email === 'string'
                  ? review.user.email
                  : (review.user.email ? String(review.user.email) : null),
                avatar: typeof review.user.avatar === 'string'
                  ? review.user.avatar
                  : (review.user.avatar ? String(review.user.avatar) : null),
              };
            }
            
            // Normaliser course
            let normalizedCourse = null;
            if (review?.course && typeof review.course === 'object' && review.course !== null) {
              normalizedCourse = {
                id: review.course.id !== null && review.course.id !== undefined
                  ? (typeof review.course.id === 'number' ? review.course.id : (typeof review.course.id === 'string' ? parseInt(review.course.id, 10) : null))
                  : null,
                title: typeof review.course.title === 'string'
                  ? review.course.title
                  : (review.course.title ? String(review.course.title) : null),
              };
            }
            
            return {
              id: normalizedId,
              rating: normalizedRating,
              comment: normalizedComment,
              createdAt: normalizedCreatedAt,
              user: normalizedUser,
              course: normalizedCourse,
            };
          })
          .filter((review: any) => review.id !== null); // Filtrer les reviews sans ID valide
        
        return reviews;
      }
      return [];
    } catch (error) {
      console.error("Error fetching reviews by course:", error);
      return [];
    }
  },

  /**
   * Ajouter un avis à un cours
   * POST /reviews/add/{courseId}
   * Body: { rating: number, comment: string }
   */
  async addReview(courseId: number, review: { rating: number; comment: string }): Promise<ApiResponse<any>> {
    const endpoint = `${API_ENDPOINTS.reviews.add}/${courseId}`;
    return apiClient.post(endpoint, { rating: review.rating, comment: review.comment });
  },
}

// ============ Testimonial Services ============
export const testimonialService = {
  async getAllTestimonials(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.testimonials.getAll);
      if (response.ok && response.data) {
        // Le backend retourne CResponse<List<TestimonialResponse>>
        // Structure: { ok: true, data: [...], message: "..." }
        const testimonials = Array.isArray(response.data)
          ? response.data
          : (response.data.data && Array.isArray(response.data.data) 
              ? response.data.data 
              : []);
        return testimonials;
      }
      return [];
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      return [];
    }
  },

  async addTestimonial(content: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.testimonials.save, { content });
      
      // Vérifier explicitement si la réponse est un succès
      if (!response.ok || response.ko) {
        console.error("Erreur lors de l'ajout du témoignage:", response);
        return {
          ...response,
          ok: false,
          ko: true,
          message: response.message || "Erreur lors de l'envoi du témoignage",
        };
      }
      
      return response;
    } catch (error: any) {
      console.error("Exception lors de l'ajout du témoignage:", error);
      return {
        data: undefined,
        ok: false,
        ko: true,
        message: error?.message || "Une erreur est survenue lors de l'envoi de votre témoignage.",
      };
    }
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
      
      logger.warn("getAllCategories: Aucune catégorie trouvée ou format de réponse inattendu", response)
      return []
    } catch (error) {
      logger.error("Erreur lors de la récupération des catégories:", error)
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
      console.log("🔵 [SERVICE] =========================================")
      console.log("🔵 [SERVICE] ===== DÉBUT getModulesByCourse =====")
      console.log("🔵 [SERVICE] Course ID:", courseId)
      console.log("🔵 [SERVICE] Endpoint:", `${API_ENDPOINTS.modules.getByCourse}/${courseId}`)
      
      // Vérifier le token JWT
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      console.log("🔵 [SERVICE] Token JWT présent:", token ? `OUI (${token.length} caractères)` : "NON")
      
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.modules.getByCourse}/${courseId}`
      )
      
      console.log("🔵 [SERVICE] ===== RÉPONSE DU BACKEND =====")
      console.log("🔵 [SERVICE] response.ok:", response.ok)
      console.log("🔵 [SERVICE] response.ko:", response.ko)
      console.log("🔵 [SERVICE] response.message:", response.message)
      console.log("🔵 [SERVICE] response.data type:", typeof response.data)
      console.log("🔵 [SERVICE] response.data isArray:", Array.isArray(response.data))
      if (response.data && typeof response.data === 'object') {
        console.log("🔵 [SERVICE] response.data keys:", Object.keys(response.data))
      }
      console.log("🔵 [SERVICE] Réponse complète:", JSON.stringify(response, null, 2))
      
      if (response.ok && response.data) {
        // Le backend retourne CResponse<List<Module>> avec data contenant la liste
        // Les entités Module sont sérialisées directement, donc contentUrl est présent dans les leçons
        let modules = Array.isArray(response.data) ? response.data : []
        
        console.log(`🔵 [SERVICE] Modules initiaux (après première extraction):`, {
          isArray: Array.isArray(modules),
          length: modules.length,
          modules: modules
        })
        
        // Si response.data n'est pas directement un array, chercher dans la structure
        if (!Array.isArray(modules) && response.data && typeof response.data === 'object') {
          console.log(`🔵 [SERVICE] Recherche d'un array dans response.data...`)
          // Chercher un array dans response.data
          for (const key in response.data) {
            if (Array.isArray((response.data as any)[key])) {
              console.log(`🔵 [SERVICE] Array trouvé dans response.data.${key}`)
              modules = (response.data as any)[key]
              break
            }
          }
        }
        
        // S'assurer que modules est un array
        if (!Array.isArray(modules)) {
          console.warn(`⚠️ [SERVICE] modules n'est pas un array, conversion en array vide`)
          modules = []
        }

        console.log(`🔵 [SERVICE] Modules finaux:`, {
          length: modules.length,
          modules: modules
        })

        // DEBUG: Log détaillé pour vérifier si contentUrl est présent dans les leçons
        if (modules.length > 0) {
          console.log(`📚 [SERVICE] ===== ANALYSE DES MODULES =====`)
          console.log(`📚 [SERVICE] Nombre de modules récupérés:`, modules.length)
          
          // Vérifier toutes les leçons, pas seulement les documents
          const allLessons = modules.flatMap((m: any) => m.lessons || [])
          console.log(`📚 [SERVICE] Total leçons trouvées dans tous les modules:`, allLessons.length)
          
          // Log détaillé pour chaque module
          modules.forEach((m: any, moduleIndex: number) => {
            console.log(`📦 [SERVICE] Module ${moduleIndex + 1}:`, {
              id: m.id,
              title: m.title,
              description: m.description,
              lessonsCount: m.lessons ? m.lessons.length : 0,
              lessons: m.lessons
            })
          })
          
          // Log détaillé pour chaque leçon
          console.log(`📚 [SERVICE] ===== ANALYSE DES LEÇONS =====`)
          allLessons.forEach((l: any, index: number) => {
            console.log(`📚 [SERVICE] Leçon ${index + 1}:`, {
              id: l.id,
              title: l.title,
              type: l.type,
              contentUrl: l.contentUrl,
              content_url: l.content_url,
              'content-url': l['content-url'],
              hasContentUrl: !!l.contentUrl,
              hasContent_url: !!l.content_url,
              hasContentDashUrl: !!l['content-url'],
              allKeys: Object.keys(l),
              rawLesson: l,
              rawLessonJSON: JSON.stringify(l)
            })
          })
          
          // Log spécifique pour les leçons document
          const documentLessons = allLessons.filter((l: any) => 
            l.type === "DOCUMENT" || l.type === "document" || 
            (l.type && l.type.toLowerCase() === "document")
          )
          if (documentLessons.length > 0) {
            console.log(`📄 [SERVICE] ===== LEÇONS DOCUMENT TROUVÉES: ${documentLessons.length} =====`)
            documentLessons.forEach((l: any) => {
              console.log(`📄 [SERVICE] Document leçon ID ${l.id}:`, {
                id: l.id,
                title: l.title,
                type: l.type,
                contentUrl: l.contentUrl,
                content_url: l.content_url,
                'content-url': l['content-url'],
                hasContentUrl: !!l.contentUrl,
                hasContent_url: !!l.content_url,
                hasContentDashUrl: !!l['content-url'],
                allKeys: Object.keys(l),
                rawData: l,
                rawDataJSON: JSON.stringify(l, null, 2)
              })
            })
          } else {
            console.warn(`⚠️ [SERVICE] Aucune leçon document trouvée dans les modules`)
          }
          
          console.log(`📚 [SERVICE] ===== FIN ANALYSE =====`)
        } else {
          // Un tableau vide peut être un cas légitime (cours sans modules, utilisateur non inscrit, etc.)
          // On log uniquement en debug pour éviter les warnings inutiles en production
          // Le warning n'est généré que si la réponse est OK mais vide, ce qui peut indiquer un problème de données
          logger.debug(`[SERVICE] Aucun module trouvé pour le cours ${courseId}. Cela peut être normal si le cours n'a pas encore de contenu.`)
        }
        
        console.log(`🔵 [SERVICE] ===== FIN getModulesByCourse =====`)
        // Sérialiser les modules pour éviter les erreurs React #185
        return serializeData(modules) as ModuleDto[]
      }
      
      // ============================================
      // GESTION DES ERREURS DE REPONSE DU BACKEND
      // ============================================
      if (!response.ok) {
        const errorMessage = String(response.message || "Une erreur inconnue est survenue")
        console.error("❌ [SERVICE] Réponse non OK du backend:", {
          courseId,
          ok: response.ok,
          ko: response.ko,
          message: errorMessage,
          data: response.data
        })
        
        // Cas spécifique : Utilisateur authentifié mais non inscrit (erreur métier)
        // Comparaison insensible à la casse (backend envoie "Vous", front peut tester "vous")
        if (errorMessage.toLowerCase().includes("vous devez vous inscrire")) {
          console.log("⚠️ [SERVICE] Utilisateur authentifié mais non inscrit. Lance une erreur pour la page learn.");
          throw new Error(errorMessage)
        }
        
        // Pour toutes les autres erreurs, on lance une exception pour React Query
        console.error("❌ [SERVICE] Erreur inattendue du backend, lance une exception.");
        throw new Error(errorMessage)
      }
      
      console.log("✅ [SERVICE] Réponse OK du backend - L'utilisateur EST INSCRIT")
      
      // Si la réponse est OK mais sans data, retourner un tableau vide (cours sans modules mais utilisateur inscrit)
      return []
    } catch (error: any) {
      // Si c'est une erreur déjà gérée (ex: non inscrit), elle aura été retournée ci-dessus
      // Ici, on gère les erreurs inattendues de type réseau ou autre
      const errorMessage = String(error?.message || "Erreur inconnue lors de la récupération des modules")
      
      console.error(`❌ [SERVICE] Erreur inattendue lors de la récupération des modules pour le cours ${courseId}:`, { error: error, message: errorMessage })
      
      // Lancer une erreur pour que React Query la gère (pour les erreurs vraiment inattendues)
      throw error
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
    if (!response.ok || !response.data) return []
    const payload = response.data as any
    const data = Array.isArray(payload) ? payload : payload?.data
    const quizzes = Array.isArray(data) ? data : []
    return quizzes.map(adaptQuiz)
  },

  /**
   * Obtenir un quiz par ID
   */
  async getQuizById(quizId: number): Promise<Quiz | null> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.quiz.getById}/${quizId}`
    )
    if (!response.ok) return null
    const data = (response.data as any)?.data ?? response.data
    if (data == null) return null
    const quiz = adaptQuiz(data as QuizDTO)
    if (!quiz.questions?.length) return null
    return quiz
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
      const labs = Array.isArray(response.data) ? response.data : []
      return labs.map((lab) => adaptLab(lab as LabDefinition))
    }
    return []
  },

  /**
   * Obtenir un lab par ID (GET /api/labs/{id})
   */
  async getLabById(labId: number | string): Promise<Lab | null> {
    const id = typeof labId === "string" ? String(labId).replace(/^\/+|\/+$/g, "") : String(labId)
    const response = await apiClient.get<any>(`${API_ENDPOINTS.labs.getAll}${id}`)
    if (!response.ok || !response.data) return null
    const raw = (response.data as any).data ?? response.data
    if (!raw || Array.isArray(raw) || raw.id == null) return null
    return adaptLab(raw as LabDefinition)
  },

  /**
   * Obtenir les labs d'un cours (via les leçons du cours).
   * Utilise la réponse brute de l'API pour conserver lesson/lessonId avant adaptation.
   */
  async getLabsByCourse(courseId: number, lessons: any[]): Promise<Lab[]> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.labs.getAll)
      if (!response.ok || !response.data) return []

      const payload = response.data
      const rawLabs = Array.isArray(payload)
        ? payload
        : (payload && Array.isArray((payload as any).data) ? (payload as any).data : [])
      const lessonIds = lessons.map((lesson: any) => {
        const id = typeof lesson.id === "string" ? parseInt(lesson.id, 10) : lesson.id
        return Number.isNaN(id) ? null : id
      }).filter((id: any) => id !== null) as number[]

      const filtered = rawLabs.filter((raw: any) => {
        const lid = raw.lesson?.id ?? raw.lessonId ?? (raw.lesson && typeof raw.lesson === "object" ? raw.lesson.id : null)
        const num = lid != null ? (typeof lid === "string" ? parseInt(lid, 10) : Number(lid)) : null
        return num != null && !Number.isNaN(num) && lessonIds.includes(num)
      })

      return filtered.map((lab: any) => adaptLab(lab, String(courseId)))
    } catch (error) {
      logger.error(`Erreur lors de la récupération des labs pour le cours ${courseId}:`, error)
      return []
    }
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

  /**
   * Soumettre un rapport de lab sans session RUNNING (fichier ou texte selon instructions).
   * POST /api/labs/submit-report/{labId}
   */
  async submitLabReport(labId: number, reportUrl: string): Promise<ApiResponse<LabSession>> {
    return apiClient.post(`${API_ENDPOINTS.labs.submitReport}/${labId}`, { reportUrl })
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
   * Obtenir l'examen d'un cours.
   * GET /api/evaluations/course/{courseId} ou .../course/{courseId}?examId=123
   * Si examId est fourni, le backend retourne cette évaluation (pour afficher le bon quiz côté apprenant).
   */
  async getCourseExam(courseId: number, examId?: number): Promise<ApiResponse<any>> {
    const url = examId != null
      ? `${API_ENDPOINTS.evaluations.getByCourse}/${courseId}?examId=${examId}`
      : `${API_ENDPOINTS.evaluations.getByCourse}/${courseId}`
    return apiClient.get(url)
  },

  /**
   * Obtenir toutes les évaluations d'un cours (y compris les TP)
   * GET /api/evaluations/get-all puis filtrer par courseId
   */
  async getEvaluationsByCourse(courseId: number): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.evaluations.getAll)
      
      if (response.ok && response.data) {
        const payload = response.data
        const evaluations = Array.isArray(payload)
          ? payload
          : (payload?.data && Array.isArray(payload.data) ? payload.data : [])
        return evaluations.filter((evaluation: any) => {
          const cid = evaluation.course?.id ?? evaluation.courseId
          return cid != null && (Number(cid) === Number(courseId) || String(cid) === String(courseId))
        })
      }
      return []
    } catch (error) {
      logger.error(`Erreur lors de la récupération des évaluations pour le cours ${courseId}:`, error)
      return []
    }
  },

  /**
   * Obtenir les TD (Travaux Dirigés) d'un cours — associés aux leçons.
   * Ne pas confondre avec l'examen de fin de cours (getCourseExam), qui est une évaluation type QUIZ sans leçon.
   */
  async getTPsByCourse(courseId: number): Promise<any[]> {
    try {
      const evaluations = await this.getEvaluationsByCourse(courseId)
      return evaluations.filter((evaluation: any) =>
        evaluation.type === "TP" ||
        evaluation.type === "tp" ||
        (evaluation.evaluationType && evaluation.evaluationType === "TP")
      )
    } catch (error) {
      logger.error(`Erreur lors de la récupération des TP pour le cours ${courseId}:`, error)
      return []
    }
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

  /**
   * Soumettre un TD (travail dirigé) : fichier et/ou texte selon les instructions de l'instructeur.
   * POST /api/evaluations/submit
   */
  async submitTP(
    evaluationId: number,
    payload: { submittedFileUrl?: string; submittedText?: string }
  ): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.evaluations.submit, {
      evaluationId,
      submittedFileUrl: payload.submittedFileUrl || undefined,
      submittedText: payload.submittedText || undefined,
    })
  },
}

/**
 * Upload d'un fichier (TD, Lab, etc.). Retourne l'URL du fichier ou null.
 */
export async function uploadFile(
  file: File,
  folderName: string = "submissions"
): Promise<string | null> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folderName", folderName)
  const response = await apiClient.postFormData<{ data?: string; success?: boolean }>(
    API_ENDPOINTS.files.upload,
    formData
  )
  if (!response.ok || !response.data) return null
  const url = (response.data as any)?.data ?? response.data
  return typeof url === "string" ? url : null
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
          totalInstructors: stats.totalInstructors || 0,
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
        totalInstructors: 0,
        mostViewedCourses: 0,
        satisfactionRate: 98,
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques publiques:", error)
      // Valeurs par défaut en cas d'erreur
      return {
        totalStudents: 0,
        totalCourses: 0,
        totalInstructors: 0,
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






