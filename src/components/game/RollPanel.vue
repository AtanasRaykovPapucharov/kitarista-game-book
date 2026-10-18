<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import { useStory } from 'src/game/useStory'
import { cues } from 'src/game/sound'
import DiceTray from './DiceTray.vue'
import TurnToButton from './TurnToButton.vue'
import StatChanges from './StatChanges.vue'

const props = defineProps({ roll: { type: Object, required: true } })

const { t } = useI18n()
const game = useGameStore()
const { outcomeText } = useStory()

const resolved = computed(() => game.save.resolved)
const rolling = ref(false)
const revealed = computed(() => resolved.value && !rolling.value)

function doRoll() {
  rolling.value = true
  cues.dice(props.roll.dice)
  game.rollTable()
}
</script>

<template>
  <section class="challenge">
    <header class="challenge__head">
      <h2 class="challenge__title">{{ props.roll.dice > 1 ? t('play.rollDice') : t('play.rollDie') }}</h2>
      <p class="challenge__rule">{{ t('play.rollRule') }}</p>
    </header>
    <div class="challenge__dice">
      <DiceTray :values="resolved?.dice ?? null" :count="props.roll.dice" @settled="rolling = false" />
      <button v-if="!resolved" type="button" class="gb-btn gb-btn--primary" @click="doRoll">
        {{ props.roll.dice > 1 ? t('play.rollDice') : t('play.rollDie') }}
      </button>
    </div>
    <template v-if="revealed">
      <p class="challenge__outcome">{{ outcomeText(game.save.section, resolved.outcomeId) }}</p>
      <StatChanges :changes="game.save.lastChanges ?? []" />
      <TurnToButton :to="resolved.to" class="q-mt-md" @go="game.continueOn()" />
    </template>
  </section>
</template>
