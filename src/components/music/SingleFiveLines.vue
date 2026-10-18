<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import treblePng from 'src/assets/images/treble.png'
import bassPng from 'src/assets/images/bass.png'
import {
  parseLetter,
  placeOnStrings,
  resolveStaff,
  writtenStep,
} from './notation'

/* =====================================================
   One staff (five lines), wrapping onto more systems when
   the notes don't fit. Items: see notation.js.

   Drawing coordinates are per system: the five lines sit at
   y 40, 52, 64, 76, 88 and every diatonic step is 6px. The
   whole drawing is shifted down by PAD so ledger lines above
   the staff are never cut off.
===================================================== */

const emit = defineEmits(['point', 'select'])
const props = defineProps({
  width: { type: Number, default: 680 },
  height: { type: Number, default: 140 },
  minLines: { type: Number, default: 1 },
  clef: { type: String, default: null }, // 'treble', 'bass', or null (none)
  beat: { type: String, default: '4/4' },
  sharps: { type: Number, default: 0 },
  flats: { type: Number, default: 0 },
  notes: { type: Array, default: () => [] },
  // { chordIndex, letterIndex } of the selected note, or null
  selected: { type: Object, default: null },
  // time signature is drawn on the first staff of a piece, or where it changes
  showTimeSignature: { type: Boolean, default: true },
  // part of a measure already filled by earlier staves (whole note = 1)
  measureStart: { type: Number, default: 0 },
  // with no time signature, how long an accidental lasts: 'note' or 'list'
  freeScope: { type: String, default: 'note' },
  // guitar tab under the staff
  showTab: { type: Boolean, default: false },
  // index of the item being played, highlighted
  playing: { type: Number, default: null },
})

const PAD = 10
const HIT_RADIUS = 12
const TAB_EXTRA = 72 // room for the six tab lines under each system
const TAB_TOP = 150 // first tab line, in system coordinates
const TAB_GAP = 9
const ACCENT = '#e53935'

const staffCanvas = ref(null)
const ctx = ref(null)
const noteHitboxes = ref([])
const noSharpsAndFlats = computed(() => !props.sharps && !props.flats)

// vertical distance between wrapped systems
const lineHeight = computed(() => 150 + (props.showTab ? TAB_EXTRA : 0))

const xInit = computed(() => {
  let x = !props.clef ? 140 : 175
  if (noSharpsAndFlats.value) x -= 77
  return x
})

// how many note slots fit before wrapping to a new system
const notesPerLine = computed(() => {
  const usable = props.width - 40 - xInit.value
  return Math.max(1, Math.floor(usable / 40) + 1)
})

const totalLines = computed(() => {
  if (!props.notes.length) return props.minLines
  return Math.max(props.minLines, Math.ceil(props.notes.length / notesPerLine.value))
})

const canvasHeight = computed(
  () =>
    PAD +
    props.height +
    (props.showTab ? TAB_EXTRA : 0) +
    (totalLines.value - 1) * lineHeight.value,
)

// pitches, barlines and accidentals in force, item by item
const resolved = computed(() =>
  resolveStaff(props.notes, {
    sharps: props.sharps,
    flats: props.flats,
    beat: props.beat,
    measureStart: props.measureStart,
    freeScope: props.freeScope,
  }),
)

/* ---------- shapes ---------- */

// number of flags drawn for shorter note durations
const FLAG_COUNTS = { 8: 1, 16: 2, 32: 3, 64: 4 }

function drawNoteFlags(c, stemX, tipY, type, stemUp) {
  const count = FLAG_COUNTS[type]
  if (!count) return

  const dir = stemUp ? 1 : -1
  const spacing = 9
  const length = 22
  const bulge = 10

  c.save()
  c.fillStyle = 'rgba(0, 0, 0, 0.55)'
  for (let i = 0; i < count; i++) {
    const startY = tipY + dir * i * spacing
    const endY = startY + dir * length
    c.beginPath()
    c.moveTo(stemX, startY)
    c.bezierCurveTo(
      stemX + bulge,
      startY + dir * length * 0.15,
      stemX + bulge,
      startY + dir * length * 0.55,
      stemX + 2,
      endY,
    )
    c.bezierCurveTo(
      stemX + bulge * 0.55,
      startY + dir * length * 0.55,
      stemX + bulge * 0.3,
      startY + dir * length * 0.25,
      stemX,
      startY,
    )
    c.closePath()
    c.fill()
  }
  c.restore()
}

