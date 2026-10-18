<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import treblePng from 'src/assets/images/treble.png'
import { placeOnStrings } from 'src/components/music/notation'
import { useStaffPlayer } from 'src/components/music/useStaffPlayer'
import en from './intervals-i18n/en'
import bg from './intervals-i18n/bg'
import zh from './intervals-i18n/zh'

/* ---------- i18n ----------
 * Texts live in one file per language: intervals-i18n/en.js, bg.js, zh.js.
 * They are added to the app's global messages under "guitarIntervals", so
 * the page follows the same language switch as the rest of the app.
 * Keys match the locale codes of the language picker in MainLayout.
 */

const { t: globalT, mergeLocaleMessage } = useI18n({ useScope: 'global' })

const PAGE_MESSAGES = { bg, 'en-US': en, 'zh-CN': zh }

for (const [locale, messages] of Object.entries(PAGE_MESSAGES)) {
  mergeLocaleMessage(locale, { guitarIntervals: messages })
}

const t = (key, values = {}) => globalT(`guitarIntervals.${key}`, values)

/* ---------- Table columns ---------- */

const columns = computed(() => [
  {
    name: 'name',
    label: t('columns.name'),
    field: 'id',
    align: 'left',
    sortable: true,
  },

  {
    name: 'semitones',
    label: t('columns.semitones'),
    field: 'semitones',
    align: 'center',
    sortable: true,
  },

  {
    name: 'description',
    label: t('columns.description'),
    field: 'semitones',
    align: 'left',
  },

  {
    name: 'notes',
    label: t('columns.example'),
    field: 'semitones',
    align: 'center',
  },

  {
    name: 'staff_notation',
    label: t('columns.staffNotation'),
    field: 'semitones',
    align: 'center',
  },

  {
    name: 'listen',
    label: t('columns.listen'),
    field: 'semitones',
    align: 'center',
  },

  {
    name: 'var_melodic',
    label: t('columns.melodic'),
    field: 'semitones',
    align: 'left',
  },

  {
    name: 'var_harmonic',
    label: t('columns.harmonic'),
    field: 'semitones',
    align: 'left',
  },
])

/* ---------- Base note picker ---------- */

const baseOptions = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

const baseNote = ref('C')

/*
 * The interval note is spelled from the letters: a 3rd is always the letter
 * two steps up, then a sharp or flat makes up the semitones. So from F a
 * perfect 4th is B♭ (not A♯), and from B a major 3rd is D♯.
 */

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

const NATURAL_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

const ACCIDENTAL_SIGN = { '-2': '𝄫', '-1': '♭', 0: '', 1: '♯', 2: '𝄪' }

// { letter, alter }: alter is -1 for a flat, 1 for a sharp
const spellTarget = (row) => {
  const root = baseNote.value

  const letter = LETTERS[(LETTERS.indexOf(root) + row.steps) % 7]

  const targetPc = (NATURAL_PC[root] + row.semitones) % 12

  let alter = (targetPc - NATURAL_PC[letter] + 12) % 12

  if (alter > 6) alter -= 12

  return { letter, alter }
}

const targetNoteName = (row) => {
  const { letter, alter } = spellTarget(row)

  return letter + ACCIDENTAL_SIGN[alter]
}

const exampleNotes = (row) => `${baseNote.value} - ${targetNoteName(row)}`

/* ---------- Staff step mapping ---------- */

/*
 * Diatonic staff-step of each natural note.
 *
 * step 0 = bottom line (E)
 * step 8 = top line (F)
 *
 * Treble-clef line order:
 * E-G-B-D-F
 *
 * Space order:
 * F-A-C-E
 */

const baseStepMap = {
  E: 0,
  F: 1,
  G: 2,
  A: 3,
  B: 4,
  C: 5,
  D: 6,
}

/* ---------- Guitar tab helper ---------- */

const rootFret = 3

const noteAtFret = (fret) => {
  const names = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#']

  return names[fret % 12]
}

const makeTab = (semitones) => {
  const root = rootFret

  const target = rootFret + semitones

  const maxFret = Math.max(target, root) + 1

  let line = 'E|'

  for (let f = 0; f <= maxFret; f++) {
    if (f === root && f === target) {
      line += '(' + f + ')'
    } else if (f === root) {
      line += 'R'
    } else if (f === target) {
      line += String(f)
    } else {
      line += '-'
    }

    line += '-'
  }

  line += '|'

  return `${line}
R = root (${noteAtFret(root)})   number = interval note (${noteAtFret(target)})`
}

