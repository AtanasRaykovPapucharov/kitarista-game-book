<template>
  <router-view />
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useSettingsStore } from '@/stores/settings-store'

// Sync vue-i18n, Quasar's language pack and <html lang> on startup
const $q = useQuasar()
const settings = useSettingsStore()
$q.dark.set(true)
settings.setLocale(settings.locale)
</script>
