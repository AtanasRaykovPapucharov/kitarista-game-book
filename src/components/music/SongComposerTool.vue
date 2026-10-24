<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import ChordDiagram from 'src/components/claude/ChordDiagram.vue'
import MiniFretboard from 'src/components/claude/MiniFretboard.vue'
import { NOTE_NAMES, SCALES } from './toneAnalysis'
import { playNote, playChord } from 'src/game/sound'

/* The Composer: a key and a scale (Tones), the steps between its notes
   (Intervals), a chord progression and a melody – and the song can be
   written down (Note sheet) or kept as your own. */
const { t } = useI18n()
const game = useGameStore()

const USEFUL = [
  'ionian',
  'aeolian',
  'dorian',
  'phrygian',
  'mixolydian',
  'minorPentatonic',
  'majorPentatonic',
  'phrygianDominant',
  'harmonicMinor',
  'blues',
]
const scales = SCALES.filter((s) => USEFUL.includes(s.key)).sort(
  (a, b) => USEFUL.indexOf(a.key) - USEFUL.indexOf(b.key),
)
const TRIADS = ['', 'm', 'dim', 'aug']
const STEPS = 16
const BARS = 4

const root = ref(9) // A
const scaleKey = ref('minorPentatonic')
const bpm = ref(90)
const prog = ref(['Am', 'F', 'C', 'G'])
const melody = ref(Array(STEPS).fill(null)) // index into the scale, or null for a rest
const playing = ref(false)
const at = ref(-1)
const saved = ref(false)

const scale = computed(() => scales.find((s) => s.key === scaleKey.value) ?? scales[0])
const noteName = (pc) => NOTE_NAMES[pc]
/** The scale, two octaves up from A3, as MIDI. */
const midis = computed(() => {
  const base = 57 + ((((root.value - 9) % 12) + 12) % 12)
  return [...scale.value.iv, ...scale.value.iv.map((i) => i + 12)].map((i) => base + i)
})
/** Steps between neighbouring notes, in semitones – the Intervals lesson made visible. */
const steps = computed(() =>
  scale.value.iv
    .map((v, i, a) => (i ? v - a[i - 1] : v + 12 - a[a.length - 1]))
    .slice(1)
    .concat(12 + scale.value.iv[0] - scale.value.iv.at(-1)),
)

/**
 * Chords that fit the key. A pentatonic or blues scale has too few notes to
 * build chords from, so the chords come from the seven-note scale behind it:
 * natural minor when the scale has a minor third, major otherwise.
 */
const AEOLIAN = [0, 2, 3, 5, 7, 8, 10]
const IONIAN = [0, 2, 4, 5, 7, 9, 11]
const chordScale = computed(() =>
  scale.value.iv.length >= 7 ? scale.value.iv : scale.value.iv.includes(3) ? AEOLIAN : IONIAN,
)
const chordChoices = computed(() => {
  const set = new Set(chordScale.value.map((i) => (root.value + i) % 12))
  const out = []
  for (const pc of chordScale.value.map((i) => (root.value + i) % 12)) {
    for (const q of TRIADS) {
      const iv =
        q === 'm' ? [0, 3, 7] : q === 'dim' ? [0, 3, 6] : q === 'aug' ? [0, 4, 8] : [0, 4, 7]
      if (iv.every((i) => set.has((pc + i) % 12))) {
        out.push(NOTE_NAMES[pc] + q)
        break
      }
    }
  }
  return out.length ? out : [NOTE_NAMES[root.value] + 'm']
})

// keep the progression inside the chosen key (also on the first render)
watch(
  chordChoices,
  (list) => {
    const fallback = [0, 3, 4, 5].map((d) => list[d % list.length]) // I – IV – V – vi-ish
    prog.value = prog.value.map((c, i) => (list.includes(c) ? c : fallback[i % fallback.length]))
  },
  { immediate: true },
)

function setStep(i, degree) {
  melody.value = melody.value.map((v, k) => (k === i ? (v === degree ? null : degree) : v))
  if (degree != null && melody.value[i] != null) playNote(midis.value[degree])
  saved.value = false
}

function surprise() {
  const n = midis.value.length
  let d = Math.floor(Math.random() * 3)
  melody.value = Array.from({ length: STEPS }, (_, i) => {
    if (i % 4 === 3 && Math.random() < 0.4) return null // breathe at the end of a bar
    d = Math.max(0, Math.min(n - 1, d + Math.floor(Math.random() * 5) - 2))
    return d
  })
  melody.value[0] = 0
  melody.value[STEPS - 1] = Math.random() < 0.6 ? 0 : melody.value[STEPS - 1]
  saved.value = false
}

