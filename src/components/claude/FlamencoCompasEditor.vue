<script setup>
import { useGameStore } from 'src/stores/game-store'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { COMPAS_MAP } from '../constants'
import {
  BEAT_CONTEXT,
  SECTION_NAMES,
  TECHNIQUE_MAP,
  TOQUES,
  fitStaffNote,
  lastPitched,
  staffText,
} from './music'
import {
  absoluteAlters,
  beatsToMelody,
  copiedNotes,
  copyNotes,
  melodyToBeats,
  respell,
  toAbsolute,
} from 'src/components/music/notation'
import { useCompasAudio } from './useCompasAudio'
import BeatEditor from './BeatEditor.vue'

/* =====================================================
   PROPS
   v-model     the whole sheet (optional), so a parent can
               save it to the API like NoteSheet does
   storageKey  autosave to localStorage, null to disable
===================================================== */

const props = defineProps({
  modelValue: { type: Object, default: null },
  storageKey: { type: String, default: 'flamenco-compas-sheet' },
})
const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()

/* =====================================================
   OPTIONS
===================================================== */

const STYLE_OPTIONS = [
  { label: 'Tangos', value: 'tangos_1' },
  { label: 'Soleá', value: 'solea_1' },
  { label: 'Bulerías (ver.1)', value: 'bulerias_1' },
  { label: 'Bulerías (ver.2)', value: 'bulerias_2' },
  { label: 'Siguiriyas', value: 'seguiriyas_1' },
  { label: 'Sevillanas', value: 'sevillanas_1' },
  { label: 'Tanguillos', value: 'tanguillos_1' },
  { label: 'Fandangos de Huelva', value: 'fandangos_1' },
  { label: 'Custom', value: 'custom' },
]

const TOQUE_OPTIONS = TOQUES.map((t) => ({ label: t.label, value: t.value }))

const CAPO_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  label: i === 0 ? 'No capo' : `Capo ${i}`,
  value: i,
}))

const SOUND_OPTIONS = [
  { label: 'Palmas', value: 'clapping' },
  { label: 'Wood', value: 'percussion' },
  { label: 'Cymbal', value: 'cymbal' },
]

const REPEAT_OPTIONS = [1, 2, 3, 4, 6, 8]

/* =====================================================
   SHEET MODEL
===================================================== */

let idCounter = 0
const uid = () => `${Date.now().toString(36)}${(idCounter++).toString(36)}`
const clone = (v) => JSON.parse(JSON.stringify(v))

const newCell = () => ({
  chord: '',
  notes: '', // tab or note names as text
  staff: [], // staff notes, same model as NoteSheet: { note: ['E'], octave, type }
  stroke: 'down',
  techniques: [],
  text: '',
  silent: false,
})

const newBar = (beats) => ({
  id: uid(),
  name: '',
  repeat: 1,
  cells: Array.from({ length: beats }, newCell),
})

const isEmptyCell = (c) =>
  !c.chord &&
  !c.notes &&
  !(c.staff || []).length &&
  !c.text &&
  !c.silent &&
  !(c.techniques || []).length

function normalizeCell(raw) {
  const cell = { ...newCell(), ...(raw || {}) }
  cell.staff = Array.isArray(cell.staff) ? cell.staff.map(fitStaffNote) : []
  return cell
}

function defaultSheet() {
  const pattern = clone(COMPAS_MAP.bulerias_1.beats)
  return {
    version: 1,
    title: '',
    style: 'bulerias_1',
    toque: 'arriba',
    capo: 0,
    tempo: 180,
    pattern,
    bars: [newBar(pattern.length)],
    settings: {
      sounds: ['clapping'],
      click: true,
      guitar: true,
      offbeat: false,
      countIn: false,
      clickVolume: 0.8,
      guitarVolume: 0.8,
      trainer: { enabled: false, step: 4, every: 4, max: 240 },
    },
  }
}

function normalizeSheet(raw) {
  const base = defaultSheet()
  if (!raw || typeof raw !== 'object') return base

  const pattern =
    Array.isArray(raw.pattern) && raw.pattern.length
      ? raw.pattern.map((b, i) => ({ label: String(b.label ?? i + 1), accent: !!b.accent }))
      : base.pattern

  const bars =
    Array.isArray(raw.bars) && raw.bars.length
      ? raw.bars.map((bar) => ({
          id: bar.id || uid(),
          name: bar.name || '',
          repeat: Number(bar.repeat) || 1,
          cells: pattern.map((_, i) => normalizeCell(bar.cells?.[i])),
        }))
      : [newBar(pattern.length)]

  return {
    ...base,
    ...raw,
    tempo: Number(raw.tempo) || base.tempo,
    capo: Number(raw.capo) || 0,
    pattern,
    bars,
    settings: {
      ...base.settings,
      ...(raw.settings || {}),
      trainer: { ...base.settings.trainer, ...(raw.settings?.trainer || {}) },
    },
  }
}

