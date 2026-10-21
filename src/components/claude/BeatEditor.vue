<script setup>
import { computed, nextTick, ref, toRaw, watch } from 'vue'
import {
  ACCIDENTALS,
  BEAT_CONTEXT,
  NOTE_TYPES,
  STAFF_LETTERS,
  STAFF_OCTAVES,
  TECHNIQUES,
  fitStaffNote,
  lastPitched,
  nearestOctave,
  parseChord,
  parseNotes,
  placeOnStrings,
  staffBeats,
  staffLettersFor,
  stepItem,
} from './music'
import {
  accOf,
  copiedNotes,
  letterOf,
  resolveStaff,
  respell,
  withAcc,
} from 'src/components/music/notation'
import ChordDiagram from './ChordDiagram.vue'
import MiniFretboard from './MiniFretboard.vue'
import SingleFiveLines from 'src/components/music/SingleFiveLines.vue'

const props = defineProps({
  cell: { type: Object, required: true },
  title: { type: String, default: '' },
  chordSet: { type: Array, default: () => [] },
  capo: { type: Number, default: 0 },
  canPaste: { type: Boolean, default: false },
  // last staff note before this beat, so a melody carries on across beats
  previousNote: { type: Object, default: null },
})

const emit = defineEmits([
  'patch',
  'pick',
  'preview',
  'audition',
  'paste-melody',
  'copy',
  'paste',
  'clear',
  'close',
  'move',
])

const chordInput = ref(null)

const field = (key) =>
  computed({
    get: () => props.cell[key],
    set: (value) => emit('patch', { [key]: value ?? '' }),
  })

const chord = field('chord')
const notes = field('notes')
const text = field('text')
const stroke = field('stroke')
const silent = field('silent')

const chordUnknown = computed(() => !!chord.value && !parseChord(chord.value))
const invalidNotes = computed(() => parseNotes(notes.value).invalid)

const strokeOptions = [
  { value: 'down', icon: 'south', attrs: { 'aria-label': 'Downstroke' } },
  { value: 'up', icon: 'north', attrs: { 'aria-label': 'Upstroke' } },
]

function toggleTechnique(value) {
  const list = props.cell.techniques || []
  const next = list.includes(value) ? list.filter((t) => t !== value) : [...list, value]
  emit('patch', { techniques: next })
}

function onChordKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    emit('move', e.shiftKey ? -1 : 1)
  }
}

/* =====================================================
   CHORD / NOTES MODE
===================================================== */

const mode = ref('chord') // 'chord' | 'notes'

const staff = computed(() => props.cell.staff || [])
const selectedIndex = ref(null)
const selectedLetter = ref(0) // which notehead of a stacked chord was tapped

// opening a beat shows what is written on it; an empty beat keeps the current mode,
// so writing a melody beat after beat stays on Notes
watch(
  () => props.cell,
  (cell) => {
    selectedIndex.value = null
    selectedLetter.value = 0
    const hasStaff = !!cell.staff?.length
    if (hasStaff && !cell.chord) mode.value = 'notes'
    else if (cell.chord && !hasStaff) mode.value = 'chord'
  },
  { immediate: true },
)

watch(
  () => staff.value.length,
  (len) => {
    if (selectedIndex.value !== null && selectedIndex.value >= len)
      selectedIndex.value = len ? len - 1 : null
  },
)

/* =====================================================
   STAFF NOTES (same model as NoteSheet)
===================================================== */

const selectedNote = computed(() =>
  selectedIndex.value === null ? null : (staff.value[selectedIndex.value] ?? null),
)

const staffSelection = computed(() =>
  selectedNote.value
    ? { chordIndex: selectedIndex.value, letterIndex: selectedLetter.value }
    : null,
)

// the staff canvas is never scaled with CSS (its hit-testing uses raw pixels),
// so it is drawn at the measured width of its box
const staffWidth = ref(320)
function onStaffResize({ width }) {
  staffWidth.value = Math.max(240, Math.floor(width) - 2)
}

// An accidental lasts to the end of the beat, so adding, removing or changing
// one note could change how the notes after it sound. Every note that was not
// edited keeps its pitch: signs are added where needed.
function setStaff(next) {
  const before = staff.value
  const resolved = resolveStaff(before, BEAT_CONTEXT)
  const alters = new Map(before.map((n, i) => [toRaw(n), resolved[i].pitches.map((p) => p.alter)]))
  const desired = next.map((n) => alters.get(toRaw(n)) ?? null)
  emit('patch', { staff: respell(next, BEAT_CONTEXT, desired) })
}

