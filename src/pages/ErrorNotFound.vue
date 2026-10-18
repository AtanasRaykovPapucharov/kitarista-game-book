<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh; line-height: 1">404</div>
      <div class="text-h5 q-mt-md">{{ t('notFound.title') }}</div>
      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="primary"
        unelevated
        to="/"
        :label="t('notFound.back')"
        no-caps
      />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
