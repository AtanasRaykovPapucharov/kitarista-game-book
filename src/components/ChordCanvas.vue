<script setup>
// import { useQuasar } from 'quasar'
import { onMounted, ref } from 'vue'

const props = defineProps({
  name: {
    type: String,
    default: 'Am',
  },
  firstFret: {
    type: Number,
    default: 0,
  },
  frets: {
    type: Number,
    default: 3,
  },
  hasBarre: {
    type: Boolean,
    default: false,
  },
  barreShort: {
    type: Number,
    default: 0,
  },
  points: {
    type: Array,
    default: () => [
      {
        string: 1,
        fret: 0,
      },
      {
        string: 2,
        fret: 1,
      },
      {
        string: 3,
        fret: 2,
      },
      {
        string: 4,
        fret: 2,
      },
      {
        string: 5,
        fret: 0,
      },
      {
        string: 6,
        fret: null,
      },
    ],
  },
})

// const $q = useQuasar();
const canvasRef = ref(null)
let ctx = null

onMounted(() => {
  const canvas = canvasRef?.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawBase(ctx, canvas)
  drawPoints(ctx, canvas)
})

const drawBase = (ctx, canvas) => {
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.moveTo(10, i * 20 + 10)
    ctx.lineTo(canvas.width - 10, i * 20 + 10)
    ctx.stroke()
    ctx.closePath()
  }

  for (let i = 0; i <= props.frets; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 50 + 10, 10)
    ctx.lineTo(i * 50 + 10, 5 * 20 + 10)
    ctx.stroke()
    ctx.closePath()
  }

  if (props.firstFret == 0) {
    ctx.beginPath()
    ctx.moveTo(14, 10)
    ctx.lineTo(14, 5 * 20 + 10)
    ctx.stroke()
    ctx.closePath()

    for (let i = 1; i <= props.frets; i++) {
      ctx.font = '14px'
      ctx.fillStyle = 'black'
      ctx.fillText(`${i}`, i * 50 + 5, 122)
    }
  } else {
    for (let i = 0; i <= props.frets; i++) {
      ctx.font = '14px'
      ctx.fillStyle = 'black'
      ctx.fillText(`${props.firstFret + i}`, i * 50 + 5, 122)
    }
  }

  if (props.hasBarre) {
    ctx.fillStyle = 'black'
    ctx.fillRect(34, 3, 8, 13 + (6 - props.barreShort) * 17) // 115
  }
}

const drawPoints = (ctx) => {
  if (!props.points) return

  for (let i = 0; i < props.points.length; i++) {
    const point = props.points[i]

    if (point.fret != null) {
      if (point.fret == 0) {
        ctx.beginPath()
        ctx.arc(12, 10 + i * 20, 5, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.closePath()
      } else {
        ctx.beginPath()
        ctx.arc(point.fret * 50 - 12, 10 + i * 20, 5, 0, 2 * Math.PI)
        ctx.fill()
        ctx.closePath()
      }
    }
  }
}
</script>
<template>
  <!-- <pre>{{ props }}</pre> -->
  <div style="max-width: 340px">
    <header style="margin-left: 90px">
      <strong>{{ name.split('-')[0] }}</strong>
      <sup>{{ name.split('-')[1] }}</sup>
      <strong>{{ name.split('-')[2] }}</strong>
      <span style="font-size: 12px; margin-left: 2px">{{ name.split('-')[3] }}</span>
    </header>
    <canvas ref="canvasRef" :width="170 + (frets - 3) * 50" height="130" />
  </div>
</template>