/* ---------- Interval data ----------
 *
 * Only structural/musical data lives here. Display text (name,
 * description, melodic, harmonic) is looked up from the i18n
 * messages above via `id`, so it stays reactive to `locale`.
 */

// [id, semitones, letter steps above the root]
const INTERVAL_DEFS = [
  ['unison', 0, 0],
  ['minor2', 1, 1],
  ['major2', 2, 1],
  ['minor3', 3, 2],
  ['major3', 4, 2],
  ['perfect4', 5, 3],
  ['tritone', 6, 3],
  ['perfect5', 7, 4],
  ['minor6', 8, 5],
  ['major6', 9, 5],
  ['minor7', 10, 6],
  ['major7', 11, 6],
  ['octave', 12, 7],
  // compound intervals: an octave plus a simple interval
  ['minor9', 13, 8],
  ['major9', 14, 8],
  ['minor10', 15, 9],
  ['major10', 16, 9],
  ['perfect11', 17, 10],
  ['aug11', 18, 10],
  ['perfect12', 19, 11],
  ['minor13', 20, 12],
  ['major13', 21, 12],
  ['minor14', 22, 13],
  ['major14', 23, 13],
  ['doubleOctave', 24, 14],
]

const intervals = ref(
  INTERVAL_DEFS.map(([id, semitones, steps]) => ({
    id,
    semitones,
    steps,
    rootFret,
    tab: makeTab(semitones),
    __expanded: false,
  })),
)

const isCompound = (row) => row.semitones > 12

const showCompound = ref(true)

const visibleRows = computed(() =>
  showCompound.value ? intervals.value : intervals.value.filter((row) => !isCompound(row)),
)

/* ---------- Playback ----------
 *
 * Uses the note sheet's player and plucked-string sound.
 * The staff shows guitar notation, which sounds an octave lower than
 * written, so the root drawn on the staff (E on the bottom line up to D
 * above the top line) sounds E3 to D4.
 */

const ROOT_MIDI = { E: 52, F: 53, G: 55, A: 57, B: 59, C: 60, D: 62 }
const PLAY_TEMPO = 80 // one note per beat when played melodically

const player = useStaffPlayer()
const playing = ref(null) // { id, mode: 'melodic' | 'harmonic' } while sounding

const intervalMidis = (row) => {
  const root = ROOT_MIDI[baseNote.value]
  return [root, root + row.semitones]
}

const playInterval = (row, mode) => {
  if (isPlayingRow(row, mode)) {
    player.stop()
    return
  }

  const [root, target] = intervalMidis(row)
  const event = (index, start, notes, beats) => ({
    staff: 0,
    index,
    start,
    beats,
    soundBeats: beats,
    rest: false,
    notes,
  })

  // melodic: the root, then the interval note; harmonic: both on different strings
  const events =
    mode === 'melodic'
      ? [event(0, 0, placeOnStrings([root]), 1), event(1, 1, placeOnStrings([target]), 1.5)]
      : [event(2, 0, placeOnStrings([root, target]), 2)]

  player.play({ events, barStarts: [0] }, { tempo: PLAY_TEMPO })
  playing.value = { id: row.id, mode }
}

const isPlayingRow = (row, mode) =>
  player.isPlaying.value && playing.value?.id === row.id && playing.value?.mode === mode

// which notes to highlight on a row's staff: 'root', 'target', 'both' or null
const highlightFor = (row) => {
  if (!player.isPlaying.value || playing.value?.id !== row.id) return null
  const index = player.current.value?.index
  if (index === 0) return 'root'
  if (index === 1) return 'target'
  if (index === 2) return 'both'
  return null
}

watch(
  () => [player.current.value?.index, player.isPlaying.value],
  () => redrawAll(),
)

/* ---------- Canvas staff notation ---------- */

/*
 * IMPORTANT:
 * Use Maps keyed by interval id rather than rowIndex (or the
 * locale-dependent name), so refs survive both re-renders and
 * language switches.
 *
 * There are two canvases per interval:
 *
 * 1. The canvas in the normal table row.
 * 2. The canvas in the expanded detail row.
 *
 * Using rowIndex for both means the expanded canvas can overwrite
 * the normal canvas reference.
 */

const canvasEls = ref(new Map())

const expandedCanvasEls = ref(new Map())

