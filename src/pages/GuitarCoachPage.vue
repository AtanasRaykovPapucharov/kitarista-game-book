<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import { EXERCISES, EXERCISE_IDS } from 'src/story/exercises'
import PlayAlong from 'src/components/music/PlayAlong.vue'

/* "Play with me": exercises on the real guitar, through the microphone.
   Open from a book mission (?ex=<id>) or on its own. */
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const game = useGameStore()

const current = computed(() => (EXERCISES[route.query.ex] ? route.query.ex : null))
const played = computed(() => game.profile.realPlayed ?? {})
const date = (iso) => new Date(iso).toLocaleDateString(locale.value)

function open(id) {
  router.replace({ query: { ex: id } })
}

function done() {
  game.recordRealPlay(current.value)
}
</script>

<template>
  <q-page class="gb gb-coach">
    <div class="gb-narrow">
      <h1 class="gb-page-title">{{ t('coach.title') }}</h1>
      <p class="gb-lead">{{ t('coach.lead') }}</p>

      <section v-if="current" class="gb-coach__current">
        <div class="gb-coach__head">
          <h2 class="gb-subtitle">{{ t(`missions.list.${current}.title`) }}</h2>
          <button type="button" class="gb-link" @click="router.replace({ query: {} })">
            {{ t('coach.all') }}
          </button>
        </div>
        <PlayAlong :id="current" @done="done" />
      </section>

      <section v-else>
        <h2 class="gb-subtitle">{{ t('coach.choose') }}</h2>
        <ul class="gb-coach__list">
          <li v-for="id in EXERCISE_IDS" :key="id">
            <button
              type="button"
              class="gb-coach__item"
              :class="{ 'is-done': played[id] }"
              @click="open(id)"
            >
              <q-icon :name="played[id] ? 'check_circle' : EXERCISES[id].icon" size="24px" />
              <span class="gb-coach__text">
                <span class="gb-coach__name">{{ t(`missions.list.${id}.title`) }}</span>
                <span class="gb-coach__meta">
                  {{ t('coach.notes', { n: EXERCISES[id].steps.length }) }}
                  <template v-if="played[id]">
                    · {{ t('coach.playedOn', { date: date(played[id]) }) }}</template
                  >
                </span>
              </span>
            </button>
          </li>
        </ul>
      </section>
    </div>
  </q-page>
</template>

<style scoped>
.gb-coach__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.gb-coach__list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gb-coach__item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--gb-rule);
  border-radius: 14px;
  background: transparent;
  color: var(--gb-ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.gb-coach__item:hover,
.gb-coach__item:focus-visible {
  border-color: var(--gb-accent);
  outline: none;
}

.gb-coach__item.is-done {
  border-color: color-mix(in srgb, var(--gb-good) 60%, var(--gb-rule));
}

.gb-coach__item.is-done .q-icon {
  color: var(--gb-good);
}

.gb-coach__text {
  display: flex;
  flex-direction: column;
}

.gb-coach__name {
  font-family: var(--gb-serif);
  font-size: 1.1rem;
  font-weight: 700;
}

.gb-coach__meta {
  font-size: 0.88rem;
  color: var(--gb-muted);
}
</style>
