<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import { MISSIONS } from 'src/story/missions'

/* A practice-room mission handed out by this section. */
const props = defineProps({ id: { type: String, required: true } })

const { t } = useI18n()
const game = useGameStore()
const m = computed(() => MISSIONS[props.id])
const done = computed(() => game.save?.missions?.[props.id] === 'done')
</script>

<template>
  <aside class="mission" :class="{ 'is-done': done }" :aria-label="t('missions.label')">
    <span class="mission__icon" aria-hidden="true">
      <q-icon :name="done ? 'check' : m.icon" size="24px" />
    </span>
    <div class="mission__body">
      <p class="mission__kicker">{{ done ? t('missions.doneLabel') : t('missions.label') }}</p>
      <p class="mission__title">{{ t(`missions.list.${id}.title`) }}</p>
      <p class="mission__task">{{ t(`missions.list.${id}.task`) }}</p>
      <p class="mission__meta">
        {{ t('missions.rewardIs', { reward: t(`missions.reward.${id}`) }) }}
        {{ t('missions.unlocks', { topic: t(`missions.topics.${m.topic}`) }) }}
      </p>
      <router-link v-if="!done" :to="m.tool" class="gb-btn gb-btn--small mission__go">
        <q-icon name="open_in_new" size="16px" class="q-mr-xs" />{{
          t(`missions.tools.${m.tool.slice(1)}`)
        }}
      </router-link>
    </div>
  </aside>
</template>

<style scoped>
.mission {
  display: flex;
  gap: 14px;
  margin: 22px 0 6px;
  padding: 14px 16px;
  border: 1.5px dashed var(--gb-accent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--gb-accent) 7%, transparent);
}

.mission.is-done {
  border-style: solid;
  opacity: 0.85;
}

.mission__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--gb-accent);
  color: var(--gb-paper);
}

.mission__body p {
  margin: 0;
}

.mission__kicker {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--gb-accent);
}

.mission__title {
  font-family: var(--gb-serif);
  font-size: 1.15rem;
  font-weight: 700;
}

.mission__task {
  margin-top: 2px !important;
  line-height: 1.45;
}

.mission__meta {
  margin-top: 4px !important;
  font-size: 0.86rem;
  color: var(--gb-muted);
}

.mission__go {
  margin-top: 10px;
  text-decoration: none;
}
</style>
