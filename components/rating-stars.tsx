import { Star, StarHalf } from "lucide-react"

interface RatingStarsProps {
  rating: number
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  count?: number
}

export function RatingStars({ rating, size = "md", showCount = false, count }: RatingStarsProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className={`${sizeClasses[size]} fill-primary text-primary`} />
        ))}
        {hasHalfStar && <StarHalf className={`${sizeClasses[size]} fill-primary text-primary`} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={`${sizeClasses[size]} text-muted-foreground/30`} />
        ))}
      </div>

      {showCount && count && <span className="text-sm text-muted-foreground">({count.toLocaleString()})</span>}
    </div>
  )
}
