<script setup>
import { ref } from 'vue'
import FretboardNoteChart from 'src/components/FretboardNoteChart.vue'
import ToneAnalyzer from 'src/components/music/ToneAnalyzer.vue'

// the marked positions, shared by the chart and the analyzer
const positions = ref([])
</script>

<template>
  <div class="q-py-md tones-page">
    <ToneAnalyzer :positions="positions" class="tones-page__analyzer" />
    <FretboardNoteChart v-model="positions" class="tones-page__chart" />
  </div>
</template>

<style scoped>
.tones-page {
  display: grid;
  gap: 16px;
}

/* wide screens: the chart on the left, the analyzer beside it and always in view */
@media (min-width: 1200px) {
  .tones-page {
    grid-template-columns: minmax(0, 1fr) minmax(300px, 380px);
    align-items: start;
  }

  .tones-page__chart {
    grid-column: 1;
    grid-row: 1;
  }

  .tones-page__analyzer {
    grid-column: 2;
    grid-row: 1;
    position: sticky;
    top: 66px;
    max-height: calc(100vh - 82px);
    overflow-y: auto;
  }
}
</style>
