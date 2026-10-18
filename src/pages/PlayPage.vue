<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
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

const { t } = useI18n()
const $q = useQuasar()
const router = useRouter()
const game = useGameStore()
const { title, paragraphs } = useStory()

const save = computed(() => game.save)
const key = computed(() => save.value?.section)
const section = computed(() => game.section ?? {})
const hasChallenge = computed(() => !!(section.value.test || section.value.roll || section.value.duel))
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
    sheetOpen.value = false
    window.scrollTo({ top: 0 })
    await nextTick()
    titleEl.value?.focus({ preventScroll: true })
  },
)
</script>

<template>
  <q-page v-if="save" class="gb gb-play">
    <div class="gb-play__grid">
      <article :key="save.visit" class="gb-reading">
        <header class="gb-section-head">
          <p class="gb-section-num" aria-hidden="true">{{ game.sectionNumber }}</p>
          <h1 ref="titleEl" class="gb-section-title" tabindex="-1">
            <span class="sr-only">{{ t('play.sectionLabel', { number: game.sectionNumber }) }}. </span>
            {{ title(key, save) }}
          </h1>
        </header>

        <div class="gb-story" :class="{ 'gb-story--prologue': key === 'prologue' }">
          <p v-for="(p, i) in paragraphs(key, save)" :key="i">{{ p }}</p>
        </div>

        <StatChanges v-if="!hasChallenge" :changes="save.lastChanges ?? []" class="gb-entry-changes" />

        <TestPanel v-if="section.test" :test="section.test" />
        <RollPanel v-else-if="section.roll" :roll="section.roll" />
        <DuelPanel v-else-if="section.duel" />

        <ChoiceList v-if="game.choices.length" :section="key" :choices="game.choices" @choose="game.choose" />
        <TurnToButton
          v-else-if="section.next && !hasChallenge"
          :to="section.next"
          class="gb-next"
          @go="game.continueOn()"
        />

        <EndingPanel v-if="section.ending" />
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
