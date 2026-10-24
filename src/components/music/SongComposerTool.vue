<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useGameStore } from 'src/stores/game-store'
import ChordDiagram from 'src/components/claude/ChordDiagram.vue'
import MiniFretboard from 'src/components/claude/MiniFretboard.vue'
import { NOTE_NAMES, SCALES } from './toneAnalysis'
import { cues, playChord, playNote } from 'src/game/sound'
import { copyNotes, markPending } from './notation'

/* The Composer: a key and a scale (Tones), the steps between its notes
   (Intervals), a chord progression and a melody – and the song can be
   written down (Note sheet) or kept as your own. */
const { t } = useI18n()
const game = useGameStore()
const router = useRouter()

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
const PER_BAR = 4 // eighth notes in a bar
const MIN_BARS = 1
const MAX_BARS = 8
const SAVE_KEY = 'kitarista-composer'

const root = ref(9) // A
const scaleKey = ref('minorPentatonic')
const bpm = ref(90)
const prog = ref(['Am', 'F', 'C', 'G'])
const melody = ref(Array(4 * PER_BAR).fill(null)) // index into the scale, or null for a rest
const loop = ref(false)
const clicks = ref(false)
const round = ref(0)
const bars = computed(() => prog.value.length)
const stepCount = computed(() => bars.value * PER_BAR)
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

/* ---------- bars ---------- */
const history = ref([]) // snapshots, for Undo
const snapshot = () => {
  history.value.push(JSON.stringify({ prog: prog.value, melody: melody.value }))
  if (history.value.length > 30) history.value.shift()
}
function undo() {
  const last = history.value.pop()
  if (!last) return
  const v = JSON.parse(last)
  prog.value = v.prog
  melody.value = v.melody
  saved.value = false
}

function addBar() {
  if (bars.value >= MAX_BARS) return
  snapshot()
  prog.value = [...prog.value, prog.value.at(-1) ?? chordChoices.value[0]]
  melody.value = [...melody.value, ...Array(PER_BAR).fill(null)]
  saved.value = false
}
function copyBar(i) {
  if (bars.value >= MAX_BARS) return
  snapshot()
  const from = i * PER_BAR
  prog.value = [...prog.value.slice(0, i + 1), prog.value[i], ...prog.value.slice(i + 1)]
  melody.value = [
    ...melody.value.slice(0, from + PER_BAR),
    ...melody.value.slice(from, from + PER_BAR),
    ...melody.value.slice(from + PER_BAR),
  ]
  saved.value = false
}
function removeBar(i) {
  if (bars.value <= MIN_BARS) return
  snapshot()
  prog.value = prog.value.filter((_, k) => k !== i)
  melody.value = [...melody.value.slice(0, i * PER_BAR), ...melody.value.slice((i + 1) * PER_BAR)]
  saved.value = false
}

function setStep(i, degree) {
  snapshot()
  melody.value = melody.value.map((v, k) => (k === i ? (v === degree ? null : degree) : v))
  if (degree != null && melody.value[i] != null) playNote(midis.value[degree])
  saved.value = false
}

function surprise() {
  const n = midis.value.length
  let d = Math.floor(Math.random() * 3)
  snapshot()
  melody.value = Array.from({ length: stepCount.value }, (_, i) => {
    if (i % 4 === 3 && Math.random() < 0.4) return null // breathe at the end of a bar
    d = Math.max(0, Math.min(n - 1, d + Math.floor(Math.random() * 5) - 2))
    return d
  })
  melody.value[0] = 0
  melody.value[stepCount.value - 1] = Math.random() < 0.6 ? 0 : melody.value[stepCount.value - 1]
  saved.value = false
}

const clear = () => {
  snapshot()
  melody.value = Array(stepCount.value).fill(null)
  saved.value = false
}

let timers = []
function stop() {
  timers.forEach(clearTimeout)
  timers = []
  playing.value = false
  at.value = -1
  round.value = 0
}

/** One pass of the song; schedules the next one when looping. */
function pass() {
  const beat = 60 / bpm.value
  const step = beat / 2
  for (let i = 0; i < stepCount.value; i++) {
    timers.push(
      setTimeout(
        () => {
          at.value = i
          if (i % PER_BAR === 0) playChord(prog.value[i / PER_BAR], { delay: 0 })
          if (clicks.value && i % 2 === 0) cues.tick(i / 2)
          const d = melody.value[i]
          if (d != null) playNote(midis.value[d])
        },
        i * step * 1000,
      ),
    )
  }
  const end = stepCount.value * step * 1000
  timers.push(
    setTimeout(() => {
      if (!playing.value) return
      if (loop.value) {
        round.value += 1
        timers = []
        pass()
      } else {
        stop()
      }
    }, end),
  )
}

