<script setup>
import { useI18n } from 'vue-i18n'
import { creator } from 'src/config/links'

const { t } = useI18n()
const name = creator.name || t('creators.unnamed')
</script>

<template>
  <q-page class="gb gb-creators">
    <div class="gb-narrow">
      <h1 class="gb-page-title">{{ t('creators.title') }}</h1>
      <p class="gb-lead">{{ t('creators.lead', { name }) }}</p>

      <div class="gb-story">
        <p>{{ t('creators.story') }}</p>
        <p>{{ t('creators.app') }}</p>
      </div>

      <ul v-if="creator.github || creator.website || creator.email" class="gb-contact">
        <li v-if="creator.github">
          <a :href="creator.github" target="_blank" rel="noopener noreferrer" class="gb-link"
            >GitHub</a
          >
        </li>
        <li v-if="creator.website">
          <a :href="creator.website" target="_blank" rel="noopener noreferrer" class="gb-link">
            {{ t('creators.website') }}
          </a>
        </li>
        <li v-if="creator.email">
          <a :href="`mailto:${creator.email}`" class="gb-link">{{ creator.email }}</a>
        </li>
      </ul>

      <h2 class="gb-subtitle">{{ t('creators.thanksTitle') }}</h2>
      <p class="gb-note gb-note--body">{{ t('creators.thanks') }}</p>

      <router-link :to="{ name: 'support' }" class="gb-btn gb-btn--primary q-mt-lg">
        {{ t('nav.support') }}
      </router-link>
    </div>
  </q-page>
</template>