function drawRest(c, x, type) {
  c.save()
  c.fillStyle = '#000'
  c.strokeStyle = '#000'
  c.lineCap = 'round'
  c.lineJoin = 'round'

  if (type === 1) {
    c.fillRect(x - 7, 52, 14, 6) // whole: hangs from the 4th line
  } else if (type === 2) {
    c.fillRect(x - 7, 58, 14, 6) // half: sits on the middle line
  } else if (type === 4) {
    const seg = (x1, y1, x2, y2, w) => {
      c.lineWidth = w
      c.beginPath()
      c.moveTo(x1, y1)
      c.lineTo(x2, y2)
      c.stroke()
    }
    seg(x - 3, 47, x + 3, 55, 1.6)
    seg(x + 3, 55, x - 3, 63, 4.2)
    seg(x - 3, 63, x + 3, 71, 1.6)
    c.lineWidth = 2.6
    c.beginPath()
    c.moveTo(x + 3, 71)
    c.bezierCurveTo(x - 6, 66, x - 7, 76, x + 1, 80)
    c.stroke()
  } else {
    const k = FLAG_COUNTS[type] || 1
    const top = 56 - (k - 1) * 8
    const bottom = top + 22 + (k - 1) * 10
    const sx = x + 4
    const stemX = (y) => sx - (y - top) * 0.25
    c.lineWidth = 1.5
    c.beginPath()
    c.moveTo(sx, top)
    c.lineTo(stemX(bottom), bottom)
    c.stroke()
    for (let i = 0; i < k; i++) {
      const ay = top + 1 + i * 10
      const ax = stemX(ay)
      const hx = ax - 7
      const hy = ay + 2
      c.beginPath()
      c.arc(hx, hy, 2.9, 0, Math.PI * 2)
      c.fill()
      c.lineWidth = 1.4
      c.beginPath()
      c.moveTo(hx, hy + 1.5)
      c.quadraticCurveTo(ax - 3, ay + 4.5, ax, ay)
      c.stroke()
    }
  }
  c.restore()
}

/* Sharps, flats and naturals are drawn as shapes, not text: canvas text
   needs a font that has ♭ and ♮, and many devices don't. Centred on (x, y). */
function drawAccidental(c, kind, x, y) {
  c.save()
  c.lineCap = 'butt'
  const line = (x1, y1, x2, y2, w) => {
    c.lineWidth = w
    c.beginPath()
    c.moveTo(x1, y1)
    c.lineTo(x2, y2)
    c.stroke()
  }
  if (kind === '#') {
    line(x - 2.5, y - 10, x - 2.5, y + 12, 1.2)
    line(x + 2.5, y - 12, x + 2.5, y + 10, 1.2)
    line(x - 6, y - 2, x + 6, y - 6, 2.6)
    line(x - 6, y + 6, x + 6, y + 2, 2.6)
  } else if (kind === 'b') {
    line(x - 3, y - 15, x - 3, y + 5, 1.3)
    c.lineWidth = 1.9
    c.beginPath()
    c.moveTo(x - 3, y - 1)
    c.bezierCurveTo(x + 1, y - 6, x + 7, y - 5, x + 5, y - 1)
    c.bezierCurveTo(x + 4, y + 2, x, y + 4, x - 3, y + 5)
    c.stroke()
  } else if (kind === 'n') {
    line(x - 3, y - 12, x - 3, y + 5, 1.2)
    line(x + 3, y - 5, x + 3, y + 12, 1.2)
    line(x - 3, y - 2, x + 3, y - 4, 2.4)
    line(x - 3, y + 5, x + 3, y + 3, 2.4)
  }
  c.restore()
}

function drawDot(c, x, y) {
  const onLine = (88 - y) % 12 === 0
  c.beginPath()
  c.arc(x, onLine ? y - 6 : y, 2.2, 0, Math.PI * 2)
  c.fill()
}

/* ---------- pitch placement ----------
   Treble (or no clef): guitar notation as written, E4 on the bottom line.
   Bass: the sounding pitch (an octave lower), G2 on the bottom line; notes
   too high for the bass staff drop an octave and get an 8va mark. */
function placeLetter(letter, octave) {
  const step = writtenStep(letter, octave)
  if (props.clef !== 'bass') return { y: 88 - (step - 30) * 6, ottava: false }
  let y = 88 - (step - 7 - 18) * 6
  if (y < 4) return { y: y + 42, ottava: true }
  return { y, ottava: false }
}

