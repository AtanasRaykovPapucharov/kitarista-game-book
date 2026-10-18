<script setup>
import { ref } from 'vue'
import GuitarChords from 'src/components/GuitarChords.vue'
import GuitarGriff from 'src/components/GuitarGriff.vue'

defineOptions({
  name: 'GuitarChordsPage',
})

const splitterModel = ref(40)
const currScale = ref([])
const currScaleLabel = ref(null)
const horizMode = ref(false)
const leftNeck = ref(false)
const clearGriff = ref(false)

const onChordSelect = (notes) => {
  currScale.value = notes || []
  currScaleLabel.value = 'Selected chord'
}
</script>
<template>
  <div>
    <div v-if="$q.screen.lt.md" class="q-pt-xl">
      <guitar-chords @select="onChordSelect" />
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
          <div class="q-px-sm q-pt-sm">
            <guitar-griff :scale="currScale" :label="currScaleLabel" :clear="clearGriff" />
          </div>
        </div>
        <div v-else class="git-tools" style="max-width: 600px">
          <div class="q-pa-md q-mt-md q-ml-sm">
            <guitar-chords @select="onChordSelect" />
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
          <div class="q-px-sm q-pt-sm">
            <guitar-griff :scale="currScale" :label="currScaleLabel" :clear="clearGriff" />
          </div>
        </div>
        <div v-else class="git-tools">
          <div class="q-pa-md q-mt-md">
            <guitar-chords @select="onChordSelect" />
          </div>
        </div>
      </template>
    </q-splitter>
  </div>
</template>
