<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from 'src/stores/game-store'
import { useStory } from 'src/game/useStory'
import TestPanel from 'src/components/game/TestPanel.vue'
import RollPanel from 'src/components/game/RollPanel.vue'
import DuelPanel from 'src/components/game/DuelPanel.vue'
import ChoiceList from 'src/components/game/ChoiceList.vue'
import TurnToButton from 'src/components/game/TurnToButton.vue'
import StatChanges from 'src/components/game/StatChanges.vue'
import AdventureSheet from 'src/components/game/AdventureSheet.vue'
import EndingPanel from 'src/components/game/EndingPanel.vue'
import LessonPanel from 'src/components/game/LessonPanel.vue'
import SongComposer from 'src/components/game/SongComposer.vue'
import SongCard from 'src/components/game/SongCard.vue'
import { narrator, readingIndex, speak, setReader, stop as stopNarrator } from 'src/game/narrator'
import SectionIllustration from 'src/components/game/SectionIllustration.vue'
import MissionCard from 'src/components/game/MissionCard.vue'
import MissionResult from 'src/components/game/MissionResult.vue'
import { SECTION_ILLUSTRATIONS, ILLUSTRATIONS_AT_END } from 'src/story/illustrations'
import { SECTIONS, sectionNumber } from 'src/story/book'
import { ENDINGS, DARKNESS_MAX } from 'src/story/book'
import { useSettingsStore } from 'src/stores/settings-store'
import { cues } from 'src/game/sound'

const { t } = useI18n()
const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const game = useGameStore()
const { title, paragraphs, choiceText } = useStory()
const settings = useSettingsStore()

/* What the narrator reads: the title, the text, then (optionally) the choices. */
function narration() {
  const s = save.value
  if (!s) return []
  const out = [title(key.value, s), ...paragraphs(key.value, s)]
  if (narrator.choices && game.choices.length) {
    out.push(t('narrator.choicesIntro'), ...game.choices.map((c) => choiceText(key.value, c.id)))
  }
  return out
}
const illustration = computed(() => SECTION_ILLUSTRATIONS[key.value] ?? null)
const illustrationAtEnd = computed(() => ILLUSTRATIONS_AT_END.includes(key.value))

/* The page itself shows how much of you belongs to the voice: the edges
   darken as Darkness grows, and at 6+ they slowly breathe. Endings set a mood. */
const darkness = computed(() => (save.value?.stats.darkness ?? 0) / DARKNESS_MAX)
const pageClass = computed(() => ({
  'is-haunted': (save.value?.stats.darkness ?? 0) >= 6,
  [`ending-${ENDINGS[save.value?.endingId]?.tone}`]: save.value?.status === 'ended',
  [`ending-${save.value?.endingId}`]: save.value?.status === 'ended',
}))

// readingIndex 0 is the title; paragraphs start at 1
const readingParagraph = computed(() => readingIndex.value - 1)

const save = computed(() => game.save)

/* Looking back: /play?read=<section> shows a chapter already read.
   Nothing can be changed there – the buttons below are disabled. */
const revisiting = computed(() => {
  const k = route.query.read
  return typeof k === 'string' && k !== save.value?.section && save.value?.trail?.includes(k)
    ? k
    : null
})
const key = computed(() => revisiting.value ?? save.value?.section)
const section = computed(() =>
  revisiting.value ? (SECTIONS[revisiting.value] ?? {}) : (game.section ?? {}),
)
const backToNow = () => router.replace({ path: '/play' })
const hasChallenge = computed(
  () => !!(section.value.test || section.value.roll || section.value.duel || section.value.lesson),
)
const sheetOpen = ref(false)
const titleEl = ref(null)
const wide = computed(() => $q.screen.gt.sm)

// no adventure (or it was abandoned from the sheet) → create a hero first
watch(
  save,
  (s) => {
    if (!s) router.replace({ name: 'hero' })
  },
  { immediate: true },
)