function play() {
  if (playing.value) return stop()
  playing.value = true
  round.value = 1
  pass()
}

onBeforeUnmount(stop)

const written = computed(() => melody.value.filter((d) => d != null).length)

/* The work is kept in this browser, so nothing is lost on the way to
   the Note sheet and back. */
watch(
  [root, scaleKey, bpm, prog, melody, loop, clicks],
  () => {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          root: root.value,
          scale: scaleKey.value,
          bpm: bpm.value,
          prog: prog.value,
          melody: melody.value,
          loop: loop.value,
          clicks: clicks.value,
        }),
      )
    } catch {
      /* storage blocked – the Composer still works, it just won't remember */
    }
  },
  { deep: true },
)

onMounted(() => {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null')
    if (!raw?.prog?.length || !Array.isArray(raw.melody)) return
    root.value = Number.isInteger(raw.root) ? raw.root : root.value
    if (scales.some((x) => x.key === raw.scale)) scaleKey.value = raw.scale
    bpm.value = Math.min(180, Math.max(50, Number(raw.bpm) || bpm.value))
    prog.value = raw.prog.slice(0, MAX_BARS)
    melody.value = raw.melody.slice(0, prog.value.length * PER_BAR)
    while (melody.value.length < prog.value.length * PER_BAR) melody.value.push(null)
    loop.value = !!raw.loop
    clicks.value = !!raw.clicks
  } catch {
    /* nothing kept, or it was unreadable – start fresh */
  }
})

/* ---------- sending the melody to the Note sheet ----------
   The note editors share a clipboard (notation.js). Writing to it means
   "Postavi" in the Note sheet and the Compás sheet pastes this melody. */
const LETTER = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
/** One grid step → an item the note editors understand (an eighth, or a rest). */
function toItem(degree) {
  if (degree == null) return { rest: true, note: [], octave: 1, type: 8 }
  const midi = midis.value[degree]
  const name = LETTER[midi % 12]
  const sounding = Math.floor(midi / 12) - 1 // C4 = octave 4
  // the sheet writes octave 1 around C4, 2 above it, 'm' below
  const octave = sounding >= 5 ? 2 : sounding <= 3 ? 'm' : 1
  return { note: [name.replace('#', '#')], octave, type: 8 }
}

function sendToSheet() {
  if (!copyNotes(melody.value.map(toItem))) {
    saved.value = 'nothing'
    return
  }
  // the sheet pastes it by itself when it opens
  markPending()
  saved.value = 'sent'
  router.push('/notes')
}

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
    <h3 class="composer__step"><span>1</span> {{ t('composer.step1') }}</h3>
    <p class="composer__hint">{{ t('composer.step1hint') }}</p>
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

    <h3 class="composer__step"><span>2</span> {{ t('composer.chords') }}</h3>
    <p class="composer__hint">{{ t('composer.chordsHint') }}</p>
    <div class="composer__prog">
      <div
        v-for="(c, i) in prog"
        :key="i"
        class="composer__bar"
        :class="{ 'is-now': at >= 0 && Math.floor(at / 4) === i }"
      >
        <p class="composer__bar-num">{{ t('composer.bar', { n: i + 1 }) }}</p>
        <select v-model="prog[i]" class="composer__select" @change="playChord(prog[i])">
          <option v-for="o in chordChoices" :key="o" :value="o">{{ o }}</option>
        </select>
        <ChordDiagram :chord="c" />
        <div class="composer__bar-tools">
          <button
            type="button"
            :title="t('composer.hear')"
            :aria-label="t('composer.hear')"
            @click="playChord(c)"
          >
            <q-icon name="volume_up" size="16px" />
          </button>
          <button
            type="button"
            :title="t('composer.copyBar')"
            :aria-label="t('composer.copyBar')"
            :disabled="bars >= MAX_BARS"
            @click="copyBar(i)"
          >
            <q-icon name="content_copy" size="16px" />
          </button>
          <button
            type="button"
            :title="t('composer.removeBar')"
            :aria-label="t('composer.removeBar')"
            :disabled="bars <= MIN_BARS"
            @click="removeBar(i)"
          >
            <q-icon name="delete" size="16px" />
          </button>
        </div>
      </div>
      <button type="button" class="composer__add" :disabled="bars >= MAX_BARS" @click="addBar">
        <q-icon name="add" size="22px" />
        <span>{{ t('composer.addBar') }}</span>
      </button>
    </div>

    <h3 class="composer__step"><span>3</span> {{ t('composer.melody') }}</h3>
    <p class="composer__hint">{{ t('composer.melodyHint') }}</p>
    <div class="composer__grid" role="group" :aria-label="t('composer.melody')">
      <div class="composer__labels">
        <span v-for="(m, d) in midis.slice(0, scale.iv.length + 1)" :key="d">{{
          noteName(m % 12)
        }}</span>
      </div>
      <div class="composer__cells">
        <div
          v-for="i in stepCount"
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
      <label class="composer__toggle">
        <input v-model="loop" type="checkbox" />
        <q-icon name="repeat" size="18px" />
        {{ t('composer.loop') }}
      </label>
      <label class="composer__toggle">
        <input v-model="clicks" type="checkbox" />
        <q-icon name="av_timer" size="18px" />
        {{ t('composer.click') }}
      </label>
      <span v-if="playing && loop" class="composer__round">{{
        t('composer.round', { n: round })
      }}</span>
      <button type="button" class="gb-btn" @click="surprise">
        <q-icon name="casino" size="16px" class="q-mr-xs" />{{ t('composer.surprise') }}
      </button>
      <button type="button" class="gb-btn" :disabled="!history.length" @click="undo">
        <q-icon name="undo" size="16px" class="q-mr-xs" />{{ t('composer.undo') }}
      </button>
      <button type="button" class="gb-btn" :disabled="!written" @click="clear">
        {{ t('composer.clear') }}
      </button>
    </div>

    <h3 class="composer__step"><span>4</span> {{ t('composer.step4') }}</h3>
    <div class="composer__actions">
      <button
        v-if="game.save"
        type="button"
        class="gb-btn gb-btn--primary"
        :disabled="!written"
        @click="keep"
      >
        <q-icon name="bookmark_add" size="16px" class="q-mr-xs" />{{ t('composer.keep') }}
      </button>
      <button type="button" class="gb-btn" :disabled="!written" @click="sendToSheet">
        <q-icon name="library_music" size="16px" class="q-mr-xs" />{{ t('composer.toSheet') }}
      </button>
      <button type="button" class="gb-btn" :disabled="!written" @click="copyText">
        <q-icon name="content_copy" size="16px" class="q-mr-xs" />{{ t('composer.copy') }}
      </button>
    </div>
    <p v-if="saved" class="composer__saved" role="status">
      {{ t(`composer.${saved}`) }}
      <router-link v-if="saved === 'sent'" to="/notes" class="gb-link">{{
        t('composer.openSheet')
      }}</router-link>
    </p>
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

