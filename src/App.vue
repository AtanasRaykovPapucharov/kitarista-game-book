<template>
  <router-view />
</template>

<script setup>
import { useQuasar } from 'quasar'
import { watch } from 'vue'
import { useSettingsStore } from '@/stores/settings-store'
import { KEYS, readJson, writeJson } from '@/services/storage'

// Self-hosted book typefaces (Latin + Cyrillic), no external requests
import '@fontsource/alegreya/400.css'
import '@fontsource/alegreya/400-italic.css'
import '@fontsource/alegreya/700.css'
import '@fontsource/alegreya/800.css'
import '@fontsource/alegreya-sans/400.css'
import '@fontsource/alegreya-sans/500.css'
import '@fontsource/alegreya-sans/700.css'

// Sync vue-i18n, Quasar's language pack and <html lang> on startup
const $q = useQuasar()
const settings = useSettingsStore()
// dark by default; the reader's own choice is remembered
$q.dark.set(readJson(KEYS.theme, 'dark') !== 'light')
watch(
  () => $q.dark.isActive,
  (dark) => writeJson(KEYS.theme, dark ? 'dark' : 'light'),
)
settings.setLocale(settings.locale)
</script>
