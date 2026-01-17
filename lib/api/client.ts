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
      this.token = localStorage.getItem("auth_token")
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
   * Obtenir le token actuel
   */
  getToken(): string | null {
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

    // Ajouter le token d'authentification si disponible
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

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

      const data = await response.json()

      // Si la réponse n'a pas la structure ApiResponse, la wrapper
      if (!response.ok) {
        return {
          data: data,
          ok: false,
          ko: true,
          message: data.message || `HTTP error! status: ${response.status}`,
        }
      }

      // Si la réponse a déjà la structure ApiResponse, la retourner telle quelle
      if (typeof data === "object" && ("ok" in data || "ko" in data)) {
        return data as ApiResponse<T>
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
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
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

    // Ajouter le token d'authentification si disponible
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
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






