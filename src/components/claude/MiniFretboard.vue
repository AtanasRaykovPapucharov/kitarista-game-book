<script setup>
import { computed } from 'vue'

/* Where a staff note (or stacked notes) sits on the neck.
   positions: [{ string: 1..6, fret }] — string 1 is the high E, drawn on top
   like tab. Frets count from the capo when there is one. */

const props = defineProps({
  positions: { type: Array, default: () => [] },
  capo: { type: Number, default: 0 },
})

const LEFT = 26
const TOP = 10
const GAP = 9 // between strings
const FRET_W = 21

const lastFret = computed(() => Math.max(12, ...props.positions.map((p) => p.fret)))
const width = computed(() => LEFT + lastFret.value * FRET_W + 8)
const height = TOP * 2 + GAP * 5 + 12

const stringY = (s) => TOP + (s - 1) * GAP
// a fretted note sits in the middle of its fret, an open one left of the nut
const noteX = (fret) => (fret === 0 ? LEFT - 11 : LEFT + (fret - 0.5) * FRET_W)

const MARKERS = [3, 5, 7, 9, 12, 15, 17, 19]
const markers = computed(() => MARKERS.filter((f) => f <= lastFret.value))

const label = computed(() =>
  props.positions
    .map((p) => `string ${p.string} ${p.fret === 0 ? 'open' : `fret ${p.fret}`}`)
    .join(', '),
)
</script>

<template>
  <svg
    v-if="positions.length"
    class="mini-fretboard"
    :viewBox="`0 0 ${width} ${height}`"
    :width="width"
    :height="height"
    role="img"
    :aria-label="`Played on ${label}${capo ? `, counted from capo ${capo}` : ''}`"
  >
    <!-- fret markers -->
    <circle
      v-for="f in markers"
      :key="`m${f}`"
      :cx="LEFT + (f - 0.5) * FRET_W"
      :cy="height - 5"
      :r="f % 12 === 0 ? 2.4 : 1.8"
      class="marker"
    />
    <!-- nut and frets -->
    <line :x1="LEFT" :x2="LEFT" :y1="TOP" :y2="stringY(6)" class="nut" />
    <line
      v-for="f in lastFret"
      :key="`f${f}`"
      :x1="LEFT + f * FRET_W"
      :x2="LEFT + f * FRET_W"
      :y1="TOP"
      :y2="stringY(6)"
      class="fret"
    />
    <!-- strings -->
    <line
      v-for="s in 6"
      :key="`s${s}`"
      :x1="LEFT"
      :x2="LEFT + lastFret * FRET_W"
      :y1="stringY(s)"
      :y2="stringY(s)"
      class="string"
      :style="{ strokeWidth: 0.6 + s * 0.15 }"
    />
    <!-- notes -->
    <g v-for="p in positions" :key="`p${p.string}`">
      <circle
        :cx="noteX(p.fret)"
        :cy="stringY(p.string)"
        r="6"
        :class="p.fret === 0 ? 'open' : 'dot'"
      />
      <text :x="noteX(p.fret)" :y="stringY(p.string) + 3.2" class="num">{{ p.fret }}</text>
    </g>
  </svg>
</template>

<style scoped>
.mini-fretboard {
  display: block;
  max-width: 100%;
  height: auto;
}
.nut {
  stroke: currentColor;
  stroke-width: 3;
}
.fret {
  stroke: currentColor;
  stroke-width: 1;
  opacity: 0.45;
}
.string {
  stroke: currentColor;
  opacity: 0.7;
}
.marker {
  fill: currentColor;
  opacity: 0.4;
}
.dot {
  fill: #42a5f5;
}
.open {
  fill: var(--app-surface, #fff);
  stroke: #42a5f5;
  stroke-width: 1.5;
}
.num {
  font: 600 8px Arial, sans-serif;
  text-anchor: middle;
  fill: #fff;
}
.open + .num {
  fill: #42a5f5;
}
</style>