function onStaffSelect(sel) {
  selectedIndex.value = sel ? sel.chordIndex : null
  selectedLetter.value = sel?.letterIndex ?? 0
}

// pitched note to continue from: the last one at or before index, else the previous beat's
const pitchedBefore = (index) => lastPitched(staff.value, index) ?? props.previousNote

// adds after the selected note or rest, or at the end; rest = true adds a rest
function addNote(letter, rest = false) {
  const list = staff.value
  const at = selectedIndex.value ?? list.length - 1
  const from = pitchedBefore(at)
  const type = list[at]?.type ?? from?.type ?? 4
  const pitch = letter || letterOf(from?.note?.[from.note.length - 1]) || 'E'
  const note = rest
    ? fitStaffNote({ rest: true, octave: from?.octave, type })
    : fitStaffNote({
        note: [pitch],
        octave: letter || !from ? nearestOctave(pitch, from) : from.octave,
        type,
      })
  const next = [...list]
  next.splice(at + 1, 0, note)
  setStaff(next)
  selectedIndex.value = at + 1
  selectedLetter.value = 0
  if (!rest) emit('audition', note)
}

const addRest = () => addNote(null, true)

function replaceSelected(item, audition = false) {
  const i = selectedIndex.value
  if (i === null || !staff.value[i]) return
  const next = [...staff.value]
  next[i] = item
  setStaff(next)
  if (audition && !item.rest) emit('audition', item)
}

function updateSelected(patch) {
  const i = selectedIndex.value
  if (i === null || !staff.value[i]) return
  const audition = 'note' in patch || 'octave' in patch || 'rest' in patch
  replaceSelected(fitStaffNote({ ...staff.value[i], ...patch }), audition)
}

function deleteSelectedNote() {
  const i = selectedIndex.value
  if (mode.value !== 'notes' || i === null || !staff.value[i]) return false
  const next = staff.value.filter((_, k) => k !== i)
  setStaff(next)
  selectedIndex.value = next.length ? Math.max(0, i - 1) : null
  selectedLetter.value = 0
  return true
}

// switch the selected item between a note and a rest of the same length
const kind = computed({
  get: () => (selectedNote.value?.rest ? 'rest' : 'note'),
  set: (value) => {
    if (value === 'rest') return updateSelected({ rest: true, tie: false })
    const from = pitchedBefore(selectedIndex.value - 1)
    updateSelected({
      rest: false,
      note: from ? [...from.note] : ['E'],
      octave: from?.octave ?? 1,
    })
  },
})
const kindOptions = [
  { label: 'Note', value: 'note' },
  { label: 'Rest', value: 'rest' },
]

// letters only; each letter keeps its accidental while it stays in the chord
const pitch = computed({
  get: () => (selectedNote.value?.note ?? []).map(letterOf),
  set: (letters) => {
    const current = selectedNote.value?.note ?? []
    updateSelected({
      note: (letters || []).map((l) => current.find((s) => letterOf(s) === l) ?? l),
    })
  },
})
const octave = computed({
  get: () => selectedNote.value?.octave ?? 1,
  set: (value) => updateSelected({ octave: value }),
})
const duration = computed({
  get: () => selectedNote.value?.type ?? 4,
  set: (value) => updateSelected({ type: value }),
})
const dotted = computed({
  get: () => !!selectedNote.value?.dot,
  set: (value) => updateSelected({ dot: value }),
})
const tied = computed({
  get: () => !!selectedNote.value?.tie,
  set: (value) => updateSelected({ tie: value }),
})

// one accidental switch per letter of the selected note or chord
const letterRows = computed(() =>
  selectedNote.value && !selectedNote.value.rest
    ? selectedNote.value.note.map((s, j) => ({ j, letter: letterOf(s), acc: accOf(s) }))
    : [],
)

function setAccidental(j, acc) {
  const n = selectedNote.value
  if (!n || n.rest || !n.note[j]) return
  updateSelected({ note: n.note.map((s, k) => (k === j ? withAcc(letterOf(s), acc) : s)) })
}

function stepSelected(delta) {
  const moved = stepItem(selectedNote.value, delta)
  if (moved) replaceSelected(moved, true)
}

