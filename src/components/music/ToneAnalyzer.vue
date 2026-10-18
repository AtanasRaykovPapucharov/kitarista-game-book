<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { TUNING } from 'src/components/claude/music'
import ChordDiagram from 'src/components/claude/ChordDiagram.vue'
import { playNote, playChord } from 'src/game/sound'
import { useGameStore } from 'src/stores/game-store'
import {
  chordCandidates,
  interval,
  noteWithOctave,
  scaleCandidates,
  scaleMidis,
  NOTE_NAMES,
} from './toneAnalysis'

/* What the marked notes make – and how they sound.
   Listens to the Tones chart's selection: plays each note as it is
   marked, and names the note / interval / chord / scales and modes. */
const props = defineProps({
  positions: { type: Array, default: () => [] }, // [{ string: 1–6, fret }]
})

const { t } = useI18n()

const playOnTap = ref(true)
const chosenScale = ref(null)

// sounding pitch: string 1 = high E (64) … string 6 = low E (40)
const midiOf = (p) => TUNING[p.string - 1] + p.fret
const notes = computed(() => [...new Set(props.positions.map(midiOf))].sort((a, b) => a - b))

const pitchClasses = computed(() => new Set(notes.value.map((m) => m % 12)).size)
const chords = computed(() =>
  notes.value.length >= 3 || pitchClasses.value >= 3 ? chordCandidates(notes.value) : [],
)
const chord = computed(() => chords.value[0] ?? null)
const scales = computed(() => scaleCandidates(notes.value))
const exactScales = computed(() => scales.value.filter((s) => s.exact))
const shownScales = computed(() =>
  (exactScales.value.length ? exactScales.value : scales.value).slice(0, 6),
)
const pair = computed(() =>
  notes.value.length === 2 ? interval(notes.value[0], notes.value[1]) : null,
)
// achievements: naming a chord, and finding a mode
const game = useGameStore()
watch(chord, (c) => c && game.award('tone_chord'))
watch(
  () => scales.value.some((s) => s.exact && s.kind === 'mode'),
  (found) => found && game.award('tone_mode'),
)

const lowest = computed(() => (notes.value.length ? NOTE_NAMES[notes.value[0] % 12] : ''))
// guitar music is written an octave above how it sounds – show names like the chart does
const written = (m) => noteWithOctave(m + 12)
// many different notes are a scale, not a chord: don't call them "no chord"
const showChord = computed(
  () =>
    (notes.value.length >= 3 || pitchClasses.value >= 3) &&
    (chord.value || pitchClasses.value <= 5),
)

// a note sounds the moment it is marked
watch(
  () => props.positions.map(midiOf),
  (now, before = []) => {
    chosenScale.value = null
    if (!playOnTap.value || now.length <= before.length) return
    const added = now.filter((m) => !before.includes(m))
    added.slice(-1).forEach((m) => playNote(m))
  },
)

function playTogether() {
  notes.value.forEach((m, i) => playNote(m, { delay: i * 0.035 }))
}

function playInOrder() {
  notes.value.forEach((m, i) => playNote(m, { delay: i * 0.38 }))
}

function playScale(s) {
  chosenScale.value = s
  scaleMidis(s.root, s.iv).forEach((m, i) => playNote(m, { delay: i * 0.3 }))
}

const intervalName = (iv) => {
  const name = t(`tones.intervals.${iv.key}`)
  return iv.octaves ? t('tones.compound', { octaves: iv.octaves, name }) : name
}
const scaleName = (s) => `${s.rootName} ${t(`tones.scales.${s.key}`)}`
</script>

