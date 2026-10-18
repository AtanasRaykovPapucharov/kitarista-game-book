<template>
  <section class="gt" aria-label="Guitar tuner">
    <div class="gt__body">
      <q-select
        v-model="tuningId"
        :options="TUNINGS"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        outlined
        dense
        label="Tuning"
        :dark="q.dark.isActive"
        class="gt__select"
        popup-content-class="gt-menu"
      >
        <template #selected>
          <div class="gt__selected">
            <span>{{ currentTuning.label }}</span>
            <span class="gt__selected-notes">{{ notesLine }}</span>
          </div>
        </template>

        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="gt-menu__notes">{{ formatNotes(scope.opt.notes) }}</span>
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <!-- Display window -->
      <div class="gt__display" :class="`is-${status}`">
        <svg class="gt__gauge" viewBox="0 0 300 172" role="img" :aria-label="gaugeLabel">
          <path class="gt__zone" :d="ZONE_PATH" />
          <line
            v-for="t in TICKS"
            :key="t.c"
            class="gt__tick"
            :class="{ 'gt__tick--major': t.major }"
            :x1="t.x1"
            :y1="t.y1"
            :x2="t.x2"
            :y2="t.y2"
          />
          <text
            v-for="l in LABELS"
            :key="l.text"
            class="gt__label"
            :x="l.x"
            :y="l.y"
            text-anchor="middle"
          >
            {{ l.text }}
          </text>
          <text class="gt__label gt__label--sign" x="16" y="168">♭</text>
          <text class="gt__label gt__label--sign" x="284" y="168" text-anchor="end">♯</text>
          <g class="gt__needle" :style="{ transform: `rotate(${needleAngle}deg)` }">
            <line :x1="CX" :y1="CY" :x2="CX" :y2="CY - R + 6" />
          </g>
          <circle class="gt__hub" :cx="CX" :cy="CY" r="7" />
        </svg>

        <div class="gt__note" aria-hidden="true">
          <template v-if="showNote">
            <span>{{ target.name }}</span
            ><span class="gt__note-octave">{{ target.octave }}</span>
          </template>
          <span v-else class="gt__note-empty">–</span>
        </div>

        <div class="gt__readout">
          <span class="gt__cents">{{ centsText }}</span>
          <span class="gt__status" aria-live="polite">{{ statusText }}</span>
          <span class="gt__hz">{{ hzText }}</span>
        </div>
      </div>

      <!-- Strings, low to high -->
      <div
        class="gt__strings"
        role="group"
        :aria-label="mode === 'manual' ? 'Choose a string' : 'Play a reference tone'"
      >
        <button
          v-for="(s, i) in strings"
          :key="`${tuningId}-${i}`"
          type="button"
          class="gt__string"
          :class="{ 'is-target': isHighlighted(i) }"
          :aria-pressed="mode === 'manual' ? String(i === selectedIndex) : undefined"
          :aria-label="`String ${s.number}, ${s.spoken}${tuned.has(i) ? ', in tune' : ''}. Play reference tone`"
          @click="onStringClick(i)"
        >
          <span class="gt__string-line" :style="{ height: `${s.thickness}px` }" />
          <span class="gt__string-note"
            >{{ s.name }}<span class="gt__string-oct">{{ s.octave }}</span></span
          >
          <span class="gt__string-num">{{ s.number }}</span>
          <q-icon v-if="tuned.has(i)" name="check_circle" class="gt__string-check" />
        </button>
      </div>
      <p class="gt__hint">
        {{
          mode === 'manual'
            ? 'Tap a string to select it and hear its pitch.'
            : 'Tap a string to hear its pitch.'
        }}
      </p>

      <div class="gt__controls">
        <q-btn
          unelevated
          no-caps
          class="gt__start"
          :icon="listening ? 'stop' : 'mic'"
          :label="listening ? 'Stop' : 'Start tuning'"
          :loading="starting"
          @click="listening ? stop() : start()"
        />

        <div class="gt__segmented" role="group" aria-label="String detection">
          <button type="button" :aria-pressed="String(mode === 'auto')" @click="setMode('auto')">
            Auto
          </button>
          <button
            type="button"
            :aria-pressed="String(mode === 'manual')"
            @click="setMode('manual')"
          >
            Manual
          </button>
        </div>

        <div class="gt__a4">
          <q-btn
            flat
            round
            dense
            size="sm"
            icon="remove"
            aria-label="Lower reference pitch"
            :disable="a4 <= A4_MIN"
            @click="a4--"
          />
          <span>A4 = {{ a4 }} Hz</span>
          <q-btn
            flat
            round
            dense
            size="sm"
            icon="add"
            aria-label="Raise reference pitch"
            :disable="a4 >= A4_MAX"
            @click="a4++"
          />
        </div>
      </div>

      <q-banner v-if="error" dense rounded class="gt__error">
        <template #avatar><q-icon name="mic_off" /></template>
        {{ error }}
      </q-banner>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  initialTuning: { type: String, default: 'standard' },
  showThemeToggle: { type: Boolean, default: true },
})

