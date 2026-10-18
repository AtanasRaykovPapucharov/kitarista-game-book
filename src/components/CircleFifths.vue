<script setup>
import { onMounted, ref } from 'vue'
import circleFifths from 'src/assets/images/circle-of-fifths.png'
import {
  MAJOR_SCALES_CIRCLE_OF_FIFTHS,
  RELATIVE_MINOR_SCALES_CIRCLE_OF_FIFTHS,
  SHARPS,
  FLATS,
  CHORDS_LEVELS,
} from './constants.js'

defineProps({
  showScale: { type: Boolean, default: true },
})

const emit = defineEmits(['scale', 'clear'])

const canvasRef = ref(null)
const ctx = ref(null)
const circleScale = ref(null)

const center = { x: 250, y: 250 }
const sectors = 12
const map = new Map()
let hovered = null
let selected = null

onMounted(() => {
  if (!canvasRef.value) return
  ctx.value = canvasRef.value.getContext('2d')
  setMapper()
  base()
})

const rings = [
  { inner: 180, outer: 250 },
  { inner: 125, outer: 180 },
  { inner: 65, outer: 125 },
]

const clearAll = () => {
  selected = null
  base()
  circleScale.value = null
}

function setMapper() {
  const rings = [
    ['###', '####', '#####', '♭♭♭♭♭♭', '♭♭♭♭♭', '♭♭♭♭', '♭♭♭', '♭♭', '♭', '', '#', '##'],
    ['A', 'E', 'B', 'G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F', 'C', 'G', 'D'],
    ['F#m', 'C#m', 'G#m', 'E♭m', 'B♭m', 'Fm', 'Cm', 'Gm', 'Dm', 'Am', 'Em', 'Bm'],
  ]

  for (let ringIndex = 0; ringIndex < 3; ringIndex++) {
    for (let sector = 0; sector < 12; sector++) {
      switch (ringIndex) {
        case 1:
          map.set(
            `${ringIndex},${sector}`,
            JSON.stringify({
              tonic: rings[ringIndex][sector],
              scale: MAJOR_SCALES_CIRCLE_OF_FIFTHS[sector],
            }),
          )
          break
        case 2:
          map.set(
            `${ringIndex},${sector}`,
            JSON.stringify({
              tonic: rings[ringIndex][sector],
              scale: RELATIVE_MINOR_SCALES_CIRCLE_OF_FIFTHS[sector],
            }),
          )
          break

        default:
          map.set(`${ringIndex},${sector}`, rings[ringIndex][sector])
          break
      }
    }
  }

  return map
}

function viewScale() {
  if (selected) {
    if (selected.ringIndex == 0) selected.ringIndex = 1
    const key = `${selected.ringIndex},${selected.sector}`
    const mappedVal = map.get(key)

    if (isJsonString(mappedVal)) {
      const v = JSON.parse(map.get(key))
      emit('scale', {
        scale: v.scale.tones,
        label: `${circleScale.value} ${circleScale.value && '-'} Relative ${selected.ringIndex == 2 ? 'minor' : 'major'} scale`,
      })
    }
  }
}

function drawScaleChords() {
  if (selected && selected.ringIndex !== 0) {
    const key = `${selected.ringIndex},${selected.sector}`
    const mappedSelected = JSON.parse(map.get(key))

    for (const circle of CHORDS_LEVELS[mappedSelected.tonic]) {
      ctx.value.font = '14px Times New Roman'
      ctx.value.textAlign = 'center'
      ctx.value.fillStyle = '#96bee6'

      ctx.value.beginPath()
      ctx.value.arc(circle.c.x, circle.c.y, 10, 0, 2 * Math.PI)
      ctx.value.fill()
      ctx.value.fillStyle = 'whitesmoke'
      ctx.value.fillText(circle.lev, circle.c.x, circle.c.y + 5)
      ctx.value.closePath()
    }
  }
}

