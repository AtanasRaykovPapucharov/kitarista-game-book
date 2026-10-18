<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import { useStory } from 'src/game/useStory'
import { soundOn, toggleSound, cues } from 'src/game/sound'
import TurnToButton from './TurnToButton.vue'
import StatChanges from './StatChanges.vue'
import ChordsLesson from './lessons/ChordsLesson.vue'
import TuningLesson from './lessons/TuningLesson.vue'
import IntervalsLesson from './lessons/IntervalsLesson.vue'
import RhythmLesson from './lessons/RhythmLesson.vue'

/* A guitar lesson inside the book: a short explanation, an exercise
   built from the practice room's tools, then the book goes on.
   Each lesson also links to its full tool in the practice room. */
const props = defineProps({ lesson: { type: Object, required: true } })

const { t } = useI18n()
const game = useGameStore()
const { testText } = useStory()

const LESSONS = {
  chords: { component: ChordsLesson, tool: '/chords', toolLabel: 'chords', ear: false },
  tuning: { component: TuningLesson, tool: '/tuner', toolLabel: 'tuner', ear: true },
  intervals: { component: IntervalsLesson, tool: '/intervals', toolLabel: 'intervals', ear: true },
  rhythm: { component: RhythmLesson, tool: '/compas', toolLabel: 'compas', ear: true },
}

const def = computed(() => LESSONS[props.lesson.id])
const resolved = computed(() => game.save.resolved)

function done(result) {
  game.finishLesson(result)
  game.save.resolved?.success ? cues.success() : cues.failure()
}
</script>

<template>
  <section class="challenge lesson" :aria-label="t(`lessons.${lesson.id}.title`)">
    <header class="challenge__head">
      <h2 class="challenge__title">{{ t(`lessons.${lesson.id}.title`) }}</h2>
      <p class="challenge__rule">{{ t(`lessons.${lesson.id}.intro`) }}</p>
    </header>

    <div v-if="def.ear && !soundOn && !resolved" class="lesson__sound">
      <span>{{ t('lessons.soundNeeded') }}</span>
      <button type="button" class="gb-btn gb-btn--small" @click="toggleSound">
        {{ t('lessons.turnOnSound') }}
      </button>
    </div>

    <component :is="def.component" v-if="!resolved" @done="done" />

    <template v-else>
      <p class="challenge__verdict" :class="resolved.success ? 'is-success' : 'is-failure'">
        <span class="verdict-word">{{
          resolved.success ? t('lessons.passed') : t('lessons.failed')
        }}</span>
        <span class="verdict-math">{{
          t('lessons.score', { score: resolved.score, total: resolved.total })
        }}</span>
      </p>
      <p class="challenge__outcome">{{ testText(game.save.section, resolved.success) }}</p>
      <StatChanges :changes="game.save.lastChanges ?? []" />
      <p class="lesson__tool">
        <router-link :to="def.tool" class="gb-link">
          {{ t('lessons.practice', { tool: t(`lessons.tools.${def.toolLabel}`) }) }}
        </router-link>
      </p>
      <TurnToButton :to="resolved.to" @go="game.continueOn()" />
    </template>
  </section>
</template>

<style scoped>
.lesson__sound {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 12px 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--gb-hover);
}

.lesson__tool {
  margin: 10px 0 0;
}
</style>
