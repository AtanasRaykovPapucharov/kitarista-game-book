<script setup>
import { useI18n } from 'vue-i18n'
import { useQuasar, copyToClipboard } from 'quasar'
import {
  supportMethods,
  supporters,
  lessonsUrl,
  feedbackUrl,
  primaryMethod,
} from 'src/config/links'

const { t } = useI18n()
const $q = useQuasar()

const FUNDS = [
  { id: 'chapters', icon: 'auto_stories' },
  { id: 'art', icon: 'palette' },
  { id: 'coach', icon: 'mic' },
  { id: 'hosting', icon: 'cloud' },
]
const TIERS = [
  { id: 'string', icon: 'linear_scale' },
  { id: 'pick', icon: 'change_history' },
  { id: 'section', icon: 'menu_book' },
  { id: 'picture', icon: 'image' },
]

/* sharing the book is support too */
async function share() {
  const url = window.location.origin
  const data = { title: t('support.share.title'), text: t('support.share.text'), url }
  try {
    if (navigator.share) await navigator.share(data)
    else {
      await copyToClipboard(url)
      $q.notify({ message: t('support.share.copied'), color: 'positive' })
    }
  } catch {
    // the reader closed the share sheet – nothing to do
  }
}

const teacherMail = () =>
  `mailto:?subject=${encodeURIComponent(t('support.teacher.subject'))}&body=${encodeURIComponent(
    t('support.teacher.body', { url: window.location.origin }),
  )}`

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

      <h2 class="gb-subtitle">{{ t('support.fundsTitle') }}</h2>
      <ul class="gb-support__grid">
        <li v-for="f in FUNDS" :key="f.id" class="gb-support__card">
          <q-icon :name="f.icon" size="26px" class="gb-support__icon" />
          <span class="gb-support__name">{{ t(`support.funds.${f.id}.title`) }}</span>
          <span class="gb-support__text">{{ t(`support.funds.${f.id}.text`) }}</span>
        </li>
      </ul>

      <h2 class="gb-subtitle">{{ t('support.tiersTitle') }}</h2>
      <ul class="gb-support__grid">
        <li v-for="tier in TIERS" :key="tier.id" class="gb-support__card gb-support__card--tier">
          <q-icon :name="tier.icon" size="24px" class="gb-support__icon" />
          <span class="gb-support__name">{{ t(`support.tiers.${tier.id}.title`) }}</span>
          <span class="gb-support__amount">{{ t(`support.tiers.${tier.id}.amount`) }}</span>
          <span class="gb-support__text">{{ t(`support.tiers.${tier.id}.text`) }}</span>
          <a
            v-if="primaryMethod"
            :href="primaryMethod.value"
            target="_blank"
            rel="noopener noreferrer"
            class="gb-btn gb-btn--small gb-support__go"
          >
            {{ t('support.tiersGo') }}
          </a>
        </li>
      </ul>
      <p class="gb-note">{{ t('support.tiersNote') }}</p>

      <h2 class="gb-subtitle">{{ t('support.methodsTitle') }}</h2>
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

      <section v-if="lessonsUrl" class="gb-support__lessons">
        <q-icon name="school" size="30px" class="gb-support__icon" />

        <div>
          <h2 class="gb-subtitle">{{ t('support.lessons.title') }}</h2>

          <p>{{ t('support.lessons.text') }}</p>

          <a
            :href="lessonsUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="gb-btn gb-btn--primary gb-btn--small"
          >
            {{ t('support.lessons.go') }}
          </a>
        </div>
      </section>

      <h2 class="gb-subtitle">{{ t('support.freeTitle') }}</h2>

      <ul class="gb-support__free">
        <li>
          <button type="button" class="gb-btn gb-btn--small" @click="share">
            <q-icon name="share" size="16px" class="q-mr-xs" />{{ t('support.share.button') }}
          </button>

          <span>{{ t('support.share.hint') }}</span>
        </li>

        <li>
          <a :href="teacherMail()" class="gb-btn gb-btn--small">
            <q-icon name="school" size="16px" class="q-mr-xs" />{{ t('support.teacher.button') }}
          </a>

          <span>{{ t('support.teacher.hint') }}</span>
        </li>

        <li v-if="feedbackUrl">
          <a
            :href="feedbackUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="gb-btn gb-btn--small"
          >
            <q-icon name="rate_review" size="16px" class="q-mr-xs" />{{
              t('support.feedback.button')
            }}
          </a>

          <span>{{ t('support.feedback.hint') }}</span>
        </li>
      </ul>

      <section v-if="supporters.length" class="gb-support__wall">
        <h2 class="gb-subtitle">{{ t('support.wallTitle') }}</h2>

        <p class="gb-support__names">
          <span v-for="n in supporters" :key="n" class="gb-support__person">{{ n }}</span>
        </p>
      </section>

      <p class="gb-note">{{ t('support.thanks') }}</p>
    </div>
  </q-page>
</template>