.composer__step {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 0;
  font-family: var(--gb-serif);
  font-size: 1.2rem;
  font-weight: 700;
}

.composer__step span {
  display: grid;
  flex: none;
  place-items: center;
  width: 1.8em;
  height: 1.8em;
  border-radius: 50%;
  background: var(--gb-accent);
  color: var(--gb-paper);
  /* the book's serif has old-style figures that hang below the baseline,
     so the digit sat at the bottom of the circle */
  font-family: var(--gb-sans);
  font-variant-numeric: lining-nums;
  font-size: 0.78em;
  font-weight: 700;
  /* centre the digit itself: a line box leaves room for descenders below it */
  line-height: 0;
  padding-top: 0.04em;
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
  padding: 8px;
  border: 1px solid var(--gb-rule);
  border-radius: 12px;
}

.composer__bar.is-now {
  border-color: var(--gb-accent);
  background: color-mix(in srgb, var(--gb-accent) 10%, transparent);
}

.composer__bar-num {
  margin: 0 !important;
  font-size: 0.78rem;
  color: var(--gb-muted);
}

.composer__bar-tools {
  display: flex;
  gap: 4px;
}

.composer__bar-tools button {
  display: grid;
  place-items: center;
  padding: 4px;
  border: 1px solid var(--gb-rule);
  border-radius: 8px;
  background: transparent;
  color: var(--gb-muted);
  cursor: pointer;
}

.composer__bar-tools button:hover:not(:disabled),
.composer__bar-tools button:focus-visible:not(:disabled) {
  border-color: var(--gb-accent);
  color: var(--gb-accent);
}

.composer__bar-tools button:disabled {
  opacity: 0.35;
  cursor: default;
}

.composer__add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 140px;
  border: 1.5px dashed var(--gb-rule);
  border-radius: 12px;
  background: transparent;
  color: var(--gb-muted);
  font: inherit;
  font-size: 0.86rem;
  cursor: pointer;
}

.composer__add:hover:not(:disabled),
.composer__add:focus-visible:not(:disabled) {
  border-color: var(--gb-accent);
  color: var(--gb-accent);
}

.composer__add:disabled {
  opacity: 0.4;
  cursor: default;
}

.composer__toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.92rem;
  cursor: pointer;
}

.composer__round {
  align-self: center;
  font-size: 0.9rem;
  color: var(--gb-accent);
  font-variant-numeric: lining-nums;
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