const pitchOptions = computed(() => {
  const allowed = staffLettersFor(octave.value)
  return STAFF_LETTERS.map((l) => ({ label: l, value: l, disable: !allowed.includes(l) }))
})

// an octave is offered only when every stacked letter fits on it
const octaveOptions = computed(() =>
  STAFF_OCTAVES.map((o) => ({
    label: o.label,
    value: o.value,
    disable: !pitch.value.every((l) => o.letters.includes(l)),
  })),
)

// where the selected note is played (frets counted from the capo)
const resolvedStaff = computed(() => resolveStaff(staff.value, BEAT_CONTEXT))
const selectedPositions = computed(() => {
  const r = selectedIndex.value === null ? null : resolvedStaff.value[selectedIndex.value]
  return r && !r.rest ? placeOnStrings(r.pitches.map((p) => p.midi)) : []
})

function formatBeats(x) {
  const whole = Math.floor(x + 1e-9)
  let num = Math.round((x - whole) * 16)
  let den = 16
  while (num && num % 2 === 0) {
    num /= 2
    den /= 2
  }
  const frac = num ? `${num}/${den}` : ''
  const value = [whole || '', frac].filter(Boolean).join(' ') || '0'
  return `${value} ${x > 1 ? 'beats' : 'beat'}`
}

const totalBeats = computed(() => staffBeats(staff.value))
const beatsLabel = computed(() => {
  if (!staff.value.length) return ''
  const label = `Lasts ${formatBeats(totalBeats.value)}`
  return totalBeats.value > 1 + 1e-9 ? `${label}, runs into the next beats` : label
})

/* =====================================================
   EXPOSED TO THE COMPÁS EDITOR (keyboard)
===================================================== */

async function focusChord(initial) {
  mode.value = 'chord'
  if (typeof initial === 'string') emit('patch', { chord: initial })
  await nextTick()
  const input = chordInput.value?.$el?.querySelector('input')
  if (!input) return
  input.focus()
  const end = input.value.length
  input.setSelectionRange(end, end)
}

// A to G: start a chord, or add a note when the Notes tab is open
function typeLetter(letter) {
  if (mode.value === 'notes') addNote(letter)
  else focusChord(letter)
}

// R: add a rest when the Notes tab is open
function typeRest() {
  if (mode.value !== 'notes') return false
  addRest()
  return true
}

// keys for the selected note while the Notes tab is open; true when handled
const DURATION_KEYS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32, 7: 64 }
const ACCIDENTAL_KEYS = { '#': '#', '+': '#', '-': 'b', '=': 'n' }

function handleKey(e) {
  if (mode.value !== 'notes') return false
  const i = selectedIndex.value
  const n = selectedNote.value
  const key = e.key

  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    if (i === null) return false
    const j = i + (key === 'ArrowRight' ? 1 : -1)
    // past the first or last note: let the compás editor move to the next beat
    if (j < 0 || j >= staff.value.length) return false
    selectedIndex.value = j
    selectedLetter.value = 0
    return true
  }
  if (!n) return false
  if (key === 'ArrowUp' || key === 'ArrowDown') {
    stepSelected((key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 7 : 1))
    return true
  }
  if (DURATION_KEYS[key]) {
    updateSelected({ type: DURATION_KEYS[key] })
    return true
  }
  if (key === '.') {
    updateSelected({ dot: !n.dot })
    return true
  }
  if (n.rest) return false
  if (key === 't' || key === 'T') {
    updateSelected({ tie: !n.tie })
    return true
  }
  if (ACCIDENTAL_KEYS[key]) {
    const j = Math.min(selectedLetter.value, n.note.length - 1)
    const want = ACCIDENTAL_KEYS[key]
    setAccidental(j, accOf(n.note[j]) === want ? '' : want)
    return true
  }
  return false
}

defineExpose({ focusChord, typeLetter, typeRest, deleteSelectedNote, handleKey })
</script>

