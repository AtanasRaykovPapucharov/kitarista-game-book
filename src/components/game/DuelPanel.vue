<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import { useStory } from 'src/game/useStory'
import { cues } from 'src/game/sound'
import DiceTray from './DiceTray.vue'
import TurnToButton from './TurnToButton.vue'

const { t } = useI18n()
const game = useGameStore()
const { enemyName } = useStory()

const duel = computed(() => game.save.duel)
const resolved = computed(() => game.save.resolved)
const last = computed(() => duel.value?.rounds.at(-1) ?? null)
const rolling = ref(false)
const showRound = computed(() => last.value && !rolling.value)

const resultText = computed(() => {
  if (!last.value) return ''
  return { win: t('duel.roundWon'), lose: t('duel.roundLost'), tie: t('duel.roundTie') }[last.value.result]
})

function fight() {
  rolling.value = true
  cues.dice()
  game.duelRound()
}

function settled() {
  rolling.value = false
  if (last.value?.result === 'win') cues.success()
  else if (last.value?.result === 'lose') cues.failure()
}

function luck() {
  game.duelLuck()
  last.value?.luck?.lucky ? cues.success() : cues.failure()
}
</script>

<template>
  <section v-if="duel" class="challenge duel">
    <header class="challenge__head">
      <h2 class="challenge__title">{{ t('duel.title') }}: {{ enemyName(duel.enemy) }}</h2>
      <p class="challenge__rule">{{ t('duel.lostRounds', { lost: duel.lost, max: duel.yieldAfter }) }}</p>
    </header>

    <div class="duel__sides">
      <div class="duel__side">
        <h3 class="duel__name">{{ t('duel.you') }}</h3>
        <p class="duel__stat">
          {{ t('stats.skill') }} {{ game.save.stats.skill }}
          <span v-if="duel.playerBonus" class="duel__bonus">+{{ duel.playerBonus }}</span>
        </p>
        <p class="duel__stat">
          {{ t('stats.inspiration') }} {{ game.save.stats.inspiration }} / {{ game.save.initial.inspiration }}
        </p>
        <DiceTray :values="last?.playerDice ?? null" :size="44" @settled="settled" />
        <p v-if="showRound" class="duel__attack">{{ t('duel.attackValue', { n: last.playerTotal }) }}</p>
      </div>

      <div class="duel__side">
        <h3 class="duel__name">{{ enemyName(duel.enemy) }}</h3>
        <p class="duel__stat">{{ t('duel.enemySkill', { n: duel.enemySkill }) }}</p>
        <div class="duel__nerve" :aria-label="`${t('duel.nerve')} ${duel.enemyStamina} / ${duel.enemyStaminaMax}`">
          <span class="duel__nerve-label">{{ t('duel.nerve') }}</span>
          <span
            v-for="n in duel.enemyStaminaMax"
            :key="n"
            class="pip"
            :class="{ 'is-on': n <= duel.enemyStamina }"
          />
        </div>
        <DiceTray :values="last?.enemyDice ?? null" :size="44" />
        <p v-if="showRound" class="duel__attack">{{ t('duel.attackValue', { n: last.enemyTotal }) }}</p>
      </div>
    </div>

    <p v-if="showRound" class="challenge__outcome" aria-live="polite">
      {{ t('duel.round', { n: duel.rounds.length }) }}. {{ resultText }}
      <template v-if="last.luck"> {{ last.luck.lucky ? t('duel.luckGood') : t('duel.luckBad') }}</template>
    </p>

    <div v-if="!resolved" class="duel__actions">
      <button type="button" class="gb-btn gb-btn--primary" :disabled="rolling" @click="fight">
        {{ t('duel.fight') }}
      </button>
      <button
        v-if="game.canDuelLuck && !rolling"
        type="button"
        class="gb-btn"
        :title="t('duel.luckHelp')"
        @click="luck"
      >
        {{ t('duel.useLuck') }} ({{ game.save.stats.luck }})
      </button>
    </div>
    <p v-if="!resolved && game.canDuelLuck && !rolling" class="challenge__rule">{{ t('duel.luckHelp') }}</p>

    <template v-if="resolved && !rolling">
      <p class="challenge__verdict" :class="resolved.won ? 'is-success' : 'is-failure'">
        <span class="verdict-word">{{ resolved.won ? t('duel.won') : t('duel.lost') }}</span>
      </p>
      <TurnToButton :to="resolved.to" @go="game.continueOn()" />
    </template>
  </section>
</template>

<style scoped>
.duel__sides {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 16px 0;
}

.duel__side {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.duel__name {
  margin: 0;
  font-family: var(--gb-serif);
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
}

.duel__stat,
.duel__attack {
  margin: 0;
  font-family: var(--gb-sans);
  font-size: 0.95rem;
  color: var(--gb-muted);
}

.duel__attack {
  color: var(--gb-ink);
  font-weight: 700;
}

.duel__bonus {
  color: var(--gb-brass);
  font-weight: 700;
}

.duel__nerve {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.duel__nerve-label {
  font-family: var(--gb-sans);
  font-size: 0.95rem;
  color: var(--gb-muted);
  margin-right: 4px;
}

.duel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

@media (max-width: 420px) {
  .duel__sides {
    gap: 12px;
  }
}
</style>