function loadLocal() {
  if (!props.storageKey) return null
  try {
    const raw = localStorage.getItem(props.storageKey)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const sheet = reactive(normalizeSheet(props.modelValue ?? loadLocal()))

// the book can ask for a rhythm to be laid out here
const game = useGameStore()
watch(
  () => {
    const bar = sheet.bars?.[0]
    if (!bar) return null
    const cells = bar.cells ?? []
    return {
      beats: sheet.pattern?.length ?? 0,
      accents: (sheet.pattern ?? []).filter((b) => b.accent).map((b) => String(b.label)),
      // a beat counts as written on when it carries a chord, notes or a word
      filled: cells.filter((c) => c && (c.chord || c.staff?.length || c.text)).length,
    }
  },
  (v) => v && game.missionEvent({ type: 'compas', ...v }),
  { deep: true },
)

function replaceSheet(next) {
  Object.assign(sheet, normalizeSheet(next))
}

/* =====================================================
   AUDIO
===================================================== */

const loopBar = ref(null)

const audio = useCompasAudio(sheet, { loopBar })
const { isPlaying, position } = audio

function togglePlay() {
  audio.toggle(selected.value?.bar ?? 0)
}

/* =====================================================
   COMPÁS PATTERN
===================================================== */

const editingPattern = ref(false)

function resizeBars() {
  const n = sheet.pattern.length
  for (const bar of sheet.bars) {
    while (bar.cells.length < n) bar.cells.push(newCell())
    if (bar.cells.length > n) bar.cells.splice(n)
  }
  if (selected.value && selected.value.beat >= n)
    selected.value = { ...selected.value, beat: n - 1 }
}

function applyStyle(value) {
  sheet.style = value
  if (value !== 'custom' && COMPAS_MAP[value]) {
    sheet.pattern = clone(COMPAS_MAP[value].beats)
    resizeBars()
  }
}

function toggleAccent(i) {
  sheet.pattern[i].accent = !sheet.pattern[i].accent
  sheet.style = 'custom'
}

function addBeat() {
  const n = sheet.pattern.length
  const last = parseInt(sheet.pattern[n - 1]?.label, 10)
  const label = Number.isFinite(last) ? String(last + 1) : String(n + 1)
  sheet.pattern.push({ label, accent: false })
  sheet.style = 'custom'
  resizeBars()
}

// function addBeat() {
//   const n = sheet.pattern.length
//   sheet.pattern.push({ label: String(n + 1), accent: false })
//   sheet.style = 'custom'
//   resizeBars()
// }

function removeBeat() {
  if (sheet.pattern.length <= 1) return
  sheet.pattern.pop()
  sheet.style = 'custom'
  resizeBars()
}

function renameBeat(i, label) {
  sheet.pattern[i].label = label
  sheet.style = 'custom'
}

/* =====================================================
   TEMPO
===================================================== */

let taps = []
function tapTempo() {
  const now = performance.now()
  if (taps.length && now - taps[taps.length - 1] > 2000) taps = []
  taps.push(now)
  if (taps.length > 5) taps.shift()
  if (taps.length < 2) return
  const avg = (taps[taps.length - 1] - taps[0]) / (taps.length - 1)
  sheet.tempo = Math.round(Math.min(320, Math.max(30, 60000 / avg)))
}

/* =====================================================
   BARS
===================================================== */

const barEls = []

function addBar() {
  sheet.bars.push(newBar(sheet.pattern.length))
  selectCell(sheet.bars.length - 1, 0)
}

function duplicateBar(i) {
  const copy = clone(sheet.bars[i])
  copy.id = uid()
  sheet.bars.splice(i + 1, 0, copy)
}

function clearBar(i) {
  sheet.bars[i].cells = sheet.pattern.map(newCell)
}

function moveBar(i, dir) {
  const j = i + dir
  if (j < 0 || j >= sheet.bars.length) return
  const [bar] = sheet.bars.splice(i, 1)
  sheet.bars.splice(j, 0, bar)
  if (loopBar.value === i) loopBar.value = j
  if (selected.value?.bar === i) selected.value = { ...selected.value, bar: j }
}

function removeBar(i) {
  if (sheet.bars.length === 1) return clearBar(0)
  sheet.bars.splice(i, 1)
  if (loopBar.value === i) loopBar.value = null
  else if (loopBar.value > i) loopBar.value--
  if (selected.value?.bar === i) selected.value = null
  else if (selected.value?.bar > i)
    selected.value = { ...selected.value, bar: selected.value.bar - 1 }
}

/* ---------- melodies: copy a compás's staff notes, paste notes across beats ---------- */

function copyBarNotes(i) {
  const lists = sheet.bars[i].cells.map((c) =>
    toAbsolute((c.staff || []).map(fitStaffNote), BEAT_CONTEXT),
  )
  const melody = beatsToMelody(lists)
  if (!melody.length) {
    $q.notify({ message: 'This compás has no staff notes to copy.', position: 'top-left' })
    return
  }
  copyNotes(melody)
  $q.notify({
    type: 'positive',
    message: `Copied ${melody.length} notes and rests. Paste them into a note sheet or another compás.`,
    position: 'top-left',
  })
}

// one quarter note per beat, starting at the given beat; adds compases when
// the melody runs past the last one. Replaces the staff notes of those beats.
function pasteMelody(bar, beat = 0) {
  const items = copiedNotes.value
  if (!items?.length) return
  const beats = melodyToBeats(items)
  const n = sheet.pattern.length
  let b = bar
  let i = beat
  for (const list of beats) {
    while (b >= sheet.bars.length) sheet.bars.push(newBar(n))
    sheet.bars[b].cells[i].staff = respell(
      list.map(fitStaffNote),
      BEAT_CONTEXT,
      list.map(absoluteAlters),
    )
    i++
    if (i >= n) {
      i = 0
      b++
    }
  }
  $q.notify({
    type: 'positive',
    message: `Pasted over ${beats.length} beat${beats.length === 1 ? '' : 's'}.`,
    position: 'top-left',
  })
}

function toggleLoop(i) {
  loopBar.value = loopBar.value === i ? null : i
}

/* =====================================================
   GRID LAYOUT
===================================================== */

const gridWidth = ref(800)
const MIN_CELL = 50

const columns = computed(() => {
  let cols = sheet.pattern.length
  while (cols * MIN_CELL > gridWidth.value && cols % 2 === 0 && cols > 4) cols /= 2
  return cols
})

// chord still sounding from the previous compás, shown on an empty first beat
const carried = computed(() => {
  let last = ''
  return sheet.bars.map((bar) =>
    bar.cells.map((cell) => {
      if (cell.chord) {
        last = cell.chord
        return ''
      }
      return last
    }),
  )
})

function staffLine(cell) {
  return cell.staff?.length ? `♪ ${staffText(cell.staff)}` : ''
}

function techniqueText(cell) {
  return (cell.techniques || []).map((t) => TECHNIQUE_MAP[t]?.short || t).join(' ')
}

function isActive(b, i) {
  return (
    position.value &&
    !position.value.countIn &&
    position.value.bar === b &&
    position.value.beat === i
  )
}

watch(
  () => position.value?.bar,
  (bar) => {
    if (bar === null || bar === undefined) return
    const el = barEls[bar]
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
  },
)

/* =====================================================
   SELECTION & EDITING
===================================================== */

const selected = ref(null) // { bar, beat }
const editor = ref(null)
const clipboard = ref(null)

const selectedCell = computed(() => {
  if (!selected.value) return null
  return sheet.bars[selected.value.bar]?.cells[selected.value.beat] ?? null
})

const editorTitle = computed(() => {
  if (!selected.value) return ''
  const bar = sheet.bars[selected.value.bar]
  const name = bar?.name ? ` (${bar.name})` : ''
  const label = sheet.pattern[selected.value.beat]?.label
  return `Compás ${selected.value.bar + 1}${name}, beat ${label}`
})

const chordSet = computed(() => TOQUES.find((t) => t.value === sheet.toque)?.chords ?? [])

function selectCell(bar, beat) {
  selected.value = { bar, beat }
}

function moveSelection(step) {
  if (!selected.value) return selectCell(0, 0)
  const n = sheet.pattern.length
  let flat = selected.value.bar * n + selected.value.beat + step
  const total = sheet.bars.length * n
  flat = (flat + total) % total
  selectCell(Math.floor(flat / n), flat % n)
}

function patchCell(patch) {
  if (selectedCell.value) Object.assign(selectedCell.value, patch)
}

// last pitched staff note before the selected beat (rests skipped),
// so new notes continue the melody
const previousStaffNote = computed(() => {
  if (!selected.value) return null
  for (let b = selected.value.bar; b >= 0; b--) {
    const cells = sheet.bars[b]?.cells || []
    const start = b === selected.value.bar ? selected.value.beat - 1 : cells.length - 1
    for (let i = start; i >= 0; i--) {
      const staff = cells[i]?.staff
      const note = staff?.length ? lastPitched(staff, staff.length - 1) : null
      if (note) return note
    }
  }
  return null
})

// play a single staff note while writing it
function auditionNote(note) {
  if (note && !note.rest && sheet.settings.guitar && !isPlaying.value)
    audio.preview({ ...newCell(), staff: [note] })
}

function pickChord(chord) {
  patchCell({ chord })
  if (chord && sheet.settings.guitar && !isPlaying.value) audio.preview(selectedCell.value)
}

function previewSelected() {
  const beat = sheet.pattern[selected.value?.beat]
  audio.preview(selectedCell.value, beat?.accent)
}

function copyCell() {
  if (selectedCell.value) clipboard.value = clone(selectedCell.value)
}

function pasteCell() {
  if (selectedCell.value && clipboard.value)
    Object.assign(selectedCell.value, clone(clipboard.value))
}

function clearCell() {
  if (selectedCell.value) Object.assign(selectedCell.value, newCell())
}

/* =====================================================
   UNDO / REDO
===================================================== */

const history = reactive({ stack: [], index: -1 })
let applyingHistory = false
let historyTimer = null

const snapshot = () => JSON.stringify({ ...sheet, tempo: undefined })

function pushHistory() {
  const snap = snapshot()
  if (history.stack[history.index] === snap) return
  history.stack.splice(history.index + 1)
  history.stack.push(snap)
  if (history.stack.length > 100) history.stack.shift()
  history.index = history.stack.length - 1
}

function restore(index) {
  clearTimeout(historyTimer)
  applyingHistory = true
  const tempo = sheet.tempo
  replaceSheet({ ...JSON.parse(history.stack[index]), tempo })
  history.index = index
  resizeBars()
  nextTick(() => (applyingHistory = false))
}

const canUndo = computed(() => history.index > 0)
const canRedo = computed(() => history.index < history.stack.length - 1)
const undo = () => canUndo.value && restore(history.index - 1)
const redo = () => canRedo.value && restore(history.index + 1)

/* =====================================================
   PERSISTENCE
===================================================== */

let saveTimer = null
let lastEmitted = ''

watch(
  sheet,
  () => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      const json = JSON.stringify(sheet)
      if (props.storageKey) {
        try {
          localStorage.setItem(props.storageKey, json)
        } catch {
          /* storage full or blocked: the sheet still lives in memory */
        }
      }
      lastEmitted = json
      emit('update:modelValue', JSON.parse(json))
    }, 400)

    if (!applyingHistory) {
      clearTimeout(historyTimer)
      historyTimer = setTimeout(pushHistory, 300)
    }
  },
  { deep: true },
)

