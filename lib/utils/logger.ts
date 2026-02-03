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
   * Formate les objets pour une meilleure lisibilité
   */
  error: (...args: any[]) => {
    const formattedArgs = args.map(arg => {
      if (arg instanceof Error) {
        return {
          name: arg.name,
          message: arg.message,
          stack: arg.stack,
        }
      }
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2)
        } catch {
          return String(arg)
        }
      }
      return arg
    })
    console.error('[ERROR]', ...formattedArgs)
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
