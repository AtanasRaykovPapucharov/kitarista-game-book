<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import { useStory } from 'src/game/useStory'
import { cues } from 'src/game/sound'
import DiceTray from './DiceTray.vue'
import TurnToButton from './TurnToButton.vue'
import StatChanges from './StatChanges.vue'

const props = defineProps({ test: { type: Object, required: true } })

const { t } = useI18n()
const game = useGameStore()
const { testText } = useStory()

const resolved = computed(() => game.save.resolved)
const rolling = ref(false)
const revealed = computed(() => resolved.value && !rolling.value)

const statLabel = computed(() => t(`stats.${props.test.stat}`))
const heading = computed(() => (props.test.stat === 'luck' ? t('play.testLuck') : t('play.testSkill')))

function roll() {
  rolling.value = true
  cues.dice(2)
  game.rollTest()
}

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
        {{ t('play.testRule', { value: resolved?.target ?? game.save.stats[test.stat], stat: statLabel }) }}
        <template v-if="test.stat === 'luck'"> {{ t('play.luckRule') }}</template>
      </p>
    </header>

    <div class="challenge__dice">
      <DiceTray :values="resolved?.dice ?? null" :count="2" @settled="settled" />
      <div v-if="revealed" class="challenge__verdict" :class="resolved.success ? 'is-success' : 'is-failure'">
        <span class="verdict-word">{{ resolved.success ? t('play.success') : t('play.failure') }}</span>
        <span class="verdict-math">{{ resolved.total }} {{ resolved.success ? '≤' : '>' }} {{ resolved.target }}</span>
      </div>
      <button v-else-if="!resolved" type="button" class="gb-btn gb-btn--primary" @click="roll">
        {{ t('play.rollDice') }}
      </button>
    </div>

    <template v-if="revealed">
      <p class="challenge__outcome">{{ testText(game.save.section, resolved.success) }}</p>
      <StatChanges :changes="game.save.lastChanges ?? []" />
      <TurnToButton :to="resolved.to" class="q-mt-md" @go="game.continueOn()" />
    </template>
  </section>
</template>
