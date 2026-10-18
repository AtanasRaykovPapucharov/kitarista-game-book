<script setup>
import { TouchSwipe, useQuasar } from 'quasar'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, toRaw, watch } from 'vue'
import GuitarGriff from 'src/components/GuitarGriff.vue'
import SingleFiveLines from './SingleFiveLines.vue'
import {
  ACCIDENTALS,
  LETTERS,
  NOTE_TYPES,
  OCTAVES,
  absoluteAlters,
  accOf,
  buildTimeline,
  copiedNotes,
  copyNotes,
  fitItem,
  itemWhole,
  letterOf,
  lettersFor,
  measureLength,
  nearestOctave,
  placeOnStrings,
  resolveStaff,
  respell,
  stepItem,
  toAbsolute,
  withAcc,
} from './notation'
import { useStaffPlayer } from './useStaffPlayer'

/* =====================================================
   PROPS
   v-model     the whole sheet (optional), so a parent can save it
   storageKey  autosave to localStorage, null to disable
===================================================== */

const props = defineProps({
  modelValue: { type: Object, default: null },
  storageKey: { type: String, default: 'note-sheet' },
})
const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()
const showNeck = ref(false) // fretboard can be folded away to give the staff more room

/* =====================================================
   SETTINGS DRAWER (phones only)
   On phones the settings panel becomes a right-side drawer.
   It is the same <aside> as on desktop, restyled with CSS,
   so it does not depend on the app's QLayout drawers.
===================================================== */

const vTouchSwipe = TouchSwipe // local directive: swipe right to close
const isMobile = computed(() => $q.screen.lt.sm)
const settingsOpen = ref(false)
const settingsPanel = ref(null)
const settingsButton = ref(null)

function openSettings() {
  settingsOpen.value = true
}

function closeSettings() {
  settingsOpen.value = false
}

function onDrawerKeydown(e) {
  if (e.key === 'Escape') closeSettings()
}

watch(settingsOpen, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    window.addEventListener('keydown', onDrawerKeydown)
    await nextTick()
    settingsPanel.value?.focus()
  } else {
    window.removeEventListener('keydown', onDrawerKeydown)
    settingsButton.value?.$el?.focus()
  }
})

// rotating or resizing to a wider screen shows the panel inline again
watch(isMobile, (mobile) => {
  if (!mobile) settingsOpen.value = false
})

/* =====================================================
   SHEET MODEL
   A sheet is a list of staves (five-line systems), like the compás
   editor's list of compases. Notes and rests: see notation.js.
   Clef, key and time signature are set for the whole sheet; a staff can
   override any of them in `own` (a missing key means "same as sheet"):
     own: { clef?: 'treble' | 'bass' | null,
            key?: { sharps, flats },
            beat?: '3/4' | null }      (null = hidden on this staff)
===================================================== */

const clone = (v) => JSON.parse(JSON.stringify(v))

let idCounter = 0
const uid = () => `${Date.now().toString(36)}${(idCounter++).toString(36)}`

const newStaff = (notes = [], own = {}) => ({ id: uid(), own, notes })

const VALID_BEAT = /^\d+\/\d+$/

function normalizeOwn(own) {
  const out = {}
  if (!own || typeof own !== 'object') return out
  if ('clef' in own) out.clef = ['treble', 'bass'].includes(own.clef) ? own.clef : null
  if ('key' in own) {
    const sharps = Number(own.key?.sharps) || 0
    out.key = { sharps, flats: sharps ? 0 : Number(own.key?.flats) || 0 }
  }
  if ('beat' in own) out.beat = VALID_BEAT.test(own.beat || '') ? own.beat : null
  return out
}

function defaultSheet() {
  return {
    width: 730,
    clef: 'treble',
    beat: '4/4',
    sharps: 0,
    flats: 0,
    tempo: 90,
    showTab: false,
    staves: [newStaff([{ note: ['C'], type: 1, octave: 1 }])],
  }
}

const normalizeNotes = (list) => (Array.isArray(list) ? list.map(fitItem) : [])

