"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AnimatedCounter } from "@/components/animated-counter"
import { ArrowUpRight, ArrowDownRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { FadeInView } from "@/components/fade-in-view"

interface StatCardWithComparisonProps {
  title: string
  value: number
  previousValue: number
  icon: React.ComponentType<{ className?: string }>
  description: string
  tooltip?: string
  delay?: number
  className?: string
}

export function StatCardWithComparison({
  title,
  value,
  previousValue,
  icon: Icon,
  description,
  tooltip,
  delay = 0,
  className,
}: StatCardWithComparisonProps) {
  const difference = value - previousValue
  const percentageChange = previousValue > 0 ? ((difference / previousValue) * 100).toFixed(1) : "0"
  const isPositive = difference >= 0
  const changeText = isPositive ? `+${difference}` : `${difference}`
  const changePercentage = isPositive ? `+${percentageChange}%` : `${percentageChange}%`

  return (
    <FadeInView delay={delay}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className={cn(
              "group relative overflow-hidden bg-black border-2 border-white/10 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 cursor-help",
              className
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-xl p-3 bg-primary/20 border border-primary/30 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-semibold",
                      isPositive ? "text-primary" : "text-white/60"
                    )}>
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      <span>{changeText}</span>
                    </div>
                    {tooltip && (
                      <Info className="h-3.5 w-3.5 text-white/40 hover:text-white/60 transition-colors" />
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white/70 font-medium">{title}</p>
                  <p className="text-4xl font-bold text-white">
                    <AnimatedCounter value={value} />
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/60">{description}</p>
                    <p className={cn(
                      "text-xs font-semibold",
                      isPositive ? "text-primary" : "text-white/60"
                    )}>
                      {changePercentage} vs période précédente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          {tooltip && (
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </FadeInView>
  )
}