const setCanvasRef = (el, id) => {
  if (el) {
    canvasEls.value.set(id, el)

    // draw as soon as the canvas exists: rows appear when compound
    // intervals are switched on, and cards replace rows on phones
    const row = intervals.value.find((r) => r.id === id)

    if (row) drawStaff(el, row)
  } else {
    canvasEls.value.delete(id)
  }
}

// const setExpandedCanvasRef = (el, id) => {
//   if (el) {
//     expandedCanvasEls.value.set(id, el)
//   } else {
//     expandedCanvasEls.value.delete(id)
//   }
// }

/* ---------- Staff geometry ---------- */

// bottom staff line; the canvas is 120px tall so high notes and 8va fit
const baseLineY = 85

// notes higher than this (two ledger lines above the staff) are written an
// octave lower with an 8va mark
const MAX_WRITTEN_STEP = 12

const needsOttava = (row) => baseStepMap[baseNote.value] + row.steps > MAX_WRITTEN_STEP

const stepSpacing = 5

const trebleClefImg = new Image()
trebleClefImg.src = treblePng
trebleClefImg.onload = () => redrawAll()

const yForStep = (step) => baseLineY - step * stepSpacing

const drawLedgerLines = (ctx, x, step) => {
  if (step <= 8) return

  ctx.strokeStyle = '#17344d'
  ctx.lineWidth = 1

  for (let s = 10; s <= step; s += 2) {
    const y = yForStep(s)

    ctx.beginPath()

    ctx.moveTo(x - 10, y)

    ctx.lineTo(x + 10, y)

    ctx.stroke()
  }
}

/* ---------- Draw staff ---------- */

const drawStaff = (canvas, row) => {
  if (!canvas) return

  const ctx = canvas.getContext('2d')

  const w = canvas.width

  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  /* 5 staff lines */

  ctx.strokeStyle = '#17344d'

  ctx.lineWidth = 1
  ;[0, 2, 4, 6, 8].forEach((step) => {
    const y = yForStep(step)

    ctx.beginPath()

    ctx.moveTo(10, y)

    ctx.lineTo(w - 10, y)

    ctx.stroke()
  })

  /* Treble clef */

  if (trebleClefImg.complete && trebleClefImg.naturalWidth) {
    ctx.drawImage(trebleClefImg, 6, baseLineY - 62, 46, 72)
  }

  /* Note positions */

  const rootStep = baseStepMap[baseNote.value]

  const ottava = needsOttava(row)

  const targetStep = rootStep + row.steps - (ottava ? 7 : 0)

  const rootX = 95

  const targetX = 185

  const rootY = yForStep(rootStep)

  const targetY = yForStep(targetStep)

  /* Highlight the note(s) being played */

  const highlight = highlightFor(row)

  const glow = (x, y) => {
    ctx.beginPath()

    ctx.arc(x, y, 12, 0, Math.PI * 2)

    ctx.fillStyle = 'rgba(66, 165, 245, 0.35)'

    ctx.fill()
  }

  if (highlight === 'root' || highlight === 'both') glow(rootX, rootY)

  if (highlight === 'target' || highlight === 'both') glow(targetX, targetY)

  /* Draw half note */

  const drawHalfNote = (x, y, step) => {
    ctx.save()

    ctx.translate(x, y)

    ctx.rotate(-0.35)

    ctx.beginPath()

    ctx.ellipse(0, 0, 6, 4.2, 0, 0, Math.PI * 2)

    ctx.lineWidth = 1.6

    ctx.strokeStyle = '#17344d'

    ctx.stroke()

    ctx.restore()

    /* Stem */

    ctx.beginPath()

    ctx.strokeStyle = '#17344d'

    ctx.lineWidth = 1.4

    if (step <= 4) {
      ctx.moveTo(x + 6, y - 1)

      ctx.lineTo(x + 6, y - 32)
    } else {
      ctx.moveTo(x - 6, y + 1)

      ctx.lineTo(x - 6, y + 32)
    }

    ctx.stroke()
  }

  /* Root note */

  drawHalfNote(rootX, rootY, rootStep)

  /* Ledger lines */

  drawLedgerLines(ctx, targetX, targetStep)

  /* Target note */

  drawHalfNote(targetX, targetY, targetStep)

  /* Accidental */

  const { alter } = spellTarget(row)

  if (alter) {
    ctx.font = 'bold 16px sans-serif'

    ctx.fillStyle = '#cf4561'

    ctx.fillText(ACCIDENTAL_SIGN[alter], targetX - 20, targetY + 5)
  }

  /* 8va: the target is written an octave lower than it sounds */

  if (ottava) {
    ctx.font = 'italic 11px serif'

    ctx.fillStyle = '#17344d'

    ctx.textAlign = 'center'

    ctx.fillText('8va', targetX, Math.max(11, Math.min(targetY, yForStep(8)) - 12))

    ctx.textAlign = 'left'
  }

  /* Note-name labels */

  ctx.font = '11px sans-serif'

  ctx.fillStyle = '#426b83'

  ctx.textAlign = 'center'

  ctx.fillText(baseNote.value, rootX, h - 8)

  ctx.fillText(targetNoteName(row), targetX, h - 8)

  ctx.textAlign = 'left'
}

