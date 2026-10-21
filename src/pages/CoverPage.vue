<script setup>
import StarTwinkle from 'src/components/StarTwinkle.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth-store'
import { useGameStore } from 'src/stores/game-store'
import { useStory } from 'src/game/useStory'
import { ENDINGS, SECTION_COUNT } from 'src/story/book'

const { t, locale } = useI18n()
const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()
const game = useGameStore()
const { content, pitch } = useStory()

const found = computed(() => Object.keys(game.profile.endings).length)
const inProgress = computed(() => game.save?.status === 'playing')

function startOver() {
  if (!inProgress.value) {
    game.abandon()
    router.push({ name: 'hero' })
    return
  }
  $q.dialog({
    title: t('play.abandonTitle'),
    message: t('play.abandonBody'),
    cancel: { label: t('common.cancel'), flat: true, noCaps: true },
    ok: { label: t('cover.newGame'), color: 'primary', noCaps: true, unelevated: true },
  }).onOk(() => {
    game.abandon()
    router.push({ name: 'hero' })
  })
}
</script>

<template>
  <q-page class="gb gb-cover">
    <StarTwinkle />
    <div class="gb-cover__inner">
      <p class="gb-cover__kind">{{ t('cover.kind') }}</p>
      <h1 class="gb-cover__title">{{ content.title }}</h1>
      <p class="gb-cover__byline">{{ content.byline }}</p>
      <p class="gb-cover__pitch">{{ pitch() }}</p>
      <p class="gb-cover__meta">{{ t('cover.sections', { count: SECTION_COUNT }) }}</p>

      <div class="gb-cover__actions">
        <template v-if="auth.isLoggedIn">
          <router-link v-if="inProgress" :to="{ name: 'play' }" class="gb-btn gb-btn--primary">
            {{ t('cover.continue', { number: game.sectionNumber }) }}
          </router-link>
          <button v-if="inProgress" type="button" class="gb-btn" @click="startOver">
            {{ t('cover.newGame') }}
          </button>
          <button v-else type="button" class="gb-btn gb-btn--primary" @click="startOver">
            {{ t('cover.start') }}
          </button>
        </template>
        <template v-else>
          <router-link :to="{ name: 'login' }" class="gb-btn gb-btn--primary">{{
            t('cover.login')
          }}</router-link>
          <router-link :to="{ name: 'register' }" class="gb-btn">{{
            t('cover.register')
          }}</router-link>
        </template>
        <router-link :to="{ name: 'rules' }" class="gb-link">{{ t('nav.rules') }}</router-link>
      </div>

      <p v-if="auth.isLoggedIn" class="gb-cover__status">
        {{ t('cover.endingsFound', { found, total: Object.keys(ENDINGS).length }) }}
        <template v-if="inProgress">
          <br />{{
            t('cover.lastPlayed', {
              date: new Date(game.save.updatedAt).toLocaleDateString(locale),
            })
          }}
        </template>
      </p>
    </div>
  </q-page>
</template>

<style scoped>
/* The cover is always a night sky, in light mode too, so it carries its
   own light-on-dark colors. The gradient keeps the title readable. */
.q-page.gb-cover {
  --gb-paper: #0a0b20;
  --gb-ink: #f1effa;
  --gb-muted: #b9bad8;
  --gb-accent: #8fdcef;
  --gb-hover: rgba(255, 255, 255, 0.08);
  --gb-rule: rgba(255, 255, 255, 0.18);

  color: var(--gb-ink);
  background-color: var(--gb-paper);
  background-image:
    linear-gradient(
      90deg,
      rgba(8, 9, 26, 0.88) 0%,
      rgba(8, 9, 26, 0.6) 48%,
      rgba(8, 9, 26, 0.1) 100%
    ),
    url('../assets/images/cover-space.webp');
  background-size: cover;
  background-position: 70% center;
  background-repeat: no-repeat;
}

@media (max-width: 1200px) {
  .q-page.gb-cover {
    background-image:
      linear-gradient(
        90deg,
        rgba(8, 9, 26, 0.88) 0%,
        rgba(8, 9, 26, 0.6) 55%,
        rgba(8, 9, 26, 0.2) 100%
      ),
      url('../assets/images/cover-space-1200.webp');
  }
}

/* phones: the text spans the whole width, so the whole image is dimmed */
@media (max-width: 700px) {
  .q-page.gb-cover {
    background-image:
      linear-gradient(180deg, rgba(8, 9, 26, 0.7) 0%, rgba(8, 9, 26, 0.6) 100%),
      url('../assets/images/cover-space-1200.webp');
    background-position: 78% center;
  }
}
</style>
