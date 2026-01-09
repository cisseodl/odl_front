import fr from './fr.json'
import en from './en.json'

export type Locale = 'fr' | 'en'

export const locales: Record<Locale, typeof fr> = {
  fr,
  en,
}

export const defaultLocale: Locale = 'fr'

export const supportedLocales: Locale[] = ['fr', 'en']

