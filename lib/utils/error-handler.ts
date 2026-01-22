/**
 * Gestion centralisée des erreurs API
 * Standardise les messages d'erreur pour une meilleure UX
 */

import { logger } from "./logger"

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

/**
 * Types d'erreurs standardisés
 */
export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

/**
 * Messages d'erreur standardisés par type
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: "Problème de connexion. Vérifiez votre connexion internet et réessayez.",
  [ErrorType.AUTHENTICATION]: "Votre session a expiré. Veuillez vous reconnecter.",
  [ErrorType.AUTHORIZATION]: "Vous n'avez pas les permissions nécessaires pour effectuer cette action.",
  [ErrorType.VALIDATION]: "Les données fournies sont invalides. Veuillez vérifier vos informations.",
  [ErrorType.NOT_FOUND]: "La ressource demandée est introuvable.",
  [ErrorType.SERVER]: "Une erreur serveur est survenue. Veuillez réessayer plus tard.",
  [ErrorType.UNKNOWN]: "Une erreur inattendue est survenue. Veuillez réessayer.",
}

/**
 * Détecter le type d'erreur à partir d'une réponse HTTP
 */
export function detectErrorType(status?: number, message?: string): ErrorType {
  if (!status) {
    return ErrorType.NETWORK
  }

  switch (status) {
    case 401:
      return ErrorType.AUTHENTICATION
    case 403:
      return ErrorType.AUTHORIZATION
    case 404:
      return ErrorType.NOT_FOUND
    case 400:
    case 422:
      return ErrorType.VALIDATION
    case 500:
    case 502:
    case 503:
      return ErrorType.SERVER
    default:
      return ErrorType.UNKNOWN
  }
}

/**
 * Créer un objet d'erreur standardisé
 */
export function createApiError(
  error: any,
  status?: number,
  defaultMessage?: string
): ApiError {
  const errorType = detectErrorType(status, error?.message)
  
  let message = defaultMessage || ERROR_MESSAGES[errorType]
  
  // Essayer d'extraire un message d'erreur plus spécifique
  if (error?.message && typeof error.message === 'string') {
    const errorMsg = error.message.toLowerCase()
    
    // Messages d'erreur spécifiques
    if (errorMsg.includes('bad credentials') || errorMsg.includes('invalid')) {
      message = "Email ou mot de passe incorrect."
    } else if (errorMsg.includes('not found') || errorMsg.includes('introuvable')) {
      message = "La ressource demandée est introuvable."
    } else if (errorMsg.includes('disabled') || errorMsg.includes('désactivé')) {
      message = "Votre compte a été désactivé. Veuillez contacter le support."
    } else if (errorMsg.includes('network') || errorMsg.includes('timeout') || errorMsg.includes('fetch')) {
      message = ERROR_MESSAGES[ErrorType.NETWORK]
    } else if (errorMsg.length < 200) {
      // Utiliser le message d'erreur si il n'est pas trop long
      message = error.message
    }
  }

  // Logger l'erreur
  logger.error("Erreur API:", {
    type: errorType,
    status,
    message,
    originalError: error,
  })

  return {
    message,
    code: errorType,
    status,
    details: error,
  }
}

/**
 * Formater une erreur pour l'affichage utilisateur
 */
export function formatErrorForUser(error: ApiError | Error | string): string {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return createApiError(error).message
  }

  return error.message || ERROR_MESSAGES[ErrorType.UNKNOWN]
}
