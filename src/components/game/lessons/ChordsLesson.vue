<script setup>
import { useI18n } from 'vue-i18n'
import ChordDiagram from 'src/components/claude/ChordDiagram.vue'
import { playChord } from 'src/game/sound'
import { useLessonRounds, shuffle } from './useLessonRounds'

/* Eyes: read a chord diagram (the practice room's ChordDiagram). */
const emit = defineEmits(['done'])
const { t } = useI18n()

const POOL = shuffle(['Em', 'Am', 'C', 'G', 'D', 'E', 'A', 'Dm'])
const { round, index, answer, answered, total, last, choose, next } = useLessonRounds((i) => {
  const correct = POOL[i]
  const others = shuffle(POOL.filter((c) => c !== correct)).slice(0, 2)
  return { correct, options: shuffle([correct, ...others]) }
})

function pick(c) {
  choose(c)
  playChord(round.value.correct)
}

function advance() {
  const result = next()
  if (result) emit('done', result)
}
</script>

<template>
  <div class="lesson-quiz">
    <p class="lesson-quiz__count">{{ t('lessons.question', { n: index + 1, total }) }}</p>
    <p class="lesson-quiz__ask">{{ t('lessons.chords.ask') }}</p>
    <div class="lesson-quiz__figure"><ChordDiagram :chord="round.correct" /></div>
    <div class="lesson-quiz__options">
      <button
        v-for="c in round.options"
        :key="c"
        type="button"
        class="gb-btn lesson-quiz__option"
        :class="{
          'is-right': answered && c === round.correct,
          'is-wrong': answer === c && c !== round.correct,
        }"
        :disabled="answered"
        @click="pick(c)"
      >
        {{ c }}
      </button>
    </div>
    <p v-if="answered" class="lesson-quiz__feedback" role="status">
      {{
        answer === round.correct
          ? t('lessons.correct')
          : t('lessons.wrong', { answer: round.correct })
      }}
    </p>
    <div v-if="answered" class="lesson-quiz__actions">
      <button type="button" class="gb-btn" @click="playChord(round.correct)">
        {{ t('lessons.listenAgain') }}
      </button>
      <button type="button" class="gb-btn gb-btn--primary" @click="advance">
        {{ last ? t('lessons.finish') : t('lessons.next') }}
      </button>
    </div>
  </div>
</template>
