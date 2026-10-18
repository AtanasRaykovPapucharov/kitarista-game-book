<script setup>
import { useI18n } from 'vue-i18n'
import { playNote } from 'src/game/sound'
import { useLessonRounds, shuffle } from './useLessonRounds'

/* Ears: is the string sharp or flat against the reference? */
const emit = defineEmits(['done'])
const { t } = useI18n()

const OPEN_STRINGS = shuffle([40, 45, 50, 55, 59, 64]) // E A D G B E
const OFFSETS = [45, 28, 16] // cents – each round a little harder
const { round, index, answer, answered, total, last, choose, next } = useLessonRounds((i) => {
  const cents = OFFSETS[i] * (Math.random() < 0.5 ? -1 : 1)
  return { midi: OPEN_STRINGS[i], cents, correct: cents > 0 ? 'higher' : 'lower' }
})

function listen() {
  playNote(round.value.midi) // reference
  playNote(round.value.midi, { cents: round.value.cents, delay: 1.1 }) // the string
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
    <p class="lesson-quiz__ask">{{ t('lessons.tuning.ask') }}</p>
    <div class="lesson-quiz__options">
      <button
        v-for="o in ['lower', 'higher']"
        :key="o"
        type="button"
        class="gb-btn lesson-quiz__option"
        :class="{
          'is-right': answered && o === round.correct,
          'is-wrong': answer === o && o !== round.correct,
        }"
        :disabled="answered"
        @click="choose(o)"
      >
        {{ t(`lessons.tuning.${o}`) }}
      </button>
    </div>
    <p v-if="answered" class="lesson-quiz__feedback" role="status">
      {{
        answer === round.correct
          ? t('lessons.correct')
          : t('lessons.wrong', { answer: t(`lessons.tuning.${round.correct}`).toLowerCase() })
      }}
    </p>
    <div v-if="answered" class="lesson-quiz__actions">
      <button type="button" class="gb-btn" @click="listen">{{ t('lessons.listenAgain') }}</button>
      <button type="button" class="gb-btn gb-btn--primary" @click="advance">
        {{ last ? t('lessons.finish') : t('lessons.next') }}
      </button>
    </div>
  </div>
</template>
