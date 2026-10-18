<script setup>
import { ref } from 'vue'
import GuitarChords from 'src/components/GuitarChords.vue'
import GuitarGriff from 'src/components/GuitarGriff.vue'
import GuitarScales from 'src/components/GuitarScales.vue'
import FlamencoCompas from 'src/components/FlamencoCompas.vue'
import CircleFifths from 'src/components/CircleFifths.vue'

defineOptions({
  name: 'GuitarScalesPage',
})

const guitarAppTab = ref('scales')

const splitterModel = ref(40)
const currScale = ref(null)
const currScaleLabel = ref(null)
const horizMode = ref(false)
const leftNeck = ref(false)
const clearGriff = ref(false)
// const tab = ref('compas')
const newScale = (ev) => {
  currScale.value = ev.scale
  currScaleLabel.value = ev.label || ''
}

const tabColor = () => {
  switch (guitarAppTab.value) {
    case 'scales':
      return 'blue-5'
    default:
      return 'green-4'
  }
}
</script>
<template>
  <div>
    <div v-if="$q.screen.lt.md" class="guitar-mobile-layout">
      <div class="git-tools">
        <q-tabs
          v-model="guitarAppTab"
          dense
          class="text-grey"
          :active-color="tabColor()"
          :indicator-color="tabColor()"
          align="justify"
          narrow-indicator
        >
          <q-tab name="scales" label="Scales" />
          <q-tab name="fifths" label="Circle of fifths" />
        </q-tabs>
        <q-tab-panels v-model="guitarAppTab" animated>
          <q-tab-panel name="fifths">
            <circle-fifths :show-scale="false" @scale="newScale" @clear="clearGriff = true" />
          </q-tab-panel>
          <q-tab-panel name="scales">
            <guitar-scales @scale="newScale" />
          </q-tab-panel>
        </q-tab-panels>
      </div>
      <div class="git-neck q-px-sm q-mt-md">
        <guitar-griff :scale="currScale" :label="currScaleLabel" :clear="clearGriff" />
      </div>
    </div>
    <q-splitter
      v-else
      :horizontal="horizMode"
      v-model="splitterModel"
      :limits="[40, 60]"
      :style="{ height: `${$q.screen.height - 60}px` }"
    >
      <template #before>
        <div v-if="leftNeck" class="git-neck">
          <div class="q-px-sm q-pt-md griff-desktop">
            <guitar-griff :scale="currScale" :label="currScaleLabel" :clear="clearGriff" />
          </div>
        </div>
        <div v-else class="git-tools" style="max-width: 600px">
          <q-tabs
            v-model="guitarAppTab"
            dense
            class="text-grey q-ml-md"
            :active-color="tabColor()"
            :indicator-color="tabColor()"
            align="justify"
            narrow-indicator
            style="max-width: 500px"
          >
            <!-- <q-tab name="compas" label="Compas" /> -->
            <q-tab name="scales" label="Scales" />
            <!-- <q-tab name="chords" label="Chords" /> -->
            <q-tab name="fifths" label="Circle of fifths" />
          </q-tabs>
          <div>
            <q-tab-panels v-model="guitarAppTab" animated>
              <q-tab-panel name="fifths">
                <circle-fifths :show-scale="false" @scale="newScale" @clear="clearGriff = true" />
              </q-tab-panel>
              <q-tab-panel name="scales">
                <guitar-scales @scale="newScale" />
              </q-tab-panel>
            </q-tab-panels>
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
          <!-- <q-btn
              dense
              flat
              :class="`rotate-${horizMode && '9'}0`"
              :icon="'view_stream'"
              @click="horizMode = !horizMode"
            /> -->
        </div>
        <div v-if="!leftNeck" class="git-neck">
          <div class="q-px-sm griff-desktop">
            <guitar-griff :scale="currScale" :label="currScaleLabel" :clear="clearGriff" />
          </div>
        </div>
        <div v-else class="git-tools">
          <div>
            <!-- <circle-fifths :show-scale="false" @scale="newScale" @clear="clearGriff = true" />
              <flamenco-compas />
              <guitar-scales @scale="newScale" />
              <guitar-chords /> -->

            <q-tabs
              v-model="guitarAppTab"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <!-- <q-tab name="compas" label="Compas" /> -->
              <q-tab name="scales" label="Scales" />
              <!-- <q-tab name="chords" label="Chords" /> -->
              <q-tab name="fifths" label="Circle of fifths" />
            </q-tabs>
            <div class="q-pa-md">
              <q-tab-panels v-model="guitarAppTab" animated>
                <q-tab-panel name="fifths">
                  <circle-fifths :show-scale="false" @scale="newScale" @clear="clearGriff = true" />
                </q-tab-panel>
                <q-tab-panel name="compas"> <flamenco-compas /></q-tab-panel>
                <q-tab-panel name="scales">
                  <guitar-scales @scale="newScale" />
                </q-tab-panel>
                <q-tab-panel name="chords"><guitar-chords /></q-tab-panel>
              </q-tab-panels>
            </div>
          </div>
        </div>
      </template>
    </q-splitter>
  </div>
</template>

<style scoped>
.griff-desktop {
  margin-top: 16px;
}
</style>
