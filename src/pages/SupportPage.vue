<script setup>
import { useI18n } from 'vue-i18n'
import { useQuasar, copyToClipboard } from 'quasar'
import { supportMethods } from 'src/config/links'

const { t } = useI18n()
const $q = useQuasar()

async function copy(value) {
  try {
    await copyToClipboard(value)
    $q.notify({ message: t('support.copied'), color: 'positive' })
  } catch {
    $q.notify({ message: t('support.copyFailed'), color: 'negative' })
  }
}
</script>

<template>
  <q-page class="gb gb-support">
    <div class="gb-narrow">
      <h1 class="gb-page-title">{{ t('support.title') }}</h1>
      <p class="gb-lead">{{ t('support.lead') }}</p>

      <p v-if="!supportMethods.length" class="gb-note">{{ t('support.none') }}</p>

      <ul v-else class="gb-methods">
        <li v-for="m in supportMethods" :key="m.id" class="gb-method">
          <q-icon :name="m.icon" size="24px" class="gb-method__icon" />
          <div class="gb-method__body">
            <h2 class="gb-method__name">{{ t(`support.methods.${m.id}.name`) }}</h2>
            <p class="gb-method__hint">{{ t(`support.methods.${m.id}.hint`) }}</p>
            <p v-if="m.kind === 'address'" class="gb-method__address">{{ m.value }}</p>
          </div>
          <div v-if="m.id != 'buymeacoffee'" class="gb-method__actions">
            <a
              v-if="m.kind === 'link'"
              :href="m.value"
              target="_blank"
              rel="noopener noreferrer"
              class="gb-btn gb-btn--primary gb-btn--small"
            >
              {{ t('support.open') }}
            </a>
            <template v-else>
              <button type="button" class="gb-btn gb-btn--small" @click="copy(m.value)">
                {{ t('support.copy') }}
              </button>
              <a v-if="m.uri" :href="m.uri(m.value)" class="gb-link gb-method__wallet">{{
                t('support.openWallet')
              }}</a>
            </template>
          </div>
        </li>
      </ul>

      <p class="gb-note">{{ t('support.thanks') }}</p>
    </div>
  </q-page>
</template>
