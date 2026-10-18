<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  width: { type: Number, default: 680 },
  height: { type: Number, default: 1123 },
})

const staffCanvas = ref(null)
const ctx = ref(null)
const notes = ref([])

// const drawNotes = () => {
//   const c = ctx.value
//   c.fillStyle = '#000'
//   notes.value.forEach((note) => {
//     c.beginPath()
//     c.ellipse(note.x, note.y, 8, 6, 0, 0, Math.PI * 2)
//     c.fill()
//   })
// }

const drawStaff = () => {
  const c = ctx.value
  c.clearRect(0, 0, props.width, props.height)
  c.lineWidth = 1
  c.strokeStyle = '#000'

  const top = 40
  const spacing = 12
  const indx = [5, 11, 17, 23, 29, 35, 41, 47, 53, 59, 65, 71, 77, 83, 89, 95]

  for (let i = 0; i < 89; i++) {
    const shift = indx.includes(i)
    c.beginPath()
    c.moveTo(20, top + i * (shift ? 22 : 1) * spacing)
    c.lineTo(props.width - 20, top + i * (shift ? 22 : 1) * spacing)
    c.stroke()
  }

  // drawNotes()
}

const drawBassClef = () => {
  const c = ctx.value
  c.save()

  // bass clef centered on 4th line
  const top = 40
  const spacing = 12
  const line4Y = top + spacing * 3

  const scale = 0.12
  c.scale(scale, scale)

  // Shift clef
  const offsetX = -40
  const offsetY = line4Y / scale - 260
  c.translate(offsetX, offsetY)

  // Main bass clef curve
  c.fillStyle = 'black'
  c.beginPath()
  c.arc(200, 250, 140, Math.PI * 0.5, Math.PI * 1.7, true)
  c.quadraticCurveTo(70, 250, 200, 390)
  c.quadraticCurveTo(330, 250, 200, 110)
  c.fill()

  // Two bass dots
  c.beginPath()
  c.arc(330, 200, 22, 0, Math.PI * 2)
  c.fill()

  c.beginPath()
  c.arc(330, 300, 22, 0, Math.PI * 2)
  c.fill()

  c.restore()
}

// const drawTrebleClef = () => {
//   const c = ctx.value
//   c.save()

//   // Center treble clef on staff line 2
//   // Staff top = 40, spacing = 12 → line 2 (index 1) y = 40 + 12 = 52
//   const targetY = 52

//   const scale = 0.22
//   c.scale(scale, scale)

//   // Original clef center around approx y ≈ 300 → shift up to align with staff line 2
//   const originalCenterY = 300
//   const offsetY = targetY / scale - originalCenterY

//   // Push clef slightly right to align with margin
//   const offsetX = -50

//   c.translate(offsetX, offsetY)

//   c.fillStyle = 'black'
//   c.beginPath()
//   c.moveTo(159, 3)
//   c.quadraticCurveTo(129, 50, 117, 93)
//   c.quadraticCurveTo(107, 126, 102, 167)
//   c.quadraticCurveTo(101, 192, 102, 210)
//   c.quadraticCurveTo(107, 255, 116, 297)
//   c.quadraticCurveTo(63, 351, 44, 375)
//   c.quadraticCurveTo(24, 401, 15, 429)
//   c.quadraticCurveTo(2, 464, 3, 503)
//   c.quadraticCurveTo(5, 540, 20, 575)
//   c.quadraticCurveTo(29, 596, 48, 615)
//   c.quadraticCurveTo(62, 630, 87, 645)
//   c.quadraticCurveTo(113, 660, 150, 666)
//   c.quadraticCurveTo(177, 668, 194, 665)
//   c.quadraticCurveTo(204, 720, 213, 776)
//   c.quadraticCurveTo(216, 795, 216, 813)
//   c.quadraticCurveTo(203, 849, 158, 857)
//   c.quadraticCurveTo(132, 857, 120, 842)
//   c.quadraticCurveTo(152, 845, 166, 813)
//   c.quadraticCurveTo(165, 821, 168, 802)
//   c.quadraticCurveTo(166, 775, 151, 765)
//   c.quadraticCurveTo(132, 750, 107, 758)
//   c.quadraticCurveTo(86, 768, 78, 789)
//   c.quadraticCurveTo(71, 818, 90, 840)
//   c.quadraticCurveTo(105, 857, 129, 865)
//   c.quadraticCurveTo(149, 872, 177, 865)
//   c.quadraticCurveTo(194, 860, 209, 846)
//   c.quadraticCurveTo(231, 828, 230, 803)
//   c.quadraticCurveTo(221, 735, 207, 662)
//   c.quadraticCurveTo(248, 650, 267, 626)
//   c.quadraticCurveTo(293, 599, 296, 566)
//   c.quadraticCurveTo(300, 527, 285, 494)
//   c.quadraticCurveTo(270, 462, 234, 444)
//   c.quadraticCurveTo(215, 435, 189, 435)
//   c.quadraticCurveTo(177, 435, 164, 438)
//   c.quadraticCurveTo(155, 396, 146, 354)
//   c.quadraticCurveTo(183, 315, 203, 275)
//   c.quadraticCurveTo(219, 243, 222, 210)
//   c.quadraticCurveTo(227, 167, 221, 137)
//   c.quadraticCurveTo(213, 93, 192, 51)
//   c.quadraticCurveTo(180, 29, 159, 3)
//   c.fill()