const clear = () => {
  melody.value = Array(STEPS).fill(null)
  saved.value = false
}

let timers = []
function stop() {
  timers.forEach(clearTimeout)
  timers = []
  playing.value = false
  at.value = -1
}

function play() {
  if (playing.value) return stop()
  playing.value = true
  const beat = 60 / bpm.value // one step = an eighth
  const step = beat / 2
  for (let i = 0; i < STEPS; i++) {
    timers.push(
      setTimeout(
        () => {
          at.value = i
          if (i % 4 === 0) playChord(prog.value[(i / 4) % BARS], { delay: 0 })
          const d = melody.value[i]
          if (d != null) playNote(midis.value[d])
        },
        i * step * 1000,
      ),
    )
  }
  timers.push(setTimeout(stop, STEPS * step * 1000 + 600))
}

onBeforeUnmount(stop)

const written = computed(() => melody.value.filter((d) => d != null).length)

/** The melody as text, ready to paste into the Note sheet. */
const asText = computed(() =>
  melody.value
    .map((d) =>
      d == null ? '–' : NOTE_NAMES[midis.value[d] % 12] + (Math.floor(midis.value[d] / 12) - 1),
    )
    .join(' '),
)

async function copyText() {
  try {
    await navigator.clipboard.writeText(`${prog.value.join(' | ')}\n${asText.value}`)
    saved.value = 'copied'
  } catch {
    saved.value = 'nocopy'
  }
}

function keep() {
  game.keepComposition({
    root: root.value,
    scale: scaleKey.value,
    bpm: bpm.value,
    prog: [...prog.value],
    melody: [...melody.value],
    notes: asText.value,
  })
  saved.value = 'kept'
}

/** Where the scale's notes sit on the neck, low to high, under the 5th fret where possible. */
const OPEN = [64, 59, 55, 50, 45, 40] // string 1 (high E) … 6 (low E)
const positions = computed(() =>
  midis.value
    .slice(0, scale.value.iv.length + 1)
    .map((m) => {
      for (let st = 6; st >= 1; st--) {
        const fret = m - OPEN[st - 1]
        if (fret >= 0 && fret <= 5) return { string: st, fret }
      }
      const st = OPEN.findIndex((o) => m - o >= 0 && m - o <= 12)
      return st === -1 ? null : { string: st + 1, fret: m - OPEN[st] }
    })
    .filter(Boolean),
)
</script>

