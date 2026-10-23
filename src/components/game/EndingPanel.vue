<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useGameStore } from 'src/stores/game-store'
import { useStory } from 'src/game/useStory'
import { ENDINGS } from 'src/story/book'
import { hintsFor } from 'src/game/hints'
import { cues } from 'src/game/sound'
import { useQuasar } from 'quasar'
import SongCard from './SongCard.vue'

const { t } = useI18n()
const router = useRouter()
const game = useGameStore()
const { ending } = useStory()
const $q = useQuasar()

function nameSong(title) {
  game.nameSong(title)
  $q.notify({ message: t('song.savedToProfile'), color: 'positive' })
}

const id = computed(() => game.save.endingId)
const meta = computed(() => ENDINGS[id.value])
// what could lead somewhere brighter next time
const hints = computed(() => hintsFor(game.save))
const found = computed(() => Object.keys(game.profile.endings).length)

onMounted(() => cues.ending(meta.value?.tone))

function again() {
  game.abandon()
  router.push({ name: 'hero' })
}
</script>

<template>
  <section class="ending" :class="`is-${meta?.tone}`">
    <p class="ending__kicker">{{ t('play.ended') }}</p>
    <h2 class="ending__title">{{ ending(id).title }}</h2>
    <p class="ending__summary">{{ ending(id).summary }}</p>
    <SongCard
      v-if="game.song.verses.length"
      :song="game.song"
      nameable
      :heading="id === 'light' || id === 'guitarist' ? t('song.yourSong') : t('song.unfinished')"
      @name="nameSong"
    />
    <section v-if="hints.length" class="ending__hints" :aria-label="t('hints.title')">
      <p class="ending__hints-title">
        <q-icon name="lightbulb" size="18px" /> {{ t('hints.title') }}
      </p>
      <ul>
        <li v-for="h in hints" :key="h">{{ t(`hints.items.${h}`) }}</li>
      </ul>
    </section>
    <p class="ending__support">
      {{ t('endingSupport.supportLine') }}
      <router-link to="/support" class="gb-link">{{ t('endingSupport.supportLink') }}</router-link
      >.
    </p>
    <p class="ending__count">
      {{ t('cover.endingsFound', { found, total: Object.keys(ENDINGS).length }) }}
    </p>
    <div class="ending__actions">
      <button type="button" class="gb-btn gb-btn--primary" @click="again">
        {{ t('play.newAdventure') }}
      </button>
      <router-link :to="{ name: 'profile' }" class="gb-btn">{{ t('play.allEndings') }}</router-link>
    </div>
  </section>
</template>

<style scoped>
.ending {
  margin-top: 36px;
  padding-top: 24px;
  border-top: 2px solid var(--gb-ink);
}

.ending__kicker {
  margin: 0;
  font-family: var(--gb-serif);
  font-style: italic;
  font-size: 1.1rem;
  color: var(--gb-muted);
}

.ending__title {
  margin: 2px 0 8px;
  font-family: var(--gb-serif);
  font-size: clamp(2rem, 6vw, 2.8rem);
  font-weight: 800;
  line-height: 1.05;
}

.is-best .ending__title,
.is-good .ending__title {
  color: var(--gb-accent);
}

.is-bad .ending__title {
  color: var(--gb-nebula);
}

.ending__summary {
  margin: 0 0 6px;
  font-family: var(--gb-serif);
  font-size: 1.15rem;
}

.ending__hints {
  margin: 18px 0 6px;
  padding: 12px 16px;
  border-left: 3px solid var(--gb-accent);
  border-radius: 0 12px 12px 0;
  background: var(--gb-hover);
}

.ending__hints-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 6px;
  font-weight: 700;
  color: var(--gb-accent);
}

.ending__hints ul {
  margin: 0;
  padding-left: 1.2em;
  line-height: 1.5;
}

.ending__support {
  margin: 14px 0 4px;
  font-size: 0.92rem;
  color: var(--gb-muted);
}

.ending__count {
  margin: 0;
  font-family: var(--gb-sans);
  color: var(--gb-muted);
}

.ending__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}
</style>
