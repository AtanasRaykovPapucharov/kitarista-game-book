<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { COMPAS_MAP } from './constants'
/* =====================================================
   CONFIG
===================================================== */

const tempo = ref(180)
const style = ref('bulerias_1')

/* =====================================================
   AUDIO CONTEXT
===================================================== */

const audioCtx = ref(null)

/* =====================================================
   TRANSPORT STATE
===================================================== */

const currentBeat = ref(null)
let nextNoteTime = 0
let schedulerTimer = null
const lookAhead = 25 // ms
const scheduleAheadTime = 0.1 // seconds

/* =====================================================
   COMPÁS DEFINITIONS
===================================================== */

const DEFAULT_COMPAS = { beats: [] }

const compas = computed(() => {
  return COMPAS_MAP[style.value] ?? DEFAULT_COMPAS
})

const styleOptions = [
  { label: 'Tangos', value: 'tangos_1' },
  { label: 'Soleá', value: 'solea_1' },
  { label: 'Bulerías (ver.1)', value: 'bulerias_1' },
  { label: 'Bulerías (ver.2)', value: 'bulerias_2' },
  { label: 'Siguiríyas', value: 'seguiriyas_1' },
  { label: 'Sevillanas', value: 'sevillanas_1' },
  { label: 'Tanguillos', value: 'tanguillos_1' },
  { label: 'Fandangos de Huelva', value: 'fandangos_1' },
]

/* =====================================================
   AUDIO CLICK
===================================================== */
const timbre = ref(['clapping'])
const timbreOptions = [
  {
    label: 'Clapping Like',
    value: 'clapping',
  },
  {
    label: 'Percussions Like',
    value: 'percussion',
  },
  {
    label: 'Cymbals Like',
    value: 'cymbal',
  },
]

function playClick(time, accented) {
  if (timbre.value.includes('percussion')) playClickPercussionLike(time, accented)
  if (timbre.value.includes('clapping')) playClickClappingLike(time, accented)
  if (timbre.value.includes('cymbal')) playClickCymbalLike(time, accented)
}
function playClickClappingLike(time, accented) {
  if (!audioCtx.value) return

  const ctx = audioCtx.value

  /* ----------------------------
     Noise source (hands)
  ----------------------------- */
  const bufferSize = ctx.sampleRate * 0.015
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    // slightly colored noise (not pure white)
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  /* ----------------------------
     Filtering = hand shape
  ----------------------------- */
  const bandpass = ctx.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.value = accented ? 2200 : 1400
  bandpass.Q.value = accented ? 1.6 : 1.0

  const highpass = ctx.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = 700

  /* ----------------------------
     Envelope = clap transient
  ----------------------------- */
  const gain = ctx.createGain()
  const peak = accented ? 1.0 : 0.5
  const decay = accented ? 0.07 : 0.045

  gain.gain.setValueAtTime(0.001, time)
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.003)
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay)

  /* ----------------------------
     Wiring
  ----------------------------- */
  noise.connect(bandpass)
  bandpass.connect(highpass)
  highpass.connect(gain)
  gain.connect(ctx.destination)

  noise.start(time)
  noise.stop(time + decay + 0.01)
}

