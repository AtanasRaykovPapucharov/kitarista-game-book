<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import { useStory } from 'src/game/useStory'
import { MOODS, lineOptions, progression, PROGRESSIONS } from 'src/story/song'
import { playChord, cues } from 'src/game/sound'
import ChordDiagram from 'src/components/claude/ChordDiagram.vue'

/* Writing a verse: mood → a line of lyrics → a chord progression.
   The chord shapes come from the practice room's ChordDiagram. */

const { t } = useI18n()
const game = useGameStore()
const { moodName, moodHint, lyric } = useStory()

const mood = ref(null)
const line = ref(null)
const prog = ref(null)

const verses = computed(() => game.song.verses)
const lines = computed(() => (mood.value ? lineOptions(mood.value, verses.value) : []))
const progs = computed(() => (mood.value ? PROGRESSIONS[mood.value].map((_, i) => i) : []))
const ready = computed(() => mood.value && line.value !== null && prog.value !== null)

function pickMood(m) {
  mood.value = m
  line.value = null
  prog.value = null
}

function listen(i) {
  progression(mood.value, i).forEach((name, k) => playChord(name, { delay: k * 0.75 }))
}

function save() {
  if (!ready.value) return
  game.composeVerse({ mood: mood.value, line: line.value, prog: prog.value })
  cues.changes([{ kind: 'song', delta: 1 }])
  mood.value = line.value = prog.value = null
}
</script>

<template>
  <section class="challenge composer" :aria-label="t('song.composeTitle')">
    <header class="challenge__head">
      <h2 class="challenge__title">
        {{ t('song.composeTitle') }}: {{ t('song.verseN', { n: verses.length + 1 }) }}
      </h2>
      <p class="challenge__rule">{{ t('song.composeLead') }}</p>
    </header>

    <fieldset class="composer__step">
      <legend class="composer__legend">1. {{ t('song.mood') }}</legend>
      <div class="composer__moods">
        <label
          v-for="m in MOODS"
          :key="m"
          class="composer__mood"
          :class="{ 'is-checked': mood === m }"
        >
          <input type="radio" name="verse-mood" :checked="mood === m" @change="pickMood(m)" />
          <span class="composer__mood-name">{{ moodName(m) }}</span>
          <span class="composer__mood-hint">{{ moodHint(m) }}</span>
        </label>
      </div>
    </fieldset>

    <fieldset v-if="mood" class="composer__step">
      <legend class="composer__legend">2. {{ t('song.line') }}</legend>
      <label
        v-for="i in lines"
        :key="i"
        class="composer__line"
        :class="{ 'is-checked': line === i }"
      >
        <input v-model="line" type="radio" name="verse-line" :value="i" />
        <span>{{ lyric(mood, i) }}</span>
      </label>
    </fieldset>

    <fieldset v-if="mood" class="composer__step">
      <legend class="composer__legend">3. {{ t('song.chords') }}</legend>
      <div
        v-for="i in progs"
        :key="i"
        class="composer__prog"
        :class="{ 'is-checked': prog === i }"
        @click="prog = i"
      >
        <label class="composer__prog-pick">
          <input v-model="prog" type="radio" name="verse-prog" :value="i" />
          <span class="composer__prog-names">{{ progression(mood, i).join(' – ') }}</span>
        </label>
        <div class="composer__diagrams" aria-hidden="true">
          <ChordDiagram v-for="(c, k) in progression(mood, i)" :key="k" :chord="c" />
        </div>
        <button type="button" class="gb-btn gb-btn--small" @click.stop="listen(i)">
          {{ t('song.listen') }}
        </button>
      </div>
    </fieldset>

    <button type="button" class="gb-btn gb-btn--primary" :disabled="!ready" @click="save">
      {{ t('song.save') }}
    </button>
  </section>
</template>

<style scoped>
.composer__step {
  margin: 18px 0 0;
  padding: 0;
  border: 0;
}

.composer__legend {
  margin-bottom: 10px;
  padding: 0;
  font-weight: 700;
}

.composer__moods {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 8px;
}

.composer__mood,
.composer__line,
.composer__prog {
  border: 1.5px solid var(--gb-rule);
  border-radius: 14px;
  cursor: pointer;
}

.composer__mood {
  display: flex;
  flex-direction: column;
  padding: 10px 14px;
}

.composer__mood input,
.composer__line input,
.composer__prog input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.is-checked {
  border-color: var(--gb-accent) !important;
  background: var(--gb-hover);
}

.composer__mood:focus-within,
.composer__line:focus-within,
.composer__prog:focus-within {
  outline: 2px solid var(--gb-accent);
  outline-offset: 2px;
}

.composer__mood-name {
  font-family: var(--gb-serif);
  font-size: 1.1rem;
  font-weight: 700;
}

.composer__mood-hint {
  font-size: 0.88rem;
  color: var(--gb-muted);
}

.composer__line {
  display: block;
  margin-bottom: 8px;
  padding: 10px 14px;
  font-family: var(--gb-serif);
  font-style: italic;
  font-size: 1.1rem;
}

.composer__prog {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 10px;
  padding: 10px 14px;
}

.composer__prog-pick {
  cursor: pointer;
}

.composer__prog-names {
  font-weight: 700;
  font-variant-numeric: lining-nums;
}

.composer__prog > .gb-btn {
  grid-column: 2;
  grid-row: 1;
}

.composer__diagrams {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.composer__diagrams :deep(.chord-diagram) {
  width: 56px;
  height: auto;
}

.composer > .gb-btn--primary {
  margin-top: 18px;
}
</style>
