import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number intelligently (e.g., 1200 -> "1.2k", 1500000 -> "1.5M")
 */
export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString()
  }
  
  if (num < 1000000) {
    const k = num / 1000
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`
  }
  
  const m = num / 1000000
  return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`
}

/**
 * Format a large number with locale formatting
 */
export function formatNumberLocale(num: number): string {
  return new Intl.NumberFormat("fr-FR").format(num)
}
