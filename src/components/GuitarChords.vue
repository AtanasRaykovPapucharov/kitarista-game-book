<script setup>
import { ref, computed, watch } from 'vue'
import chords from 'src/helpers/chords'
import ChordCanvas from './ChordCanvas.vue'

const emit = defineEmits(['select'])

const letter = ref('A')
const minor = ref(false)
const sign = ref([])
const signOptions = computed(() => {
  return [
    {
      label: 'b',
      value: 'b',
      disable: letter.value == 'C' || letter.value == 'F',
    },
    {
      label: '#',
      value: '#',
      disable: letter.value == 'B' || letter.value == 'E',
    },
  ]
})
const sus = ref([])
const susOptions = [
  {
    label: '5',
    value: '5',
  },
  {
    label: '7',
    value: '7',
  },
  {
    label: '9',
    value: '9',
  },
  {
    label: 'dim',
    value: 'dim',
  },
  {
    label: 'aug',
    value: 'aug',
  },
  {
    label: 'dim7',
    value: 'dim7',
  },
  {
    label: 'sus2',
    value: 'sus2',
  },
  {
    label: 'sus4',
    value: 'sus4',
  },
  {
    label: 'maj7',
    value: 'maj7',
  },
  {
    label: '7sus4',
    value: '7sus4',
  },
]
const chordName = computed(() => {
  let val = letter.value

  if (sign.value.length) {
    val += `-${sign.value[0]}`
  }
  if (minor.value) {
    val += '-m'
  }
  if (sus.value.length) {
    val += `-${sus.value[0]}`
  }
  return val
})

const normalizeTone = (value) =>
  String(value || '')
    .replace('♭', 'b')
    .replace('♯', '#')

