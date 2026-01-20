/**
 * Utilitaires pour sérialiser les données non sérialisables
 * Évite les erreurs React #185 liées aux objets Date, Map, etc.
 */

/**
 * Sérialise récursivement un objet pour éviter les erreurs de sérialisation
 */
export function serializeData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data
  }
  
  if (data instanceof Date) {
    return data.toISOString() as unknown as T
  }
  
  if (data instanceof Map) {
    return Object.fromEntries(data) as unknown as T
  }
  
  if (data instanceof Set) {
    return Array.from(data) as unknown as T
  }
  
  if (Array.isArray(data)) {
    return data.map(serializeData) as unknown as T
  }
  
  if (typeof data === 'object' && data.constructor === Object) {
    const serialized: any = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        serialized[key] = serializeData((data as any)[key])
      }
    }
    return serialized as T
  }
  
  return data
}
