<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { metronome } from 'src/game/sound'

/* Hands: four count-in clicks, then tap along with the next four.
   A tap within ±170 ms of a beat counts. */
const emit = defineEmits(['done'])
const { t } = useI18n()

const BPM = 76
const TOLERANCE = 170
const COUNT_IN = 4
const TAPS = 4

const phase = ref('idle') // idle | count | tap | done
const lit = ref(-1)
const hits = ref([]) // per tap beat: true / false
const noSound = ref(false)
let beats = []
let taps = []
let timers = []

function start() {
  timers.forEach(clearTimeout)
  taps = []
  hits.value = []
  noSound.value = false
  const times = metronome(COUNT_IN + TAPS, BPM)
  if (!times) {
    noSound.value = true
    return
  }
  beats = times
  phase.value = 'count'
  const now = performance.now()
  times.forEach((at, i) => {
    timers.push(
      setTimeout(() => {
        lit.value = i
        if (i === COUNT_IN) phase.value = 'tap'
      }, at - now),
    )
  })
  timers.push(setTimeout(finish, times.at(-1) - now + 450))
}

function tap() {
  if (phase.value === 'tap' || phase.value === 'count') taps.push(performance.now())
}

function finish() {
  const targets = beats.slice(COUNT_IN)
  const used = new Set()
  hits.value = targets.map((b) => {
    const i = taps.findIndex((x, k) => !used.has(k) && Math.abs(x - b) <= TOLERANCE)
    if (i === -1) return false
    used.add(i)
    return true
  })
  phase.value = 'done'
  lit.value = -1
}

const score = () => hits.value.filter(Boolean).length

function onKey(e) {
  if (e.code === 'Space' && (phase.value === 'tap' || phase.value === 'count')) {
    e.preventDefault()
    tap()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  timers.forEach(clearTimeout)
})
</script>

<template>
  <div class="lesson-quiz">
    <div class="rhythm__beats" aria-hidden="true">
      <span
        v-for="i in COUNT_IN + TAPS"
        :key="i"
        class="rhythm__beat"
        :class="{
          'is-count': i <= COUNT_IN,
          'is-lit': lit === i - 1,
          'is-hit': phase === 'done' && i > COUNT_IN && hits[i - COUNT_IN - 1],
          'is-miss': phase === 'done' && i > COUNT_IN && !hits[i - COUNT_IN - 1],
        }"
      />
    </div>
    <p class="lesson-quiz__ask" role="status">
      <template v-if="phase === 'count'">{{ t('lessons.rhythm.countIn') }}</template>
      <template v-else-if="phase === 'tap'">{{ t('lessons.rhythm.go') }}</template>
      <template v-else-if="phase === 'done'">{{
        t('lessons.rhythm.result', { hits: score() })
      }}</template>
    </p>

    <button
      v-if="phase === 'count' || phase === 'tap'"
      type="button"
      class="rhythm__pad"
      :class="{ 'is-ready': phase === 'tap' }"
      @pointerdown.prevent="tap"
    >
      {{ t('lessons.rhythm.tap') }}
    </button>

    <p v-if="noSound" class="lesson-quiz__feedback">{{ t('lessons.soundNeeded') }}</p>
    <p v-if="phase !== 'done'" class="lesson-quiz__hint">{{ t('lessons.rhythm.keyHint') }}</p>

    <div class="lesson-quiz__actions">
      <button v-if="phase === 'idle'" type="button" class="gb-btn gb-btn--primary" @click="start">
        {{ t('lessons.rhythm.start') }}
      </button>
      <template v-if="phase === 'done'">
        <button type="button" class="gb-btn" @click="start">{{ t('lessons.rhythm.again') }}</button>
        <button
          type="button"
          class="gb-btn gb-btn--primary"
          @click="emit('done', { score: score(), total: TAPS })"
        >
          {{ t('lessons.finish') }}
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.rhythm__beats {
  display: flex;
  gap: 10px;
  margin: 6px 0 4px;
}

.rhythm__beat {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--gb-rule);
  transition: background-color 0.08s ease;
}

.rhythm__beat:not(.is-count) {
  border-color: var(--gb-accent);
}

.rhythm__beat.is-lit {
  background: var(--gb-ink);
}

.rhythm__beat.is-hit {
  background: var(--gb-good);
  border-color: var(--gb-good);
}

.rhythm__beat.is-miss {
  border-color: var(--gb-bad);
}

.rhythm__pad {
  width: 100%;
  max-width: 22rem;
  min-height: 96px;
  margin: 8px 0;
  border: 2px dashed var(--gb-rule);
  border-radius: 18px;
  background: transparent;
  color: var(--gb-muted);
  font: 700 1.3rem var(--gb-sans);
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
}

.rhythm__pad.is-ready {
  border-style: solid;
  border-color: var(--gb-accent);
  color: var(--gb-ink);
}

.rhythm__pad:active {
  background: var(--gb-hover);
}

@media (prefers-reduced-motion: reduce) {
  .rhythm__beat {
    transition: none;
  }
}
</style>