function draw() {
  let isHovered, isSelected
  rings.forEach((ring, ringIndex) => {
    for (let i = 0; i < sectors; i++) {
      const start = (i * 2 * Math.PI) / sectors - Math.PI / 12
      const end = ((i + 1) * 2 * Math.PI) / sectors - Math.PI / 12

      ctx.value.beginPath()
      ctx.value.arc(center.x, center.y, ring.outer, start, end)
      ctx.value.arc(center.x, center.y, ring.inner, end, start, true)
      ctx.value.closePath()

      isHovered = hovered && hovered.ringIndex === ringIndex && hovered.sector === i
      isSelected = selected && selected.ringIndex === ringIndex && selected.sector === i

      ctx.value.fillStyle = isSelected
        ? selected.ringIndex !== 2
          ? 'rgba(25, 118, 210, 0.3)'
          : 'rgba(255,211,110, 0.4)'
        : isHovered
          ? 'rgba(9, 9, 9, 0.1)'
          : 'transparent'
      ctx.value.fill()
    }
  })

  drawScaleChords()
}

function getRingAndSector(x, y) {
  const dx = x - center.x
  const dy = y - center.y
  const d = Math.sqrt(dx * dx + dy * dy)

  const ringIndex = rings.findIndex((r) => d > r.inner && d < r.outer)
  if (ringIndex === -1) return null

  let angle = Math.atan2(dy, dx)
  if (angle < 0) angle += 2 * Math.PI

  // APPLY SAME OFFSET AS draw()
  angle += Math.PI / 12
  angle %= 2 * Math.PI

  const sectorSize = (2 * Math.PI) / sectors
  const sector = Math.floor(angle / sectorSize)

  return { ringIndex, sector }
}

function onMouseMove(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) * canvasRef.value.width) / rect.width
  const y = ((e.clientY - rect.top) * canvasRef.value.height) / rect.height

  const hit = getRingAndSector(x, y)

  if (!hovered || !hit || hovered.ringIndex !== hit.ringIndex || hovered.sector !== hit.sector) {
    hovered = hit
    base()
  }

  canvasRef.value.style.cursor = hit ? 'pointer' : 'default'
}

function onClick() {
  if (!hovered) {
    // selected = null
    // base()
    // circleScale.value = null
    return
  }

  selected = { ...hovered }
  base()

  const key = `${hovered.ringIndex},${hovered.sector}`
  const mappedVal = map.get(key)

  let val = map.get(key)
  let valPlus
  if (val == '♭♭♭♭♭♭')
    valPlus = '  <=>  F#, C#, G#, D#, A#, E#' // ♯
  else valPlus = ''

  if (isJsonString(mappedVal)) val = JSON.parse(val).scale.scale
  if (hovered.ringIndex == 0)
    switch (val[0]) {
      case '#':
        val = val
          .split('')
          .map((s, i) => `${SHARPS[i]}${s}`)
          .join(', ')
        break

      case '♭':
        val = val
          .split('')
          .map((s, i) => `${FLATS[i]}${s}`)
          .join(', ')
        break
    }

  circleScale.value = val + valPlus
  viewScale()
}

function base() {
  const griffImg = new Image()
  griffImg.src = circleFifths
  griffImg.onload = () => {
    ctx.value.drawImage(griffImg, 0, 0, canvasRef.value.width, canvasRef.value.height)
    draw()
  }
  griffImg.onerror = (e) => console.error('Failed to load image', e)
}

function isJsonString(value) {
  if (typeof value !== 'string') return false

  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && parsed !== null
  } catch {
    return false
  }
}
</script>

<template>
  <div class="circle-fifths">
    <q-btn flat dense icon="clear_all" @click="clearAll" class="clear-button">
      <q-tooltip anchor="top right">Clear All</q-tooltip>
    </q-btn>
    <div v-if="showScale" class="q-mr-xs float-right">
      <strong class="q-mr-md">
        {{ circleScale }}
      </strong>
    </div>
    <div v-else class="q-mt-xs"></div>
    <canvas
      ref="canvasRef"
      :width="500"
      :height="500"
      class="circle-fifths-canvas"
      @mousemove="onMouseMove"
      @click="onClick"
    />
  </div>
</template>

<style scoped>
.circle-fifths {
  position: relative;
  width: 502px;
  max-width: 100%;
  border: 1px solid black;
  overflow: hidden;
}

.clear-button {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

.circle-fifths-canvas {
  display: block;
  width: 100%;
  height: auto;
}
</style>
