"use client"

import { cn } from "@/lib/utils"

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  label?: string
  showPercentage?: boolean
  showValue?: boolean
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  showLabel = true,
  label,
  showPercentage = false,
  showValue = false,
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90"
        aria-label={`Progression: ${Math.round(percentage)}%`}
      >
        {/* Background circle - plus subtil */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-800"
          opacity={0.2}
        />
        {/* Progress circle avec gradient orange pour impact */}
        <defs>
          <linearGradient id={`gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7900" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF9F33" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${size})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{
            filter: percentage >= 100 ? "drop-shadow(0 0 4px rgba(255, 121, 0, 0.4))" : "none",
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {showValue && (
            <span className={cn(
              "font-bold text-black leading-none tabular-nums",
              size <= 60 ? "text-base" : size <= 80 ? "text-xl" : "text-2xl"
            )}>
              {value}
            </span>
          )}
          {showPercentage && (
            <span className={cn(
              "font-bold text-black leading-none tabular-nums",
              size <= 60 ? "text-sm" : size <= 80 ? "text-base" : "text-2xl"
            )}>
              {Math.round(percentage)}%
            </span>
          )}
          {!showPercentage && !showValue && (
            <span className={cn(
              "font-bold text-black leading-none tabular-nums",
              size <= 60 ? "text-sm" : size <= 80 ? "text-base" : "text-2xl"
            )}>
              {Math.round(percentage)}%
            </span>
          )}
          {label && (
            <span className={cn(
              "text-gray-600 mt-0.5 leading-none",
              size <= 60 ? "text-[10px]" : "text-xs"
            )}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

