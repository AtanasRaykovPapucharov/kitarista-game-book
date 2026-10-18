<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStory } from 'src/game/useStory'
import { progression } from 'src/story/song'
import { playSong } from 'src/game/sound'

/* The reader's song: title, a line and the chords for every verse,
   and a button that plays it on the guitar synth, following along. */

const props = defineProps({
  song: { type: Object, required: true }, // { title, verses: [{ mood, line, prog }] }
  nameable: { type: Boolean, default: false },
  heading: { type: String, default: '' },
})
const emit = defineEmits(['name'])

const { t } = useI18n()
const { lyric, moodName } = useStory()

const draft = ref('')
const playing = ref(false)
const step = ref({ verse: -1, chord: -1 })
let handle = null

const verses = computed(() =>
  props.song.verses.map((v) => ({
    text: lyric(v.mood, v.line),
    mood: moodName(v.mood),
    chords: progression(v.mood, v.prog),
  })),
)

function toggle() {
  if (playing.value) {
    handle?.stop()
    return
  }
  playing.value = true
  handle = playSong(
    verses.value.map((v) => v.chords),
    {
      onStep: (verse, chord) => (step.value = { verse, chord }),
      onEnd: () => {
        playing.value = false
        step.value = { verse: -1, chord: -1 }
      },
    },
  )
}

function saveName() {
  const title = draft.value.trim()
  if (title) emit('name', title)
}

onBeforeUnmount(() => handle?.stop())
</script>

<template>
  <section class="song-card" :aria-label="t('song.yourSong')">
    <p class="song-card__kicker">{{ heading || t('song.yourSong') }}</p>
    <h3 class="song-card__title">{{ song.title || t('song.untitled') }}</h3>

    <form v-if="nameable && !song.title" class="song-card__name" @submit.prevent="saveName">
      <label class="sr-only" for="song-title">{{ t('song.nameIt') }}</label>
      <input
        id="song-title"
        v-model="draft"
        class="song-card__input"
        maxlength="60"
        :placeholder="t('song.namePlaceholder')"
        autocomplete="off"
      />
      <button type="submit" class="gb-btn gb-btn--primary gb-btn--small" :disabled="!draft.trim()">
        {{ t('song.saveName') }}
      </button>
    </form>

    <ol class="song-card__verses">
      <li v-for="(v, vi) in verses" :key="vi" :class="{ 'is-now': step.verse === vi }">
        <p class="song-card__line">{{ v.text }}</p>
        <p class="song-card__chords">
          <span
            v-for="(c, ci) in v.chords"
            :key="ci"
            :class="{ 'is-now': step.verse === vi && step.chord === ci }"
            >{{ c }}</span
          >
          <span class="song-card__mood">{{ v.mood }}</span>
        </p>
      </li>
    </ol>

    <button v-if="verses.length" type="button" class="gb-btn" @click="toggle">
      {{ playing ? t('song.stop') : t('song.play') }}
    </button>
  </section>
</template>

<style scoped>
.song-card {
  margin-top: 22px;
  padding: 18px 20px;
  border: 1px solid var(--gb-rule);
  border-radius: 16px;
  background: var(--gb-surface);
}

.song-card__kicker {
  margin: 0;
  font-family: var(--gb-serif);
  font-style: italic;
  color: var(--gb-muted);
}

.song-card__title {
  margin: 2px 0 10px;
  font-family: var(--gb-serif);
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.15;
  color: var(--gb-accent);
}

.song-card__name {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.song-card__input {
  flex: 1 1 12rem;
  min-height: 40px;
  padding: 6px 12px;
  border: 1.5px solid var(--gb-rule);
  border-radius: 10px;
  background: transparent;
  color: var(--gb-ink);
  font: inherit;
}

.song-card__input:focus {
  outline: 2px solid var(--gb-accent);
  outline-offset: 1px;
}

.song-card__verses {
  margin: 0 0 14px;
  padding-left: 1.4em;
}

.song-card__verses li {
  padding: 4px 0;
  transition: opacity 0.2s ease;
}

.song-card__verses li.is-now .song-card__line {
  color: var(--gb-accent);
}

.song-card__line {
  margin: 0;
  font-family: var(--gb-serif);
  font-style: italic;
  font-size: 1.12rem;
}

.song-card__chords {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin: 2px 0 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--gb-muted);
  font-variant-numeric: lining-nums;
}

.song-card__chords .is-now {
  color: var(--gb-accent);
}

.song-card__mood {
  font-weight: 400;
  font-style: italic;
}

@media (prefers-reduced-motion: reduce) {
  .song-card__verses li {
    transition: none;
  }
}
</style>