/* ---------- Redraw normal table canvases ---------- */

const redrawAll = () => {
  intervals.value.forEach((row) => {
    const canvas = canvasEls.value.get(row.id)

    drawStaff(canvas, row)
  })
}

/* ---------- Redraw expanded canvases ---------- */

const redrawExpanded = () => {
  intervals.value.forEach((row) => {
    if (!row.__expanded) {
      return
    }

    const canvas = expandedCanvasEls.value.get(row.id)

    drawStaff(canvas, row)
  })
}

/* ---------- Base-note change ---------- */

const onBaseNoteChange = async () => {
  player.stop()

  await nextTick()

  redrawAll()

  redrawExpanded()
}

/* ---------- Mounted ---------- */

onMounted(async () => {
  await nextTick()

  redrawAll()

  redrawExpanded()
})
</script>

<template>
  <!-- <div class="intervals-heading row items-center q-mb-md q-col-gutter-sm">
    <div class="col text-h5">{{ t('title') }}</div>

    <q-space />

    <div class="col-auto">
      <svan class="text-secondary"></svan>
    </div>
  </div> -->

  <q-table
    row-key="id"
    :rows="visibleRows"
    :columns="columns"
    :pagination="{ rowsPerPage: 0 }"
    class="intervals-table bg-grey-2"
    :class="{ 'intervals-table--dark': $q.dark.isActive }"
    hide-pagination
    bordered
    flat
    :grid="$q.screen.lt.sm"
  >
    <template #top>
      <div
        class="intervals-mobile-controls intervals-top full-width q-pa-sm"
        :class="{ 'intervals-mobile-controls--dark': $q.dark.isActive }"
      >
        <q-select
          v-if="$q.screen.lt.sm"
          v-model="baseNote"
          :options="baseOptions"
          dense
          outlined
          emit-value
          map-options
          dark
          bg-color="grey-10"
          :label="t('baseNoteLabel')"
          @update:model-value="onBaseNoteChange"
          :style="{ width: $q.screen.lt.sm ? '50%' : '100px' }"
        />
        <q-toggle v-model="showCompound" :label="t('showCompound')" color="teal" dense />
      </div>
    </template>

    <template #item="props">
      <q-card
        class="interval-card q-ma-xs full-width"
        :class="{ 'interval-card--dark': $q.dark.isActive }"
        bordered
        flat
      >
        <q-card-section class="interval-card-heading row items-center justify-between q-pb-sm">
          <div>
            <q-badge color="teal" outline>{{ t(`intervals.${props.row.id}.name`) }}</q-badge>
            <div v-if="isCompound(props.row)" class="compound-tag">{{ t('compound') }}</div>
          </div>
          <q-chip dense square color="dark" text-color="white">
            {{ props.row.semitones }} st
          </q-chip>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-sm">
          <div class="interval-card-label">{{ t('columns.description') }}</div>
          <div>{{ t(`intervals.${props.row.id}.description`) }}</div>

          <div class="interval-card-label">{{ t('columns.example') }}</div>
          <q-chip dense square color="dark" text-color="white">
            {{ exampleNotes(props.row) }}
          </q-chip>

          <div class="interval-card-label">{{ t('columns.staffNotation') }}</div>
          <div class="staff-content">
            <canvas
              :ref="(el) => setCanvasRef(el, props.row.id)"
              width="260"
              height="120"
              class="staff-canvas"
              :title="needsOttava(props.row) ? t('eightVa') : undefined"
            />
          </div>

          <div class="interval-card-label">{{ t('columns.listen') }}</div>
          <div class="listen-buttons listen-buttons--row">
            <q-btn
              unelevated
              dense
              no-caps
              :color="isPlayingRow(props.row, 'melodic') ? 'negative' : 'primary'"
              :icon="isPlayingRow(props.row, 'melodic') ? 'stop' : 'trending_up'"
              :label="t('columns.melodic')"
              :aria-label="
                isPlayingRow(props.row, 'melodic')
                  ? t('stop')
                  : t('playMelodic', { name: t(`intervals.${props.row.id}.name`) })
              "
              @click="playInterval(props.row, 'melodic')"
            />
            <q-btn
              unelevated
              dense
              no-caps
              :color="isPlayingRow(props.row, 'harmonic') ? 'negative' : 'primary'"
              :icon="isPlayingRow(props.row, 'harmonic') ? 'stop' : 'library_music'"
              :label="t('columns.harmonic')"
              :aria-label="
                isPlayingRow(props.row, 'harmonic')
                  ? t('stop')
                  : t('playHarmonic', { name: t(`intervals.${props.row.id}.name`) })
              "
              @click="playInterval(props.row, 'harmonic')"
            />
          </div>

          <div class="interval-card-label">{{ t('columns.melodic') }}</div>
          <div>{{ t(`intervals.${props.row.id}.melodic`) }}</div>

          <div class="interval-card-label">{{ t('columns.harmonic') }}</div>
          <div>{{ t(`intervals.${props.row.id}.harmonic`) }}</div>
        </q-card-section>
      </q-card>
    </template>

    <!-- Custom header: "Example" column header becomes a base-note picker -->
    <template #header-cell-notes="props">
      <q-th :props="props">
        <q-select
          v-model="baseNote"
          :options="baseOptions"
          popup-content-class="bg-grey-9"
          dense
          options-dense
          filled
          emit-value
          map-options
          :label="t('baseNoteLabel')"
          style="min-width: 110px"
          @update:model-value="onBaseNoteChange"
        />
      </q-th>
    </template>
    <template #header-cell-staff_notation="props">
      <q-th :props="props">
        <div class="text-subtitle2 q-mb-xs">
          <q-icon name="piano" size="18px" class="q-mr-xs" />
          {{ props.col.label }}
        </div>
      </q-th>
    </template>
    <template #header-cell-listen="props">
      <q-th :props="props">
        <div class="text-subtitle2 q-mb-xs">
          <q-icon name="volume_up" size="18px" class="q-mr-xs" />
          {{ props.col.label }}
        </div>
      </q-th>
    </template>
    <template #header-cell-var_melodic="props">
      <q-th :props="props">
        <div class="text-subtitle2 q-mb-xs">
          <q-icon name="trending_up" size="18px" class="q-mr-xs" />
          {{ t('columns.melodic') }} <br />{{ t('columns.melodicSub') }}
        </div>
      </q-th>
    </template>
    <template #header-cell-var_harmonic="props">
      <q-th :props="props">
        <div class="text-subtitle2 q-mb-xs">
          <q-icon name="library_music" size="18px" class="q-mr-xs" />
          {{ t('columns.harmonic') }} <br />{{ t('columns.harmonicSub') }}
        </div>
      </q-th>
    </template>

    <!-- Regular row -->
    <template #body="props">
      <q-tr :props="props">
        <!-- Interval name — using the badge design previously reserved for the BG column -->
        <q-td key="name" :props="props">
          <q-badge color="teal" outline>
            {{ t(`intervals.${props.row.id}.name`) }}
          </q-badge>
          <div v-if="isCompound(props.row)" class="compound-tag">{{ t('compound') }}</div>
        </q-td>

        <q-td key="semitones" :props="props" class="text-center">
          {{ props.row.semitones }}
        </q-td>

        <q-td key="description" :props="props">
          <div class="descr">{{ t(`intervals.${props.row.id}.description`) }}</div>
        </q-td>

        <q-td key="notes" :props="props" class="text-center">
          <q-chip dense square color="dark" text-color="white">
            {{ exampleNotes(props.row) }}
          </q-chip>
        </q-td>

        <!-- Staff notation -->
        <q-td key="staff_notation" :props="props" class="staff-cell">
          <div class="staff-content">
            <canvas
              :ref="(el) => setCanvasRef(el, props.row.id)"
              width="260"
              height="120"
              class="staff-canvas"
              :title="needsOttava(props.row) ? t('eightVa') : undefined"
            />
          </div>
        </q-td>

        <!-- Listen -->
        <q-td key="listen" :props="props" class="listen-cell">
          <div class="listen-buttons">
            <q-btn
              unelevated
              dense
              no-caps
              :color="isPlayingRow(props.row, 'melodic') ? 'negative' : 'primary'"
              :icon="isPlayingRow(props.row, 'melodic') ? 'stop' : 'trending_up'"
              :label="t('columns.melodic')"
              :aria-label="
                isPlayingRow(props.row, 'melodic')
                  ? t('stop')
                  : t('playMelodic', { name: t(`intervals.${props.row.id}.name`) })
              "
              @click="playInterval(props.row, 'melodic')"
            />
            <q-btn
              unelevated
              dense
              no-caps
              :color="isPlayingRow(props.row, 'harmonic') ? 'negative' : 'primary'"
              :icon="isPlayingRow(props.row, 'harmonic') ? 'stop' : 'library_music'"
              :label="t('columns.harmonic')"
              :aria-label="
                isPlayingRow(props.row, 'harmonic')
                  ? t('stop')
                  : t('playHarmonic', { name: t(`intervals.${props.row.id}.name`) })
              "
              @click="playInterval(props.row, 'harmonic')"
            />
          </div>
        </q-td>

        <!-- Variations -->
        <q-td key="var_melodic" :props="props" class="variations-cell">
          <div class="variation-content">
            <p class="q-mb-sm">
              {{ t(`intervals.${props.row.id}.melodic`) }}
            </p>
          </div>
        </q-td>

        <q-td key="var_harmonic" :props="props" class="variations-cell">
          <div class="variation-content">
            <p class="q-mb-none">
              {{ t(`intervals.${props.row.id}.harmonic`) }}
            </p>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<style scoped>
