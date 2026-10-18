<script setup>
import { computed } from 'vue'
import { voiceChord } from './music'

const props = defineProps({
  chord: { type: String, default: '' },
  capo: { type: Number, default: 0 },
})

const W = 72
const H = 88
const LEFT = 14
const TOP = 18
const GAP = 9 // between strings
const FRET_H = 15
const FRETS = 4

const voicing = computed(() => voiceChord(props.chord))

const baseFret = computed(() => {
  if (!voicing.value) return 1
  const fretted = voicing.value.frets.filter((f) => f !== null && f > 0)
  if (!fretted.length) return 1
  const max = Math.max(...fretted)
  return max <= FRETS ? 1 : Math.min(...fretted)
})

// x position per string, low E on the left
const stringX = (s) => LEFT + (6 - s) * GAP

const marks = computed(() => {
  if (!voicing.value) return []
  return voicing.value.frets.map((fret, i) => {
    const string = i + 1
    const x = stringX(string)
    if (fret === null) return { kind: 'muted', x, string }
    if (fret === 0) return { kind: 'open', x, string }
    return { kind: 'dot', x, y: TOP + (fret - baseFret.value + 0.5) * FRET_H, string }
  })
})
</script>

<template>
  <svg
    v-if="voicing"
    class="chord-diagram"
    :viewBox="`0 0 ${W} ${H}`"
    :width="W"
    :height="H"
    role="img"
    :aria-label="`${chord} chord shape`"
  >
    <!-- frets -->
    <line
      v-for="f in FRETS + 1"
      :key="`f${f}`"
      :x1="stringX(6)"
      :x2="stringX(1)"
      :y1="TOP + (f - 1) * FRET_H"
      :y2="TOP + (f - 1) * FRET_H"
      :stroke-width="f === 1 && baseFret === 1 ? 3 : 1"
      class="line"
    />
    <!-- strings -->
    <line
      v-for="s in 6"
      :key="`s${s}`"
      :x1="stringX(s)"
      :x2="stringX(s)"
      :y1="TOP"
      :y2="TOP + FRETS * FRET_H"
      class="line"
    />

    <text
      v-if="baseFret > 1"
      :x="LEFT - 4"
      :y="TOP + FRET_H * 0.7"
      class="fret-label"
      text-anchor="end"
    >
      {{ baseFret }}
    </text>

    <template v-for="m in marks" :key="m.string">
      <circle v-if="m.kind === 'dot'" :cx="m.x" :cy="m.y" r="3.6" class="dot" />
      <circle v-else-if="m.kind === 'open'" :cx="m.x" :cy="TOP - 7" r="2.6" class="open" />
      <text v-else :x="m.x" :y="TOP - 4" class="muted" text-anchor="middle">×</text>
    </template>

    <text v-if="capo" :x="W / 2" :y="H - 2" class="capo" text-anchor="middle">capo {{ capo }}</text>
  </svg>
</template>

<style scoped>
.chord-diagram {
  display: block;
  color: var(--app-muted);
}
.line {
  stroke: currentColor;
  opacity: 0.55;
}
.dot {
  fill: #42a5f5;
}
.open {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.2;
}
.muted {
  fill: currentColor;
  font-size: 9px;
}
.fret-label,
.capo {
  fill: currentColor;
  font-size: 8px;
}
</style>
