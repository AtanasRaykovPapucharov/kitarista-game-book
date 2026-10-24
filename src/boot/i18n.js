import { defineBoot } from '#q-app'
import { createI18n } from 'vue-i18n'
import { unref, watch } from 'vue'
import { setPracticeLanguage } from './../i18n/practiceTranslator'
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
  // Bulgarian by default, whatever the browser's language; a choice made
  // in the language menu is remembered and wins on the next visit.
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
  // the practice-room tools are written in English: translate them on the page while in Bulgarian
  watch(() => unref(i18n.global.locale), setPracticeLanguage, { immediate: true })
})