const buildChordToneNames = (name) => {
  const raw = normalizeTone(name)
  const root = raw.split('-')[0]
  const acc = raw.includes('#') ? '#' : raw.includes('b') ? 'b' : ''
  const cleanRoot = root.replace(/[#b]/g, '')
  const rootIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(
    `${cleanRoot}${acc}`,
  )

  if (rootIndex < 0) return [root]

  const semitoneMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const isMinor = raw.includes('m')
  const isDim = raw.includes('dim')
  const isAug = raw.includes('aug')
  const isSus2 = raw.includes('sus2')
  const isSus4 = raw.includes('sus4')
  const hasMaj7 = raw.includes('maj7')
  const has7 = raw.includes('7')

  let intervals = [0, 4, 7]

  if (isMinor) intervals = [0, 3, 7]
  if (isDim) intervals = [0, 3, 6]
  if (isAug) intervals = [0, 4, 8]
  if (isSus2) intervals = [0, 2, 7]
  if (isSus4) intervals = [0, 5, 7]
  if (hasMaj7) intervals = [0, 4, 7, 11]
  if (has7 && !hasMaj7 && !isSus2 && !isSus4) intervals = [0, 4, 7, 10]
  if (raw.includes('5')) intervals = [0, 7]

  const names = intervals.map((interval) => {
    const idx = (rootIndex + interval) % 12
    return semitoneMap[idx]
  })

  return [...new Set(names)]
}

const noteIndexes = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
}

const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const getChordParts = (name) => {
  const parts = name.split('-')
  const root = `${parts[0]}${['#', 'b'].includes(parts[1]) ? parts[1] : ''}`
  const suffixStart = ['#', 'b'].includes(parts[1]) ? 2 : 1

  return {
    root,
    suffix: parts.slice(suffixStart).join(''),
  }
}

const toChordKey = (root, suffix) =>
  `${sharpNames[noteIndexes[root]]}${suffix}`.replace('#', 'diez')

const chordRootFromKey = (key) => {
  const match = key.match(/^([A-G](?:diez|bemol)?)/)
  if (!match) return null

  return match[1].replace('diez', '#').replace('bemol', 'b')
}

const transposeVoicing = (voicing, semitoneShift, chordName, id) => {
  const shift = semitoneShift > 0 ? semitoneShift : semitoneShift + 12
  const absoluteFrets = voicing.points.map((point) => {
    if (point.fret == null) return point.fret
    return (voicing.firstFret || 1) + point.fret - 1
  })

  const shiftedFrets = absoluteFrets.map((fret) => {
    if (fret == null) return fret
    const shifted = fret + shift
    return shifted > 0 ? shifted : null
  })

  if (shiftedFrets.some((fret, index) => absoluteFrets[index] > 0 && fret == null)) return null

  const fretted = shiftedFrets.filter((fret) => fret > 0)
  if (!fretted.length) return null

  const firstFret = Math.max(1, Math.min(...fretted), Math.max(...fretted) - 3)
  const points = voicing.points.map((point, index) => ({
    ...point,
    fret:
      shiftedFrets[index] == null || shiftedFrets[index] === 0
        ? shiftedFrets[index]
        : shiftedFrets[index] - firstFret + 1,
  }))

  return {
    ...voicing,
    id,
    name: chordName,
    firstFret,
    frets: Math.max(3, ...points.map((point) => point.fret || 0)),
    points,
  }
}

const chordVariations = computed(() => {
  const { root, suffix } = getChordParts(chordName.value)
  const targetKey = toChordKey(root, suffix)
  const existing = chords[targetKey] || []
  const variations = existing.slice(0, 3)
  const targetIndex = noteIndexes[root]

  if (variations.length >= 3) return variations

  for (const [sourceKey, sourceVoicings] of Object.entries(chords)) {
    if (variations.length >= 3 || sourceKey.endsWith(suffix) === false) continue
    const sourceRoot = chordRootFromKey(sourceKey)
    if (!sourceRoot || sourceRoot === root) continue

    const shift = targetIndex - noteIndexes[sourceRoot]
    for (const sourceVoicing of sourceVoicings) {
      if (variations.length >= 3) break
      const id = `${targetKey}-${sourceVoicing.id}-transposed`
      const variation = transposeVoicing(sourceVoicing, shift, chordName.value, id)
      if (variation) variations.push(variation)
    }
  }

  return variations
})

const emitSelectedChord = () => {
  emit('select', buildChordToneNames(chordName.value))
}

watch(
  () => sign.value,
  (newVal) => {
    if (newVal.length > 1) sign.value = [newVal[1]]
    emitSelectedChord()
  },
)
watch(
  () => sus.value,
  (newVal) => {
    if (newVal.length > 1) sus.value = [newVal[1]]
    emitSelectedChord()
  },
)
watch(
  () => letter.value,
  (newVal) => {
    if ((newVal === 'B' || newVal === 'E') && sign.value.includes('#')) sign.value = []
    if ((newVal === 'C' || newVal === 'F') && sign.value.includes('b')) sign.value = []
    emitSelectedChord()
  },
)
watch(
  () => minor.value,
  () => {
    emitSelectedChord()
  },
)
</script>
<template>
  <div class="guitar-chords q-mx-md">
    <div class="guitar-chords__controls q-mb-md row q-pa-sm" style="border: none; box-shadow: none">
      <q-select
        class="guitar-chords__letter"
        dense
        borderless
        v-model="letter"
        :options="['A', 'B', 'C', 'D', 'E', 'F', 'G']"
        options-dense
      />
      <q-separator vertical class="q-mr-sm" size="2px" />

      <q-option-group
        v-model="sign"
        :options="signOptions"
        type="checkbox"
        dense
        left-label
        size="xs"
      />
      <q-separator vertical class="q-mx-sm" size="2px" />
      <label class="q-pt-sm q-pr-sm">m</label>
      <q-toggle dense size="xs" v-model="minor" />
      <q-separator vertical class="q-mx-sm" size="2px" />
      <q-option-group
        v-model="sus"
        :options="susOptions.filter((s) => s.label.length < 2)"
        type="checkbox"
        dense
        size="xs"
      />
      <q-separator vertical class="q-mx-sm" size="2px" />
      <q-option-group
        v-model="sus"
        :options="susOptions.filter((s) => s.label.length == 3 || s.label == 'maj7')"
        type="checkbox"
        dense
        size="xs"
      />
      <q-separator vertical class="q-mx-sm" size="2px" />
      <q-option-group
        v-model="sus"
        :options="susOptions.filter((s) => s.label.length >= 4 && s.label !== 'maj7')"
        inline
        type="checkbox"
        dense
        size="xs"
      />
    </div>
    <q-separator class="q-my-md" />
    <!-- <pre>CH: {{ chords }}</pre> -->
    <div v-if="!chordVariations.length">
      <header style="margin-left: 90px">
        <strong>{{ chordName.split('-')[0] }}</strong>
        <sup>{{ chordName.split('-')[1] }}</sup>
        <strong>{{ chordName.split('-')[2] }}</strong>
        <span style="font-size: 12px; margin-left: 2px">{{ chordName.split('-')[3] }}</span>
      </header>
    </div>
    <div v-else class="guitar-chords__variations q-ml-sm">
      <div
        v-for="(ch, i) in chordVariations"
        :key="ch.id"
        :name="i"
        class="q-mb-sm q-pl-lg q-ml-lg"
        style="border-radius: 8px; margin-right: 6px"
      >
        <chord-canvas
          :name="chordName"
          :firstFret="ch.firstFret"
          :frets="ch.frets"
          :hasBarre="ch.hasBarre"
          :barreShort="ch.barreShort"
          :points="ch.points"
        />
      </div>
    </div>
    <br />
  </div>
</template>

<style scoped>
.guitar-chords {
  width: min(355px, calc(100vw - 32px));
  margin-right: 16px;
  margin-top: -30px;
  min-width: 0;
}

.guitar-chords__controls {
  align-items: center;
  column-gap: 4px;
  row-gap: 4px;
  overflow-x: hidden;
}

.guitar-chords__letter {
  width: 48px;
  flex: 0 0 48px;
}

.guitar-chords__variations {
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 4px;
}

@media (max-width: 599px) {
  .guitar-chords {
    width: calc(100vw - 24px);
    margin: -30px auto 0 !important;
  }

  .guitar-chords__controls {
    padding: 6px;
  }

  .guitar-chords__variations {
    margin-left: 0 !important;
  }

  .guitar-chords__variations > div {
    padding-left: 0;
  }
}
</style>
