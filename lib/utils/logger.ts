/**
 * Logger centralisé pour remplacer console.log
 * Désactive automatiquement les logs en production
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * Log d'information
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args)
    }
  },

  /**
   * Log d'erreur (toujours affiché)
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
  },

  /**
   * Log d'avertissement
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args)
    }
  },

  /**
   * Log de débogage (uniquement en développement)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args)
    }
  },

  /**
   * Log pour les requêtes API (uniquement en développement)
   */
  api: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[API]', ...args)
    }
  },
}