watch(
  () => props.modelValue,
  (value) => {
    if (!value || JSON.stringify(value) === lastEmitted) return
    replaceSheet(value)
    selected.value = null
    loopBar.value = null
  },
  { deep: true },
)

/* =====================================================
   IMPORT / EXPORT
===================================================== */

const fileInput = ref(null)
const styleLabel = computed(
  () => STYLE_OPTIONS.find((o) => o.value === sheet.style)?.label ?? 'Custom',
)

function fileName(ext) {
  const base = (sheet.title || styleLabel.value || 'compas')
    .trim()
    .replace(/[^\w\-áéíóúñü ]+/gi, '')
  return `${base.replace(/\s+/g, '-').toLowerCase() || 'compas'}.${ext}`
}

function exportJson() {
  const blob = new Blob([JSON.stringify(sheet, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName('json')
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function importJson(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      audio.stop()
      replaceSheet(JSON.parse(String(reader.result)))
      selected.value = null
      loopBar.value = null
      $q.notify({ type: 'positive', message: 'Compás imported', position: 'top-left' })
    } catch {
      $q.notify({
        type: 'negative',
        message: 'This file is not a compás export. Choose a .json file saved from here.',
        position: 'top-left',
      })
    }
  }
  reader.readAsText(file)
}

function sheetAsText() {
  const toque = TOQUES.find((t) => t.value === sheet.toque)?.label
  const head = [
    sheet.title,
    `${styleLabel.value}, ${toque}${sheet.capo ? `, capo ${sheet.capo}` : ''}, ${sheet.tempo} BPM`,
  ].filter(Boolean)
  const accents = sheet.pattern.map((b) => (b.accent ? `[${b.label}]` : b.label)).join(' ')
  const lines = [...head, `Compás: ${accents}`, '']

  sheet.bars.forEach((bar, b) => {
    const repeat = bar.repeat > 1 ? ` x${bar.repeat}` : ''
    lines.push(`${b + 1}. ${bar.name || 'Compás'}${repeat}`)
    bar.cells.forEach((cell, i) => {
      if (isEmptyCell(cell)) return
      const parts = [
        cell.chord && `${cell.chord}${cell.stroke === 'up' ? ' ↑' : ''}`,
        (cell.techniques || []).map((t) => TECHNIQUE_MAP[t]?.label || t).join(', '),
        cell.staff?.length && staffLine(cell),
        cell.notes,
        cell.text && `"${cell.text}"`,
        cell.silent && '(no click)',
      ].filter(Boolean)
      lines.push(`   ${sheet.pattern[i].label.padStart(2)}  ${parts.join('  ')}`)
    })
    lines.push('')
  })
  return lines.join('\n').trim()
}

async function copyAsText() {
  try {
    await navigator.clipboard.writeText(sheetAsText())
    $q.notify({ type: 'positive', message: 'Copied as text', position: 'top-left' })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Clipboard is blocked by the browser. Use Export instead.',
      position: 'top-left',
    })
  }
}

