<script setup>
import AppDialog from 'src/components/AppDialog.vue'
import { useQuasar } from 'quasar'
import { onMounted, ref, watch, computed } from 'vue'
import { TONES } from './constants'
import guitarGriff from 'src/assets/images/guitar-griff.png'
import SingleFiveLines from 'src/components/music/SingleFiveLines.vue'

const props = defineProps({
  scale: { type: Array, default: () => [] },
  label: { type: String, default: () => '' },
  clear: Boolean,
})

const $q = useQuasar()
const rectSide = 24
const canvasRef = ref(null)
const ctx = ref(null)
const griffImg = ref(null)
const currNote = ref(null)
const showNote = ref(false)
const showTitle = ref(false)
const scale = computed(() => (showTitle.value ? props?.label?.split(' - ')?.[0] : null))
const title = computed(() => (showTitle.value ? props?.label?.split(' - ')?.[1] : null))

onMounted(() => {
  console.log($q.dark.isActive)
  if (!canvasRef.value) return
  ctx.value = canvasRef.value.getContext('2d')
  base()

  watch(
    () => showNote.value,
    (note) => {
      if (!note) drawAllNotes()
    },
  )

  watch(
    () => currNote.value,
    (note) => {
      if (!note) return
      showNote.value = true
      drawNote(note, 'red ', 'white')
    },
  )

  watch(
    () => props.scale,
    (val) => {
      if (val?.length && griffImg.value?.complete) {
        drawScale()
      }
    },
    { deep: true },
  )

  watch(
    () => props.clear,
    (val) => {
      if (val) {
        drawAllNotes()
      }
    },
    { deep: true },
  )
})

const onNote = (ev) => {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = ((ev.clientX - rect.left) * canvasRef.value.width) / rect.width
  const y = ((ev.clientY - rect.top) * canvasRef.value.height) / rect.height
  currNote.value = getNote(x, y)
}

function getNote(x, y) {
  if (!x || !y) return null
  for (const tone of TONES) {
    for (const point of tone.points) {
      if (y >= point.y && y <= point.y + rectSide) {
        if (x >= point.x && x <= point.x + rectSide) return tone
      }
    }
  }
}

function base() {
  griffImg.value = new Image()
  griffImg.value.src = guitarGriff
  griffImg.value.onload = () => {
    if (props.scale?.length) drawScale()
    else drawAllNotes()
  }
  griffImg.value.onerror = (e) => console.error('Failed to load image', e)
}

function drawAllNotes() {
  ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  ctx.value.drawImage(griffImg.value, 30, 0, canvasRef.value.width - 30, canvasRef.value.height)
  for (const tone of TONES)
    if (tone.name.length == 3) drawNote(tone, 'transparent', 'transparent')
    else drawNote(tone)
}

function normalizeNeckNote(value) {
  return String(value || '')
    .replace(/♭/g, 'b')
    .replace(/♯/g, '#')
    .replace(/(?:\d+|m)$/, '')
    .trim()
}

function drawScale() {
  ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  ctx.value.drawImage(griffImg.value, 30, 0, canvasRef.value.width - 30, canvasRef.value.height)

  const selectedNotes = new Set((props.scale || []).map((note) => normalizeNeckNote(note)))

  for (const tone of TONES) {
    const note = normalizeNeckNote(tone.name)
    if (selectedNotes.has(note)) {
      const color =
        selectedNotes.has(note) && note === normalizeNeckNote(props.scale?.[0] || '')
          ? '#29a77b'
          : '#72b8ee'
      drawNote(tone, color)
    }
  }

  showTitle.value = !!(props.scale && props.scale.length)
}

function drawNote(tone, bgcolor, textcolor) {
  let text
  for (const p of tone.points) {
    text = tone.name.substring(0, tone.name.length - 1)
    ctx.value.fillStyle = bgcolor || '#147b83'
    ctx.value.fillRect(p.x, p.y, rectSide, rectSide)
    ctx.value.save()
    ctx.value.fillStyle = textcolor || 'whitesmoke'
    ctx.value.font = 'bold 16px Arial'
    ctx.value.textAlign = 'center'
    ctx.value.fillText(text, p.x + 12, p.y + 18)
    ctx.value.restore()
  }
}

function clearAll() {
  drawAllNotes()
  showTitle.value = false
}
</script>

<template>
  <div class="griff-wrapper">
    <div class="text-center">
      <strong style="position: absolute; left: 180px">
        <span class="text-blue-5"> {{ scale }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>
        {{ title }}
      </strong>
      <q-btn flat dense size="sm" icon="clear_all" @click="clearAll" class="griff-clear-button">
        <q-tooltip anchor="top right">Clear All</q-tooltip>
      </q-btn>
    </div>
    <br />
    <canvas ref="canvasRef" :width="768" :height="260" class="griff-canvas" @click="onNote" />
    <AppDialog
      v-model="showNote"
      width="320px"
      :title="currNote?.name?.substring(0, currNote.name.length - 1) || ''"
    >
      <SingleFiveLines
        :width="100"
        :beat="null"
        :notes="[
          {
            note: [currNote.name[0]],
            type: 4,
            octave:
              +currNote.name[currNote.name.length - 1] || currNote.name[currNote.name.length - 1],
          },
        ]"
      />
    </AppDialog>
  </div>
</template>

<style scoped>
.griff-canvas {
  display: block;
  width: 100%;
  max-width: 768px;
  height: auto;
  border: 1px solid grey;
}

.griff-wrapper {
  position: relative;
  max-width: 770px;
}

.griff-clear-button {
  position: absolute;
  top: 0;
  right: 8px;
  z-index: 1;
}

@media (max-width: 599px) {
  .griff-wrapper {
    max-width: 100vw;
    overflow-x: auto;
  }

  .griff-canvas {
    width: 768px;
    max-width: none;
  }

  strong {
    left: 40px !important;
    max-width: calc(100% - 80px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