// clef and beat can be null on purpose (hidden on the staff), so a missing
// key falls back to the default but an explicit null is kept.
// Older exports have one flat `notes` list: it becomes a single staff.
function normalizeSheet(raw) {
  const base = defaultSheet()
  if (!raw || typeof raw !== 'object') return base

  const sharps = Number(raw.sharps) || 0
  const staves =
    Array.isArray(raw.staves) && raw.staves.length
      ? raw.staves.map((st) => ({
          id: st?.id || uid(),
          own: normalizeOwn(st?.own),
          notes: normalizeNotes(st?.notes),
        }))
      : [newStaff(normalizeNotes(raw.notes))]

  return {
    width: Number(raw.width) || base.width,
    clef: 'clef' in raw ? raw.clef : base.clef,
    beat: 'beat' in raw ? raw.beat : base.beat,
    sharps,
    flats: sharps > 0 ? 0 : Number(raw.flats) || 0,
    tempo: Math.min(240, Math.max(30, Number(raw.tempo) || base.tempo)),
    showTab: !!raw.showTab,
    staves,
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

const initial = props.modelValue ?? loadLocal()
const sheetName = ref(initial?.name || 'Untitled sheet')
const addOperState = reactive(normalizeSheet(initial))

const selectedNote = ref(null) // { staff, chordIndex, letterIndex }
const activeStaff = ref(0) // staff that new notes and rests go to

function replaceSheet(next) {
  player.stop()
  Object.assign(addOperState, normalizeSheet(next))
  selectedNote.value = null
  activeStaff.value = 0
  settingsScope.value = 'sheet'
}

/* =====================================================
   CLEF, KEY AND TIME SIGNATURE
   Set for the whole sheet, or for one staff on its own.
===================================================== */

// what a staff actually uses: its own settings, else the sheet's
function staffSettings(staff) {
  const own = staff?.own || {}
  const key = 'key' in own ? own.key : { sharps: addOperState.sharps, flats: addOperState.flats }
  return {
    clef: 'clef' in own ? own.clef : addOperState.clef,
    sharps: key.sharps,
    flats: key.flats,
    beat: 'beat' in own ? own.beat : addOperState.beat,
  }
}

const staffConfigs = computed(() => addOperState.staves.map(staffSettings))

// a time signature is drawn at the start, and again wherever the meter changes
// or a staff was given its own
const showTime = computed(() =>
  staffConfigs.value.map(
    (r, i) =>
      !!r.beat &&
      (i === 0 ||
        r.beat !== staffConfigs.value[i - 1].beat ||
        'beat' in (addOperState.staves[i].own || {})),
  ),
)

// barlines carry on from one staff to the next: each staff starts with the
// part of a measure the staves before it left open. A change of meter
// starts a fresh measure.
const measureStarts = computed(() => {
  let fill = 0
  return addOperState.staves.map((staff, i) => {
    const beat = staffConfigs.value[i].beat
    if (i > 0 && beat !== staffConfigs.value[i - 1].beat) fill = 0
    const len = measureLength(beat)
    const start = fill
    if (len) {
      for (const n of staff.notes) {
        fill += itemWhole(n)
        if (fill >= len - 1e-9) fill = 0
      }
    }
    return start
  })
})

// everything needed to read a staff's pitches
const staffContext = (i) => ({
  ...staffConfigs.value[i],
  measureStart: measureStarts.value[i] ?? 0,
  freeScope: 'note',
})

// pitch of every note, with key signature and accidentals applied
const pitchInfo = computed(() =>
  addOperState.staves.map((staff, i) => resolveStaff(staff.notes, staffContext(i))),
)

const settingsScope = ref('sheet') // 'sheet' | 'staff' (the active staff)
const settingsBlock = ref(null)
const scopeStaff = computed(() => addOperState.staves[activeStaff.value] ?? null)

const scopeOptions = computed(() => [
  { label: 'Whole sheet', value: 'sheet' },
  { label: staffNumber(activeStaff.value), value: 'staff' },
])

// values shown in the panel for the current scope
const shown = computed(() =>
  settingsScope.value === 'sheet'
    ? {
        clef: addOperState.clef,
        sharps: addOperState.sharps,
        flats: addOperState.flats,
        beat: addOperState.beat,
      }
    : staffSettings(scopeStaff.value),
)

// true when the staff in scope uses the sheet's setting for this group
function follows(group) {
  return settingsScope.value === 'staff' && !(group in (scopeStaff.value?.own || {}))
}

function setGroup(group, value) {
  if (settingsScope.value === 'sheet') {
    if (group === 'key') {
      addOperState.sharps = value.sharps
      addOperState.flats = value.flats
    } else {
      addOperState[group] = value
    }
    return
  }
  const staff = scopeStaff.value
  if (!staff) return
  if (!staff.own) staff.own = {}
  staff.own[group] = group === 'key' ? { ...value } : value
}

// "Same as sheet" ticked: drop the staff's own value; unticked: start from
// what the staff shows now
function setFollows(group, follow) {
  const staff = scopeStaff.value
  if (!staff) return
  if (!staff.own) staff.own = {}
  if (follow) {
    delete staff.own[group]
    return
  }
  const r = staffSettings(staff)
  staff.own[group] = group === 'key' ? { sharps: r.sharps, flats: r.flats } : r[group]
}

// last visible value per sheet or staff, restored when a hidden item is shown again
const lastVisible = reactive({})
const visibleKey = (group) =>
  `${settingsScope.value === 'sheet' ? 'sheet' : scopeStaff.value?.id}:${group}`
const SHOW_DEFAULTS = { clef: 'treble', key: { sharps: 1, flats: 0 }, beat: '4/4' }

const isShown = (group) =>
  group === 'key' ? !!(shown.value.sharps || shown.value.flats) : !!shown.value[group]

function toggleVisible(group) {
  const id = visibleKey(group)
  if (isShown(group)) {
    lastVisible[id] =
      group === 'key'
        ? { sharps: shown.value.sharps, flats: shown.value.flats }
        : shown.value[group]
    setGroup(group, group === 'key' ? { sharps: 0, flats: 0 } : null)
  } else {
    setGroup(group, lastVisible[id] ?? SHOW_DEFAULTS[group])
  }
}

const isBass = computed({
  get: () => (shown.value.clef ?? lastVisible[visibleKey('clef')]) === 'bass',
  set: (bass) => setGroup('clef', bass ? 'bass' : 'treble'),
})

const sharps = computed({
  get: () => shown.value.sharps || null,
  set: (n) => n && setGroup('key', { sharps: n, flats: 0 }),
})

const flats = computed({
  get: () => shown.value.flats || null,
  set: (n) => n && setGroup('key', { sharps: 0, flats: n }),
})

function beatParts() {
  const beat = shown.value.beat || lastVisible[visibleKey('beat')] || '4/4'
  const [top, bottom] = String(beat).split('/').map(Number)
  return { top: top || 4, bottom: bottom || 4 }
}

const beatTop = computed({
  get: () => beatParts().top,
  set: (n) => {
    if (Number.isInteger(n) && n >= 1 && n <= 32) setGroup('beat', `${n}/${beatParts().bottom}`)
  },
})

const beatBottom = computed({
  get: () => beatParts().bottom,
  set: (n) => setGroup('beat', `${beatParts().top}/${n}`),
})

const scopeHint = computed(() =>
  settingsScope.value === 'sheet'
    ? 'Every staff uses these, unless it has its own.'
    : `Untick "Same as sheet" to give ${staffNumber(activeStaff.value).toLowerCase()} its own setting.`,
)

// short note in a staff's header, e.g. "Bass clef, 2 flats, 3/4"
function ownSummary(staff) {
  const own = staff.own || {}
  const parts = []
  if ('clef' in own)
    parts.push(own.clef ? `${own.clef === 'bass' ? 'Bass' : 'Treble'} clef` : 'No clef')
  if ('key' in own) {
    const { sharps: s, flats: f } = own.key
    parts.push(
      s ? `${s} sharp${s > 1 ? 's' : ''}` : f ? `${f} flat${f > 1 ? 's' : ''}` : 'No key signature',
    )
  }
  if ('beat' in own) parts.push(own.beat || 'No time signature')
  return parts.join(', ')
}

async function openStaffSettings(i) {
  if (selectedNote.value && selectedNote.value.staff !== i) selectedNote.value = null
  activeStaff.value = i
  settingsScope.value = 'staff'
  if (isMobile.value) openSettings()
  await nextTick()
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  settingsBlock.value?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
}

/* =====================================================
   IMPORT / EXPORT / PRINT
===================================================== */

const fileInput = ref(null)

function fileName(ext) {
  const base = (sheetName.value || 'note-sheet').trim().replace(/[^\w\-áéíóúñü ]+/gi, '')
  return `${base.replace(/\s+/g, '-').toLowerCase() || 'note-sheet'}.${ext}`
}

function sheetPayload() {
  const sheet = clone(addOperState)
  return {
    version: 3,
    name: sheetName.value || 'Untitled sheet',
    ...sheet,
    // flat copy for anything that still reads version 1 files
    notes: sheet.staves.flatMap((st) => st.notes),
  }
}

function exportJson() {
  const blob = new Blob([JSON.stringify(sheetPayload(), null, 2)], { type: 'application/json' })
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
      const raw = JSON.parse(String(reader.result))
      if (!raw || !(Array.isArray(raw.staves) || Array.isArray(raw.notes)))
        throw new Error('Not a note sheet')
      replaceSheet(raw)
      sheetName.value = raw.name || file.name.replace(/\.json$/i, '') || 'Untitled sheet'
      $q.notify({ type: 'positive', message: 'Sheet imported', position: 'top-left' })
    } catch {
      $q.notify({
        type: 'negative',
        message: 'This file is not a note sheet export. Choose a .json file saved from here.',
        position: 'top-left',
      })
    }
  }
  reader.readAsText(file)
}

function clearAll() {
  $q.dialog({
    title: 'Clear the sheet?',
    message:
      'All staves, notes and rests will be removed and the settings reset. You can undo this.',
    cancel: { flat: true, label: 'Cancel' },
    ok: { color: 'negative', label: 'Clear' },
  }).onOk(() => {
    replaceSheet({ ...defaultSheet(), staves: [newStaff()] })
    sheetName.value = 'Untitled sheet'
  })
}

const stavesBox = ref(null)

