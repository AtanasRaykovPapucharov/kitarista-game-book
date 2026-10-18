<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from 'src/stores/settings-store'
import { useStory } from 'src/game/useStory'
import { tryCode, waitSeconds } from 'src/services/access'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const settings = useSettingsStore()
const { bookTitle } = useStory()

const code = ref('')
const show = ref(false)
const busy = ref(false)
const message = ref('')
let timer = null

function startCountdown() {
  clearInterval(timer)
  const tick = () => {
    const s = waitSeconds()
    message.value = s > 0 ? t('access.wait', { seconds: s }) : ''
    if (s === 0) clearInterval(timer)
  }
  tick()
  timer = setInterval(tick, 1000)
}

async function submit() {
  if (!code.value.trim() || busy.value) return
  busy.value = true
  const result = await tryCode(code.value)
  busy.value = false
  if (result === 'ok') {
    const target = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(target)
    return
  }
  code.value = ''
  if (result === 'wait') startCountdown()
  else message.value = t('access.wrong')
}

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="gb gb-access">
        <nav class="gb-access__lang" :aria-label="t('nav.language')">
          <button
            v-for="l in [
              { value: 'bg', label: 'Български' },
              { value: 'en-US', label: 'English' },
            ]"
            :key="l.value"
            type="button"
            class="gb-access__lang-btn"
            :class="{ 'is-active': settings.locale === l.value }"
            :aria-pressed="settings.locale === l.value"
            @click="settings.setLocale(l.value)"
          >
            {{ l.label }}
          </button>
        </nav>

        <div class="gb-access__inner">
          <p class="gb-access__book">{{ bookTitle() }}</p>
          <h1 class="gb-access__title">{{ t('access.title') }}</h1>
          <p class="gb-access__lead">{{ t('access.lead') }}</p>

          <form class="gb-access__form" @submit.prevent="submit">
            <q-input
              v-model="code"
              dark
              outlined
              color="accent"
              :type="show ? 'text' : 'password'"
              :label="t('access.code')"
              autocomplete="off"
              autofocus
              :disable="busy || waitSeconds() > 0"
              class="gb-access__input"
            >
              <template #append>
                <q-icon
                  :name="show ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  role="button"
                  tabindex="0"
                  :aria-label="show ? t('access.hide') : t('access.show')"
                  @click="show = !show"
                  @keydown.enter.prevent="show = !show"
                />
              </template>
            </q-input>
            <button type="submit" class="gb-btn gb-btn--primary" :disabled="busy || !code.trim()">
              {{ t('access.enter') }}
            </button>
          </form>

          <p class="gb-access__message" role="alert">{{ message }}</p>
          <p class="gb-access__note">{{ t('access.remember') }}</p>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
/* same night sky as the cover */
.q-page.gb-access {
  --gb-paper: #0a0b20;
  --gb-ink: #f1effa;
  --gb-muted: #b9bad8;
  --gb-accent: #8fdcef;
  --gb-hover: rgba(255, 255, 255, 0.08);
  --gb-rule: rgba(255, 255, 255, 0.18);

  display: flex;
  align-items: center;
  min-height: 100vh;
  color: var(--gb-ink);
  background-color: var(--gb-paper);
  background-image:
    linear-gradient(
      90deg,
      rgba(8, 9, 26, 0.9) 0%,
      rgba(8, 9, 26, 0.62) 50%,
      rgba(8, 9, 26, 0.15) 100%
    ),
    url('../assets/images/cover-space.webp');
  background-size: cover;
  background-position: 70% center;
}

@media (max-width: 700px) {
  .q-page.gb-access {
    background-image:
      linear-gradient(180deg, rgba(8, 9, 26, 0.72) 0%, rgba(8, 9, 26, 0.62) 100%),
      url('../assets/images/cover-space-1200.webp');
    background-position: 78% center;
  }
}

.gb-access__lang {
  position: absolute;
  top: calc(16px + env(safe-area-inset-top, 0px));
  right: 20px;
  display: flex;
  gap: 4px;
}

.gb-access__lang-btn {
  padding: 6px 10px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--gb-muted);
  font: 500 0.92rem var(--gb-sans);
  cursor: pointer;
}

.gb-access__lang-btn.is-active {
  color: var(--gb-ink);
  background: var(--gb-hover);
}

.gb-access__inner {
  width: 100%;
  max-width: 34rem;
  margin: 0 auto;
}

.gb-access__book {
  margin: 0 0 14px;
  font-family: var(--gb-serif);
  font-style: italic;
  font-size: 1.15rem;
  color: var(--gb-accent);
}

.gb-access__title {
  margin: 0;
  font-family: var(--gb-serif);
  font-size: clamp(2.8rem, 10vw, 4.6rem);
  font-weight: 800;
  line-height: 0.95;
}

.gb-access__lead {
  margin: 18px 0 28px;
  font-family: var(--gb-serif);
  font-size: 1.2rem;
  line-height: 1.55;
}

.gb-access__form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}

.gb-access__input {
  flex: 1 1 16rem;
}

.gb-access__form .gb-btn {
  min-height: 56px;
  padding: 8px 28px;
}

.gb-access__message {
  min-height: 1.5em;
  margin: 10px 0 0;
  color: #f2a0ae;
  font-weight: 500;
}

.gb-access__note {
  margin: 4px 0 0;
  font-size: 0.92rem;
  color: var(--gb-muted);
}
</style>