//   c.fillStyle = 'white'
//   c.beginPath()
//   c.moveTo(191, 93)
//   c.quadraticCurveTo(179, 83, 171, 93)
//   c.quadraticCurveTo(126, 162, 131, 281)
//   c.quadraticCurveTo(188, 239, 203, 188)
//   c.quadraticCurveTo(209, 162, 204, 135)
//   c.quadraticCurveTo(200, 111, 191, 93)
//   c.fill()

//   c.beginPath()
//   c.moveTo(171, 473)
//   c.quadraticCurveTo(188, 555, 206, 648)
//   c.quadraticCurveTo(237, 639, 255, 620)
//   c.quadraticCurveTo(283, 588, 283, 558)
//   c.quadraticCurveTo(285, 525, 269, 501)
//   c.quadraticCurveTo(252, 476, 216, 470)
//   c.quadraticCurveTo(194, 465, 171, 473)
//   c.fill()

//   c.beginPath()
//   c.moveTo(147, 446)
//   c.quadraticCurveTo(141, 411, 132, 369)
//   c.quadraticCurveTo(90, 401, 68, 435)
//   c.quadraticCurveTo(45, 467, 39, 503)
//   c.quadraticCurveTo(30, 540, 45, 576)
//   c.quadraticCurveTo(60, 612, 92, 633)
//   c.quadraticCurveTo(123, 651, 161, 654)
//   c.quadraticCurveTo(174, 654, 188, 653)
//   c.fill()

//   c.fillStyle = 'black'
//   c.beginPath()
//   c.moveTo(147, 444)
//   c.quadraticCurveTo(120, 456, 101, 480)
//   c.quadraticCurveTo(83, 504, 84, 536)
//   c.quadraticCurveTo(86, 567, 107, 588)
//   c.quadraticCurveTo(114, 597, 126, 605)
//   c.quadraticCurveTo(116, 593, 107, 581)
//   c.quadraticCurveTo(95, 560, 99, 537)
//   c.quadraticCurveTo(105, 509, 132, 491)
//   c.quadraticCurveTo(143, 482, 164, 476)
//   c.fill()

//   c.restore()
// }

const addNote = (event) => {
  const rect = staffCanvas.value.getBoundingClientRect()
  const x = event.clientX - 2 * rect.left
  const y = event.clientY - rect.top

  notes.value.push({ x, y })
  drawStaff()
  drawBassClef()
  // drawTrebleClef()
}

const clearNotes = () => {
  notes.value = []
  drawStaff()
  drawBassClef()
  // drawTrebleClef()
}

onMounted(() => {
  ctx.value = staffCanvas.value.getContext('2d')
  drawStaff()
  drawBassClef()
  // drawTrebleClef()
})
</script>

<template>
  <div class="q-pa-md column gap-4">
    <div class="row q-gutter-sm">
      <q-btn label="Draw Staff" color="primary" @click="drawStaff" />
      <!-- <q-btn label="Draw Treble Clef" color="secondary" @click="drawTrebleClef" /> -->
      <q-btn label="Clear Notes" color="negative" @click="clearNotes" />
    </div>
    <br />
    <canvas
      ref="staffCanvas"
      :width="width"
      :height="height"
      class="border rounded shadow-md"
      @click="addNote"
    />
  </div>
</template>

<style scoped>
canvas {
  cursor: crosshair;
  background-color: var(--app-score-surface);
}
</style>