function clearAll() {
  $q.dialog({
    title: 'Clear everything?',
    message: 'All compases and beats will be emptied. You can undo this.',
    dark: true,
    cancel: { flat: true, color: 'grey-5', label: 'Cancel' },
    ok: { color: 'negative', label: 'Clear' },
  }).onOk(() => {
    audio.stop()
    sheet.title = ''
    sheet.bars = [newBar(sheet.pattern.length)]
    selected.value = null
    loopBar.value = null
  })
}

/* =====================================================
   KEYBOARD
===================================================== */

const showShortcuts = ref(false)
const SHORTCUTS = [
  ['Space', 'Play or stop'],
  ['← →', 'Previous or next beat, or note in the Notes tab'],
  ['↑ ↓', 'Same beat in the previous or next compás'],
  ['A to G', 'Type a chord, or add a note when the Notes tab is open'],
  ['R', 'Add a rest when the Notes tab is open'],
  ['↑ ↓ on a note', 'Move it a step, with Shift an octave'],
  ['1 to 7 on a note', 'Length, from whole to sixty-fourth'],
  ['. and T on a note', 'Dotted, tie to the next note'],
  ['# - = on a note', 'Sharp, flat, natural'],
  ['Enter', 'Edit the chord, Enter again moves on'],
  ['Delete', 'Delete the selected note or rest, or clear the beat'],
  ['Ctrl C / Ctrl V', 'Copy or paste a beat'],
  ['Ctrl Z / Ctrl Shift Z', 'Undo or redo'],
  ['Esc', 'Close the beat editor'],
]

function isTyping(e) {
  return !!e.target?.closest?.(
    'input, textarea, select, [contenteditable="true"], [role="slider"], [role="combobox"], .q-field',
  )
}