// opens a clean page with the staves as images and the browser's print dialog,
// where "Save as PDF" is also offered
async function printSheet() {
  const keep = selectedNote.value
  selectedNote.value = null
  player.stop()
  await nextTick()
  const canvases = [...(stavesBox.value?.querySelectorAll('canvas') ?? [])]
  const images = canvases.map((c) => c.toDataURL('image/png'))
  selectedNote.value = keep

  const win = window.open('', '_blank')
  if (!win) {
    $q.notify({
      type: 'negative',
      message: 'The print window was blocked. Allow pop-ups for this site and try again.',
      position: 'top-left',
    })
    return
  }
  const title = (sheetName.value || 'Untitled sheet').replace(/[<>&]/g, '')
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { margin: 24px; font-family: Georgia, 'Times New Roman', serif; color: #000; background: #fff; }
  h1 { font-size: 20px; font-weight: normal; margin: 0 0 16px; }
  img { display: block; max-width: 100%; margin: 0 0 6px; break-inside: avoid; }
  @page { margin: 14mm; }
</style></head><body><h1>${title}</h1>
${images.map((src) => `<img src="${src}" alt="">`).join('\n')}
</body></html>`)
  win.document.close()
  win.onload = () => {
    win.focus()
    win.print()
  }
}

/* =====================================================
   STAVES (add / duplicate / move / clear / delete,
   like the compases of the compás editor)
===================================================== */

const staffEls = []

const staffNumber = (i) => `Staff ${i + 1}`

async function addStaff() {
  // a new staff carries on with the clef, key and time of the one above it
  const last = addOperState.staves[addOperState.staves.length - 1]
  addOperState.staves.push(newStaff([], clone(last?.own || {})))
  activeStaff.value = addOperState.staves.length - 1
  selectedNote.value = null
  await nextTick()
  scrollToStaff(activeStaff.value)
}

function scrollToStaff(i) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  staffEls[i]?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
}

function duplicateStaff(i) {
  const copy = clone(addOperState.staves[i])
  copy.id = uid()
  addOperState.staves.splice(i + 1, 0, copy)
  activeStaff.value = i + 1
  selectedNote.value = null
}

function moveStaff(i, dir) {
  const j = i + dir
  if (j < 0 || j >= addOperState.staves.length) return
  const [staff] = addOperState.staves.splice(i, 1)
  addOperState.staves.splice(j, 0, staff)
  if (activeStaff.value === i) activeStaff.value = j
  else if (activeStaff.value === j) activeStaff.value = i
  const sel = selectedNote.value
  if (sel?.staff === i) selectedNote.value = { ...sel, staff: j }
  else if (sel?.staff === j) selectedNote.value = { ...sel, staff: i }
}

function clearStaff(i) {
  addOperState.staves[i].notes = []
  if (selectedNote.value?.staff === i) selectedNote.value = null
}

function removeStaff(i) {
  if (addOperState.staves.length === 1) return clearStaff(0)
  addOperState.staves.splice(i, 1)
  const sel = selectedNote.value
  if (sel?.staff === i) selectedNote.value = null
  else if (sel?.staff > i) selectedNote.value = { ...sel, staff: sel.staff - 1 }
  if (activeStaff.value > i || activeStaff.value >= addOperState.staves.length)
    activeStaff.value = Math.max(0, activeStaff.value - 1)
}

/* =====================================================
   NOTES & RESTS
   Every change goes through editStaff: an accidental lasts to the end of
   its measure, so adding, removing or changing one note could change how
   later notes sound. Notes that were not edited keep their pitch.
===================================================== */

const typeOptions = NOTE_TYPES.map((t) => ({ value: t.value, label: t.label.split(' (')[0] }))
const kindOptions = [
  { label: 'Note', value: 'note' },
  { label: 'Rest', value: 'rest' },
]

function editStaff(si, change) {
  const staff = addOperState.staves[si]
  if (!staff) return
  const context = staffContext(si)
  const before = resolveStaff(staff.notes, context)
  const alters = new Map(
    staff.notes.map((n, i) => [toRaw(n), before[i].pitches.map((p) => p.alter)]),
  )
  const next = staff.notes.map((n) => toRaw(n))
  change(next)
  const desired = next.map((n) => alters.get(toRaw(n)) ?? null)
  staff.notes = respell(next, context, desired)
}

const selectedItem = computed(() => {
  const sel = selectedNote.value
  if (!sel) return null
  return addOperState.staves[sel.staff]?.notes[sel.chordIndex] ?? null
})

const staffSelection = (i) => (selectedNote.value?.staff === i ? selectedNote.value : null)

// last note with a pitch before a position, looking back across staves
function pitchedBefore(staffIndex, index) {
  for (let s = staffIndex; s >= 0; s--) {
    const notes = addOperState.staves[s]?.notes || []
    const start = s === staffIndex ? index - 1 : notes.length - 1
    const found = lastPitchedIn(notes, start)
    if (found) return found
  }
  return null
}

function lastPitchedIn(notes, start) {
  for (let i = start; i >= 0; i--) {
    if (!notes[i]?.rest && notes[i]?.note?.length) return notes[i]
  }
  return null
}

const selectedPitches = computed(() => {
  const sel = selectedNote.value
  if (!sel || !selectedItem.value || selectedItem.value.rest) return []
  return pitchInfo.value[sel.staff]?.[sel.chordIndex]?.pitches ?? []
})

// GuitarGriff takes names like "C1", "F#1", "Bbm" (letter, accidental, octave)
const selectedGuitarNotes = computed(() => {
  const item = selectedItem.value
  if (!item || item.rest) return []
  return selectedPitches.value.map(
    (p) => `${p.letter}${p.alter > 0 ? '#' : p.alter < 0 ? 'b' : ''}${item.octave ?? 1}`,
  )
})

const selectedGuitarLabel = computed(() => '')

function audition(si, index) {
  const pitches = pitchInfo.value[si]?.[index]?.pitches
  if (pitches?.length) player.preview(placeOnStrings(pitches.map((p) => p.midi)))
}

const onSelectNote = (staffIndex, sel) => {
  activeStaff.value = staffIndex
  selectedNote.value = sel ? { staff: staffIndex, ...sel } : null

  // phones: the note fields live in the drawer, so open it on the Notes box
  // (tapping empty staff only picks the staff and leaves the drawer closed)
  if (sel && isMobile.value) {
    if (settingsPanel.value) settingsPanel.value.scrollTop = 0
    openSettings()
  }
}

// adds after the selected note or rest, or at the end of the active staff.
// With a letter, the note goes to the octave closest to the note before it.
function addItem(rest = false, letter = null) {
  const sel = selectedNote.value
  const si = sel ? sel.staff : Math.min(activeStaff.value, addOperState.staves.length - 1)
  const staff = addOperState.staves[si]
  if (!staff) return
  const at = sel ? sel.chordIndex + 1 : staff.notes.length
  const from = pitchedBefore(si, at)
  const type = staff.notes[at - 1]?.type ?? from?.type ?? 4
  const octave = from?.octave ?? 1

  let item
  if (rest) item = fitItem({ rest: true, type, octave })
  else if (letter) item = fitItem({ note: [letter], octave: nearestOctave(letter, from), type })
  else item = fitItem({ note: from ? from.note.map(letterOf) : ['C'], octave, type })

  editStaff(si, (notes) => notes.splice(at, 0, item))
  activeStaff.value = si
  selectedNote.value = { staff: si, chordIndex: at, letterIndex: 0 }
  if (!rest) nextTick(() => audition(si, at))
}

const addNote = () => addItem(false)
const addRest = () => addItem(true)

function deleteNote() {
  const sel = selectedNote.value
  if (!sel || !selectedItem.value) return
  editStaff(sel.staff, (notes) => notes.splice(sel.chordIndex, 1))
  const left = addOperState.staves[sel.staff].notes.length
  // keep a selection so Delete can be pressed again, like a backspace
  selectedNote.value = left
    ? { ...sel, chordIndex: Math.max(0, sel.chordIndex - 1), letterIndex: 0 }
    : null
}

function replaceSelected(item, sound = false) {
  const sel = selectedNote.value
  if (!sel || !selectedItem.value) return
  editStaff(sel.staff, (notes) => notes.splice(sel.chordIndex, 1, item))
  if (sound && !item.rest) nextTick(() => audition(sel.staff, sel.chordIndex))
}

function updateSelected(patch) {
  const item = selectedItem.value
  if (!item) return
  const sound = 'note' in patch || 'octave' in patch || 'rest' in patch
  replaceSelected(fitItem({ ...toRaw(item), ...patch }), sound)
}

// switch the selected item between a note and a rest of the same length
const kind = computed({
  get: () => (selectedItem.value?.rest ? 'rest' : 'note'),
  set: (value) => {
    const item = selectedItem.value
    if (!item || (value === 'rest') === !!item.rest) return
    if (value === 'rest') return updateSelected({ rest: true, tie: false })
    const from = pitchedBefore(selectedNote.value.staff, selectedNote.value.chordIndex)
    updateSelected({
      rest: false,
      note: from ? from.note.map(letterOf) : ['C'],
      octave: from?.octave ?? 1,
    })
  },
})

// letters only; each letter keeps its accidental while it stays in the chord
const pitch = computed({
  get: () => (selectedItem.value?.rest ? [] : (selectedItem.value?.note ?? []).map(letterOf)),
  set: (letters) => {
    const current = selectedItem.value?.note ?? []
    if (!letters?.length) return
    updateSelected({ note: letters.map((l) => current.find((s) => letterOf(s) === l) ?? l) })
  },
})

const octave = computed({
  get: () => selectedItem.value?.octave ?? 1,
  set: (value) => updateSelected({ octave: value }),
})

const duration = computed({
  get: () => selectedItem.value?.type ?? 4,
  set: (value) => updateSelected({ type: value }),
})

const dotted = computed({
  get: () => !!selectedItem.value?.dot,
  set: (value) => updateSelected({ dot: value }),
})

const tied = computed({
  get: () => !!selectedItem.value?.tie,
  set: (value) => updateSelected({ tie: value }),
})

// one accidental switch per letter of the selected note or chord
const letterRows = computed(() => {
  const item = selectedItem.value
  if (!item || item.rest) return []
  return item.note.map((s, j) => ({ j, letter: letterOf(s), acc: accOf(s) }))
})

function setAccidental(j, acc) {
  const item = selectedItem.value
  if (!item || item.rest || !item.note[j]) return
  updateSelected({ note: item.note.map((s, k) => (k === j ? withAcc(letterOf(s), acc) : s)) })
}

function stepSelected(delta) {
  const moved = stepItem(toRaw(selectedItem.value), delta)
  if (moved) replaceSelected(moved, true)
}

// only letters the chosen octave can show, and only octaves that fit every letter
const pitchOptions = computed(() => {
  const allowed = lettersFor(octave.value)
  return LETTERS.map((l) => ({ label: l, value: l, disable: !allowed.includes(l) }))
})

const octaveOptions = computed(() =>
  OCTAVES.map((o) => ({
    label: o.label,
    value: o.value,
    disable: !pitch.value.every((l) => o.letters.includes(l)),
  })),
)

const addTarget = computed(() => {
  const sel = selectedNote.value
  if (sel)
    return `New notes and rests go after the selected one on ${staffNumber(sel.staff).toLowerCase()}.`
  return `New notes and rests go at the end of ${staffNumber(activeStaff.value).toLowerCase()}.`
})

/* ---------- copy & paste (also between the note sheet and the compás editor) ---------- */

function copyStaffNotes(i) {
  const staff = addOperState.staves[i]
  if (!staff?.notes.length) return
  copyNotes(
    toAbsolute(
      staff.notes.map((n) => toRaw(n)),
      staffContext(i),
    ),
  )
  $q.notify({
    type: 'positive',
    message: `Copied ${staffNumber(i).toLowerCase()}. Paste it here or into a compás.`,
    position: 'top-left',
  })
}

function copySelected() {
  const sel = selectedNote.value
  if (!sel || !selectedItem.value) return copyStaffNotes(activeStaff.value)
  const notes = addOperState.staves[sel.staff].notes.map((n) => toRaw(n))
  copyNotes([toAbsolute(notes, staffContext(sel.staff))[sel.chordIndex]])
  $q.notify({ type: 'positive', message: 'Copied the selected note.', position: 'top-left' })
}

// copied notes keep their sound: accidentals are added for this staff's key
function pasteNotes() {
  const items = copiedNotes.value
  if (!items?.length) return
  const sel = selectedNote.value
  const si = sel ? sel.staff : Math.min(activeStaff.value, addOperState.staves.length - 1)
  const staff = addOperState.staves[si]
  if (!staff) return
  const at = sel ? sel.chordIndex + 1 : staff.notes.length
  const context = staffContext(si)
  const before = resolveStaff(staff.notes, context)
  const pasted = items.map(fitItem)
  const raw = staff.notes.map((n) => toRaw(n))
  staff.notes = respell([...raw.slice(0, at), ...pasted, ...raw.slice(at)], context, [
    ...raw.slice(0, at).map(() => null),
    ...pasted.map(absoluteAlters),
    ...before.slice(at).map((r) => r.pitches.map((p) => p.alter)),
  ])
  activeStaff.value = si
  selectedNote.value = { staff: si, chordIndex: at + pasted.length - 1, letterIndex: 0 }
}

/* =====================================================
   PLAYBACK
===================================================== */

const player = useStaffPlayer()
const isPlaying = player.isPlaying
const loop = ref(false)
const metronome = ref(false)

const timeline = () =>
  buildTimeline(
    addOperState.staves.map((staff, i) => ({
      items: staff.notes.map((n) => toRaw(n)),
      context: staffContext(i),
    })),
  )

function startPlayback(from) {
  player.play(timeline(), {
    tempo: addOperState.tempo,
    loop: loop.value,
    click: metronome.value,
    from,
  })
}

// from the selected note, or from the start
function togglePlay() {
  if (isPlaying.value) return player.stop()
  const sel = selectedNote.value
  startPlayback(sel ? { staff: sel.staff, index: sel.chordIndex } : null)
}

const playingIndex = (i) => (player.current.value?.staff === i ? player.current.value.index : null)

// keep the staff being played in view
watch(
  () => player.current.value?.staff,
  (staff) => {
    if (staff !== undefined && staff !== null) scrollToStaff(staff)
  },
)

// tempo, loop or click changed while playing: carry on from the current note
let restartTimer = null
watch([() => addOperState.tempo, loop, metronome], () => {
  if (!isPlaying.value) return
  clearTimeout(restartTimer)
  restartTimer = setTimeout(() => {
    if (isPlaying.value) startPlayback(player.current.value)
  }, 250)
})

/* =====================================================
   UNDO / REDO
===================================================== */

const history = reactive({ stack: [], index: -1 })
let applyingHistory = false
let historyTimer = null

// tempo is a playback setting, not an edit
const snapshot = () => JSON.stringify({ name: sheetName.value, ...addOperState, tempo: undefined })

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
  const snap = JSON.parse(history.stack[index])
  const tempo = addOperState.tempo
  const sel = selectedNote.value
  const active = activeStaff.value
  replaceSheet({ ...snap, tempo })
  sheetName.value = snap.name || 'Untitled sheet'
  history.index = index
  // keep the selection when it still points at something
  activeStaff.value = Math.min(active, addOperState.staves.length - 1)
  if (sel && addOperState.staves[sel.staff]?.notes[sel.chordIndex]) selectedNote.value = sel
  nextTick(() => (applyingHistory = false))
}

const canUndo = computed(() => history.index > 0)
const canRedo = computed(() => history.index < history.stack.length - 1)
const undo = () => canUndo.value && restore(history.index - 1)
const redo = () => canRedo.value && restore(history.index + 1)

/* =====================================================
   AUTOSAVE & V-MODEL
===================================================== */

let saveTimer = null
let lastEmitted = ''

watch(
  [addOperState, sheetName],
  () => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      const payload = sheetPayload()
      const json = JSON.stringify(payload)
      if (props.storageKey) {
        try {
          localStorage.setItem(props.storageKey, json)
        } catch {
          /* storage full or blocked: the sheet still lives in memory */
        }
      }
      lastEmitted = json
      emit('update:modelValue', payload)
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
    sheetName.value = value.name || sheetName.value
  },
  { deep: true },
)

/* =====================================================
   KEYBOARD
===================================================== */

const showShortcuts = ref(false)
const SHORTCUTS = [
  ['Space', 'Play or stop, from the selected note'],
  ['A to G', 'Add a note after the selected one'],
  ['R', 'Add a rest'],
  ['← →', 'Previous or next note'],
  ['↑ ↓', 'Move the note a step, with Shift an octave'],
  ['1 to 7', 'Length, from whole to sixty-fourth'],
  ['.', 'Dotted note or rest'],
  ['T', 'Tie to the next note'],
  ['# or +', 'Sharp'],
  ['-', 'Flat'],
  ['=', 'Natural'],
  ['Delete', 'Delete the selected note or rest'],
  ['Ctrl C / Ctrl V', 'Copy the note (or the staff) / paste after it'],
  ['Ctrl Z / Ctrl Shift Z', 'Undo or redo'],
  ['Esc', 'Deselect'],
]

const DURATION_KEYS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32, 7: 64 }
const ACCIDENTAL_KEYS = { '#': '#', '+': '#', '-': 'b', '=': 'n' }

function isTyping(e) {
  return !!e.target?.closest?.(
    'input, textarea, select, [contenteditable="true"], [role="slider"], [role="combobox"], .q-field',
  )
}

// previous or next note or rest, across staves
function moveSelection(delta) {
  const sel = selectedNote.value
  const staves = addOperState.staves
  if (!sel) {
    const si = Math.min(activeStaff.value, staves.length - 1)
    if (staves[si]?.notes.length)
      selectedNote.value = {
        staff: si,
        chordIndex: delta > 0 ? 0 : staves[si].notes.length - 1,
        letterIndex: 0,
      }
    return
  }
  let s = sel.staff
  let i = sel.chordIndex + delta
  while (s >= 0 && s < staves.length && (i < 0 || i >= staves[s].notes.length)) {
    s += delta
    if (s < 0 || s >= staves.length) return
    i = delta > 0 ? 0 : staves[s].notes.length - 1
  }
  if (s < 0 || s >= staves.length) return
  activeStaff.value = s
  selectedNote.value = { staff: s, chordIndex: i, letterIndex: 0 }
}

function onKeydown(e) {
  if (isTyping(e)) {
    if (e.key === 'Escape') e.target.blur()
    return
  }
  if (document.querySelector('.q-dialog, .q-menu')) return
  const mod = e.ctrlKey || e.metaKey
  const key = e.key

  if (mod) {
    const k = key.toLowerCase()
    if (k === 'z') {
      e.preventDefault()
      return e.shiftKey ? redo() : undo()
    }
    if (k === 'y') {
      e.preventDefault()
      return redo()
    }
    if (k === 'c' && !window.getSelection()?.toString()) {
      e.preventDefault()
      return copySelected()
    }
    if (k === 'v' && copiedNotes.value) {
      e.preventDefault()
      return pasteNotes()
    }
    return
  }
  if (e.altKey) return

  const item = selectedItem.value
  const handled = () => {
    e.preventDefault()
    return true
  }

  if (key === ' ') return handled() && togglePlay()
  if (key === 'Escape') return (selectedNote.value = null)
  if (key === 'ArrowLeft' || key === 'ArrowRight')
    return handled() && moveSelection(key === 'ArrowRight' ? 1 : -1)
  if (/^[a-gA-G]$/.test(key)) return handled() && addItem(false, key.toUpperCase())
  if (key === 'r' || key === 'R') return handled() && addItem(true)
  if (!item) return

  if (key === 'Delete' || key === 'Backspace') return handled() && deleteNote()
  if (key === 'ArrowUp' || key === 'ArrowDown')
    return handled() && stepSelected((key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 7 : 1))
  if (DURATION_KEYS[key]) return handled() && updateSelected({ type: DURATION_KEYS[key] })
  if (key === '.') return handled() && updateSelected({ dot: !item.dot })
  if (item.rest) return
  if (key === 't' || key === 'T') return handled() && updateSelected({ tie: !item.tie })
  if (ACCIDENTAL_KEYS[key]) {
    const j = Math.min(selectedNote.value.letterIndex ?? 0, item.note.length - 1)
    const want = ACCIDENTAL_KEYS[key]
    return handled() && setAccidental(j, accOf(item.note[j]) === want ? '' : want)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  pushHistory()
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onDrawerKeydown)
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(saveTimer)
  clearTimeout(historyTimer)
  clearTimeout(restartTimer)
})

// helpers
function allowOnlyDigits(e) {
  if (!/[0-9]/.test(e.key)) e.preventDefault()
}
</script>

<template>
  <div class="ns-page" :class="$q.dark.isActive ? 'ns-dark' : 'ns-light'">
    <!-- ===== Workspace: fretboard + staff ===== -->
    <main class="ns-workspace">
      <!-- phones: sheet name and the button that opens the settings drawer -->
      <div v-if="isMobile" class="ns-mobile-bar">
        <span class="ns-mobile-title">{{ sheetName || 'Untitled sheet' }}</span>
        <q-btn
          ref="settingsButton"
          class="ns-settings-btn"
          color="primary"
          unelevated
          no-caps
          icon="settings"
          :aria-expanded="settingsOpen"
          aria-controls="ns-settings"
          @click="openSettings"
        >
          <q-badge v-if="selectedItem" floating rounded color="positive" aria-hidden="true" />
        </q-btn>
      </div>

      <section class="ns-block">
        <header class="ns-block-head">
          <h2 class="ns-block-title">Fretboard</h2>
          <q-btn
            flat
            dense
            no-caps
            class="ns-quiet"
            :icon="showNeck ? 'expand_less' : 'expand_more'"
            :label="showNeck ? 'Hide' : 'Show'"
            :aria-expanded="showNeck"
            @click="showNeck = !showNeck"
          />
        </header>
        <div v-show="showNeck" class="ns-neck">
          <guitar-griff :scale="selectedGuitarNotes" :label="selectedGuitarLabel" :clear="false" />
        </div>
      </section>

      <section class="ns-block">
        <header class="ns-block-head">
          <h2 class="ns-block-title">Staves</h2>
          <span class="ns-hint">Tap a staff to write on it, or a note to change it</span>
        </header>

        <!-- playback and view -->
        <div class="ns-transport">
          <q-btn
            round
            unelevated
            color="primary"
            :icon="isPlaying ? 'stop' : 'play_arrow'"
            :aria-label="isPlaying ? 'Stop' : 'Play'"
            @click="togglePlay"
          >
            <q-tooltip
              >{{ selectedItem ? 'Play from the selected note' : 'Play' }} (Space)</q-tooltip
            >
          </q-btn>
          <div class="ns-tempo">
            <span class="ns-tempo-value">{{ addOperState.tempo }}</span>
            <span class="ns-tempo-unit">BPM</span>
          </div>
          <q-slider
            v-model="addOperState.tempo"
            :min="30"
            :max="240"
            :step="1"
            dense
            color="primary"
            class="ns-tempo-slider"
            aria-label="Tempo"
          />
          <q-btn
            flat
            dense
            round
            icon="repeat"
            class="ns-toggle"
            :class="{ 'is-on': loop }"
            :aria-pressed="loop"
            aria-label="Loop"
            @click="loop = !loop"
          >
            <q-tooltip>Loop</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="av_timer"
            class="ns-toggle"
            :class="{ 'is-on': metronome }"
            :aria-pressed="metronome"
            aria-label="Click on every beat"
            @click="metronome = !metronome"
          >
            <q-tooltip>Click on every beat</q-tooltip>
          </q-btn>

          <span class="ns-transport-gap" />

          <q-btn
            flat
            dense
            no-caps
            label="Tab"
            class="ns-toggle ns-tab-toggle"
            :class="{ 'is-on': addOperState.showTab }"
            :aria-pressed="addOperState.showTab"
            @click="addOperState.showTab = !addOperState.showTab"
          >
            <q-tooltip>Guitar tab under each staff</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="undo"
            class="ns-quiet"
            :disable="!canUndo"
            aria-label="Undo"
            @click="undo"
          >
            <q-tooltip>Undo (Ctrl Z)</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="redo"
            class="ns-quiet"
            :disable="!canRedo"
            aria-label="Redo"
            @click="redo"
          >
            <q-tooltip>Redo (Ctrl Shift Z)</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="print"
            class="ns-quiet"
            aria-label="Print"
            @click="printSheet"
          >
            <q-tooltip>Print or save as PDF</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="keyboard"
            class="ns-quiet"
            aria-label="Keyboard shortcuts"
            @click="showShortcuts = true"
          >
            <q-tooltip>Keyboard shortcuts</q-tooltip>
          </q-btn>
        </div>

        <div ref="stavesBox" class="ns-staves">
          <div
            v-for="(staff, i) in addOperState.staves"
            :key="staff.id"
            :ref="(el) => (staffEls[i] = el)"
            class="ns-staff"
            :class="{ 'is-active': activeStaff === i }"
          >
            <div class="ns-staff-head">
              <span class="ns-staff-num">{{ i + 1 }}</span>
              <q-btn
                v-if="ownSummary(staff)"
                flat
                dense
                no-caps
                size="sm"
                class="ns-own"
                :label="ownSummary(staff)"
                :aria-label="`${staffNumber(i)} has its own settings: ${ownSummary(staff)}. Edit`"
                @click="openStaffSettings(i)"
              />
              <span v-if="!staff.notes.length" class="ns-staff-empty">Empty</span>
              <q-space />
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="more_horiz"
                class="ns-quiet"
                :aria-label="`${staffNumber(i)} options`"
              >
                <q-menu anchor="bottom right" self="top right">
                  <q-list dense style="min-width: 170px">
                    <q-item v-close-popup clickable @click="openStaffSettings(i)">
                      <q-item-section>Clef, key and time</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                      v-close-popup
                      clickable
                      :disable="!staff.notes.length"
                      @click="copyStaffNotes(i)"
                    >
                      <q-item-section>Copy notes</q-item-section>
                    </q-item>
                    <q-item v-close-popup clickable @click="duplicateStaff(i)">
                      <q-item-section>Duplicate</q-item-section>
                    </q-item>
                    <q-item v-close-popup clickable :disable="i === 0" @click="moveStaff(i, -1)">
                      <q-item-section>Move up</q-item-section>
                    </q-item>
                    <q-item
                      v-close-popup
                      clickable
                      :disable="i === addOperState.staves.length - 1"
                      @click="moveStaff(i, 1)"
                    >
                      <q-item-section>Move down</q-item-section>
                    </q-item>
                    <q-item v-close-popup clickable @click="clearStaff(i)">
                      <q-item-section>Clear</q-item-section>
                    </q-item>
                    <q-item v-close-popup clickable class="text-negative" @click="removeStaff(i)">
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <!-- the staff canvas is never scaled with CSS: its hit-testing uses raw
               pixel offsets, so on narrow screens it scrolls sideways instead -->
            <div class="ns-staff-scroll">
              <SingleFiveLines
                :width="addOperState.width"
                :clef="staffConfigs[i].clef"
                :beat="staffConfigs[i].beat"
                :sharps="staffConfigs[i].sharps"
                :flats="staffConfigs[i].flats"
                :show-tab="addOperState.showTab"
                :playing="playingIndex(i)"
                :notes="staff.notes"
                :min-lines="1"
                :show-time-signature="showTime[i]"
                :measure-start="measureStarts[i]"
                :selected="staffSelection(i)"
                @select="(sel) => onSelectNote(i, sel)"
              />
            </div>
          </div>
        </div>

        <q-btn
          flat
          no-caps
          icon="add"
          label="Add staff"
          class="full-width ns-add"
          @click="addStaff"
        />
      </section>
    </main>

    <!-- ===== Settings: inline panel, or right drawer on phones ===== -->
    <div
      v-if="isMobile"
      class="ns-backdrop"
      :class="{ 'is-open': settingsOpen }"
      aria-hidden="true"
      @click="closeSettings"
    />

    <aside
      id="ns-settings"
      ref="settingsPanel"
      v-touch-swipe.right="closeSettings"
      class="ns-panel"
      :class="{ 'is-drawer': isMobile, 'is-open': settingsOpen }"
      :role="isMobile ? 'dialog' : null"
      :aria-modal="isMobile ? 'true' : null"
      aria-label="Sheet settings"
      :tabindex="isMobile ? -1 : null"
    >
      <header v-if="isMobile" class="ns-drawer-head">
        <h2 class="ns-block-title">Settings</h2>
        <q-btn
          flat
          round
          dense
          class="ns-quiet"
          icon="close"
          aria-label="Close settings"
          @click="closeSettings"
        />
      </header>

      <!-- Sheet -->
      <fieldset class="settings-fieldset">
        <legend>Sheet</legend>
        <div class="ns-sheet-row">
          <q-input
            v-model="sheetName"
            class="ns-sheet-name"
            label="Name"
            filled
            dense
            color="primary"
          >
            <template #append>
              <q-btn
                color="negative"
                flat
                dense
                round
                icon="delete_sweep"
                aria-label="Clear the sheet"
                @click="clearAll"
              >
                <q-tooltip>Clear the sheet</q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <q-btn
            class="ns-action"
            color="primary"
            outline
            no-caps
            icon="upload"
            label="Import"
            @click="fileInput?.click()"
          />
          <q-btn
            class="ns-action"
            color="positive"
            unelevated
            no-caps
            icon="download"
            label="Export"
            @click="exportJson"
          />
          <input
            ref="fileInput"
            type="file"
            accept="application/json,.json"
            hidden
            @change="importJson"
          />
        </div>
      </fieldset>

      <!-- Notes -->
      <fieldset class="settings-fieldset">
        <legend>Notes</legend>
        <div class="ns-note-actions">
          <q-btn color="primary" outline no-caps icon="add" label="Add note" @click="addNote" />
          <q-btn color="primary" outline no-caps icon="add" label="Add rest" @click="addRest" />
          <q-btn
            v-if="copiedNotes"
            color="primary"
            outline
            no-caps
            icon="content_paste"
            label="Paste"
            @click="pasteNotes"
          >
            <q-tooltip>Paste copied notes (Ctrl V)</q-tooltip>
          </q-btn>
          <q-btn
            v-if="selectedItem"
            class="ns-delete"
            color="negative"
            outline
            no-caps
            icon="delete"
            label="Delete"
            @click="deleteNote"
          />
        </div>
        <p class="ns-target">{{ addTarget }}</p>

        <p v-if="!selectedItem" class="ns-empty">
          Select a note or rest on a staff to change it, or type A to G to write notes.
        </p>
        <div v-else class="ns-note-fields" :class="{ 'is-rest': kind === 'rest' }">
          <q-btn-toggle
            v-model="kind"
            :options="kindOptions"
            class="ns-kind"
            spread
            no-caps
            unelevated
            toggle-color="primary"
          />
          <q-select
            v-if="kind === 'note'"
            v-model="pitch"
            class="ns-pitch"
            label="Pitch"
            :options="pitchOptions"
            emit-value
            map-options
            multiple
            use-chips
            filled
            dense
            options-dense
            color="primary"
          />
          <q-select
            v-if="kind === 'note'"
            v-model="octave"
            label="Octave"
            :options="octaveOptions"
            emit-value
            map-options
            filled
            dense
            options-dense
            color="primary"
          />
          <q-select
            v-model="duration"
            label="Duration"
            :options="typeOptions"
            emit-value
            map-options
            filled
            dense
            options-dense
            color="primary"
          />
          <div class="ns-flags">
            <q-checkbox v-model="dotted" label="Dotted" dense color="primary" />
            <q-checkbox
              v-if="kind === 'note'"
              v-model="tied"
              label="Tie to next"
              dense
              color="primary"
            />
          </div>
          <div v-if="kind === 'note'" class="ns-acc-rows">
            <div v-for="row in letterRows" :key="row.j" class="ns-acc-row">
              <span class="ns-acc-letter">{{ row.letter }}</span>
              <q-btn-toggle
                :model-value="row.acc"
                :options="ACCIDENTALS"
                class="ns-kind"
                dense
                no-caps
                unelevated
                toggle-color="primary"
                :aria-label="`Accidental for ${row.letter}`"
                @update:model-value="(v) => setAccidental(row.j, v)"
              />
            </div>
          </div>
        </div>
      </fieldset>

      <!-- Clef, key and time: whole sheet, or one staff on its own -->
      <div ref="settingsBlock" class="ns-scope">
        <q-btn-toggle
          v-model="settingsScope"
          :options="scopeOptions"
          class="ns-kind"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          aria-label="Set clef, key and time for"
        />
        <p class="ns-target">{{ scopeHint }}</p>
      </div>

      <div class="ns-staff-settings">
        <fieldset
          class="settings-fieldset"
          :class="{ 'is-off': !isShown('clef'), 'is-inherited': follows('clef') }"
        >
          <legend>Clef</legend>
          <q-btn
            v-if="!follows('clef')"
            class="ns-fieldset-toggle"
            round
            unelevated
            size="xs"
            padding="none"
            color="primary"
            :icon="isShown('clef') ? 'clear' : 'add'"
            :aria-label="isShown('clef') ? 'Hide clef' : 'Show clef'"
            @click="toggleVisible('clef')"
          />
          <q-checkbox
            v-if="settingsScope === 'staff'"
            :model-value="follows('clef')"
            label="Same as sheet"
            dense
            size="sm"
            color="primary"
            class="ns-follow"
            @update:model-value="(v) => setFollows('clef', v)"
          />
          <div class="ns-off-content ns-clef">
            <span>Treble</span>
            <q-toggle
              v-model="isBass"
              color="primary"
              keep-color
              :disable="!isShown('clef') || follows('clef')"
              aria-label="Bass clef"
            />
            <span>Bass</span>
          </div>
        </fieldset>

        <fieldset
          class="settings-fieldset"
          :class="{ 'is-off': !isShown('key'), 'is-inherited': follows('key') }"
        >
          <legend>Key signature</legend>
          <q-btn
            v-if="!follows('key')"
            class="ns-fieldset-toggle"
            round
            unelevated
            size="xs"
            padding="none"
            color="primary"
            :icon="isShown('key') ? 'clear' : 'add'"
            :aria-label="isShown('key') ? 'Remove key signature' : 'Restore key signature'"
            @click="toggleVisible('key')"
          />
          <q-checkbox
            v-if="settingsScope === 'staff'"
            :model-value="follows('key')"
            label="Same as sheet"
            dense
            size="sm"
            color="primary"
            class="ns-follow"
            @update:model-value="(v) => setFollows('key', v)"
          />
          <div class="ns-off-content ns-pair q-mt-md">
            <q-select
              v-model="sharps"
              label="Sharps"
              :options="[1, 2, 3, 4, 5, 6]"
              filled
              dense
              options-dense
              color="primary"
            />
            <q-select
              v-model="flats"
              label="Flats"
              :options="[1, 2, 3, 4, 5, 6]"
              filled
              dense
              options-dense
              color="primary"
            />
          </div>
        </fieldset>

        <fieldset
          class="settings-fieldset"
          :class="{ 'is-off': !isShown('beat'), 'is-inherited': follows('beat') }"
        >
          <legend>Time signature</legend>
          <q-btn
            v-if="!follows('beat')"
            class="ns-fieldset-toggle"
            round
            unelevated
            size="xs"
            padding="none"
            color="primary"
            :icon="isShown('beat') ? 'clear' : 'add'"
            :aria-label="isShown('beat') ? 'Hide time signature' : 'Show time signature'"
            @click="toggleVisible('beat')"
          />
          <q-checkbox
            v-if="settingsScope === 'staff'"
            :model-value="follows('beat')"
            label="Same as sheet"
            dense
            size="sm"
            color="primary"
            class="ns-follow"
            @update:model-value="(v) => setFollows('beat', v)"
          />
          <div class="ns-off-content ns-pair q-mt-md">
            <q-input
              v-model.number="beatTop"
              label="Beats"
              type="number"
              inputmode="numeric"
              min="1"
              max="32"
              filled
              dense
              color="primary"
              @keypress="allowOnlyDigits"
            />
            <q-select
              v-model="beatBottom"
              label="Note value"
              :options="[2, 4, 8, 16, 32, 64]"
              filled
              dense
              options-dense
              color="primary"
            />
          </div>
        </fieldset>
      </div>
    </aside>

    <q-dialog v-model="showShortcuts">
      <q-card class="ns-shortcuts">
        <q-card-section class="text-subtitle1">Keyboard shortcuts</q-card-section>
        <q-card-section class="q-pt-none">
          <div v-for="[keys, what] in SHORTCUTS" :key="keys" class="ns-shortcut">
            <kbd>{{ keys }}</kbd>
            <span>{{ what }}</span>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Close" color="primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
/* =====================================================
   THEME
   Colours come from the app-wide --app-* variables
   (body.body--light / body.body--dark). The few values
   that have no app variable are set per theme here.
   --q-primary / --q-positive are re-pointed for this page
   only, so every color="primary" control picks up the
   theme accent without per-component bindings.
===================================================== */

.ns-light {
  --ns-accent: #126d79; /* = --app-header-start, 5.4:1 on surface-soft */
  --ns-positive: #17794a;
  --ns-shadow: rgba(23, 52, 77, 0.18);
  --ns-shadow-strong: rgba(23, 52, 77, 0.28);
  --ns-backdrop: rgba(23, 52, 77, 0.35);
}

.ns-dark {
  --ns-accent: #42a5f5;
  --ns-positive: #2b9a5c;
  --ns-shadow: rgba(0, 0, 0, 0.35);
  --ns-shadow-strong: rgba(0, 0, 0, 0.5);
  --ns-backdrop: rgba(4, 12, 26, 0.6);
}

.ns-page {
  --q-primary: var(--ns-accent);
  --q-positive: var(--ns-positive);
  color: var(--app-text);
}

.ns-quiet {
  color: var(--app-muted);
}

/* form fields sit on the fieldset tint, so give them the plain surface */
.ns-page :deep(.q-field--filled .q-field__control) {
  background: var(--app-surface);
  color: var(--app-text);
}

.ns-page :deep(.q-field--filled .q-field__control::after) {
  background: var(--ns-accent);
}

.ns-page :deep(.q-field__label),
.ns-page :deep(.q-field__marginal) {
  color: var(--app-muted);
}

.ns-page :deep(.q-field--highlighted .q-field__label) {
  color: var(--ns-accent);
}

.ns-page :deep(.q-field__native),
.ns-page :deep(.q-field__input) {
  color: var(--app-text);
}

.ns-page :deep(.q-field .q-chip) {
  background: var(--app-surface-raised);
  color: var(--app-text);
}

/* =====================================================
   PAGE LAYOUT
   < 600px    one column, tight padding, full-width buttons
   600-1199   one column, settings below the score
   >= 1200    score left, settings panel right (sticky)
===================================================== */

.ns-page {
  --ns-header: 60px; /* app header height */
  --ns-gap: 16px;
  --ns-pad: 16px;
  --ns-radius: 8px;

  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--ns-gap);
  padding: var(--ns-pad);
  padding-bottom: calc(var(--ns-pad) + env(safe-area-inset-bottom, 0px));
  min-height: calc(100dvh - var(--ns-header));
  align-items: start;
}

.ns-workspace,
.ns-panel {
  width: 100%;
  max-width: 820px;
  margin-inline: auto;
  min-width: 0;
}

@media (min-width: 1200px) {
  .ns-page {
    grid-template-columns: minmax(0, 820px) minmax(340px, 440px);
    justify-content: center;
    gap: 24px;
    padding: 20px 24px;
  }

  .ns-workspace,
  .ns-panel {
    margin-inline: 0;
  }

  /* settings stay in view while the score scrolls */
  .ns-panel {
    position: sticky;
    top: 20px;
    max-height: calc(100dvh - var(--ns-header) - 40px);
    overflow-y: auto;
    overscroll-behavior: contain;
  }
}

@media (max-width: 599px) {
  .ns-page {
    --ns-gap: 12px;
    --ns-pad: 8px;
  }
}

/* =====================================================
   WORKSPACE
===================================================== */

.ns-workspace {
  display: flex;
  flex-direction: column;
  gap: var(--ns-gap);
}

.ns-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 36px;
  margin-bottom: 6px;
}

.ns-block-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--app-text);
}

.ns-hint {
  font-size: 0.8rem;
  color: var(--app-muted);
}

.ns-neck {
  min-width: 0;
}

/* GuitarGriff uses 100vw on phones, which ignores the page padding */
.ns-neck :deep(.griff-wrapper) {
  max-width: 100%;
}

.ns-neck :deep(.griff-canvas) {
  border-color: var(--app-border);
  border-radius: 4px;
}

/* ----- playback and view bar ----- */

.ns-transport {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
  margin-bottom: 10px;
}

.ns-tempo {
  min-width: 64px;
  font-variant-numeric: tabular-nums;
}

.ns-tempo-value {
  font-size: 1.05rem;
  font-weight: 600;
}

.ns-tempo-unit {
  margin-left: 3px;
  font-size: 0.75rem;
  color: var(--app-muted);
}

.ns-tempo-slider {
  flex: 1 1 120px;
  min-width: 100px;
  max-width: 260px;
}

.ns-transport-gap {
  flex: 1 1 0;
}

/* toggles read as on by colour and a filled background, not colour alone */
.ns-toggle {
  color: var(--app-muted);
}

.ns-toggle.is-on {
  color: var(--ns-accent);
  background: color-mix(in srgb, var(--ns-accent) 14%, transparent);
}

.ns-tab-toggle {
  padding: 0 10px;
  font-weight: 600;
}

/* ----- staves, laid out like the compases of the compás editor ----- */

.ns-staff {
  margin: 0 0 12px -8px;
  padding-left: 6px;
  border-left: 2px solid transparent;
}

/* the staff new notes and rests are added to */
.ns-staff.is-active {
  border-left-color: var(--ns-accent);
}

.ns-staff-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
}

.ns-staff-num {
  min-width: 14px;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: var(--app-muted);
}

.ns-staff.is-active .ns-staff-num {
  color: var(--ns-accent);
  font-weight: 700;
}

.ns-staff-empty {
  font-size: 0.8rem;
  color: var(--app-muted);
}

.ns-add {
  border: 1px dashed var(--app-border);
  color: var(--app-muted);
}

.ns-staff-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  border-radius: var(--ns-radius);
  scrollbar-width: thin;
}

/* the canvas sits flush; display:block removes the inline-gap under it */
.ns-staff-scroll :deep(canvas) {
  display: block;
  border: 1px solid var(--app-border);
  border-radius: var(--ns-radius);
}

/* =====================================================
   SETTINGS PANEL
===================================================== */

.ns-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  background: var(--app-surface);
  box-shadow: 0 1px 3px var(--ns-shadow);
  border: 1px solid var(--app-border);
  border-radius: var(--ns-radius);
}

.settings-fieldset {
  position: relative;
  margin: 0;
  min-width: 0; /* fieldsets default to min-content and overflow grids */
  border: 1px solid var(--app-border);
  border-radius: 6px;
  padding: 12px 10px 10px;
  background: var(--app-surface-soft);
  color: var(--app-text);
}

.settings-fieldset legend {
  padding: 0 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ns-accent);
}

/* add/remove button sits on the top border, opposite the legend */
.ns-fieldset-toggle {
  position: absolute;
  top: -3px;
  right: 7px;
  width: 20px;
  height: 20px;
  min-width: 0;
  min-height: 0;
}

.ns-fieldset-toggle :deep(.q-icon) {
  font-size: 14px;
}

/* invisible 32px hit area, so the small button is still easy to tap */
.ns-fieldset-toggle::after {
  content: '';
  position: absolute;
  inset: -6px;
}

/* a staff element that is switched off */
.settings-fieldset.is-off legend {
  color: var(--app-muted);
}

.is-off .ns-off-content,
.is-inherited .ns-off-content {
  opacity: 0.4;
  pointer-events: none;
}

/* ----- clef, key and time scope ----- */

.ns-scope .ns-target {
  margin-top: 6px;
}

.ns-follow {
  margin: -2px 0 6px;
  font-size: 0.8rem;
  color: var(--app-text);
}

/* a staff's own clef / key / time, shown in its header */
.ns-own {
  min-height: 0;
  padding: 0 6px;
  font-size: 0.75rem;
  color: var(--ns-accent);
  border: 1px solid var(--app-border);
  border-radius: 4px;
}

/* ----- Sheet ----- */

.ns-sheet-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
}

.ns-action {
  min-height: 40px;
}

/* ----- Notes ----- */

.ns-note-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ns-delete {
  margin-left: auto;
}

.ns-target {
  margin: 8px 0 0;
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--app-muted);
}

.ns-empty {
  margin: 10px 0 0;
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--app-muted);
}

.ns-note-fields {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 8px;
  margin-top: 10px;
}

/* note / rest switch on its own row; a rest only has a duration */
.ns-kind,
.ns-note-fields.is-rest > * {
  grid-column: 1 / -1;
}

.ns-kind {
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text);
}

.ns-flags,
.ns-acc-rows {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  font-size: 0.85rem;
}

.ns-acc-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ns-acc-letter {
  min-width: 12px;
  font-weight: 600;
}

/* ----- shortcuts ----- */

.ns-shortcuts {
  min-width: min(380px, 92vw);
  background: var(--app-surface);
  color: var(--app-text);
}

.ns-shortcut {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 12px;
  padding: 3px 0;
  font-size: 0.875rem;
}

.ns-shortcut kbd {
  font: inherit;
  font-weight: 600;
  color: var(--ns-accent);
}

/* ----- Clef, key and time signature ----- */

.ns-staff-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px 10px; /* row gap leaves room for the toggle on the border */
  padding-top: 4px;
}

.ns-clef {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 40px;
  font-size: 0.85rem;
  color: var(--app-muted);
}

.ns-pair {
  display: grid;
  gap: 6px;
}

/* in the narrow desktop side panel, clef takes its own short row */
@media (min-width: 1200px) {
  .ns-staff-settings {
    grid-template-columns: 1fr 1fr;
  }

  .ns-staff-settings > :first-child {
    grid-column: 1 / -1;
  }
}

/* =====================================================
   PHONES
===================================================== */

@media (max-width: 599px) {
  .ns-panel {
    padding: 10px;
    gap: 12px;
  }

  .ns-sheet-row {
    grid-template-columns: 1fr 1fr;
  }

  .ns-sheet-name {
    grid-column: 1 / -1;
  }

  .ns-note-actions > * {
    flex: 1;
  }

  .ns-note-fields {
    grid-template-columns: 1fr 1fr;
  }

  .ns-pitch {
    grid-column: 1 / -1;
  }

  .ns-staff-settings {
    grid-template-columns: 1fr;
  }

  /* side by side is easier to reach with a thumb than stacked */
  .ns-pair {
    grid-template-columns: 1fr 1fr;
  }
}

/* =====================================================
   SETTINGS DRAWER (phones)
   z-index sits above the app header (2000) and below
   Quasar menus and dialogs (6000), so selects still open
===================================================== */

.ns-mobile-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 6px 6px 12px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--ns-radius);
}

.ns-mobile-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  color: var(--app-text);
}

.ns-settings-btn {
  flex: none;
  min-height: 40px;
}

.ns-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2999;
  background: var(--ns-backdrop);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.25s ease,
    visibility 0s linear 0.25s;
}

.ns-backdrop.is-open {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.25s ease;
}

.ns-panel.is-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
  width: min(380px, 88vw);
  max-width: none;
  margin: 0;
  padding: 0 12px calc(16px + env(safe-area-inset-bottom, 0px));
  padding-right: calc(12px + env(safe-area-inset-right, 0px));
  border: 0;
  border-left: 1px solid var(--app-border);
  border-radius: 12px 0 0 12px;
  overflow-y: auto;
  overscroll-behavior: contain;
  box-shadow: -8px 0 24px var(--ns-shadow-strong);
  outline: none;

  /* closed: off screen and out of the tab order */
  transform: translateX(100%);
  visibility: hidden;
  transition:
    transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1),
    visibility 0s linear 0.28s;
}

.ns-panel.is-drawer.is-open {
  transform: none;
  visibility: visible;
  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* sticky title row so the close button is always reachable */
.ns-drawer-head {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 -12px;
  padding: calc(10px + env(safe-area-inset-top, 0px)) 8px 10px 16px;
  background: inherit;
  border-bottom: 1px solid var(--app-border);
}

@media (prefers-reduced-motion: reduce) {
  .ns-backdrop,
  .ns-backdrop.is-open,
  .ns-panel.is-drawer,
  .ns-panel.is-drawer.is-open {
    transition: none;
  }
}
</style>
