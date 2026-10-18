<script setup>
import { ref, watch } from 'vue'
import { ANCIENT_SCALES, MAJOR_SCALES, MINOR_SCALES } from './constants'

const emit = defineEmits(['scale'])

const scaleAncient = ref({
  id: 1,
  label: 'Ionian',
  value: 'Ionian',
  description: 'C',
  tones: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'],
  scale: 'C__D__E_F__G__A__B_C',
})
const scaleMajor = ref({
  id: 1,
  label: 'Relative',
  value: 'Relative',
  description: 'C',
  tones: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'],
  scale: 'C__D__E_F__G__A__B_C',
})
const scaleMinor = ref({
  id: 1,
  label: 'Relative',
  value: 'Relative',
  description: 'A',
  tones: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'A'],
  scale: 'A__B_C__D__E_F__G__A',
})

watch(
  () => scaleAncient.value,
  (v) => {
    emit('scale', { scale: v.tones, label: `${v.scale} - ${v.label} scale` })
  },
)
watch(
  () => scaleMajor.value,
  (v) => {
    emit('scale', { scale: v.tones, label: `${v.scale} - ${v.label} major scale` })
  },
)
watch(
  () => scaleMinor.value,
  (v) => {
    emit('scale', { scale: v.tones, label: `${v.scale + 'm'} - ${v.label} minor scale` })
  },
)
</script>

<template>
  <!-- <div style="text-align: center; font-weight: bolder; font-size: 18px; max-width: 400px">
    Scales
  </div> -->
  <div class="row q-gutter-sm">
    <div class="row q-pa-md" style="min-width: 220px">
      <q-select
        outlined
        dense
        label="Ancient Scales"
        v-model="scaleAncient"
        :options="ANCIENT_SCALES"
        label-color="secondary"
        color="secondary"
        options-dense
        class="q-mr-md"
        style="width: 170px"
      />
      <div class="q-mt-sm">
        <span v-for="(tone, ind) in scaleAncient.tones" :key="ind">
          {{ tone }}

          <span v-if="ind < 7" class="text-secondary">_</span>
          <span v-if="ind < 7 && tone !== 'B' && tone !== 'E'" class="text-secondary">_</span>
        </span>
      </div>
    </div>
    <div class="row q-pa-md" style="min-width: 220px">
      <q-select
        outlined
        dense
        label="Major Scales"
        v-model="scaleMajor"
        :options="MAJOR_SCALES"
        label-color="secondary"
        color="secondary"
        options-dense
        class="q-mr-md"
        style="width: 170px"
      />

      <div class="q-mt-sm">
        <span v-for="(tone, ind) in scaleMajor.tones" :key="ind">
          <span v-if="ind > 0" class="text-secondary">_</span>
          <span
            v-if="
              ind > 0 &&
              tone[0] !== 'C' &&
              tone[0] !== 'F' &&
              !tone.includes('b') &&
              !scaleMajor.tones[ind - 1]?.includes('#')
            "
            class="text-secondary"
            >_</span
          >
          <span
            v-if="ind > 0 && (tone.includes('#') || scaleMajor.tones[ind - 1]?.includes('b'))"
            class="text-secondary"
            >_</span
          >

          {{ tone }}
        </span>
      </div>
    </div>
    <div class="row q-pa-md" style="min-width: 220px">
      <q-select
        outlined
        dense
        label="Minor Scales"
        v-model="scaleMinor"
        :options="MINOR_SCALES"
        label-color="secondary"
        color="secondary"
        options-dense
        class="q-mr-md"
        style="width: 170px"
      />
      <div class="q-mt-sm">
        <span v-for="(tone, ind) in scaleMinor.tones" :key="ind">
          <span v-if="ind > 0" class="text-secondary">_</span>
          <span
            v-if="
              ind > 0 &&
              tone[0] !== 'C' &&
              tone[0] !== 'F' &&
              !tone.includes('b') &&
              !scaleMinor.tones[ind - 1]?.includes('#')
            "
            class="text-secondary"
            >_</span
          >
          <span
            v-if="ind > 0 && (tone.includes('#') || scaleMinor.tones[ind - 1]?.includes('b'))"
            class="text-secondary"
            >_</span
          >

          {{ tone }}
        </span>
      </div>
    </div>
  </div>
</template>