<template>
  <div class="beat-editor">
    <div class="row items-center no-wrap q-mb-xs">
      <div class="text-subtitle2 text-grey-3 ellipsis">{{ title }}</div>
      <q-space />
      <q-btn flat dense round size="sm" icon="play_arrow" color="blue-5" @click="emit('preview')">
        <q-tooltip>Hear this beat</q-tooltip>
      </q-btn>
      <q-btn flat dense round size="sm" icon="content_copy" color="grey-5" @click="emit('copy')">
        <q-tooltip>Copy beat</q-tooltip>
      </q-btn>
      <q-btn
        flat
        dense
        round
        size="sm"
        icon="content_paste"
        color="grey-5"
        :disable="!canPaste"
        @click="emit('paste')"
      >
        <q-tooltip>Paste beat</q-tooltip>
      </q-btn>
      <q-btn flat dense round size="sm" icon="backspace" color="grey-5" @click="emit('clear')">
        <q-tooltip>Clear beat</q-tooltip>
      </q-btn>
      <q-btn flat dense round size="sm" icon="close" color="grey-5" @click="emit('close')">
        <q-tooltip>Close</q-tooltip>
      </q-btn>
    </div>

    <q-tabs
      v-model="mode"
      dense
      no-caps
      inline-label
      narrow-indicator
      align="left"
      active-color="blue-5"
      indicator-color="blue-5"
      class="text-grey-5 q-mb-sm mode-tabs"
    >
      <q-tab name="chord" label="Chord" :alert="mode !== 'chord' && !!chord ? 'blue-5' : false" />
      <q-tab
        name="notes"
        label="Notes"
        :alert="mode !== 'notes' && (staff.length > 0 || !!notes) ? 'blue-5' : false"
      />
    </q-tabs>

    <!-- ===== Chord ===== -->
    <div v-if="mode === 'chord'" class="row no-wrap q-gutter-x-md items-start">
      <div class="col">
        <q-input
          ref="chordInput"
          v-model="chord"
          label="Chord"
          placeholder="E7b9, Am, F/E"
          dense
          outlined
          color="blue-5"
          :error="chordUnknown"
          error-message="Not a chord I can play, kept as text"
          :hide-bottom-space="true"
          @keydown="onChordKeydown"
        >
          <template #append>
            <q-btn-toggle
              v-model="stroke"
              :options="strokeOptions"
              flat
              dense
              size="sm"
              color="grey-6"
              toggle-color="blue-5"
            />
          </template>
        </q-input>

        <div class="chips q-mt-xs">
          <q-chip
            v-for="c in chordSet"
            :key="c"
            dense
            square
            clickable
            :color="chord === c ? 'blue-5' : 'grey-9'"
            :text-color="chord === c ? 'white' : 'grey-4'"
            @click="emit('pick', chord === c ? '' : c)"
          >
            {{ c }}
          </q-chip>
        </div>
      </div>

      <div class="col-auto diagram">
        <ChordDiagram :chord="chord" :capo="capo" />
      </div>
    </div>

    <!-- ===== Notes ===== -->
    <div v-else class="notes-panel">
      <div class="staff-box">
        <q-resize-observer @resize="onStaffResize" />
        <SingleFiveLines
          :width="staffWidth"
          clef="treble"
          :beat="null"
          :sharps="0"
          :flats="0"
          :notes="staff"
          free-scope="list"
          :selected="staffSelection"
          @select="onStaffSelect"
        />
      </div>

      <div class="row items-center no-wrap q-gutter-x-sm q-mt-sm">
        <q-btn
          outline
          dense
          no-caps
          color="blue-5"
          icon="add"
          label="Add note"
          @click="addNote()"
        />
        <q-btn outline dense no-caps color="blue-5" icon="add" label="Add rest" @click="addRest" />
        <q-btn
          v-if="copiedNotes"
          outline
          dense
          no-caps
          color="blue-5"
          icon="content_paste"
          label="Paste melody"
          @click="emit('paste-melody')"
        >
          <q-tooltip>Paste the copied notes from this beat on, one beat per quarter note</q-tooltip>
        </q-btn>
        <q-btn
          v-if="selectedNote"
          outline
          dense
          no-caps
          color="negative"
          icon="delete"
          label="Delete"
          @click="deleteSelectedNote"
        />
        <q-space />
        <span class="text-caption text-grey-6 ellipsis">{{ beatsLabel }}</span>
      </div>

      <div v-if="selectedNote" class="note-fields q-mt-sm" :class="{ 'is-rest': kind === 'rest' }">
        <q-btn-toggle
          v-model="kind"
          :options="kindOptions"
          class="note-kind"
          spread
          dense
          no-caps
          unelevated
          color="grey-9"
          text-color="grey-4"
          toggle-color="blue-5"
        />
        <q-select
          v-if="kind === 'note'"
          v-model="pitch"
          class="note-pitch"
          label="Pitch"
          :options="pitchOptions"
          emit-value
          map-options
          multiple
          use-chips
          dense
          outlined
          options-dense
          color="blue-5"
        />
        <q-select
          v-if="kind === 'note'"
          v-model="octave"
          label="Octave"
          :options="octaveOptions"
          emit-value
          map-options
          dense
          outlined
          options-dense
          color="blue-5"
        />
        <q-select
          v-model="duration"
          label="Duration"
          :options="NOTE_TYPES"
          emit-value
          map-options
          dense
          outlined
          options-dense
          color="blue-5"
        />
        <div class="note-flags">
          <q-checkbox v-model="dotted" label="Dotted" dense size="sm" color="blue-5" />
          <q-checkbox
            v-if="kind === 'note'"
            v-model="tied"
            label="Tie to next"
            dense
            size="sm"
            color="blue-5"
          />
        </div>
        <div v-if="kind === 'note'" class="acc-rows">
          <div v-for="row in letterRows" :key="row.j" class="acc-row">
            <span class="acc-letter">{{ row.letter }}</span>
            <q-btn-toggle
              :model-value="row.acc"
              :options="ACCIDENTALS"
              dense
              no-caps
              unelevated
              size="sm"
              color="grey-9"
              text-color="grey-4"
              toggle-color="blue-5"
              :aria-label="`Accidental for ${row.letter}`"
              @update:model-value="(v) => setAccidental(row.j, v)"
            />
          </div>
        </div>
      </div>

      <div v-if="selectedPositions.length" class="q-mt-sm">
        <MiniFretboard :positions="selectedPositions" :capo="capo" class="text-grey-5" />
        <div v-if="capo" class="text-caption text-grey-6">Frets counted from the capo.</div>
      </div>
      <p v-else class="empty text-caption text-grey-6">
        {{
          staff.length
            ? 'Tap a note or rest on the staff to change it.'
            : 'Add a note or rest, or press A to G for a note and R for a rest.'
        }}
      </p>

      <q-input
        v-model="notes"
        label="Tab"
        placeholder="3-2 1-0  or  6-0+1-0"
        dense
        outlined
        color="blue-5"
        class="q-mt-sm"
        :error="invalidNotes.length > 0"
        :error-message="`Can't read: ${invalidNotes.join(' ')}`"
        hint="Optional. Space plays notes in order, + plays them together."
      />
    </div>

    <!-- ===== Shared ===== -->
    <div class="chips q-mt-sm">
      <q-chip
        v-for="t in TECHNIQUES"
        :key="t.value"
        dense
        square
        clickable
        :color="cell.techniques?.includes(t.value) ? 'blue-5' : 'grey-9'"
        :text-color="cell.techniques?.includes(t.value) ? 'white' : 'grey-4'"
        @click="toggleTechnique(t.value)"
      >
        {{ t.label }}
      </q-chip>
    </div>

    <q-input
      v-model="text"
      label="Text"
      placeholder="Lyrics, falseta cue, reminder"
      dense
      outlined
      color="blue-5"
      hint="Shown under the beat"
      class="q-mt-xs"
    />

    <q-toggle
      v-model="silent"
      label="Mute the click on this beat"
      dense
      size="sm"
      color="blue-5"
      class="q-mt-sm text-grey-4"
    />
  </div>
</template>

<style scoped>
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}
.chips :deep(.q-chip) {
  margin: 0;
  font-weight: 500;
}
.diagram {
  min-width: 72px;
  min-height: 88px;
}

.mode-tabs :deep(.q-tab) {
  padding: 0 12px;
  min-height: 32px;
}

.notes-panel {
  min-width: 0;
}

/* sized by the resize observer; scrolls rather than scales on very narrow screens */
.staff-box {
  position: relative;
  overflow-x: auto;
  border-radius: 6px;
}

.staff-box :deep(canvas) {
  display: block;
  border: 1px solid var(--app-border);
  border-radius: 6px;
}

.note-fields {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.6fr);
  gap: 8px;
}

.note-kind,
.note-flags,
.acc-rows,
.note-fields.is-rest > * {
  grid-column: 1 / -1;
}

.note-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
}

.acc-rows {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
}

.acc-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.acc-letter {
  min-width: 12px;
  font-weight: 600;
}

.empty {
  margin: 8px 0 0;
  line-height: 1.45;
}

@media (max-width: 599px) {
  .note-fields {
    grid-template-columns: 1fr 1fr;
  }
  .note-pitch {
    grid-column: 1 / -1;
  }
}
</style>