function drawLedgers(c, x, ys, wide) {
  const maxY = Math.max(...ys)
  const minY = Math.min(...ys)
  const left = x - 13
  const right = x + (wide ? 27 : 13)
  c.beginPath()
  for (let ly = 100; ly <= maxY + 0.5; ly += 12) {
    c.moveTo(left, ly)
    c.lineTo(right, ly)
  }
  for (let ly = 28; ly >= minY - 0.5; ly -= 12) {
    c.moveTo(left, ly)
    c.lineTo(right, ly)
  }
  c.stroke()
}

/** Draw one note or chord; returns where its noteheads ended up. */
function drawChord(c, x, el, index, lineTop) {
  const heads = []
  el.note.forEach((s, letterIndex) => {
    const p = parseLetter(s)
    if (!p) return
    heads.push({ ...placeLetter(p.letter, el.octave), acc: p.acc, letterIndex })
  })
  if (!heads.length) return null

  const ys = heads.map((h) => h.y)
  const maxY = Math.max(...ys)
  const minY = Math.min(...ys)
  // stem follows the note furthest from the middle line
  const stemUp = maxY - 64 > 64 - minY

  // seconds can't share a column: every other one moves across the stem
  const order = [...heads].sort((a, b) => (stemUp ? b.y - a.y : a.y - b.y))
  let prev = null
  for (const h of order) {
    h.dx = prev && !prev.dx && Math.abs(prev.y - h.y) === 6 ? (stemUp ? 14 : -14) : 0
    prev = h
  }
  const wide = heads.some((h) => h.dx)

  drawLedgers(c, x, ys, wide)

  const hollow = el.type === 1 || el.type === 2
  for (const h of heads) {
    c.beginPath()
    c.ellipse(x + h.dx, h.y, 7, 5, 0, 0, Math.PI * 2)
    if (hollow) c.stroke()
    else c.fill()
  }

  // accidentals, staggered when they would collide
  let lastSignY = null
  let column = 0
  for (const h of [...heads].sort((a, b) => a.y - b.y)) {
    if (!h.acc) continue
    column = lastSignY !== null && h.y - lastSignY < 18 ? column + 1 : 0
    lastSignY = h.y
    drawAccidental(c, h.acc, x - 16 - column * 10 + Math.min(0, h.dx), h.y)
  }

  if (el.dot) {
    for (const h of heads) drawDot(c, x + 12 + Math.max(0, h.dx), h.y)
  }

  if (el.type !== 1) {
    const stemX = stemUp ? x + 7 : x - 7
    const tipY = stemUp ? minY - 30 : maxY + 30
    c.beginPath()
    c.moveTo(stemX, stemUp ? maxY : minY)
    c.lineTo(stemX, tipY)
    c.stroke()
    drawNoteFlags(c, stemX, tipY, el.type, stemUp)
  }

  const ottava = heads.find((h) => h.ottava)
  if (ottava) {
    c.save()
    c.font = 'italic 10px "Times New Roman", serif'
    c.textAlign = 'center'
    c.fillText('8va', x, Math.max(-4, minY - (stemUp ? 34 : 9)))
    c.restore()
  }

  for (const h of heads) {
    noteHitboxes.value.push({
      x: x + h.dx,
      y: h.y + lineTop,
      chordIndex: index,
      letterIndex: h.letterIndex,
    })
  }

  if (props.selected && props.selected.chordIndex === index) {
    c.save()
    c.strokeStyle = ACCENT
    c.lineWidth = 2
    for (const h of heads) {
      const chosen = h.letterIndex === props.selected.letterIndex && heads.length > 1
      c.beginPath()
      c.ellipse(x + h.dx, h.y, chosen ? 12 : 11, chosen ? 10 : 9, 0, 0, Math.PI * 2)
      c.stroke()
    }
    c.restore()
  }

  return { heads, stemUp, x }
}

/* ---------- tab ---------- */

function drawTabLines(c, lineTop) {
  c.save()
  c.strokeStyle = 'rgba(0, 0, 0, 0.55)'
  for (let s = 0; s < 6; s++) {
    const y = lineTop + TAB_TOP + s * TAB_GAP
    c.beginPath()
    c.moveTo(20, y)
    c.lineTo(props.width - 20, y)
    c.stroke()
  }
  c.fillStyle = '#000'
  c.font = 'bold 10px Arial, sans-serif'
  c.textAlign = 'center'
  ;['T', 'A', 'B'].forEach((ch, i) => c.fillText(ch, 30, lineTop + TAB_TOP + 13 + i * 13))
  c.restore()
}