.descr {
  width: 200px;
  white-space: pre-wrap;
}

.staff-cell {
  min-width: 285px;
  width: 285px;
  vertical-align: top;
  text-align: center;
}

.staff-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.intervals-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
}

.compound-tag {
  margin-top: 4px;
  font-size: 0.7rem;
  color: var(--app-muted);
}

.listen-cell {
  width: 150px;
  vertical-align: top;
}

.listen-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: stretch;
}

.listen-buttons :deep(.q-btn) {
  padding: 2px 10px;
}

.listen-buttons--row {
  flex-direction: row;
  flex-wrap: wrap;
}

.variations-cell {
  width: 300px;
  vertical-align: top;
  text-align: left;
  white-space: pre-wrap;
}

.variation-content {
  width: 100%;
}

.staff-canvas {
  display: block;
  background: var(--app-score-surface);
  border: 1px solid var(--app-border);
  border-radius: 4px;
  max-width: 100%;
}

.tab-block {
  font-family: 'Roboto Mono', 'Courier New', monospace;

  background: var(--app-strong-surface);
  color: var(--app-strong-text);

  padding: 12px;

  border-radius: 6px;

  font-size: 13px;

  line-height: 1.5;

  white-space: pre;

  overflow-x: auto;
}

.intervals-table {
  max-width: 100%;
}

