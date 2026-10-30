<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import { useStory } from 'src/game/useStory'
import { cues } from 'src/game/sound'
import DiceTray from './DiceTray.vue'
import TurnToButton from './TurnToButton.vue'
import MusicMove from './MusicMove.vue'
import StatChanges from './StatChanges.vue'

const props = defineProps({ test: { type: Object, required: true } })

const { t } = useI18n()
const game = useGameStore()
const { testText } = useStory()

const resolved = computed(() => game.save.resolved)
const rolling = ref(false)
const revealed = computed(() => resolved.value && !rolling.value)

const statLabel = computed(() => t(`stats.${props.test.stat}`))
const heading = computed(() =>
  props.test.stat === 'luck' ? t('play.testLuck') : t('play.testSkill'),
)

function roll(bonus = 0) {
  asking.value = false
  rolling.value = true
  cues.dice(2)
  game.rollTest({ bonus })
}

/* a music move: what the practice room taught makes the test easier */
const asking = ref(false)
const topics = computed(() => game.musicTopics)
const answered = (correct) => roll(correct ? 2 : -1)

function settled() {
  rolling.value = false
  resolved.value?.success ? cues.success() : cues.failure()
}
</script>

<template>
  <section class="challenge" :aria-label="heading">
    <header class="challenge__head">
      <h2 class="challenge__title">{{ heading }}</h2>
      <p class="challenge__rule">
        {{
          t('play.testRule', {
            value: resolved?.target ?? game.save.stats[test.stat],
            stat: statLabel,
          })
        }}
        <template v-if="test.stat === 'luck'"> {{ t('play.luckRule') }}</template>
      </p>
    </header>

    <div class="challenge__dice">
      <DiceTray :values="resolved?.dice ?? null" :count="2" @settled="settled" />
      <div
        v-if="revealed"
        class="challenge__verdict"
        :class="resolved.success ? 'is-success' : 'is-failure'"
      >
        <span class="verdict-word">{{
          resolved.success ? t('play.success') : t('play.failure')
        }}</span>
        <span class="verdict-math"
          >{{ resolved.total }} {{ resolved.success ? '≤' : '>' }} {{ resolved.target }}</span
        >
      </div>
      <div v-else-if="!resolved && !asking" class="challenge__actions">
        <button
          v-if="topics.length"
          type="button"
          class="gb-btn"
          :title="t('play.testMusicHelp')"
          @click="asking = true"
        >
          <q-icon name="music_note" size="18px" class="q-mr-xs" />{{ t('duel.musicMove') }}
        </button>
        <button type="button" class="gb-btn gb-btn--primary" @click="roll()">
          {{ t('play.rollDice') }}
        </button>
      </div>
    </div>

    <MusicMove
      v-if="asking && !resolved"
      :topics="topics"
      @answer="answered"
      @cancel="asking = false"
    />
    <p v-if="!resolved && !asking && topics.length" class="challenge__rule">
      {{ t('play.testMusicHelp') }}
    </p>

    <template v-if="revealed">
      <p class="challenge__outcome">
        {{ testText(game.save.section, resolved.success) }}
        <template v-if="resolved.music">
          {{ resolved.music > 0 ? t('play.testMusicHit') : t('play.testMusicMiss') }}
        </template>
      </p>
      <StatChanges :changes="game.save.lastChanges ?? []" />
      <TurnToButton :to="resolved.to" class="q-mt-md" @go="game.continueOn()" />
    </template>
  </section>
</template>