function playClickPercussionLike(time, accented) {
  if (!audioCtx.value) return

  const osc = audioCtx.value.createOscillator()
  const gain = audioCtx.value.createGain()

  osc.frequency.value = accented ? 880 : 440
  gain.gain.value = accented ? 0.25 : 0.15

  osc.connect(gain)
  gain.connect(audioCtx.value.destination)

  osc.start(time)
  osc.stop(time + 0.05)

  const ctx = audioCtx.value

  // White noise buffer
  const bufferSize = ctx.sampleRate * 0.02
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  // Filter = percussive character
  const filter = ctx.createBiquadFilter()
  filter.type = accented ? 'bandpass' : 'lowpass'
  filter.frequency.value = accented ? 1800 : 800
  filter.Q.value = accented ? 1.2 : 0.7

  // Envelope
  // const gain = ctx.createGain()
  gain.gain.setValueAtTime(accented ? 0.9 : 0.5, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  noise.start(time)
  noise.stop(time + 0.06)
}

function playClickCymbalLike(time, accented) {
  if (!audioCtx.value) return

  const ctx = audioCtx.value

  /* ----------------------------
     Noise source
  ----------------------------- */
  const bufferSize = ctx.sampleRate * 0.5
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    // bright noise
    data[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  /* ----------------------------
     High-pass (metal brightness)
  ----------------------------- */
  const highpass = ctx.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = accented ? 4000 : 2500

  /* ----------------------------
     Multiple band resonances
  ----------------------------- */
  const band1 = ctx.createBiquadFilter()
  band1.type = 'bandpass'
  band1.frequency.value = 6000
  band1.Q.value = 3

  const band2 = ctx.createBiquadFilter()
  band2.type = 'bandpass'
  band2.frequency.value = 9000
  band2.Q.value = 4

  /* ----------------------------
     Envelope
  ----------------------------- */
  const gain = ctx.createGain()
  const peak = accented ? 0.6 : 0.3
  const decay = accented ? 0.6 : 0.35

  gain.gain.setValueAtTime(0.001, time)
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay)

  /* ----------------------------
     Wiring
  ----------------------------- */
  noise.connect(highpass)
  highpass.connect(band1)
  band1.connect(band2)
  band2.connect(gain)
  gain.connect(ctx.destination)

  noise.start(time)
  noise.stop(time + decay + 0.1)
}

/* =====================================================
   SCHEDULER
===================================================== */

let beatIndex = 0

function scheduler() {
  while (nextNoteTime < audioCtx.value.currentTime + scheduleAheadTime) {
    const beat = compas.value.beats[beatIndex]
    playClick(nextNoteTime, beat.accent)

    currentBeat.value = beatIndex

    const secondsPerBeat = 60 / tempo.value
    nextNoteTime += secondsPerBeat

    beatIndex = (beatIndex + 1) % compas.value.beats.length
  }
}

/* =====================================================
   TRANSPORT CONTROLS
===================================================== */

function start() {
  stop()

  if (!compas.value.beats.length) return

  audioCtx.value = new AudioContext()
  beatIndex = 0
  nextNoteTime = audioCtx.value.currentTime + 0.05

  schedulerTimer = setInterval(scheduler, lookAhead)
}

function stop() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer)
    schedulerTimer = null
  }
  currentBeat.value = null

  if (audioCtx.value) {
    audioCtx.value.close()
    audioCtx.value = null
  }
}

onBeforeUnmount(stop)
</script>

<template>
  <!-- <div style="width: 390px; text-align: center; font-weight: bolder; font-size: 18px">Compás</div> -->
  <div class="flamenco-compas q-pa-sm column items-center">
    <div class="row items-center q-col-gutter-sm q-pa-sm">
      <div class="col q-mr-sm">
        <q-select
          v-model="style"
          :options="styleOptions"
          options-dense
          emit-value
          map-options
          dense
          outlined
          label="Compás"
        />
      </div>

      <div class="col-auto">
        <q-btn dense size="sm" icon="play_arrow" color="primary" @click="start" />
      </div>

      <div class="col-auto">
        <q-btn dense size="sm" icon="stop" color="primary" @click="stop" />
      </div>
      <div class="col-12 q-mt-sm" style="width: 100%">
        <div class="row items-center q-col-gutter-sm">
          <div class="col-auto text-subtitle2">Tempo: {{ tempo }} BPM</div>

          <div class="col q-ml-xs">
            <q-slider v-model="tempo" :min="30" :max="300" :step="1" label dense />
          </div>
        </div>
      </div>
      <div class="col-12 q-mt-sm" style="width: 100%">
        <q-option-group
          v-model="timbre"
          :options="timbreOptions"
          color="black"
          type="checkbox"
          dense
          inline
          left-label
          size="xs"
        />
      </div>
    </div>

    <div class="beats">
      <span
        v-for="(beat, i) in compas.beats"
        :key="i"
        :class="['beat', { active: currentBeat === i, accent: beat.accent }]"
      >
        {{ beat.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.flamenco-compas {
  width: min(390px, 100%);
  box-sizing: border-box;
}

.beats {
  display: flex;
  gap: 0.6rem;
  font-size: 1.3rem;
}

.beat {
  width: 1.3rem;
  text-align: center;
  opacity: 0.7;
}

.beat.accent {
  color: #1976d2;
  font-weight: 600;
}

.beat.active {
  color: #c10015;
  opacity: 1;
  transform: scale(1.25);
}
</style>
