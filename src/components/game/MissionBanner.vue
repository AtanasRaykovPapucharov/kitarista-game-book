<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import { MISSIONS } from 'src/story/missions'

/* In the practice room: the book's mission for this tool, always in view,
   with a way back to the book – and, once done, what was won. */
const { t } = useI18n()
const route = useRoute()
const game = useGameStore()

const playing = computed(() => game.save?.status === 'playing')
const done = computed(() => (playing.value ? game.missionNews.filter((id) => MISSIONS[id]) : []))
const active = computed(() =>
  playing.value
    ? Object.entries(game.save.missions ?? {})
        .filter(([id, state]) => state === 'active' && MISSIONS[id]?.tool === route.path)
        .map(([id]) => id)
    : [],
)
const statOf = (id) => MISSIONS[id].reward[0].stat
</script>

<template>
  <div v-if="done.length || active.length" class="mission-banner-wrap">
    <section
      v-for="id in done"
      :key="`done-${id}`"
      class="mission-banner is-done"
      role="status"
      aria-live="polite"
    >
      <q-icon name="check_circle" size="28px" class="mission-banner__icon" />
      <div class="mission-banner__text">
        <strong>{{ t('missions.doneNamed', { title: t(`missions.list.${id}.title`) }) }}</strong>
        <span>
          {{ t('missions.rewardIs', { reward: t(`missions.reward.${id}`) }) }}
          {{ t('stats.' + statOf(id)) }}: {{ game.save.stats[statOf(id)] }}/{{
            game.save.initial[statOf(id)]
          }}.
        </span>
        <span>{{
          t('missions.unlocked', { topic: t(`missions.topics.${MISSIONS[id].topic}`) })
        }}</span>
      </div>
      <router-link to="/play" class="gb-btn gb-btn--primary mission-banner__back">
        <q-icon name="auto_stories" size="18px" class="q-mr-xs" />{{ t('missions.back') }}
      </router-link>
    </section>

    <section v-for="id in active" :key="`active-${id}`" class="mission-banner">
      <q-icon :name="MISSIONS[id].icon" size="26px" class="mission-banner__icon" />
      <div class="mission-banner__text">
        <strong>{{ t('missions.fromBook', { title: t(`missions.list.${id}.title`) }) }}</strong>
        <span>{{ t(`missions.list.${id}.task`) }}</span>
        <span class="mission-banner__hint">{{ t('missions.inProgress') }}</span>
      </div>
      <router-link to="/play" class="gb-btn mission-banner__back">
        <q-icon name="auto_stories" size="18px" class="q-mr-xs" />{{ t('missions.back') }}
      </router-link>
    </section>
  </div>
</template>

<style scoped>
.mission-banner-wrap {
  position: sticky;
  bottom: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 12px calc(10px + env(safe-area-inset-bottom, 0px));
}

.mission-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  padding: 10px 14px;
  border: 1.5px solid var(--gb-accent, #2fa6c1);
  border-radius: 14px;
  background: var(--app-surface, #1c2042);
  color: var(--app-text, #eee);
  box-shadow: 0 8px 24px -14px rgba(0, 0, 0, 0.7);
}

.mission-banner.is-done {
  border-color: var(--gb-good, #4fd1a5);
  background: color-mix(in srgb, var(--gb-good, #4fd1a5) 14%, var(--app-surface, #1c2042));
}

.mission-banner__icon {
  flex: none;
  color: var(--gb-accent, #2fa6c1);
}

.is-done .mission-banner__icon {
  color: var(--gb-good, #4fd1a5);
}

.mission-banner__text {
  display: flex;
  flex: 1 1 18rem;
  flex-direction: column;
  gap: 2px;
  line-height: 1.4;
}

.mission-banner__hint {
  font-size: 0.85rem;
  opacity: 0.75;
}

.mission-banner__back {
  flex: none;
  text-decoration: none;
}
</style>
