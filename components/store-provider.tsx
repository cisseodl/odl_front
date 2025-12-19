"use client"

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Stores will hydrate automatically with the storage configuration
  return <>{children}</>
}