function drawTabNumbers(c, x, pitches, held) {
  const placed = placeOnStrings(pitches.map((p) => p.midi))
  c.save()
  c.font = 'bold 11px Arial, sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  for (const { string, fret } of placed) {
    const y = TAB_TOP + (string - 1) * TAB_GAP
    const label = held ? `(${fret})` : String(fret)
    const w = label.length * 7 + 2
    c.clearRect(x - w / 2, y - 5, w, 10)
    c.fillStyle = '#000'
    c.fillText(label, x, y + 0.5)
  }
  c.restore()
}

/* ---------- notes ---------- */

const drawNotes = () => {
  const c = ctx.value
  c.fillStyle = '#000'
  c.strokeStyle = '#000'
  c.lineWidth = 1
  noteHitboxes.value = []

  const perLine = notesPerLine.value
  const placed = [] // per item: { line, x, heads, stemUp } for ties
  let heldIn = false // previous note was tied into this one

  for (let index = 0; index < props.notes.length; index++) {
    const el = props.notes[index]
    const info = resolved.value[index]
    const line = Math.floor(index / perLine)
    const lineTop = line * lineHeight.value
    const x = xInit.value + (index % perLine) * 40

    c.save()
    c.translate(0, lineTop)

    if (props.playing === index) {
      c.save()
      c.fillStyle = 'rgba(66, 165, 245, 0.22)'
      const h = props.showTab ? TAB_TOP + 5 * TAB_GAP + 12 - 26 : 72
      if (c.roundRect) {
        c.beginPath()
        c.roundRect(x - 18, 26, 36, h, 6)
        c.fill()
      } else c.fillRect(x - 18, 26, 36, h)
      c.restore()
    }

    if (el.rest) {
      drawRest(c, x, el.type)
      if (el.dot) drawDot(c, x + 12, 58)
      noteHitboxes.value.push({ x, y: 64 + lineTop, r: 18, chordIndex: index, letterIndex: 0 })
      if (props.selected && props.selected.chordIndex === index) {
        c.save()
        c.strokeStyle = ACCENT
        c.lineWidth = 2
        c.beginPath()
        if (c.roundRect) c.roundRect(x - 12, 42, 24, 44, 6)
        else c.rect(x - 12, 42, 24, 44)
        c.stroke()
        c.restore()
      }
      placed.push(null)
      heldIn = false
    } else {
      const drawn = drawChord(c, x, el, index, lineTop)
      placed.push(drawn ? { ...drawn, line } : null)
      if (props.showTab && info) drawTabNumbers(c, x, info.pitches, heldIn)
      heldIn = !!el.tie
    }

    // barline; red when the measure holds more than the time signature allows
    if (info?.barAfter) {
      const barX = x + 20
      c.save()
      if (info.overfull) {
        c.strokeStyle = ACCENT
        c.fillStyle = ACCENT
        c.lineWidth = 2
        c.font = 'bold 11px Arial, sans-serif'
        c.textAlign = 'center'
        c.fillText('!', barX, 36)
      }
      c.beginPath()
      c.moveTo(barX, 40)
      c.lineTo(barX, 88)
      if (props.showTab) {
        c.moveTo(barX, TAB_TOP)
        c.lineTo(barX, TAB_TOP + 5 * TAB_GAP)
      }
      c.stroke()
      c.restore()
    }

    c.restore()
  }

  drawTies(c, placed)
}

// a curve from each tied notehead to the next note, or to the edge of the system
function drawTies(c, placed) {
  c.save()
  c.lineWidth = 1.3
  props.notes.forEach((el, i) => {
    const from = placed[i]
    if (!el.tie || !from) return
    const to = placed[i + 1]
    const sameLine = to && to.line === from.line
    const top = from.line * lineHeight.value
    for (const h of from.heads) {
      const dir = from.stemUp ? 1 : -1 // curve away from the stem
      const x1 = from.x + h.dx + 8
      const x2 = sameLine ? to.x - 8 : Math.min(x1 + 22, props.width - 22)
      const y = top + h.y + dir * 6
      c.beginPath()
      c.moveTo(x1, y)
      c.quadraticCurveTo((x1 + x2) / 2, y + dir * 8, x2, y)
      c.stroke()
    }
  })
  c.restore()
}

/* ---------- staff, signatures, clefs ---------- */