function onKeydown(e) {
  const mod = e.ctrlKey || e.metaKey

  if (mod && e.key.toLowerCase() === 'z' && !isTyping(e)) {
    e.preventDefault()
    return e.shiftKey ? redo() : undo()
  }
  if (mod && e.key.toLowerCase() === 'y' && !isTyping(e)) {
    e.preventDefault()
    return redo()
  }

  if (e.key === 'Escape') {
    if (isTyping(e)) e.target.blur()
    else selected.value = null
    return
  }

  if (isTyping(e) || e.altKey) return
  if (document.querySelector('.q-dialog, .q-menu')) return

  if (e.key === ' ') {
    e.preventDefault()
    return togglePlay()
  }
  if (!selected.value) return

  // the Notes tab handles keys for its selected note first
  if (!mod && editor.value?.handleKey(e)) {
    e.preventDefault()
    return
  }

  const n = sheet.pattern.length
  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault()
      return moveSelection(1)
    case 'ArrowLeft':
      e.preventDefault()
      return moveSelection(-1)
    case 'ArrowDown':
      e.preventDefault()
      return moveSelection(n)
    case 'ArrowUp':
      e.preventDefault()
      return moveSelection(-n)
    case 'Delete':
    case 'Backspace':
      e.preventDefault()
      if (editor.value?.deleteSelectedNote()) return
      return clearCell()
    case 'Enter':
      e.preventDefault()
      return editor.value?.focusChord()
  }

  if (mod && e.key.toLowerCase() === 'c' && !window.getSelection()?.toString()) return copyCell()
  if (mod && e.key.toLowerCase() === 'v') return pasteCell()

  if (!mod && /^[rR]$/.test(e.key) && editor.value?.typeRest()) {
    e.preventDefault()
    return
  }

  if (!mod && /^[a-gA-G]$/.test(e.key)) {
    e.preventDefault()
    editor.value?.typeLetter(e.key.toUpperCase())
  }
}

function onEditorMove(step) {
  moveSelection(step)
  editor.value?.focusChord()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  pushHistory()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(saveTimer)
  clearTimeout(historyTimer)
})
</script>

