<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

/* A thin layer of twinkling stars over the night-sky backgrounds.
   About 70 points, redrawn ~24 times a second, paused when the tab
   is hidden; with reduced motion they are drawn once and stay still. */
const props = defineProps({ count: { type: Number, default: 70 } })

const canvas = ref(null)
let stars = []
let frame = 0
let last = 0
let observer = null

function resize() {
  const el = canvas.value
  if (!el) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  el.width = el.clientWidth * dpr
  el.height = el.clientHeight * dpr
  el.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
}

function seed() {
  stars = Array.from({ length: props.count }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.5 + Math.random() ** 3 * 1.6,
    speed: 0.6 + Math.random() * 1.8,
    phase: Math.random() * Math.PI * 2,
    hue: Math.random() < 0.25 ? 'rgba(170, 225, 255,' : 'rgba(255, 252, 240,',
  }))
}

function draw(t) {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  const w = el.clientWidth
  const h = el.clientHeight
  ctx.clearRect(0, 0, w, h)
  for (const s of stars) {
    const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase)) ** 3
    ctx.fillStyle = `${s.hue}${a.toFixed(3)})`
    ctx.beginPath()
    ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
    ctx.fill()
    if (s.r > 1.4 && a > 0.8) {
      // the brightest ones sparkle with a faint cross
      ctx.strokeStyle = `${s.hue}${(a * 0.35).toFixed(3)})`
      ctx.lineWidth = 0.6
      ctx.beginPath()
      ctx.moveTo(s.x * w - s.r * 4, s.y * h)
      ctx.lineTo(s.x * w + s.r * 4, s.y * h)
      ctx.moveTo(s.x * w, s.y * h - s.r * 4)
      ctx.lineTo(s.x * w, s.y * h + s.r * 4)
      ctx.stroke()
    }
  }
}

function loop(t) {
  frame = requestAnimationFrame(loop)
  if (document.hidden || t - last < 40) return
  last = t
  draw(t)
}

onMounted(() => {
  seed()
  resize()
  observer = new ResizeObserver(() => {
    resize()
    draw(performance.now())
  })
  observer.observe(canvas.value)
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) draw(0)
  else frame = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
})
</script>

<template>
  <canvas ref="canvas" class="star-twinkle" aria-hidden="true" />
</template>

<style scoped>
.star-twinkle {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
