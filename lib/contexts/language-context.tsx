"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, locales, defaultLocale } from '@/lib/locales'

type LanguageContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Récupérer la langue depuis localStorage au chargement
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale | null
      if (savedLocale && (savedLocale === 'fr' || savedLocale === 'en')) {
        setLocaleState(savedLocale)
      }
    }
    setMounted(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = locales[locale]
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) {
        // Fallback sur le français si la clé n'existe pas
        value = locales[defaultLocale]
        for (const fallbackKey of keys) {
          value = value?.[fallbackKey]
        }
        break
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  // Toujours rendre le Provider, même avant le montage
  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