<template>
  <div class="fc text-grey-3">
    <!-- ===== Header ===== -->
    <div class="row items-center no-wrap q-mb-sm">
      <q-input
        v-model="sheet.title"
        borderless
        dense
        placeholder="Untitled compás"
        class="col fc-title"
        input-class="text-h6 text-grey-2"
      />
      <q-btn flat dense round icon="undo" color="grey-5" :disable="!canUndo" @click="undo">
        <q-tooltip>Undo</q-tooltip>
      </q-btn>
      <q-btn flat dense round icon="redo" color="grey-5" :disable="!canRedo" @click="redo">
        <q-tooltip>Redo</q-tooltip>
      </q-btn>

      <q-btn flat dense round icon="settings" color="grey-5">
        <q-tooltip>Sound and practice</q-tooltip>
        <q-menu anchor="bottom right" self="top right">
          <div class="fc-menu q-pa-md">
            <div class="text-subtitle2 q-mb-xs">Click</div>
            <q-toggle
              v-model="sheet.settings.click"
              label="Play the compás click"
              dense
              color="blue-5"
            />
            <div class="q-pl-lg q-mt-xs" :class="{ 'fc-dim': !sheet.settings.click }">
              <q-option-group
                v-model="sheet.settings.sounds"
                :options="SOUND_OPTIONS"
                type="checkbox"
                inline
                dense
                color="blue-5"
              />
              <q-toggle
                v-model="sheet.settings.offbeat"
                label="Contratiempo, soft clap between beats"
                dense
                color="blue-5"
                class="q-mt-xs"
              />
              <div class="row items-center no-wrap q-mt-sm">
                <span class="text-caption text-grey-5 fc-vol-label">Volume</span>
                <q-slider
                  v-model="sheet.settings.clickVolume"
                  :min="0"
                  :max="1"
                  :step="0.05"
                  dense
                  color="blue-5"
                  aria-label="Click volume"
                  class="col"
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <div class="text-subtitle2 q-mb-xs">Guitar</div>
            <q-toggle
              v-model="sheet.settings.guitar"
              label="Play chords and notes"
              dense
              color="blue-5"
            />
            <div class="q-pl-lg" :class="{ 'fc-dim': !sheet.settings.guitar }">
              <div class="row items-center no-wrap q-mt-sm">
                <span class="text-caption text-grey-5 fc-vol-label">Volume</span>
                <q-slider
                  v-model="sheet.settings.guitarVolume"
                  :min="0"
                  :max="1"
                  :step="0.05"
                  dense
                  color="blue-5"
                  aria-label="Guitar volume"
                  class="col"
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <div class="text-subtitle2 q-mb-xs">Practice</div>
            <q-toggle
              v-model="sheet.settings.countIn"
              label="Count in one compás"
              dense
              color="blue-5"
            />
            <q-toggle
              v-model="sheet.settings.trainer.enabled"
              label="Speed up as I play"
              dense
              color="blue-5"
              class="q-mt-xs"
            />
            <div v-if="sheet.settings.trainer.enabled" class="q-pl-lg q-mt-xs fc-trainer">
              <div class="row items-center no-wrap q-gutter-x-xs">
                <span>Add</span>
                <q-input
                  v-model.number="sheet.settings.trainer.step"
                  type="number"
                  dense
                  outlined
                  class="fc-num"
                  color="blue-5"
                  aria-label="BPM to add"
                />
                <span>BPM, every</span>
              </div>
              <div class="row items-center no-wrap q-gutter-x-xs q-mt-xs">
                <q-input
                  v-model.number="sheet.settings.trainer.every"
                  type="number"
                  dense
                  outlined
                  class="fc-num"
                  color="blue-5"
                  aria-label="Compases between steps"
                />
                <span>compases, up to</span>
              </div>
              <div class="row items-center no-wrap q-gutter-x-xs q-mt-xs">
                <q-input
                  v-model.number="sheet.settings.trainer.max"
                  type="number"
                  dense
                  outlined
                  class="fc-num wide"
                  color="blue-5"
                  aria-label="Maximum BPM"
                />
                <span>BPM</span>
              </div>
            </div>
          </div>
        </q-menu>
      </q-btn>

      <q-btn flat dense round icon="more_vert" color="grey-5">
        <q-menu anchor="bottom right" self="top right">
          <q-list dense style="min-width: 210px">
            <q-item v-close-popup clickable @click="copyAsText">
              <q-item-section avatar><q-icon name="notes" /></q-item-section>
              <q-item-section>Copy as text</q-item-section>
            </q-item>
            <q-item v-close-popup clickable @click="exportJson">
              <q-item-section avatar><q-icon name="download" /></q-item-section>
              <q-item-section>Export</q-item-section>
            </q-item>
            <q-item v-close-popup clickable @click="fileInput?.click()">
              <q-item-section avatar><q-icon name="upload" /></q-item-section>
              <q-item-section>Import</q-item-section>
            </q-item>
            <q-item v-close-popup clickable @click="showShortcuts = true">
              <q-item-section avatar><q-icon name="keyboard" /></q-item-section>
              <q-item-section>Keyboard shortcuts</q-item-section>
            </q-item>
            <q-separator />
            <q-item v-close-popup clickable class="text-negative" @click="clearAll">
              <q-item-section avatar><q-icon name="delete_sweep" /></q-item-section>
              <q-item-section>Clear everything</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        hidden
        @change="importJson"
      />
    </div>

    <!-- ===== Setup ===== -->
    <div class="row q-col-gutter-sm q-mb-sm">
      <div class="col-12 col-sm-4">
        <q-select
          :model-value="sheet.style"
          :options="STYLE_OPTIONS"
          label="Palo"
          emit-value
          map-options
          options-dense
          dense
          outlined
          color="blue-5"
          @update:model-value="applyStyle"
        />
      </div>
      <div class="col-7 col-sm-5">
        <q-select
          v-model="sheet.toque"
          :options="TOQUE_OPTIONS"
          label="Key"
          emit-value
          map-options
          options-dense
          dense
          outlined
          color="blue-5"
        />
      </div>
      <div class="col-5 col-sm-3">
        <q-select
          v-model="sheet.capo"
          :options="CAPO_OPTIONS"
          label="Cejilla"
          emit-value
          map-options
          options-dense
          dense
          outlined
          color="blue-5"
        />
      </div>
    </div>

    <!-- ===== Transport ===== -->
    <div class="row items-center no-wrap q-gutter-x-sm q-mb-md">
      <q-btn
        round
        unelevated
        :icon="isPlaying ? 'stop' : 'play_arrow'"
        :color="isPlaying ? 'red-5' : 'blue-5'"
        :aria-label="isPlaying ? 'Stop' : 'Play'"
        @click="togglePlay"
      />
      <div class="fc-tempo text-grey-2">
        <span class="text-weight-medium">{{ sheet.tempo }}</span>
        <span class="text-grey-6 text-caption"> BPM</span>
      </div>
      <q-slider
        v-model="sheet.tempo"
        :min="30"
        :max="320"
        :step="1"
        dense
        color="blue-5"
        class="col"
        aria-label="Tempo"
      />
      <q-btn flat dense no-caps label="Tap" color="grey-4" class="q-px-sm" @click="tapTempo">
        <q-tooltip>Tap 4 times to set the tempo</q-tooltip>
      </q-btn>
    </div>

    <!-- ===== Compás strip ===== -->
    <div class="fc-strip row items-center no-wrap q-mb-xs">
      <div class="fc-strip-beats">
        <template v-if="!editingPattern">
          <button
            v-for="(beat, i) in sheet.pattern"
            :key="i"
            type="button"
            :class="[
              'fc-beat',
              {
                accent: beat.accent,
                active: position && position.beat === i,
                countin: position && position.countIn,
              },
            ]"
            :aria-pressed="beat.accent"
            :aria-label="`Beat ${beat.label}, ${beat.accent ? 'accented' : 'not accented'}`"
            @click="toggleAccent(i)"
          >
            {{ beat.label }}
          </button>
        </template>
        <template v-else>
          <input
            v-for="(beat, i) in sheet.pattern"
            :key="i"
            :value="beat.label"
            class="fc-beat-input"
            :class="{ accent: beat.accent }"
            maxlength="3"
            :aria-label="`Label for beat ${i + 1}`"
            @input="renameBeat(i, $event.target.value)"
          />
        </template>
      </div>
      <q-space />
      <template v-if="editingPattern">
        <q-btn flat dense round size="sm" icon="remove" color="grey-5" @click="removeBeat">
          <q-tooltip>Remove last beat</q-tooltip>
        </q-btn>
        <q-btn flat dense round size="sm" icon="add" color="grey-5" @click="addBeat">
          <q-tooltip>Add a beat</q-tooltip>
        </q-btn>
      </template>
      <q-btn
        flat
        dense
        round
        size="sm"
        :icon="editingPattern ? 'check' : 'edit'"
        :color="editingPattern ? 'blue-5' : 'grey-6'"
        @click="editingPattern = !editingPattern"
      >
        <q-tooltip>{{ editingPattern ? 'Done' : 'Edit beat labels and length' }}</q-tooltip>
      </q-btn>
    </div>
    <div class="text-caption text-grey-7 q-mb-md">
      <template v-if="editingPattern">Rename beats, or add and remove them at the end.</template>
      <template v-else>Click a number to accent it. Click a beat below to write on it.</template>
    </div>

    <!-- ===== Bars ===== -->
    <div class="fc-bars">
      <q-resize-observer @resize="(s) => (gridWidth = s.width)" />

      <div
        v-for="(bar, b) in sheet.bars"
        :key="bar.id"
        :ref="(el) => (barEls[b] = el)"
        class="fc-bar"
        :class="{ looping: loopBar === b }"
      >
        <div class="row items-center no-wrap fc-bar-head">
          <span class="fc-bar-num text-grey-6">{{ b + 1 }}</span>
          <input
            v-model="bar.name"
            class="fc-bar-name"
            :placeholder="`Compás ${b + 1}`"
            list="fc-sections"
            :aria-label="`Name of compás ${b + 1}`"
          />
          <span v-if="bar.repeat > 1" class="fc-repeat text-blue-5">×{{ bar.repeat }}</span>
          <q-space />
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="repeat_one"
            :color="loopBar === b ? 'blue-5' : 'grey-7'"
            @click="toggleLoop(b)"
          >
            <q-tooltip>{{
              loopBar === b ? 'Stop looping this compás' : 'Loop only this compás'
            }}</q-tooltip>
          </q-btn>
          <q-btn flat dense round size="sm" icon="more_horiz" color="grey-6">
            <q-menu dark anchor="bottom right" self="top right">
              <q-list dense dark style="min-width: 190px">
                <q-item>
                  <q-item-section>Repeat</q-item-section>
                  <q-item-section side>
                    <q-btn-toggle
                      v-model="bar.repeat"
                      :options="REPEAT_OPTIONS.map((r) => ({ label: `${r}`, value: r }))"
                      dense
                      flat
                      size="sm"
                      color="grey-5"
                      toggle-color="blue-5"
                    />
                  </q-item-section>
                </q-item>
                <q-separator dark />
                <q-item v-close-popup clickable @click="duplicateBar(b)">
                  <q-item-section>Duplicate</q-item-section>
                </q-item>
                <q-item v-close-popup clickable @click="copyBarNotes(b)">
                  <q-item-section>Copy notes as a melody</q-item-section>
                </q-item>
                <q-item v-close-popup clickable :disable="!copiedNotes" @click="pasteMelody(b, 0)">
                  <q-item-section>Paste melody here</q-item-section>
                </q-item>
                <q-item v-close-popup clickable :disable="b === 0" @click="moveBar(b, -1)">
                  <q-item-section>Move up</q-item-section>
                </q-item>
                <q-item
                  v-close-popup
                  clickable
                  :disable="b === sheet.bars.length - 1"
                  @click="moveBar(b, 1)"
                >
                  <q-item-section>Move down</q-item-section>
                </q-item>
                <q-item v-close-popup clickable @click="clearBar(b)">
                  <q-item-section>Clear</q-item-section>
                </q-item>
                <q-item v-close-popup clickable class="text-negative" @click="removeBar(b)">
                  <q-item-section>Delete</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <div class="fc-grid" :style="{ '--cols': columns }">
          <button
            v-for="(cell, i) in bar.cells"
            :key="i"
            type="button"
            :class="[
              'fc-cell',
              {
                accent: sheet.pattern[i]?.accent,
                selected: selected && selected.bar === b && selected.beat === i,
                active: isActive(b, i),
                silent: cell.silent,
              },
            ]"
            :aria-label="`Compás ${b + 1}, beat ${sheet.pattern[i]?.label}${cell.chord ? `, ${cell.chord}` : ''}${cell.staff?.length ? `, notes ${staffText(cell.staff)}` : ''}`"
            @click="selectCell(b, i)"
          >
            <span class="fc-cell-top">
              <span class="fc-cell-label">{{ sheet.pattern[i]?.label }}</span>
              <span v-if="cell.chord && cell.stroke === 'up'" class="fc-stroke">↑</span>
            </span>
            <span v-if="cell.chord" class="fc-chord">{{ cell.chord }}</span>
            <span
              v-else-if="i === 0 && carried[b]?.[0] && !cell.notes && !cell.staff?.length"
              class="fc-chord carried"
            >
              {{ carried[b][i] }}
            </span>
            <span v-if="cell.staff?.length" class="fc-notes fc-staff">{{ staffLine(cell) }}</span>
            <span v-if="cell.notes" class="fc-notes">{{ cell.notes }}</span>
            <span v-if="cell.techniques?.length" class="fc-tech">{{ techniqueText(cell) }}</span>
            <span v-if="cell.text" class="fc-text">{{ cell.text }}</span>
          </button>
        </div>
      </div>

      <q-btn
        flat
        no-caps
        icon="add"
        label="Add compás"
        color="grey-5"
        class="full-width q-mt-xs fc-add"
        @click="addBar"
      />
    </div>

    <datalist id="fc-sections">
      <option v-for="s in SECTION_NAMES" :key="s" :value="s" />
    </datalist>

    <!-- ===== Beat editor ===== -->
    <div v-if="selectedCell" class="fc-editor">
      <BeatEditor
        ref="editor"
        :cell="selectedCell"
        :title="editorTitle"
        :chord-set="chordSet"
        :capo="sheet.capo"
        :can-paste="!!clipboard"
        :previous-note="previousStaffNote"
        @patch="patchCell"
        @audition="auditionNote"
        @paste-melody="pasteMelody(selected.bar, selected.beat)"
        @pick="pickChord"
        @preview="previewSelected"
        @copy="copyCell"
        @paste="pasteCell"
        @clear="clearCell"
        @close="selected = null"
        @move="onEditorMove"
      />
    </div>

    <q-dialog v-model="showShortcuts">
      <q-card dark class="bg-grey-10" style="min-width: 320px">
        <q-card-section class="text-subtitle1">Keyboard shortcuts</q-card-section>
        <q-card-section class="q-pt-none">
          <div v-for="[keys, what] in SHORTCUTS" :key="keys" class="row no-wrap q-py-xs">
            <kbd class="fc-kbd">{{ keys }}</kbd>
            <span class="q-ml-md text-grey-4">{{ what }}</span>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Close" color="blue-5" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.fc {
  --fc-line: var(--app-border);
  --fc-blue: #318bd1;
  --fc-red: var(--q-accent);
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 6px;
  color: var(--app-text);
}

