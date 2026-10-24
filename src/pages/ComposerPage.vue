<script setup>
import { useI18n } from 'vue-i18n'
import SongComposerTool from 'src/components/music/SongComposerTool.vue'

const { t } = useI18n()
</script>

<template>
  <q-page class="gb gb-composer">
    <div class="gb-narrow">
      <h1 class="gb-page-title">{{ t('composer.title') }}</h1>
      <p class="gb-lead">{{ t('composer.lead') }}</p>
      <SongComposerTool />
    </div>
  </q-page>
</template>
