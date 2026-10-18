import { defineBoot } from '#q-app'
import { createI18n } from 'vue-i18n'
import messages from '@/i18n'

export const SUPPORTED_LOCALES = Object.keys(messages)
export const DEFAULT_LOCALE = 'bg'
const STORAGE_KEY = 'kitarista-locale'

function getInitialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SUPPORTED_LOCALES.includes(saved)) return saved
  } catch {
    // storage unavailable — fall through
  }
  const browser = typeof navigator !== 'undefined' ? navigator.language : ''
  if (browser?.toLowerCase().startsWith('bg')) return 'bg'
  if (browser?.toLowerCase().startsWith('en')) return 'en-US'
  return DEFAULT_LOCALE
}

export const i18n = createI18n({
  locale: getInitialLocale(),
  fallbackLocale: 'en-US',
  globalInjection: true,
  messages,
})

export function saveLocale(locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // ignore
  }
}

export default defineBoot(({ app }) => {
  app.use(i18n)
})
