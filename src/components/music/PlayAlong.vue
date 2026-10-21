<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MiniFretboard from 'src/components/claude/MiniFretboard.vue'
import { EXERCISES } from 'src/story/exercises'
import { NOTE_NAMES } from './toneAnalysis'
import { matches } from './pitch'
import { useListener } from './useListener'
import { playNote, cues } from 'src/game/sound'

/* One exercise on the real guitar: note after note, the app listens
   and moves on when it hears the right one. Emits done(). */
const props = defineProps({ id: { type: String, required: true } })
const emit = defineEmits(['done'])

const { t } = useI18n()
const { listening, error, heard, level, start, stop } = useListener()

const steps = computed(() => EXERCISES[props.id].steps)
const index = ref(0)
const finished = ref(false)
const current = computed(() => steps.value[index.value])
const nameOf = (midi) => NOTE_NAMES[midi % 12]
const where = (s) =>
  s.fret === 0
    ? t('coach.open', { string: s.string })
    : t('coach.at', { string: s.string, fret: s.fret })

watch(
  () => props.id,
  () => {
    index.value = 0
    finished.value = false
  },
)

// a heard note that matches the target counts – once
let locked = false
watch(heard, (h) => {
  if (!h || finished.value || locked || !matches(h.midi, current.value.midi)) return
  locked = true
  cues.tick(index.value)
  setTimeout(() => {
    locked = false
    if (index.value < steps.value.length - 1) index.value += 1
    else {
      finished.value = true
      stop()
      cues.achievement()
      emit('done')
    }
  }, 350)
})

function restart() {
  index.value = 0
  finished.value = false
}

const heardText = computed(() => {
  if (!listening.value) return ''
  if (!heard.value) return t('coach.listening')
  const c = heard.value.cents
  return t('coach.heard', { note: nameOf(heard.value.midi), cents: c > 0 ? `+${c}` : c })
})
</script>

<template>
  <section class="play-along" :aria-label="t(`missions.list.${id}.title`)">
    <ol class="pa-steps" :aria-label="t('coach.steps')">
      <li
        v-for="(s, i) in steps"
        :key="i"
        :class="{ 'is-done': i < index || finished, 'is-now': i === index && !finished }"
      >
        <q-icon v-if="i < index || finished" name="check" size="14px" />
        {{ nameOf(s.midi) }}
      </li>
    </ol>

    <template v-if="!finished">
      <div class="pa-target">
        <p class="pa-label">{{ t('coach.playNow', { n: index + 1, total: steps.length }) }}</p>
        <p class="pa-note">{{ nameOf(current.midi) }}</p>
        <p class="pa-where">{{ where(current) }}</p>
        <div class="pa-board">
          <MiniFretboard :positions="[{ string: current.string, fret: current.fret }]" />
        </div>
        <button type="button" class="gb-btn gb-btn--small" @click="playNote(current.midi)">
          <q-icon name="volume_up" size="16px" class="q-mr-xs" />{{ t('coach.hearIt') }}
        </button>
      </div>

      <div class="pa-mic">
        <button v-if="!listening" type="button" class="gb-btn gb-btn--primary" @click="start">
          <q-icon name="mic" size="18px" class="q-mr-xs" />{{ t('coach.start') }}
        </button>
        <template v-else>
          <div class="pa-meter" aria-hidden="true">
            <span :style="{ width: `${Math.round(level * 100)}%` }" />
          </div>
          <p class="pa-heard" role="status" aria-live="polite">{{ heardText }}</p>
          <button type="button" class="gb-link" @click="stop">{{ t('coach.stop') }}</button>
        </template>
        <p v-if="error" class="pa-error" role="alert">{{ t(`coach.errors.${error}`) }}</p>
        <p class="pa-privacy">{{ t('coach.privacy') }}</p>
      </div>
    </template>

    <div v-else class="pa-done" role="status">
      <q-icon name="military_tech" size="34px" />
      <div>
        <p class="pa-done-title">{{ t('coach.done') }}</p>
        <button type="button" class="gb-link" @click="restart">{{ t('coach.again') }}</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.play-along {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pa-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pa-steps li {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-width: 2.6em;
  justify-content: center;
  padding: 3px 10px;
  border: 1.5px solid var(--gb-rule);
  border-radius: 999px;
  font-weight: 600;
  color: var(--gb-muted);
}

.pa-steps li.is-now {
  border-color: var(--gb-accent);
  color: var(--gb-ink);
}

.pa-steps li.is-done {
  border-color: var(--gb-good);
  color: var(--gb-good);
}

.pa-target {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.pa-target p,
.pa-mic p {
  margin: 0;
}

.pa-label {
  font-size: 0.85rem;
  color: var(--gb-muted);
}

.pa-note {
  font-family: var(--gb-serif);
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: var(--gb-accent);
}

.pa-where {
  font-size: 1.05rem;
}

.pa-board {
  width: min(100%, 420px);
}

.pa-board :deep(svg) {
  width: 100%;
  height: auto;
}

.pa-mic {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--gb-rule);
}

.pa-meter {
  width: min(100%, 320px);
  height: 8px;
  border-radius: 999px;
  background: var(--gb-rule);
  overflow: hidden;
}

.pa-meter span {
  display: block;
  height: 100%;
  background: var(--gb-accent);
  transition: width 0.08s linear;
}

.pa-heard {
  font-size: 1.1rem;
  font-weight: 600;
}

.pa-error {
  color: var(--gb-bad);
}

.pa-privacy {
  font-size: 0.82rem;
  color: var(--gb-muted);
}

.pa-done {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1.5px solid var(--gb-good);
  border-radius: 14px;
  color: var(--gb-good);
}

.pa-done-title {
  margin: 0;
  font-family: var(--gb-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gb-ink);
}

@media (prefers-reduced-motion: reduce) {
  .pa-meter span {
    transition: none;
  }
}
</style>