// a new section is a new page of the book
watch(
  () => save.value?.visit,
  async (visit, old) => {
    if (old === undefined) return
    stopNarrator()
    cues.page()
    sheetOpen.value = false
    window.scrollTo({ top: 0 })
    await nextTick()
    titleEl.value?.focus({ preventScroll: true })
    // the click that turned the page counts as permission to speak
    if (narrator.auto) setTimeout(() => speak(narration(), settings.locale), 450)
  },
)

watch(
  () => settings.locale,
  () => stopNarrator(),
)
// the header's narrator controls read this section
onMounted(() => setReader(narration))
onBeforeUnmount(() => {
  setReader(null)
  stopNarrator()
})
</script>

<template>
  <q-page v-if="save" class="gb gb-play" :class="pageClass" :style="{ '--darkness': darkness }">
    <div class="gb-play__grid">
      <article :key="save.visit" class="gb-reading">
        <MissionResult />
        <header class="gb-section-head">
          <p class="gb-section-num" aria-hidden="true">{{ game.sectionNumber }}</p>
          <h1 ref="titleEl" class="gb-section-title" tabindex="-1">
            <span class="sr-only"
              >{{ t('play.sectionLabel', { number: game.sectionNumber }) }}.
            </span>
            {{ title(key, save) }}
          </h1>
        </header>

        <p v-if="revisiting" class="gb-revisit" role="status">
          {{ t('play.revisiting', { n: sectionNumber(revisiting) }) }}
          <button type="button" class="gb-link" @click="backToNow">
            {{ t('play.backToNow') }}
          </button>
        </p>

        <SectionIllustration
          v-if="illustration && !illustrationAtEnd"
          :key="illustration"
          :name="illustration"
        />

        <div class="gb-story" :class="{ 'gb-story--prologue': key === 'prologue' }">
          <p
            v-for="(p, i) in paragraphs(key, save)"
            :key="i"
            :class="{ 'is-reading': readingParagraph === i }"
          >
            {{ p }}
          </p>
        </div>

        <StatChanges
          v-if="!hasChallenge && !revisiting"
          :changes="save.lastChanges ?? []"
          class="gb-entry-changes"
        />

        <div :inert="revisiting ? true : undefined" :class="{ 'gb-readonly': revisiting }">
          <TestPanel v-if="section.test" :test="section.test" />
          <RollPanel v-else-if="section.roll" :roll="section.roll" />
          <DuelPanel v-else-if="section.duel" />
          <LessonPanel v-else-if="section.lesson" :lesson="section.lesson" />

          <MissionCard v-if="section.mission" :id="section.mission" />

          <SongComposer v-if="game.songPending" />
          <SongCard v-else-if="section.showSong && game.song.verses.length" :song="game.song" />

          <ChoiceList
            v-if="game.choices.length"
            :section="key"
            :choices="game.choices"
            @choose="game.choose"
          />
          <TurnToButton
            v-else-if="section.next && !hasChallenge"
            :to="section.next"
            class="gb-next"
            @go="game.continueOn()"
          />
        </div>

        <EndingPanel v-if="section.ending" />

        <SectionIllustration
          v-if="illustration && illustrationAtEnd"
          :key="`end-${illustration}`"
          :name="illustration"
          class="gb-illustration--end"
        />
      </article>

      <AdventureSheet v-if="wide" sticky class="gb-play__sheet" />
    </div>

    <template v-if="!wide">
      <q-page-sticky position="bottom-right" :offset="[16, 16]">
        <q-btn
          fab
          unelevated
          color="primary"
          icon="assignment"
          :aria-label="t('play.openSheet')"
          @click="sheetOpen = true"
        />
      </q-page-sticky>
      <q-dialog v-model="sheetOpen" position="bottom">
        <q-card class="gb gb-sheet-dialog">
          <q-card-section>
            <AdventureSheet />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn v-close-popup flat no-caps :label="t('common.close')" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </template>
  </q-page>
</template>
