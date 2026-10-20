<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ChordDiagram from 'src/components/claude/ChordDiagram.vue'
import { playNote, playChord } from 'src/game/sound'
import { makeQuestion } from 'src/game/musicQuestions'

/* A music move in a duel: one question from what the reader learned
   in the practice room. Emits answer(true | false). */
const props = defineProps({ topics: { type: Array, required: true } })
const emit = defineEmits(['answer', 'cancel'])

const { t } = useI18n()
const q = ref(makeQuestion(props.topics))

function listen() {
  const v = q.value
  if (v.kind === 'interval') {
    playNote(v.root)
    playNote(v.root + v.answer, { delay: 0.75 })
  } else if (v.kind === 'tuning') {
    playNote(v.midi)
    playNote(v.midi, { cents: v.cents, delay: 1.1 })
  }
}
if (q.value.kind === 'interval' || q.value.kind === 'tuning') setTimeout(listen, 200)

const label = (o) => {
  const v = q.value
  if (v.kind === 'interval') return t(`tones.intervals.s${o}`)
  if (v.kind === 'tuning') return t(`lessons.tuning.${o}`)
  return o
}

function choose(o) {
  if (q.value.kind === 'diagram') playChord(q.value.chord)
  emit('answer', o === q.value.answer)
}
</script>

<template>
  <div class="music-move" role="group" :aria-label="t('duel.musicMove')">
    <p class="music-move__prompt">
      <template v-if="q.kind === 'diagram'">{{ t('mq.diagram') }}</template>
      <template v-else-if="q.kind === 'interval'">{{ t('mq.interval') }}</template>
      <template v-else-if="q.kind === 'odd-note'">
        {{ t('mq.oddNote', { scale: `${q.rootName} ${t(`tones.scales.${q.scaleKey}`)}` }) }}
      </template>
      <template v-else>{{ t('mq.tuning') }}</template>
    </p>
    <div v-if="q.kind === 'diagram'" class="music-move__figure">
      <ChordDiagram :chord="q.chord" />
    </div>
    <button
      v-if="q.kind === 'interval' || q.kind === 'tuning'"
      type="button"
      class="gb-btn gb-btn--small"
      @click="listen"
    >
      {{ t('lessons.listenAgain') }}
    </button>
    <div class="music-move__options">
      <button v-for="o in q.options" :key="o" type="button" class="gb-btn" @click="choose(o)">
        {{ label(o) }}
      </button>
    </div>
    <button type="button" class="gb-link music-move__cancel" @click="emit('cancel')">
      {{ t('common.cancel') }}
    </button>
  </div>
</template>

<style scoped>
.music-move {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin: 12px 0;
  padding: 14px 16px;
  border: 1.5px solid var(--gb-accent);
  border-radius: 14px;
  background: var(--gb-hover);
}

.music-move__prompt {
  margin: 0;
  font-family: var(--gb-serif);
  font-size: 1.1rem;
}

.music-move__figure :deep(.chord-diagram) {
  width: 96px;
  height: auto;
}

.music-move__options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.music-move__cancel {
  font-size: 0.88rem;
}
</style>
