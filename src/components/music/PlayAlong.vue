<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
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

/* ---------- how it is going ---------- */
const tries = ref(0) // wrong notes heard for the current target
const firstTry = ref(0) // notes hit without a wrong one before them
const startedAt = ref(0)
const seconds = ref(0)
let ticker = null

function resetRun() {
  index.value = 0
  lastWrong = null
  prevMidi = null
  advancedAt = Date.now()
  finished.value = false
  tries.value = 0
  firstTry.value = 0
  seconds.value = 0
  startedAt.value = 0
  clearInterval(ticker)
  ticker = null
}

watch(() => props.id, resetRun)

watch(listening, (on) => {
  if (on) {
    startedAt.value = startedAt.value || Date.now()
    ticker = setInterval(() => {
      seconds.value = Math.round((Date.now() - startedAt.value) / 1000)
    }, 1000)
  } else {
    clearInterval(ticker)
    ticker = null
  }
})

/* ---------- live feedback while a note is held ---------- */
/** How far the note being heard is from the target, in semitones (octaves ignored). */
const offBy = computed(() => {
  if (!heard.value || finished.value) return null
  let d = (heard.value.midi - current.value.midi) % 12
  if (d > 6) d -= 12
  if (d < -6) d += 12
  return d
})
const onTarget = computed(() => !!heard.value && matches(heard.value.midi, current.value.midi))
/** −50…+50 cents of the target, for the little meter. */
const cents = computed(() => (onTarget.value ? (heard.value.cents ?? 0) : null))
const inTune = computed(() => cents.value != null && Math.abs(cents.value) <= 12)

// a heard note that matches the target counts – once
let locked = false
let lastWrong = null
let prevMidi = null
let advancedAt = 0
watch(heard, (h) => {
  if (!h || finished.value || locked) return
  if (!matches(h.midi, current.value.midi)) {
    // the note just played still rings while we move on – that is not a mistake,
    // and neither is anything heard in the first moments after advancing
    const ringing = prevMidi != null && matches(h.midi, prevMidi)
    if (!ringing && Date.now() - advancedAt > 700 && h.midi !== lastWrong) {
      lastWrong = h.midi
      tries.value += 1
    }
    return
  }
  if (tries.value === 0) firstTry.value += 1
  lastWrong = null
  locked = true
  cues.tick(index.value)
  setTimeout(() => {
    locked = false
    tries.value = 0
    prevMidi = current.value.midi
    advancedAt = Date.now()
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
  resetRun()
}

function go(d) {
  if (finished.value) return
  index.value = Math.min(steps.value.length - 1, Math.max(0, index.value + d))
  tries.value = 0
  lastWrong = null
  advancedAt = Date.now()
}

/** Play the whole exercise, so you know what you are aiming for. */
let demoTimers = []
const demoing = ref(false)
function hearAll() {
  if (demoing.value) {
    demoTimers.forEach(clearTimeout)
    demoTimers = []
    demoing.value = false
    return
  }
  demoing.value = true
  steps.value.forEach((s, i) => {
    demoTimers.push(setTimeout(() => playNote(s.midi), i * 620))
  })
  demoTimers.push(
    setTimeout(() => {
      demoing.value = false
      demoTimers = []
    }, steps.value.length * 620),
  )
}

onBeforeUnmount(() => {
  clearInterval(ticker)
  demoTimers.forEach(clearTimeout)
})

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
        <div class="pa-row">
          <button type="button" class="gb-btn gb-btn--small" @click="playNote(current.midi)">
            <q-icon name="volume_up" size="16px" class="q-mr-xs" />{{ t('coach.hearIt') }}
          </button>
          <button type="button" class="gb-btn gb-btn--small" @click="hearAll">
            <q-icon :name="demoing ? 'stop' : 'playlist_play'" size="16px" class="q-mr-xs" />
            {{ demoing ? t('coach.stopDemo') : t('coach.hearAll') }}
          </button>
          <button
            type="button"
            class="gb-btn gb-btn--small"
            :disabled="index === 0"
            :aria-label="t('coach.prev')"
            @click="go(-1)"
          >
            <q-icon name="chevron_left" size="18px" />
          </button>
          <button
            type="button"
            class="gb-btn gb-btn--small"
            :disabled="index === steps.length - 1"
            :aria-label="t('coach.next')"
            @click="go(1)"
          >
            <q-icon name="chevron_right" size="18px" />
          </button>
        </div>
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
          <div v-if="onTarget" class="pa-tune" :class="{ 'is-in': inTune }">
            <span class="pa-tune__scale" aria-hidden="true">
              <span
                class="pa-tune__needle"
                :style="{ left: `${50 + Math.max(-50, Math.min(50, cents))}%` }"
              />
            </span>
            <span class="pa-tune__text">
              {{ inTune ? t('coach.inTune') : cents < 0 ? t('coach.flat') : t('coach.sharp') }}
            </span>
          </div>
          <p v-else-if="heard" class="pa-hint" role="status">
            {{ offBy > 0 ? t('coach.tooHigh', { n: offBy }) : t('coach.tooLow', { n: -offBy }) }}
          </p>
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
        <p class="pa-done-stats">
          {{ t('coach.summary', { first: firstTry, total: steps.length, seconds }) }}
        </p>
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

.pa-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pa-tune {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: min(100%, 320px);
}

.pa-tune__scale {
  position: relative;
  display: block;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--gb-bad) 0%,
    var(--gb-rule) 35%,
    var(--gb-good) 50%,
    var(--gb-rule) 65%,
    var(--gb-bad) 100%
  );
}

.pa-tune__needle {
  position: absolute;
  top: -3px;
  width: 3px;
  height: 16px;
  margin-left: -1.5px;
  border-radius: 2px;
  background: var(--gb-ink);
  transition: left 0.08s linear;
}

.pa-tune__text {
  font-size: 0.9rem;
  font-weight: 600;
}

.pa-tune.is-in .pa-tune__text {
  color: var(--gb-good);
}

.pa-hint {
  font-size: 0.95rem;
  color: var(--gb-muted);
}

.pa-done-stats {
  margin: 2px 0 6px !important;
  font-size: 0.92rem;
  color: var(--gb-muted);
  font-variant-numeric: lining-nums;
}

@media (prefers-reduced-motion: reduce) {
  .pa-tune__needle {
    transition: none;
  }
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
