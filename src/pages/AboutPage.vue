<template>
  <q-page class="q-pa-lg">
    <div class="page-narrow">
      <h1 class="text-h4 q-mt-md q-mb-sm">{{ t('about.title') }}</h1>
      <p class="text-body1">{{ t('about.body') }}</p>
      <q-btn class="q-mt-md" outline color="primary" no-caps to="/" :label="t('about.back')" />
    </div>
  </q-page>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
