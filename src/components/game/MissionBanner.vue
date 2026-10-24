<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import { MISSIONS } from 'src/story/missions'
import { EXERCISES } from 'src/story/exercises'

/* In the practice room: the book's mission for this tool, always in view,
   with a way back to the book – and, once done, what was won. */
const { t } = useI18n()
const route = useRoute()
const game = useGameStore()
// the reader can put the banner away; it comes back on the next visit
const hidden = ref(false)

const playing = computed(() => game.save?.status === 'playing')
const done = computed(() => (playing.value ? game.missionNews.filter((id) => MISSIONS[id]) : []))
const active = computed(() =>
  playing.value
    ? Object.entries(game.save.missions ?? {})
        .filter(
          ([id, state]) =>
            state === 'active' &&
            (MISSIONS[id]?.tool === route.path ||
              (route.path === '/coach' && EXERCISES[id] && route.query.ex === id)),
        )
        .map(([id]) => id)
    : [],
)
// Several missions can wait on the same tool. Showing them all would fill the
// screen, so one is shown at a time with a switcher.
const at = ref(0)
// a link can name the mission it is for (?m=…); show that one first
watch(
  [active, () => route.query.m],
  ([list, wanted]) => {
    const i = list.indexOf(wanted)
    if (i >= 0) at.value = i
    else if (at.value >= list.length) at.value = 0
  },
  { immediate: true },
)
const shown = computed(() => active.value[Math.min(at.value, active.value.length - 1)])
const step = (d) => {
  at.value = (at.value + d + active.value.length) % active.value.length
}

const statOf = (id) => MISSIONS[id].reward[0].stat
</script>

<template>
  <div v-if="!hidden && (done.length || shown)" class="mission-banner-wrap">
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
      <button
        type="button"
        class="mission-banner__x"
        :aria-label="t('common.close')"
        @click="hidden = true"
      >
        <q-icon name="close" size="20px" />
      </button>
    </section>

    <section v-if="shown" class="mission-banner">
      <q-icon :name="MISSIONS[shown].icon" size="26px" class="mission-banner__icon" />
      <div class="mission-banner__text">
        <strong>{{ t('missions.fromBook', { title: t(`missions.list.${shown}.title`) }) }}</strong>
        <span>{{
          route.path === '/coach' ? t('missions.coachTask') : t(`missions.list.${shown}.task`)
        }}</span>
        <span class="mission-banner__hint">{{ t('missions.inProgress') }}</span>
      </div>
      <div v-if="active.length > 1" class="mission-banner__nav">
        <button type="button" :aria-label="t('missions.prev')" @click="step(-1)">
          <q-icon name="chevron_left" size="20px" />
        </button>
        <span>{{ at + 1 }} / {{ active.length }}</span>
        <button type="button" :aria-label="t('missions.next')" @click="step(1)">
          <q-icon name="chevron_right" size="20px" />
        </button>
      </div>
      <router-link to="/play" class="gb-btn mission-banner__back">
        <q-icon name="auto_stories" size="18px" class="q-mr-xs" />{{ t('missions.back') }}
      </router-link>
      <button
        type="button"
        class="mission-banner__x"
        :aria-label="t('common.close')"
        @click="hidden = true"
      >
        <q-icon name="close" size="20px" />
      </button>
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

.mission-banner__nav {
  display: flex;
  flex: none;
  align-items: center;
  gap: 4px;
  font-variant-numeric: lining-nums;
}

.mission-banner__nav button {
  display: grid;
  place-items: center;
  padding: 2px;
  border: 1px solid currentColor;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.8;
}

.mission-banner__nav button:hover,
.mission-banner__nav button:focus-visible {
  opacity: 1;
}

.mission-banner__x {
  flex: none;
  padding: 4px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
}

.mission-banner__x:hover,
.mission-banner__x:focus-visible {
  opacity: 1;
}
</style>
