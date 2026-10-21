<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: null },
  size: { type: Number, default: 56 },
  tumbling: { type: Boolean, default: false },
})

// pip positions on a 3×3 grid (0–2)
const PIPS = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [2, 0],
    [0, 2],
    [2, 2],
  ],
  5: [
    [0, 0],
    [2, 0],
    [1, 1],
    [0, 2],
    [2, 2],
  ],
  6: [
    [0, 0],
    [2, 0],
    [0, 1],
    [2, 1],
    [0, 2],
    [2, 2],
  ],
}

const pips = computed(() =>
  (PIPS[props.value] ?? []).map(([c, r]) => ({ cx: 13 + c * 12, cy: 13 + r * 12 })),
)
</script>

<template>
  <svg
    class="dice-face"
    :class="{ 'is-tumbling': tumbling, 'is-blank': !value }"
    viewBox="0 0 50 50"
    :width="size"
    :height="size"
    role="img"
    :aria-label="value ? String(value) : '?'"
  >
    <rect x="2" y="2" width="46" height="46" rx="9" class="dice-body" />
    <circle v-for="(p, i) in pips" :key="i" :cx="p.cx" :cy="p.cy" r="4.2" class="dice-pip" />
    <text v-if="!value" x="25" y="32" text-anchor="middle" class="dice-q">?</text>
  </svg>
</template>

<style scoped>
.dice-face {
  display: block;
  flex: none;
}

.dice-body {
  fill: var(--gb-surface);
  stroke: var(--gb-ink);
  stroke-width: 2;
}

.dice-pip {
  fill: var(--gb-ink);
}

.dice-q {
  fill: var(--gb-muted);
  font-family: var(--gb-serif);
  font-size: 22px;
}

.is-tumbling {
  animation: tumble 0.16s linear infinite;
}

@keyframes tumble {
  0% {
    transform: rotate(0deg) translateY(0);
  }
  50% {
    transform: rotate(12deg) translateY(-3px);
  }
  100% {
    transform: rotate(-8deg) translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .is-tumbling {
    animation: none;
  }
}
</style>