.fc-title :deep(input::placeholder) {
  color: var(--app-muted);
}

.fc-tempo {
  min-width: 70px;
  font-size: 1.15rem;
  font-variant-numeric: tabular-nums;
}

.fc-dim {
  opacity: 0.4;
  pointer-events: none;
}

.fc-menu {
  width: 340px;
  max-width: calc(100vw - 32px);
}

.fc-num {
  width: 56px;
}

.fc-num.wide {
  width: 68px;
}

.fc-trainer span {
  white-space: nowrap;
}

.fc-vol-label {
  width: 56px;
}

/* ---------- compás strip ---------- */

.fc-strip-beats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.fc-beat,
.fc-beat-input {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--fc-line);
  background: transparent;
  color: var(--app-muted);
  font: inherit;
  font-size: 0.95rem;
  text-align: center;
  cursor: pointer;
  transition:
    transform 0.06s ease-out,
    background-color 0.06s ease-out;
}

.fc-beat.accent,
.fc-beat-input.accent {
  color: #fff;
  background: var(--fc-blue);
  border-color: var(--fc-blue);
  font-weight: 600;
}

.fc-beat.active {
  background: var(--fc-red);
  border-color: var(--fc-red);
  color: #fff;
  transform: scale(1.15);
}

.fc-beat.active.countin {
  background: transparent;
  color: var(--fc-red);
}

