import { defineStore, acceptHMRUpdate } from 'pinia'
import { Quasar } from 'quasar'
import quasarLangEn from 'quasar/lang/en-US.js'
import quasarLangBg from 'quasar/lang/bg.js'
import { i18n, saveLocale, SUPPORTED_LOCALES } from '@/boot/i18n'
import { setPracticeLanguage } from '@/i18n/practiceTranslator'

// Quasar's own language packs (labels inside built-in components)
const quasarLangPacks = {
  'en-US': quasarLangEn,
  bg: quasarLangBg,
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    locale: i18n.global.locale,
  }),

  getters: {
    locales: () => SUPPORTED_LOCALES,
  },

  actions: {
    setLocale(locale) {
      if (!SUPPORTED_LOCALES.includes(locale)) return
      this.locale = locale
      i18n.global.locale = locale
      saveLocale(locale)
      if (typeof document !== 'undefined') document.documentElement.lang = locale
      if (quasarLangPacks[locale]) Quasar.lang.set(quasarLangPacks[locale])
      // the practice-room tools are English in the code; translate them on the page
      setPracticeLanguage(locale)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
