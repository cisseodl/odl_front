import { API_CONFIG } from "./config"

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
      } else {
        localStorage.removeItem("auth_token")
      }
    }
  }

  /**
   * Obtenir le token actuel (depuis l'instance ou localStorage)
   */
  getToken(): string | null {
    // D'abord vérifier l'instance
    if (this.token) {
      return this.token
    }
    // Sinon, récupérer depuis localStorage
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("auth_token")
      if (storedToken) {
        this.token = storedToken
        return storedToken
      }
    }
    return null
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
   */
  private getCurrentToken(): string | null {
    // D'abord vérifier l'instance
    if (this.token) {
      return this.token
    }
    // Sinon, récupérer depuis localStorage (pour les cas où le token a été mis à jour ailleurs)
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("auth_token")
      if (storedToken) {
        this.token = storedToken
        return storedToken
      }
    }
    return null
  }

  /**
   * Effectuer une requête HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint)
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    // Récupérer le token actuel (depuis l'instance ou localStorage)
    const currentToken = this.getCurrentToken()
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`
    }

    try {
      console.log("🌐 [HTTP] Fetch request:", { url, method: options.method, hasBody: !!options.body, hasToken: !!currentToken })
      const response = await fetch(url, {
        ...options,
        headers,
      })
      console.log("🌐 [HTTP] Response status:", response.status, response.statusText)

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

        // Gérer les erreurs 403 (Forbidden) - Token invalide ou expiré
        if (response.status === 403) {
          // Nettoyer le token invalide
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token")
            this.token = null
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
    console.log("🌐 [HTTP] POST request:", { endpoint, body })
    const bodyString = body ? JSON.stringify(body) : undefined
    console.log("🌐 [HTTP] Body stringifié:", bodyString)
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
    
    const headers: HeadersInit = {
      ...additionalHeaders,
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
      console.error("API request error:", error)
      return {
        data: undefined,
        ok: false,
        ko: true,
        message: error instanceof Error ? error.message : "Une erreur est survenue",
      }
    }
  }
}

// Instance singleton du client API
export const apiClient = new ApiClient(API_CONFIG.baseURL)