const drawStaff = () => {
  const c = ctx.value
  c.lineWidth = 1
  c.strokeStyle = '#000'
  for (let line = 0; line < totalLines.value; line++) {
    const top = 40 + line * lineHeight.value
    for (let i = 0; i < 5; i++) {
      c.beginPath()
      c.moveTo(20, top + i * 12)
      c.lineTo(props.width - 20, top + i * 12)
      c.stroke()
    }
    if (props.showTab) drawTabLines(c, line * lineHeight.value)
  }
}

const drawTimeSignature = () => {
  if (!props.beat || !props.showTimeSignature) return
  const c = ctx.value
  c.save()
  c.fillStyle = '#000'
  c.font = '28px "Times New Roman", serif'
  c.textAlign = 'center'
  const [top, bottom] = props.beat.split('/').map((b) => parseInt(b.trim()))
  let x = !props.clef ? 110 : 145
  if (noSharpsAndFlats.value) x -= 77
  c.fillText(top, x, 62)
  c.fillText(bottom, x, 85)
  c.restore()
}

// key signature: x without / with a clef, and the treble-staff y of each sign
// (F C G D A E for sharps, B E A D G C for flats); the bass staff sits 12px lower
const SHARP_POS = [
  [30, 65, 40],
  [42, 77, 58],
  [56, 91, 34],
  [68, 103, 52],
  [81, 116, 70],
  [92, 128, 46],
]
const FLAT_POS = [
  [28, 65, 64],
  [41, 78, 46],
  [51, 90, 70],
  [65, 102, 52],
  [77, 114, 76],
  [89, 126, 58],
]

function drawKey(count, table, kind) {
  if (!count) return
  const c = ctx.value
  const shift = props.clef === 'bass' ? 12 : 0
  c.save()
  c.strokeStyle = '#1976d2'
  for (let line = 0; line < totalLines.value; line++) {
    const lineTop = line * lineHeight.value
    for (let i = 0; i < Math.min(count, table.length); i++) {
      const [plain, withClef, y] = table[i]
      drawAccidental(c, kind, props.clef ? withClef : plain, y + lineTop + shift)
    }
  }
  c.restore()
}

const trebleImg = new Image()
trebleImg.src = treblePng
const bassImg = new Image()
bassImg.src = bassPng

function drawClef() {
  const bass = props.clef === 'bass'
  if (props.clef !== 'treble' && !bass) return
  const img = bass ? bassImg : trebleImg
  if (!img.complete) {
    img.onload = base
    return
  }
  const c = ctx.value
  const imgHeight = bass ? 38 : 85
  const imgWidth = imgHeight * (img.width / img.height)
  const anchorY = bass ? 21 + 36 : 55 + 12
  for (let line = 0; line < totalLines.value; line++) {
    const lineTop = line * lineHeight.value
    const y = lineTop + anchorY - imgHeight * (bass ? 0.45 : 0.52)
    c.drawImage(img, bass ? 20 : 9, y, imgWidth, imgHeight)
  }
}

/* ---------- click ---------- */

const canvasPoint = (ev) => {
  const rect = staffCanvas.value.getBoundingClientRect()
  const x = ev.clientX - rect.left
  const y = ev.clientY - rect.top - PAD
  emit('point', { x, y })

  let closest = null
  let closestDist = Infinity
  for (const box of noteHitboxes.value) {
    const dist = Math.hypot(box.x - x, box.y - y)
    if (dist <= (box.r || HIT_RADIUS) && dist < closestDist) {
      closest = box
      closestDist = dist
    }
  }
  emit(
    'select',
    closest ? { chordIndex: closest.chordIndex, letterIndex: closest.letterIndex } : null,
  )
}

/* ---------- lifecycle ---------- */

function base() {
  const c = ctx.value
  if (!c) return
  c.clearRect(0, 0, props.width, canvasHeight.value)
  c.save()
  c.translate(0, PAD)
  drawStaff()
  drawClef()
  drawKey(props.sharps, SHARP_POS, '#')
  drawKey(props.flats, FLAT_POS, 'b')
  drawTimeSignature()
  drawNotes()
  c.restore()
}

onMounted(() => {
  ctx.value = staffCanvas.value.getContext('2d')
  base()
})

// redraw after Vue has applied the new width/height: resizing a canvas
// erases it, so drawing before the DOM update leaves a blank staff
watch(() => props, base, { deep: true, flush: 'post' })

defineExpose({ canvas: staffCanvas })
</script>

<template>
  <canvas
    ref="staffCanvas"
    :width="width"
    :height="canvasHeight"
    class="border rounded shadow-md"
    @click="canvasPoint"
  />
</template>

<style scoped>
canvas {
  cursor: pointer;
  background-color: var(--app-score-surface);
}
</style>
