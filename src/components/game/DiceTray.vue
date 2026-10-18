<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import DiceFace from './DiceFace.vue'

/* Shows `count` dice. When `values` arrive, the faces tumble
   briefly before settling — the result is already decided
   and saved; the tumble is only for the reader's eyes. */

const props = defineProps({
  values: { type: Array, default: null },
  count: { type: Number, default: 2 },
  size: { type: Number, default: 56 },
  animate: { type: Boolean, default: true },
})

const emit = defineEmits(['settled'])

const shown = ref(props.values ?? Array(props.count).fill(null))
const tumbling = ref(false)
let timer = null

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

watch(
  () => props.values,
  (vals, old) => {
    clearInterval(timer)
    if (!vals) {
      shown.value = Array(props.count).fill(null)
      return
    }
    if (!props.animate || old === undefined || reducedMotion()) {
      shown.value = vals
      emit('settled')
      return
    }
    tumbling.value = true
    const started = Date.now()
    timer = setInterval(() => {
      if (Date.now() - started > 650) {
        clearInterval(timer)
        tumbling.value = false
        shown.value = vals
        emit('settled')
        return
      }
      shown.value = vals.map(() => 1 + Math.floor(Math.random() * 6))
    }, 70)
  },
)

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="dice-tray" aria-live="polite">
    <DiceFace v-for="(v, i) in shown" :key="i" :value="v" :size="size" :tumbling="tumbling" />
  </div>
</template>

<style scoped>
.dice-tray {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