.intervals-table :deep(th),
.intervals-table :deep(td) {
  color: var(--app-text);
}

.intervals-table--dark :deep(th),
.intervals-table--dark :deep(td) {
  background: var(--app-surface);
  color: var(--app-text);
  border-color: var(--app-border);
}

.interval-card {
  background: var(--app-surface-soft);
  color: var(--app-text);
}

.interval-card--dark {
  background: var(--app-surface);
  color: var(--app-text);
}

.interval-card-heading {
  min-height: 48px;
}

.interval-card-label {
  color: var(--app-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.intervals-mobile-controls {
  background: var(--app-surface-soft);
}

.intervals-mobile-controls--dark {
  background: var(--app-surface);
}

.interval-card--dark .interval-card-label {
  color: var(--app-muted);
}

:deep(.intervals-table th),
:deep(.intervals-table td) {
  border-right: 1px solid var(--app-border);
  border-bottom: 1px solid var(--app-border);
}

:deep(.intervals-table .q-table__middle) {
  overflow-x: auto;
}

@media (max-width: 599px) {
  .intervals-heading {
    align-items: flex-start;
  }

  .intervals-heading .text-h5 {
    font-size: 1.35rem;
    line-height: 1.2;
  }

  :deep(.intervals-table table) {
    min-width: 1100px;
  }
}
</style>
