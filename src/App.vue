<template>
  <router-view />
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useSettingsStore } from '@/stores/settings-store'

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
$q.dark.set(true)
settings.setLocale(settings.locale)
</script>
