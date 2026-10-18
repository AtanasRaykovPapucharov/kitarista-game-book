<script setup>
import { ref } from 'vue'
import GuitarGriff from 'src/components/GuitarGriff.vue'
import FlamencoCompas from 'src/components/FlamencoCompas.vue'

defineOptions({
  name: 'GuitarFlamencoPage',
})

const splitterModel = ref(40)
const currScale = ref(null)
const currScaleLabel = ref(null)
const horizMode = ref(false)
const leftNeck = ref(false)
const clearGriff = ref(false)
</script>
<template>
  <div>
    <div v-if="$q.screen.lt.md" class="flamenco-mobile-layout">
      <div class="git-tools flamenco-mobile-tools">
        <flamenco-compas />
      </div>
      <div class="git-neck q-px-sm q-mt-md">
        <guitar-griff :scale="currScale" :label="currScaleLabel" :clear="clearGriff" />
      </div>
    </div>
    <q-splitter
      v-else
      :horizontal="horizMode"
      v-model="splitterModel"
      :limits="[30, 60]"
      :style="{ height: `${$q.screen.height - 60}px` }"
    >
      <template #before>
        <div v-if="leftNeck" class="git-neck">
          <div class="q-px-sm q-mt-sm">
            <guitar-griff :scale="currScale" :label="currScaleLabel" :clear="clearGriff" />
          </div>
        </div>
        <div v-else class="git-tools" style="max-width: 600px">
          <div class="q-pt-lg q-mt-sm q-ml-md">
            <flamenco-compas />
          </div>
        </div>
      </template>

      <template #after>
        <div style="width: 200px; position: fixed; z-index: 777">
          <q-btn
            dense
            flat
            :icon="!horizMode ? 'swap_horiz' : 'swap_vert'"
            @click="leftNeck = !leftNeck"
          />
        </div>
        <div v-if="!leftNeck" class="git-neck">
          <div class="q-px-sm q-mt-sm">
            <guitar-griff :scale="currScale" :label="currScaleLabel" :clear="clearGriff" />
          </div>
        </div>
        <div v-else class="git-tools">
          <div class="q-pt-lg q-mt-sm q-ml-sm">
            <flamenco-compas />
          </div>
        </div>
      </template>
    </q-splitter>
  </div>
</template>
