<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MiniFretboard from 'src/components/claude/MiniFretboard.vue'
import { TUNING, stringForMidi } from 'src/components/claude/music'
import { playNote } from 'src/game/sound'
import { useLessonRounds, shuffle } from './useLessonRounds'

/* Ears: octave, fifth or major third? Afterwards the practice room's
   MiniFretboard shows where the two notes sit on the neck. */
const emit = defineEmits(['done'])
const { t } = useI18n()

const INTERVALS = [4, 7, 12]
const targets = shuffle([...INTERVALS, INTERVALS[Math.floor(Math.random() * 3)]])
const { round, index, answer, answered, total, last, choose, next } = useLessonRounds((i) => {
  const root = 45 + Math.floor(Math.random() * 8) // A2 … E3
  return { root, correct: targets[i] }
})

const position = (midi) => {
  const string = stringForMidi(midi)
  return { string, fret: midi - TUNING[string - 1] }
}
const positions = computed(() => [
  position(round.value.root),
  position(round.value.root + round.value.correct),
])

function listen() {
  const { root, correct } = round.value
  playNote(root)
  playNote(root + correct, { delay: 0.8 })
  playNote(root, { delay: 1.8 })
  playNote(root + correct, { delay: 1.8 })
}

function advance() {
  const result = next()
  if (result) emit('done', result)
}
</script>

<template>
  <div class="lesson-quiz">
    <p class="lesson-quiz__count">{{ t('lessons.question', { n: index + 1, total }) }}</p>
    <button type="button" class="gb-btn gb-btn--primary" @click="listen">
      {{ t('lessons.listen') }}
    </button>
    <p class="lesson-quiz__ask">{{ t('lessons.intervals.ask') }}</p>
    <div class="lesson-quiz__options">
      <button
        v-for="n in INTERVALS"
        :key="n"
        type="button"
        class="gb-btn lesson-quiz__option lesson-quiz__option--tall"
        :class="{
          'is-right': answered && n === round.correct,
          'is-wrong': answer === n && n !== round.correct,
        }"
        :disabled="answered"
        @click="choose(n)"
      >
        <span>{{ t(`lessons.intervals.names.i${n}`) }}</span>
        <span class="lesson-quiz__hint">{{ t(`lessons.intervals.hints.i${n}`) }}</span>
      </button>
    </div>
    <template v-if="answered">
      <p class="lesson-quiz__feedback" role="status">
        {{
          answer === round.correct
            ? t('lessons.correct')
            : t('lessons.wrong', {
                answer: t(`lessons.intervals.names.i${round.correct}`).toLowerCase(),
              })
        }}
      </p>
      <p class="lesson-quiz__ask">{{ t('lessons.intervals.where') }}</p>
      <div class="lesson-quiz__figure lesson-quiz__figure--wide">
        <MiniFretboard :positions="positions" />
      </div>
      <div class="lesson-quiz__actions">
        <button type="button" class="gb-btn" @click="listen">{{ t('lessons.listenAgain') }}</button>
        <button type="button" class="gb-btn gb-btn--primary" @click="advance">
          {{ last ? t('lessons.finish') : t('lessons.next') }}
        </button>
      </div>
    </template>
  </div>
</template>
