interface AriaLiveRegionProps {
  message?: string
  priority?: "polite" | "assertive"
}

// Server Component - peut être utilisé dans layout.tsx
export function AriaLiveRegion({ message, priority = "polite" }: AriaLiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message && <span>{message}</span>}
    </div>
  )
}