<template>
  <section class="composer">
    <!-- 1. the key and the scale: what Tones taught -->
    <div class="composer__row">
      <label class="composer__field">
        <span>{{ t('composer.key') }}</span>
        <select v-model.number="root" class="composer__select">
          <option v-for="(n, i) in NOTE_NAMES" :key="n" :value="i">{{ n }}</option>
        </select>
      </label>
      <label class="composer__field">
        <span>{{ t('composer.scale') }}</span>
        <select v-model="scaleKey" class="composer__select">
          <option v-for="s in scales" :key="s.key" :value="s.key">
            {{ t(`tones.scales.${s.key}`) }}
          </option>
        </select>
      </label>
      <label class="composer__field">
        <span>{{ t('composer.tempo') }}</span>
        <input
          v-model.number="bpm"
          type="number"
          min="50"
          max="180"
          step="5"
          class="composer__select composer__bpm"
        />
      </label>
    </div>

    <p class="composer__notes">
      <button
        v-for="(m, i) in midis.slice(0, scale.iv.length + 1)"
        :key="i"
        type="button"
        class="composer__note"
        @click="playNote(m)"
      >
        {{ noteName(m % 12) }}
      </button>
    </p>
    <p class="composer__steps">
      {{ t('composer.stepsAre') }}
      <span v-for="(s, i) in steps" :key="i"
        >{{ t(`tones.intervals.s${s}`) }}<template v-if="i < steps.length - 1"> · </template></span
      >
    </p>
    <div class="composer__board"><MiniFretboard :positions="positions" /></div>

    <!-- 2. the chords -->
    <h3 class="composer__title">{{ t('composer.chords') }}</h3>
    <div class="composer__prog">
      <div v-for="(c, i) in prog" :key="i" class="composer__bar">
        <select v-model="prog[i]" class="composer__select" @change="playChord(prog[i])">
          <option v-for="o in chordChoices" :key="o" :value="o">{{ o }}</option>
        </select>
        <ChordDiagram :chord="c" />
      </div>
    </div>

    <!-- 3. the melody -->
    <h3 class="composer__title">{{ t('composer.melody') }}</h3>
    <p class="composer__hint">{{ t('composer.melodyHint') }}</p>
    <div class="composer__grid" role="group" :aria-label="t('composer.melody')">
      <div class="composer__labels">
        <span v-for="(m, d) in midis.slice(0, scale.iv.length + 1)" :key="d">{{
          noteName(m % 12)
        }}</span>
      </div>
      <div class="composer__cells">
        <div
          v-for="i in STEPS"
          :key="i"
          class="composer__col"
          :class="{ 'is-now': at === i - 1, 'is-bar': (i - 1) % 4 === 0 }"
        >
          <button
            v-for="(m, d) in midis.slice(0, scale.iv.length + 1)"
            :key="d"
            type="button"
            class="composer__cell"
            :class="{ 'is-on': melody[i - 1] === d }"
            :aria-label="t('composer.cell', { note: noteName(m % 12), step: i })"
            :aria-pressed="melody[i - 1] === d"
            @click="setStep(i - 1, d)"
          />
        </div>
      </div>
    </div>

    <div class="composer__actions">
      <button type="button" class="gb-btn gb-btn--primary" @click="play">
        <q-icon :name="playing ? 'stop' : 'play_arrow'" size="18px" class="q-mr-xs" />
        {{ playing ? t('composer.stop') : t('composer.play') }}
      </button>
      <button type="button" class="gb-btn" @click="surprise">
        <q-icon name="casino" size="16px" class="q-mr-xs" />{{ t('composer.surprise') }}
      </button>
      <button type="button" class="gb-btn" :disabled="!written" @click="clear">
        {{ t('composer.clear') }}
      </button>
      <button type="button" class="gb-btn" :disabled="!written" @click="copyText">
        <q-icon name="content_copy" size="16px" class="q-mr-xs" />{{ t('composer.copy') }}
      </button>
      <button v-if="game.save" type="button" class="gb-btn" :disabled="!written" @click="keep">
        <q-icon name="bookmark_add" size="16px" class="q-mr-xs" />{{ t('composer.keep') }}
      </button>
    </div>
    <p v-if="saved" class="composer__saved" role="status">{{ t(`composer.${saved}`) }}</p>
    <p class="composer__text">{{ asText }}</p>
  </section>
</template>

<style scoped>
.composer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.composer__row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
}

.composer__field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.86rem;
  color: var(--gb-muted);
}

.composer__select {
  padding: 6px 10px;
  border: 1px solid var(--gb-rule);
  border-radius: 10px;
  background: var(--gb-surface);
  color: var(--gb-ink);
  font: inherit;
  font-size: 1rem;
}

.composer__bpm {
  width: 6rem;
}

.composer__notes,
.composer__steps,
.composer__hint,
.composer__text,
.composer__saved {
  margin: 0;
}

.composer__notes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.composer__note {
  min-width: 2.6rem;
  padding: 4px 10px;
  border: 1px solid var(--gb-accent);
  border-radius: 999px;
  background: transparent;
  color: var(--gb-ink);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.composer__steps,
.composer__hint {
  font-size: 0.88rem;
  color: var(--gb-muted);
}

.composer__board {
  width: min(100%, 420px);
}

.composer__board :deep(svg) {
  width: 100%;
  height: auto;
}

.composer__title {
  margin: 10px 0 0;
  font-family: var(--gb-serif);
  font-size: 1.15rem;
  font-weight: 700;
}

.composer__prog {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
  gap: 10px;
  max-width: 42rem;
}

.composer__bar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.composer__bar :deep(.chord-diagram) {
  width: 84px;
  height: auto;
}

.composer__grid {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.composer__labels {
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  gap: 2px;
  font-size: 0.76rem;
  color: var(--gb-muted);
}

.composer__cells {
  display: flex;
  gap: 2px;
}

.composer__col {
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
  padding: 0 1px;
  border-radius: 4px;
}

.composer__col.is-bar {
  border-left: 2px solid var(--gb-rule);
}

.composer__col.is-now {
  background: color-mix(in srgb, var(--gb-accent) 22%, transparent);
}

.composer__cell {
  width: 26px;
  height: 18px;
  padding: 0;
  border: 1px solid var(--gb-rule);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}

.composer__cell.is-on {
  border-color: var(--gb-accent);
  background: var(--gb-accent);
}

.composer__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.composer__saved {
  color: var(--gb-good);
  font-weight: 600;
}

.composer__text {
  font-family: var(--gb-mono, monospace);
  font-size: 0.84rem;
  color: var(--gb-muted);
  word-break: break-word;
}
</style>
