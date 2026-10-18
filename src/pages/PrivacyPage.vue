<script setup>
import { useI18n } from 'vue-i18n'
import { creator } from 'src/config/links'

const { t } = useI18n()
const sections = ['stored', 'notStored', 'thirdParty', 'delete', 'children', 'changes']
</script>

<template>
  <q-page class="gb gb-privacy">
    <div class="gb-narrow">
      <h1 class="gb-page-title">{{ t('privacy.title') }}</h1>
      <p class="gb-lead">{{ t('privacy.lead') }}</p>

      <section v-for="s in sections" :key="s" class="gb-privacy__section">
        <h2 class="gb-subtitle">{{ t(`privacy.${s}.title`) }}</h2>
        <p class="gb-story-plain">{{ t(`privacy.${s}.body`) }}</p>
      </section>

      <section class="gb-privacy__section">
        <h2 class="gb-subtitle">{{ t('privacy.contact.title') }}</h2>
        <p class="gb-story-plain">
          {{ t('privacy.contact.body') }}
          <a v-if="creator.email" :href="`mailto:${creator.email}`" class="gb-link">{{
            creator.email
          }}</a>
          <a
            v-else-if="creator.github"
            :href="creator.github"
            target="_blank"
            rel="noopener noreferrer"
            class="gb-link"
          >
            GitHub
          </a>
        </p>
      </section>

      <p class="gb-note">{{ t('privacy.updated') }}</p>
    </div>
  </q-page>
</template>

<style scoped>
.gb-story-plain {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.6;
}
</style>
