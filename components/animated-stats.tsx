"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatedCounter } from "./animated-counter"
import { formatNumber } from "@/lib/utils"

interface StatItem {
  value: number
  label: string
  suffix?: string
  useFormat?: boolean
}

interface AnimatedStatsProps {
  stats: StatItem[]
  className?: string
}

export function AnimatedStats({ stats, className }: AnimatedStatsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [isMounted])

  return (
    <div ref={sectionRef} className={className}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 justify-items-center max-w-4xl mx-auto">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="text-center space-y-2"
            style={{
              animation: isVisible
                ? `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                : "none",
            }}
          >
            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
              {isVisible && (
                <>
                  {stat.useFormat ? (
                    formatNumber(stat.value)
                  ) : (
                    <AnimatedCounter value={stat.value} />
                  )}
                  {stat.suffix && <span className="text-2xl">{stat.suffix}</span>}
                </>
              )}
            </div>
            <p className="text-sm md:text-base text-muted-foreground font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

