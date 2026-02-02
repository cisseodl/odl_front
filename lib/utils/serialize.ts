/**
 * Utilitaires pour sérialiser les données non sérialisables
 * Évite les erreurs React #185 liées aux objets Date, Map, etc.
 */

/**
 * Sérialise récursivement un objet pour éviter les erreurs de sérialisation
 * Gère les références circulaires et les objets non sérialisables
 */
export function serializeData<T>(data: T, visited = new WeakSet()): T {
  if (data === null || data === undefined) {
    return data
  }
  
  // Gérer les primitives
  if (typeof data !== 'object') {
    return data
  }
  
  // Détecter les références circulaires
  if (visited.has(data as object)) {
    return null as unknown as T // Retourner null pour les références circulaires
  }
  
  visited.add(data as object)
  
  try {
    if (data instanceof Date) {
      return data.toISOString() as unknown as T
    }
    
    if (data instanceof Map) {
      return Object.fromEntries(data) as unknown as T
    }
    
    if (data instanceof Set) {
      return Array.from(data) as unknown as T
    }
    
    // Gérer les fonctions (ne pas les sérialiser)
    if (typeof data === 'function') {
      return undefined as unknown as T
    }
    
    if (Array.isArray(data)) {
      return data.map(item => serializeData(item, visited)) as unknown as T
    }
    
    // Gérer les objets simples
    if (typeof data === 'object' && data.constructor === Object) {
      const serialized: any = {}
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          try {
            const value = (data as any)[key]
            // Ignorer les fonctions
            if (typeof value !== 'function') {
              serialized[key] = serializeData(value, visited)
            }
          } catch (error) {
            // En cas d'erreur, ignorer cette propriété
            console.warn(`Erreur lors de la sérialisation de la propriété ${key}:`, error)
          }
        }
      }
      return serialized as T
    }
    
    // Pour les autres types d'objets (classes, etc.), essayer de les convertir en objet simple
    try {
      const jsonString = JSON.stringify(data)
      const parsed = JSON.parse(jsonString)
      return serializeData(parsed, visited) as T
    } catch (error) {
      // Si la sérialisation JSON échoue, retourner un objet vide
      console.warn('Impossible de sérialiser l\'objet:', error)
      return {} as T
    }
  } finally {
    visited.delete(data as object)
  }
}