.fc-beat-input {
  border-radius: 6px;
  cursor: text;
}

.fc-beat:focus-visible,
.fc-cell:focus-visible,
.fc-bar-name:focus-visible {
  outline: 2px solid var(--fc-blue);
  outline-offset: 2px;
}

/* ---------- bars ---------- */

.fc-bars {
  position: relative;
}

.fc-bar {
  margin-bottom: 14px;
  border-left: 2px solid transparent;
  padding-left: 6px;
  margin-left: -8px;
}

.fc-bar.looping {
  border-left-color: var(--fc-blue);
}

.fc-bar-head {
  height: 28px;
  gap: 6px;
}

.fc-bar-num {
  font-size: 0.75rem;
  min-width: 14px;
  font-variant-numeric: tabular-nums;
}

.fc-bar-name {
  background: transparent;
  border: 0;
  color: var(--app-text);
  font: inherit;
  font-size: 0.85rem;
  padding: 2px 0;
  min-width: 0;
  width: 160px;
}

.fc-bar-name::placeholder {
  color: var(--app-muted);
}

.fc-repeat {
  font-size: 0.8rem;
  font-weight: 600;
}

.fc-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: 3px;
}

.fc-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  min-height: 78px;
  padding: 4px 5px 5px;
  border: 1px solid var(--fc-line);
  border-radius: 4px;
  background: var(--app-surface);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
}

.fc-cell:hover {
  background: var(--app-surface-soft);
}

.fc-cell.accent {
  background: var(--app-surface-raised);
}

.fc-cell.selected {
  border-color: var(--fc-blue);
  box-shadow: inset 0 0 0 1px var(--fc-blue);
}

.fc-cell.active {
  border-color: var(--fc-red);
  box-shadow: inset 0 3px 0 var(--fc-red);
}

.fc-cell-top {
  display: flex;
  width: 100%;
  justify-content: space-between;
  font-size: 0.7rem;
  line-height: 1;
  color: var(--app-muted);
}

.fc-cell.accent .fc-cell-label {
  color: var(--fc-blue);
  font-weight: 700;
}

.fc-cell.silent .fc-cell-label {
  text-decoration: line-through;
}

.fc-stroke {
  color: var(--app-muted);
}

.fc-chord {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--app-text);
  line-height: 1.3;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fc-chord.carried {
  color: var(--app-muted);
  font-weight: 400;
}

.fc-notes,
.fc-tech,
.fc-text {
  font-size: 0.7rem;
  line-height: 1.25;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fc-notes {
  color: #90caf9;
}

.fc-staff {
  font-weight: 600;
}

.fc-tech {
  color: var(--app-muted);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.fc-text {
  color: var(--app-muted);
  font-style: italic;
  margin-top: auto;
}

.fc-add {
  border: 1px dashed var(--fc-line);
}

/* ---------- editor ---------- */

.fc-editor {
  position: sticky;
  bottom: 0;
  z-index: 2;
  margin: 12px -16px -16px;
  padding: 12px 16px 16px;
  background: var(--app-surface);
  border-top: 1px solid var(--fc-line);
  border-radius: 0 0 6px 6px;
  /* the staff makes the editor taller; keep the grid visible above it */
  max-height: 70vh;
  max-height: 70dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.fc-kbd {
  min-width: 150px;
  font: inherit;
  font-size: 0.8rem;
  color: var(--app-text);
}

@media (max-width: 599px) {
  .fc {
    padding: 12px;
  }
  .fc-editor {
    margin: 12px -12px -12px;
    padding: 12px;
  }
  .fc-cell {
    min-height: 70px;
    padding: 3px 4px 4px;
  }
  .fc-chord {
    font-size: 0.95rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fc-beat {
    transition: none;
  }
}
</style>
