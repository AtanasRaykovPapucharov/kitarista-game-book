<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useGameStore } from 'src/stores/game-store'
import { rollHero } from 'src/game/engine'
import { cues } from 'src/game/sound'
import DiceTray from 'src/components/game/DiceTray.vue'

const REROLLS = 2
const ROWS = [
  { stat: 'skill', count: 1, base: 6 },
  { stat: 'inspiration', count: 2, base: 12 },
  { stat: 'luck', count: 1, base: 6 },
]

const { t } = useI18n()
const router = useRouter()
const game = useGameStore()

const hero = ref(null)
const rolls = ref(0)
const settledCount = ref(0)
const settled = computed(() => hero.value && settledCount.value >= ROWS.length)
const left = computed(() => REROLLS - Math.max(0, rolls.value - 1))

function roll() {
  settledCount.value = 0
  hero.value = rollHero()
  rolls.value += 1
  cues.dice(4) // 1 + 2 + 1 dice for the three stats
}

function begin() {
  game.start(hero.value)
  router.push({ name: 'play' })
}
</script>

<template>
  <q-page class="gb gb-hero">
    <div class="gb-narrow">
      <h1 class="gb-page-title">{{ t('hero.title') }}</h1>
      <p class="gb-lead">{{ t('hero.lead') }}</p>

      <dl class="gb-hero__rows">
        <div v-for="row in ROWS" :key="row.stat" class="gb-hero__row">
          <dt>
            <span class="gb-hero__stat">{{ t(`stats.${row.stat}`) }}</span>
            <span class="gb-hero__help">{{ t(`statsHelp.${row.stat}`) }}</span>
          </dt>
          <dd>
            <DiceTray :values="hero?.dice[row.stat] ?? null" :count="row.count" :size="46" @settled="settledCount++" />
            <span class="gb-hero__formula">+ {{ row.base }} =</span>
            <strong class="gb-hero__value">{{ settled ? hero.stats[row.stat] : '–' }}</strong>
          </dd>
        </div>
        <div class="gb-hero__row">
          <dt>
            <span class="gb-hero__stat">{{ t('stats.darkness') }}</span>
            <span class="gb-hero__help">{{ t('hero.darknessNote') }}</span>
          </dt>
          <dd><strong class="gb-hero__value">0</strong></dd>
        </div>
      </dl>

      <div class="gb-hero__actions">
        <button v-if="!hero" type="button" class="gb-btn gb-btn--primary" @click="roll">{{ t('hero.roll') }}</button>
        <template v-else>
          <button type="button" class="gb-btn gb-btn--primary" :disabled="!settled" @click="begin">
            {{ t('hero.begin') }}
          </button>
          <button v-if="left > 0" type="button" class="gb-btn" :disabled="!settled" @click="roll">
            {{ t('hero.reroll', { left }) }}
          </button>
          <span v-else class="gb-note">{{ t('hero.noRerolls') }}</span>
        </template>
      </div>
    </div>
  </q-page>
</template>