const q = useQuasar()

/* ---------- Tunings ---------- */
const TUNINGS = [
  { value: 'standard', label: 'Standard', notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  { value: 'drop-d', label: 'Drop D', notes: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  {
    value: 'half-down',
    label: 'Half step down',
    notes: ['Eb2', 'Ab2', 'Db3', 'Gb3', 'Bb3', 'Eb4'],
  },
  { value: 'full-down', label: 'Full step down', notes: ['D2', 'G2', 'C3', 'F3', 'A3', 'D4'] },
  { value: 'drop-c', label: 'Drop C', notes: ['C2', 'G2', 'C3', 'F3', 'A3', 'D4'] },
  { value: 'dadgad', label: 'DADGAD', notes: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'] },
  { value: 'open-g', label: 'Open G', notes: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'] },
  { value: 'open-d', label: 'Open D', notes: ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'] },
  { value: 'open-e', label: 'Open E', notes: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'] },
  { value: 'open-c', label: 'Open C', notes: ['C2', 'G2', 'C3', 'G3', 'C4', 'E4'] },
]

const SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const THICKNESS = [3.2, 2.7, 2.2, 1.7, 1.3, 1]
const A4_MIN = 430
const A4_MAX = 450

function parseNote(note) {
  const [, letter, acc, octave] = /^([A-G])([#b]?)(\d)$/.exec(note)
  const offset = acc === '#' ? 1 : acc === 'b' ? -1 : 0
  return {
    midi: (Number(octave) + 1) * 12 + SEMITONES[letter] + offset,
    name: letter + (acc === '#' ? '♯' : acc === 'b' ? '♭' : ''),
    spoken: letter + (acc === '#' ? ' sharp' : acc === 'b' ? ' flat' : '') + ' ' + octave,
    octave,
  }
}

function formatNotes(notes) {
  return notes.map((n) => parseNote(n).name).join(' ')
}

/* ---------- State ---------- */
const tuningId = ref(
  TUNINGS.some((t) => t.value === props.initialTuning) ? props.initialTuning : 'standard',
)
const mode = ref('auto')
const selectedIndex = ref(0)
const detectedIndex = ref(0)
const a4 = ref(440)
const listening = ref(false)
const starting = ref(false)
const hasSignal = ref(false)
const frequency = ref(null)
const error = ref('')
const tuned = ref(new Set())

const currentTuning = computed(() => TUNINGS.find((t) => t.value === tuningId.value))
const notesLine = computed(() => formatNotes(currentTuning.value.notes))

const strings = computed(() =>
  currentTuning.value.notes.map((n, i) => {
    const p = parseNote(n)
    return {
      ...p,
      number: 6 - i,
      thickness: THICKNESS[i],
      freq: a4.value * 2 ** ((p.midi - 69) / 12),
    }
  }),
)

const targetIndex = computed(() =>
  mode.value === 'manual' ? selectedIndex.value : detectedIndex.value,
)
const target = computed(() => strings.value[targetIndex.value])

const cents = computed(() => {
  if (!frequency.value) return 0
  return 1200 * Math.log2(frequency.value / target.value.freq)
})

const status = computed(() => {
  if (!listening.value) return 'idle'
  if (!hasSignal.value) return 'waiting'
  if (Math.abs(cents.value) <= 5) return 'in-tune'
  return cents.value < 0 ? 'flat' : 'sharp'
})

const STATUS_TEXT = {
  idle: 'Press start',
  waiting: 'Pluck a string',
  'in-tune': 'In tune',
  flat: 'Tune up',
  sharp: 'Tune down',
}
const statusText = computed(() => STATUS_TEXT[status.value])

const showNote = computed(() => mode.value === 'manual' || hasSignal.value)

const centsText = computed(() => {
  if (!hasSignal.value) return '– ¢'
  const c = Math.round(cents.value)
  if (Math.abs(c) > 99) return c < 0 ? '< −99 ¢' : '> +99 ¢'
  return `${c > 0 ? '+' : c < 0 ? '−' : ''}${Math.abs(c)} ¢`
})

const hzText = computed(() =>
  hasSignal.value ? `${frequency.value.toFixed(1)} Hz` : `${target.value.freq.toFixed(1)} Hz`,
)

const gaugeLabel = computed(() =>
  hasSignal.value
    ? `${centsText.value} from ${target.value.spoken}. ${statusText.value}.`
    : 'Tuning gauge, no signal',
)

function isHighlighted(i) {
  return i === targetIndex.value && (mode.value === 'manual' || hasSignal.value)
}

/* ---------- Gauge geometry ---------- */
const CX = 150
const CY = 158
const R = 124
const DEG_PER_CENT = 70 / 50

function polar(r, deg) {
  const rad = (deg * Math.PI) / 180
  return { x: +(CX + r * Math.sin(rad)).toFixed(2), y: +(CY - r * Math.cos(rad)).toFixed(2) }
}

const TICKS = []
for (let c = -50; c <= 50; c += 5) {
  const major = c % 25 === 0
  const len = major ? 16 : c % 10 === 0 ? 10 : 6
  const a = c * DEG_PER_CENT
  const p1 = polar(R, a)
  const p2 = polar(R - len, a)
  TICKS.push({ c, major, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
}

const LABELS = [-50, 0, 50].map((c) => {
  const p = polar(R + 14, c * DEG_PER_CENT)
  return { text: c > 0 ? `+${c}` : c < 0 ? `−${Math.abs(c)}` : '0', x: p.x, y: p.y + 4 }
})

const ZONE_PATH = (() => {
  const r = R - 6
  const p1 = polar(r, -5 * DEG_PER_CENT)
  const p2 = polar(r, 5 * DEG_PER_CENT)
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`
})()

const needleAngle = computed(() => {
  if (!hasSignal.value) return 0
  return Math.max(-50, Math.min(50, cents.value)) * DEG_PER_CENT
})

/* ---------- Audio ---------- */
const MIN_FREQ = 60
const MAX_FREQ = 1000
const SILENCE_RMS = 0.01
const YIN_THRESHOLD = 0.15
const FRAME_MS = 40
const HOLD_MS = 1200
const IN_TUNE_HOLD_MS = 800

let audioCtx = null
let stream = null
let source = null
let analyser = null
let timeBuffer = null
let yinBuffer = null
let rafId = 0
let lastProcess = 0
let lastSignalAt = 0
let inTuneSince = 0
let muteUntil = 0
let history = []

function getContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    audioCtx = new Ctx()
  }
  return audioCtx
}

// YIN pitch detection (cumulative mean normalized difference)
function detectPitch(buffer, sampleRate) {
  let rms = 0
  for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i]
  rms = Math.sqrt(rms / buffer.length)
  if (rms < SILENCE_RMS) return -1

  const minLag = Math.floor(sampleRate / MAX_FREQ)
  const maxLag = Math.min(
    Math.ceil(sampleRate / MIN_FREQ),
    Math.floor(buffer.length / 2),
    yinBuffer.length - 2,
  )
  const windowSize = buffer.length - maxLag
  const cmnd = yinBuffer

  cmnd[0] = 1
  let runningSum = 0
  for (let tau = 1; tau <= maxLag; tau++) {
    let sum = 0
    for (let i = 0; i < windowSize; i++) {
      const delta = buffer[i] - buffer[i + tau]
      sum += delta * delta
    }
    runningSum += sum
    cmnd[tau] = runningSum > 0 ? (sum * tau) / runningSum : 1
  }

  let tau = -1
  for (let t = minLag; t <= maxLag; t++) {
    if (cmnd[t] < YIN_THRESHOLD) {
      while (t + 1 <= maxLag && cmnd[t + 1] < cmnd[t]) t++
      tau = t
      break
    }
  }
  if (tau === -1) return -1

  let refined = tau
  if (tau > 1 && tau < maxLag) {
    const s0 = cmnd[tau - 1]
    const s1 = cmnd[tau]
    const s2 = cmnd[tau + 1]
    const denom = s0 + s2 - 2 * s1
    if (denom !== 0) refined = tau + (s0 - s2) / (2 * denom)
  }
  return sampleRate / refined
}

function nearestString(f) {
  let best = 0
  let bestDist = Infinity
  strings.value.forEach((s, i) => {
    const d = Math.abs(Math.log2(f / s.freq))
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  })
  return best
}

function trackInTune(now) {
  if (Math.abs(cents.value) <= 5) {
    if (!inTuneSince) inTuneSince = now
    else if (now - inTuneSince > IN_TUNE_HOLD_MS && !tuned.value.has(targetIndex.value)) {
      tuned.value = new Set([...tuned.value, targetIndex.value])
    }
  } else {
    inTuneSince = 0
  }
}

function loop(t) {
  rafId = requestAnimationFrame(loop)
  if (!analyser || t - lastProcess < FRAME_MS) return
  lastProcess = t

  const now = performance.now()
  if (now < muteUntil) return

  analyser.getFloatTimeDomainData(timeBuffer)
  const f = detectPitch(timeBuffer, audioCtx.sampleRate)

  if (f > 0) {
    // A jump of more than a semitone usually means a new string: restart smoothing
    if (history.length && Math.abs(1200 * Math.log2(f / history[history.length - 1])) > 100)
      history = []
    history.push(f)
    if (history.length > 5) history.shift()
    const sorted = [...history].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]

    frequency.value = median
    hasSignal.value = true
    lastSignalAt = now
    if (mode.value === 'auto') detectedIndex.value = nearestString(median)
    trackInTune(now)
  } else if (hasSignal.value && now - lastSignalAt > HOLD_MS) {
    hasSignal.value = false
    history = []
    inTuneSince = 0
  }
}

async function start() {
  error.value = ''
  if (!navigator.mediaDevices?.getUserMedia) {
    error.value =
      "This browser can't use the microphone here. Open the page over HTTPS in a recent browser."
    return
  }
  starting.value = true
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    })
    const ctx = getContext()
    if (ctx.state === 'suspended') await ctx.resume()

    source = ctx.createMediaStreamSource(stream)
    analyser = ctx.createAnalyser()
    analyser.fftSize = 4096
    source.connect(analyser)

    timeBuffer = new Float32Array(analyser.fftSize)
    yinBuffer = new Float32Array(Math.ceil(ctx.sampleRate / MIN_FREQ) + 2)
    history = []
    listening.value = true
    rafId = requestAnimationFrame(loop)
  } catch (e) {
    if (e.name === 'NotAllowedError')
      error.value =
        "Microphone access is blocked. Allow it in your browser's site settings, then press Start tuning."
    else if (e.name === 'NotFoundError')
      error.value = 'No microphone found. Connect one and press Start tuning again.'
    else error.value = `The microphone couldn't be opened: ${e.message}`
    stop()
  } finally {
    starting.value = false
  }
}

function stop() {
  cancelAnimationFrame(rafId)
  source?.disconnect()
  stream?.getTracks().forEach((track) => track.stop())
  source = null
  stream = null
  analyser = null
  history = []
  inTuneSince = 0
  listening.value = false
  hasSignal.value = false
  frequency.value = null
}

async function playReference(i) {
  const ctx = getContext()
  if (ctx.state === 'suspended') await ctx.resume()

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const t0 = ctx.currentTime
  osc.type = 'triangle'
  osc.frequency.value = strings.value[i].freq
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.8)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + 1.9)

  // Ignore the mic while the reference tone plays so it isn't read as the guitar
  muteUntil = performance.now() + 2000
}

function onStringClick(i) {
  if (mode.value === 'manual') selectedIndex.value = i
  playReference(i)
}

function setMode(m) {
  if (m === 'manual' && mode.value === 'auto') selectedIndex.value = detectedIndex.value
  mode.value = m
  inTuneSince = 0
}

watch(tuningId, () => {
  tuned.value = new Set()
  detectedIndex.value = 0
  history = []
  inTuneSince = 0
})

watch(a4, () => {
  tuned.value = new Set()
})

onBeforeUnmount(() => {
  stop()
  audioCtx?.close()
  audioCtx = null
})
</script>

<!-- Theme tokens: remove the two body blocks if they already live in src/css/app.scss -->
<style lang="scss">
body.body--light {
  --app-page: #f1f7ff;
  --app-page-end: #e7f7f3;
  --app-surface: #ffffff;
  --app-surface-soft: #e7f5f6;
  --app-surface-raised: #d3ebf0;
  --app-score-surface: #f2fcff;
  --app-text: #17344d;
  --app-muted: #426b83;
  --app-border: #bbdce5;
  --app-header-start: #126d79;
  --app-header-end: #3453a5;
  --app-strong-surface: #146c78;
  --app-strong-text: #f4ffff;
  --app-separator: #bbdce5;
}

body.body--dark {
  --app-page: #0c1a31;
  --app-page-end: #102a3a;
  --app-surface: #152945;
  --app-surface-soft: #1b3856;
  --app-surface-raised: #254968;
  --app-score-surface: #d8f4f3;
  --app-text: #e5f5ff;
  --app-muted: #a6c8df;
  --app-border: #345975;
  --app-header-start: #173b68;
  --app-header-end: #126b73;
  --app-strong-surface: #1c526c;
  --app-strong-text: #efffff;
  --app-separator: #345975;
}

body.body--dark .gt {
  --gt-ok-bright: #4fd1a5;
}

/* q-select dropdown is teleported to body, so it can't be scoped */
.gt-menu {
  background: var(--app-surface);
  color: var(--app-text);
  border: 1px solid var(--app-border);
  border-radius: 12px;

  .q-item--active {
    color: var(--app-text) !important;
    background: var(--app-surface-soft);
    font-weight: 600;
  }
}

.gt-menu__notes {
  color: var(--app-muted);
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
</style>

<style scoped lang="scss">
.gt {
  --gt-ok: #0b8a69;
  --gt-ok-bright: #0b8a69;
  --gt-off: #b45f06;
  --gt-ink: var(--app-header-start);

  max-width: 520px;
  margin: 0 auto;
  background: var(--app-surface);
  color: var(--app-text);
  border: 1px solid var(--app-border);
  border-radius: 20px;
  overflow: hidden;
  font-variant-numeric: tabular-nums;
}

/* Header */
.gt__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(120deg, var(--app-header-start), var(--app-header-end));
  color: var(--app-strong-text);
}

.gt__title {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: 0;
}

.gt__subtitle {
  margin: 2px 0 0;
  font-size: 0.875rem;
  line-height: 1.4;
  opacity: 0.85;
}

.gt__theme {
  color: var(--app-strong-text);
}

/* Body */
.gt__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.gt__select {
  :deep(.q-field__control) {
    background: var(--app-surface-soft);
    border-radius: 12px;
  }
  :deep(.q-field__control:before) {
    border-color: var(--app-border);
  }
  :deep(.q-field__control.text-primary) {
    color: var(--app-header-end) !important;
  }
  :deep(.q-field__native),
  :deep(.q-field__append) {
    color: var(--app-text);
  }
  :deep(.q-field__label) {
    color: var(--app-muted);
  }
}

/* Display window */
.gt__display {
  padding: 16px 16px 14px;
  background: var(--app-score-surface);
  color: var(--gt-ink);
  border: 1px solid var(--app-border);
  border-radius: 16px;
  box-shadow: inset 0 2px 8px rgba(23, 52, 77, 0.1);
  text-align: center;
}

.gt__gauge {
  display: block;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  overflow: visible;
}

.gt__tick {
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  opacity: 0.35;
}

.gt__tick--major {
  stroke-width: 2.5;
  opacity: 0.7;
}

.gt__label {
  fill: currentColor;
  font-size: 11px;
  opacity: 0.7;
}

.gt__label--sign {
  font-size: 18px;
}

.gt__zone {
  fill: none;
  stroke: var(--gt-ok);
  stroke-width: 14;
  opacity: 0.18;
  transition: opacity 0.2s;
}

.gt__needle {
  transform-box: view-box;
  transform-origin: 150px 158px;
  transition:
    transform 0.12s linear,
    opacity 0.2s;

  line {
    stroke: currentColor;
    stroke-width: 3;
    stroke-linecap: round;
  }
}

.gt__hub {
  fill: currentColor;
}

.gt__note {
  margin-top: -6px;
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}

.gt__note-octave {
  margin-left: 2px;
  font-size: 1.25rem;
  font-weight: 600;
  opacity: 0.6;
}

.gt__note-empty {
  opacity: 0.35;
}

.gt__readout {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 0.95rem;
}

.gt__cents {
  text-align: left;
}

.gt__hz {
  text-align: right;
  opacity: 0.75;
}

.gt__status {
  padding: 3px 12px;
  border-radius: 999px;
  background: rgba(18, 109, 121, 0.1);
  font-weight: 600;
  transition:
    background-color 0.2s,
    color 0.2s;
}

/* Display states */
.is-idle,
.is-waiting {
  .gt__needle {
    opacity: 0.35;
  }
}

.is-in-tune {
  .gt__zone {
    opacity: 0.55;
  }
  .gt__needle,
  .gt__note {
    color: var(--gt-ok);
  }
  .gt__status {
    background: var(--gt-ok);
    color: #ffffff;
  }
}

.is-flat,
.is-sharp {
  .gt__needle,
  .gt__status {
    color: var(--gt-off);
  }
  .gt__status {
    background: rgba(180, 95, 6, 0.12);
  }
}

/* Strings */
.gt__strings {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.gt__string {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 4px 8px;
  background: var(--app-surface-soft);
  color: var(--app-text);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  font: inherit;
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s,
    color 0.15s;

  &:hover {
    background: var(--app-surface-raised);
  }

  &:focus-visible {
    outline: 2px solid var(--app-header-end);
    outline-offset: 2px;
  }

  &.is-target {
    background: var(--app-strong-surface);
    border-color: var(--app-strong-surface);
    color: var(--app-strong-text);

    .gt__string-num {
      color: inherit;
      opacity: 0.75;
    }
  }
}

.gt__string-line {
  width: 70%;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.45;
}

.gt__string-note {
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.2;
}

.gt__string-oct {
  margin-left: 1px;
  font-size: 0.7rem;
  opacity: 0.65;
}

.gt__string-num {
  font-size: 0.7rem;
  color: var(--app-muted);
}

.gt__string-check {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 14px;
  color: var(--gt-ok-bright);
}

.is-target .gt__string-check {
  color: var(--app-strong-text);
}

.gt__hint {
  margin: -8px 0 0;
  font-size: 0.8rem;
  color: var(--app-muted);
  text-align: center;
}

/* Controls */
.gt__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.gt__start {
  min-height: 44px;
  padding: 0 18px;
  background: var(--app-strong-surface);
  color: var(--app-strong-text);
  border-radius: 12px;
  font-weight: 600;
}

.gt__segmented {
  display: inline-flex;
  padding: 3px;
  background: var(--app-surface-soft);
  border: 1px solid var(--app-border);
  border-radius: 12px;

  button {
    padding: 6px 14px;
    background: transparent;
    color: var(--app-muted);
    border: 1px solid transparent;
    border-radius: 9px;
    font: inherit;
    font-size: 0.875rem;
    cursor: pointer;

    &[aria-pressed='true'] {
      background: var(--app-surface-raised);
      border-color: var(--app-border);
      color: var(--app-text);
      font-weight: 600;
    }

    &:focus-visible {
      outline: 2px solid var(--app-header-end);
      outline-offset: 1px;
    }
  }
}

.gt__a4 {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--app-muted);
  font-size: 0.875rem;

  span {
    min-width: 92px;
    color: var(--app-text);
    text-align: center;
  }
}

.gt__error {
  background: var(--app-surface-soft);
  color: var(--app-text);
  border: 1px solid var(--app-border);
}

.gt__selected {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-width: 0;
}

.gt__selected-notes {
  color: var(--app-muted);
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

@media (max-width: 440px) {
  .gt__body {
    padding: 14px;
  }
  .gt__note {
    font-size: 3.25rem;
  }
  .gt__strings {
    gap: 6px;
  }
  .gt__string-note {
    font-size: 1rem;
  }
  .gt__controls {
    justify-content: center;
  }
  .gt__start {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gt__needle,
  .gt__zone,
  .gt__status,
  .gt__string {
    transition: none;
  }
}
</style>
