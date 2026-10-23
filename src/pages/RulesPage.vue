<script setup>
import { useCast } from 'src/game/useCast'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const paragraphs = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9']
// names for texts that mention the protagonist or the friend
const names = useCast()
</script>

<template>
  <q-page class="gb gb-rules">
    <div class="gb-narrow">
      <h1 class="gb-page-title">{{ t('rules.title') }}</h1>
      <div class="gb-story">
        <p v-for="p in paragraphs" :key="p">{{ t(`rules.${p}`, names) }}</p>
      </div>
      <p class="gb-note">{{ t('rules.source') }}</p>
      <router-link :to="{ name: 'cover' }" class="gb-btn gb-btn--primary q-mt-lg">{{ t('play.toCover') }}</router-link>
    </div>
  </q-page>
</template>
