<script setup>
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import { MISSIONS } from 'src/story/missions'

/* Back in the book: what the finished mission gave, plainly. */
const { t } = useI18n()
const game = useGameStore()
const statOf = (id) => MISSIONS[id].reward[0].stat
</script>

<template>
  <section v-if="game.missionNews.length" class="mission-result" role="status" aria-live="polite">
    <div v-for="id in game.missionNews" :key="id" class="mission-result__item">
      <q-icon name="military_tech" size="30px" class="mission-result__icon" />
      <div>
        <p class="mission-result__kicker">{{ t('missions.done') }}</p>
        <p class="mission-result__title">{{ t(`missions.list.${id}.title`) }}</p>
        <ul class="mission-result__list">
          <li>
            {{ t('missions.rewardIs', { reward: t(`missions.reward.${id}`) }) }}
            {{
              t('missions.now', {
                stat: t('stats.' + statOf(id)),
                value: game.save.stats[statOf(id)],
                max: game.save.initial[statOf(id)],
              })
            }}
          </li>
          <li>
            {{ t('missions.unlocked', { topic: t(`missions.topics.${MISSIONS[id].topic}`) }) }}
          </li>
        </ul>
      </div>
    </div>
    <button
      type="button"
      class="gb-btn gb-btn--small mission-result__ok"
      @click="game.dismissMissionNews()"
    >
      {{ t('missions.ok') }}
    </button>
  </section>
</template>

<style scoped>
.mission-result {
  margin: 0 0 22px;
  padding: 14px 16px;
  border: 1.5px solid var(--gb-good);
  border-radius: 14px;
  background: color-mix(in srgb, var(--gb-good) 10%, transparent);
  animation: mission-in 0.5s ease-out both;
}

.mission-result__item {
  display: flex;
  gap: 12px;
}

.mission-result__item + .mission-result__item {
  margin-top: 12px;
}

.mission-result__icon {
  flex: none;
  color: var(--gb-good);
}

.mission-result p {
  margin: 0;
}

.mission-result__kicker {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--gb-good);
}

.mission-result__title {
  font-family: var(--gb-serif);
  font-size: 1.2rem;
  font-weight: 700;
}

.mission-result__list {
  margin: 6px 0 0;
  padding-left: 1.1em;
  line-height: 1.5;
}

.mission-result__ok {
  margin-top: 12px;
}

@keyframes mission-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mission-result {
    animation: none;
  }
}
</style>
