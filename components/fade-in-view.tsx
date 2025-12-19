"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FadeInViewProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeInView({ children, delay = 0, className }: FadeInViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
