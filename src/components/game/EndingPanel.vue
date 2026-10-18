<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useGameStore } from 'src/stores/game-store'
import { useStory } from 'src/game/useStory'
import { ENDINGS } from 'src/story/book'
import { cues } from 'src/game/sound'

const { t } = useI18n()
const router = useRouter()
const game = useGameStore()
const { ending } = useStory()

const id = computed(() => game.save.endingId)
const meta = computed(() => ENDINGS[id.value])
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
    <p class="ending__count">{{ t('cover.endingsFound', { found, total: Object.keys(ENDINGS).length }) }}</p>
    <div class="ending__actions">
      <button type="button" class="gb-btn gb-btn--primary" @click="again">{{ t('play.newAdventure') }}</button>
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
  color: var(--gb-brass);
}

.is-bad .ending__title {
  color: var(--gb-nebula);
}

.ending__summary {
  margin: 0 0 6px;
  font-family: var(--gb-serif);
  font-size: 1.15rem;
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
