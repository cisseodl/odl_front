import { API_CONFIG } from "./config"
import { logger } from "../utils/logger"
import { createApiError, formatErrorForUser } from "../utils/error-handler"

/**
 * Réponse standard de l'API backend
 */
export interface ApiResponse<T = any> {
  data?: T
  ok: boolean
  ko: boolean
  message?: string
}

/**
 * Client API réutilisable avec gestion des tokens JWT
 */
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Récupérer le token depuis localStorage si disponible
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("auth_token")
      if (storedToken) {
        this.token = storedToken
      }
    }
  }

  /**
   * Définir le token d'authentification
   */
  setToken(token: string | null) {
    this.token = token
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token)
        console.log("👉 [API CLIENT] Token SET en localStorage:", token.substring(0, 30) + "...")
      } else {
        localStorage.removeItem("auth_token")
        console.log("👉 [API CLIENT] Token REMOVED de localStorage.")
      }
    }
  }

  /**
   * Obtenir le token actuel (depuis l'instance ou localStorage)
   * Toujours vérifier localStorage en priorité pour s'assurer d'avoir le token le plus récent
   */
  getToken(): string | null {
    // TOUJOURS vérifier localStorage en premier pour avoir le token le plus récent
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("auth_token")
      if (storedToken) {
        // Synchroniser avec l'instance
        this.token = storedToken
        return storedToken
      }
    }
    // Si pas de token dans localStorage, utiliser l'instance (peut être null)
    return this.token
  }

  /**
   * Construire l'URL complète
   */
  private buildURL(endpoint: string): string {
    // Si l'endpoint commence déjà par http, le retourner tel quel
    if (endpoint.startsWith("http")) {
      return endpoint
    }
    // Sinon, construire l'URL avec le baseURL
    const base = this.baseURL.endsWith("/") ? this.baseURL.slice(0, -1) : this.baseURL
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    return `${base}${path}`
  }

  /**
   * Obtenir le token actuel (depuis l'instance ou localStorage)
   * Toujours vérifier localStorage en priorité pour s'assurer d'avoir le token le plus récent
   */
  private getCurrentToken(): string | null {
    // TOUJOURS vérifier localStorage en premier pour avoir le token le plus récent
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("auth_token")
      if (storedToken) {
        // Synchroniser avec l'instance
        this.token = storedToken
        console.log("👈 [API CLIENT] Token GET depuis localStorage:", storedToken.substring(0, 30) + "...")
        return storedToken
      }
    }
    console.log("👈 [API CLIENT] Aucun token GET (retourne null).")
    // Si pas de token dans localStorage, utiliser l'instance (peut être null)
    return this.token
  }

  /**
   * Effectuer une requête HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint)
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    }

    // Récupérer le token actuel (depuis l'instance ou localStorage)
    const currentToken = this.getCurrentToken()
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`
      logger.api("Token trouvé et ajouté au header", { length: currentToken.length })
    } else {
      logger.warn("Aucun token trouvé dans localStorage ou instance")
      // Vérifier une dernière fois dans localStorage directement
      if (typeof window !== "undefined") {
        const directToken = localStorage.getItem("auth_token")
        if (directToken) {
          logger.api("Token trouvé directement dans localStorage, mise à jour")
          this.token = directToken
          headers["Authorization"] = `Bearer ${directToken}`
        }
      }
    }

    try {
      const finalToken = headers["Authorization"] ? "présent" : "absent"
      logger.api("Fetch request", { url, method: options.method, hasBody: !!options.body, token: finalToken })
      const response = await fetch(url, {
        ...options,
        headers,
      })
      logger.api("Response status", { status: response.status, statusText: response.statusText })

      // Gérer les réponses non-JSON (comme les fichiers)
      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return {
          data: await response.text() as any,
          ok: true,
          ko: false,
        }
      }

      // Gérer les erreurs HTTP avant de parser le JSON
      if (!response.ok) {
        // Essayer de parser le JSON pour obtenir le message d'erreur
        let errorMessage = `HTTP error! status: ${response.status}`
        let errorData: any = null
        
        try {
          const errorJson = await response.json()
          if (typeof errorJson === "object") {
            if ("message" in errorJson) {
              errorMessage = errorJson.message
            } else if ("error" in errorJson) {
              errorMessage = errorJson.error
            }
            errorData = errorJson
          }
        } catch (e) {
          // Si le parsing JSON échoue, utiliser le texte brut
          try {
            const errorText = await response.text()
            if (errorText) {
              errorMessage = errorText
            }
          } catch (textError) {
            // Ignorer les erreurs de parsing
          }
        }

        // Nettoyer le token uniquement sur 401 (Unauthorized), pas sur 403 (Forbidden).
        // Un 403 peut signifier "action interdite" sans invalider la session ; supprimer le token
        // à chaque 403 provoquait une déconnexion en ouvrant une fiche cours.
        if (response.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token")
            this.token = null
            window.dispatchEvent(new CustomEvent("auth:unauthorized"))
          }
        }

        return {
          data: errorData,
          ok: false,
          ko: true,
          message: errorMessage,
        }
      }

      const data = await response.json()

      // Le backend retourne toujours une structure CResponse avec { ok: boolean, data: T, message: string }
      // Vérifier si c'est une CResponse du backend
      if (typeof data === "object" && "ok" in data) {
        const cResponse = data as { ok: boolean; data?: any; message?: string }
        return {
          data: cResponse.data as T,
          ok: cResponse.ok,
          ko: !cResponse.ok,
          message: cResponse.message,
        }
      }

      // Sinon, wrapper la réponse
      return {
        data: data as T,
        ok: true,
        ko: false,
      }
    } catch (error) {
      console.error("API request error:", error)
      return {
        data: undefined,
        ok: false,
        ko: true,
        message: error instanceof Error ? error.message : "Une erreur est survenue",
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    return this.request<T>(url, { method: "GET" })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    logger.api("POST request", { endpoint })
    const bodyString = body ? JSON.stringify(body) : undefined
    return this.request<T>(endpoint, {
      method: "POST",
      body: bodyString,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    return this.request<T>(url, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  /**
   * POST request avec FormData (pour les uploads de fichiers)
   */
  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    additionalHeaders?: HeadersInit
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint)
    
    const headers: Record<string, string> = {
      ...(additionalHeaders as Record<string, string> || {}),
    }

    // Récupérer le token actuel (depuis l'instance ou localStorage)
    const currentToken = this.getCurrentToken()
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      })

      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return {
          data: await response.text() as any,
          ok: true,
          ko: false,
        }
      }

      const data = await response.json()

      if (!response.ok) {
        return {
          data: data,
          ok: false,
          ko: true,
          message: data.message || `HTTP error! status: ${response.status}`,
        }
      }

      if (typeof data === "object" && ("ok" in data || "ko" in data)) {
        return data as ApiResponse<T>
      }

      return {
        data: data as T,
        ok: true,
        ko: false,
      }
    } catch (error) {
      const apiError = createApiError(error)
      logger.error("API request error", apiError)
      return {
        data: undefined,
        ok: false,
        ko: true,
        message: apiError.message,
      }
    }
  }
}

// Instance singleton du client API
export const apiClient = new ApiClient(API_CONFIG.baseURL)