<template>
  <q-card flat bordered class="tone-analyzer">
    <q-card-section class="ta-head">
      <div class="ta-title">{{ t('tones.title') }}</div>
      <q-toggle v-model="playOnTap" dense :label="t('tones.playOnTap')" color="accent" />
    </q-card-section>

    <q-card-section v-if="!notes.length" class="ta-hint">{{ t('tones.hint') }}</q-card-section>

    <template v-else>
      <q-card-section class="ta-notes">
        <div class="ta-label">{{ t('tones.notes') }}</div>
        <div class="ta-chips">
          <span v-for="m in notes" :key="m" class="ta-chip">{{ written(m) }}</span>
        </div>
        <div class="ta-actions">
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="music_note"
            :label="t('tones.playTogether')"
            @click="playTogether"
          />
          <q-btn
            v-if="notes.length > 1"
            outline
            no-caps
            icon="queue_music"
            :label="t('tones.playInOrder')"
            @click="playInOrder"
          />
        </div>
      </q-card-section>

      <!-- one note -->
      <q-card-section v-if="notes.length === 1" class="ta-block">
        <div class="ta-label">{{ t('tones.note') }}</div>
        <div class="ta-big">{{ written(notes[0]) }}</div>
      </q-card-section>

      <!-- two notes: the interval -->
      <q-card-section v-if="pair" class="ta-block">
        <div class="ta-label">{{ t('tones.interval') }}</div>
        <div class="ta-big">{{ intervalName(pair) }}</div>
        <div class="ta-sub">
          {{ written(notes[0]) }} – {{ written(notes[1]) }},
          {{ t('tones.semitones', pair.semis) }}
        </div>
      </q-card-section>

      <!-- three or more: the chord -->
      <q-card-section v-if="showChord" class="ta-block">
        <div class="ta-label">{{ t('tones.chord') }}</div>
        <template v-if="chord">
          <div class="ta-chord">
            <div>
              <div class="ta-big">{{ chord.name }}</div>
              <div class="ta-sub">
                {{ chord.rootName }} {{ t(`tones.chords.${chord.quality}`) }},
                {{ t(`tones.inversions.i${chord.inversion}`) }}
                <template v-if="chord.inversion"
                  >({{ t('tones.bassIs', { note: chord.bassName }) }})</template
                >
                <template v-if="chord.omittedFifth">, {{ t('tones.withoutFifth') }}</template>
              </div>
              <div class="ta-sub">{{ chord.tones.join(' – ') }}</div>
              <div v-if="chords.length > 1" class="ta-sub">
                {{ t('tones.alsoAs') }}:
                {{
                  chords
                    .slice(1, 4)
                    .map((c) => c.name)
                    .join(', ')
                }}
              </div>
              <q-btn
                flat
                dense
                no-caps
                icon="play_arrow"
                class="q-mt-xs"
                :label="t('tones.playShape')"
                @click="playChord(chord.ascii)"
              />
            </div>
            <figure class="ta-shape">
              <ChordDiagram :chord="chord.ascii" />
              <figcaption>{{ t('tones.standardShape') }}</figcaption>
            </figure>
          </div>
        </template>
        <div v-else class="ta-sub">{{ t('tones.noChord') }}</div>
      </q-card-section>

      <!-- scales and modes -->
      <q-card-section class="ta-block">
        <div class="ta-label">{{ t('tones.scalesTitle') }}</div>
        <div v-if="!scales.length" class="ta-sub">
          {{ pitchClasses < 3 ? t('tones.moreNotes') : t('tones.noScale') }}
        </div>
        <template v-else>
          <div class="ta-sub">
            {{ exactScales.length ? t('tones.exactly') : t('tones.containedIn') }}:
          </div>
          <div class="ta-scales">
            <button
              v-for="s in shownScales"
              :key="`${s.root}-${s.key}`"
              type="button"
              class="ta-scale"
              :class="{ 'is-chosen': chosenScale === s, 'is-tonic': s.tonic }"
              :title="t('tones.playScale', { name: scaleName(s) })"
              @click="playScale(s)"
            >
              <q-icon name="play_arrow" size="16px" />
              {{ scaleName(s) }}
            </button>
          </div>
          <div v-if="chosenScale" class="ta-sub">{{ chosenScale.notes.join(' – ') }}</div>
          <div v-if="exactScales.some((s) => s.kind === 'mode')" class="ta-note">
            {{ t('tones.modeNote', { note: lowest }) }}
          </div>
        </template>
      </q-card-section>
    </template>
  </q-card>
</template>

<style scoped>
.tone-analyzer {
  background: var(--app-surface);
  color: var(--app-text);
}

.ta-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ta-title {
  font-size: 1.15rem;
  font-weight: 700;
}

.ta-hint,
.ta-sub,
.ta-note {
  color: var(--app-muted);
  line-height: 1.45;
}

.ta-note {
  margin-top: 8px;
  font-size: 0.88rem;
}

.ta-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--app-muted);
  margin-bottom: 4px;
}

.ta-block {
  border-top: 1px solid var(--app-border);
}

.ta-big {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.2;
}

.ta-chips,
.ta-actions,
.ta-scales {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ta-actions {
  margin-top: 10px;
}

.ta-chip {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--app-surface-soft);
  font-weight: 600;
  font-variant-numeric: lining-nums;
}

.ta-chord {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.ta-shape {
  margin: 0;
  text-align: center;
  font-size: 0.78rem;
  color: var(--app-muted);
}

.ta-shape :deep(.chord-diagram) {
  width: 92px;
  height: auto;
}

.ta-scales {
  margin: 6px 0 4px;
}

.ta-scale {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px 5px 8px;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: transparent;
  color: var(--app-text);
  font: inherit;
  font-size: 0.92rem;
  cursor: pointer;
}

.ta-scale.is-tonic {
  font-weight: 700;
}

.ta-scale.is-chosen,
.ta-scale:hover {
  border-color: var(--q-accent);
  background: var(--app-surface-soft);
}

.ta-scale:focus-visible {
  outline: 2px solid var(--q-accent);
  outline-offset: 2px;
}
</style>
