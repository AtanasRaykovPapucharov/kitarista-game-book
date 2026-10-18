<script setup>
import { useI18n } from 'vue-i18n'
import { sectionNumber } from 'src/story/book'
import { useGameStore } from 'src/stores/game-store'

/* The book's signature move: "turn to 27". */
const props = defineProps({
  to: { type: String, required: true },
  label: { type: String, default: '' },
})
defineEmits(['go'])
const { t } = useI18n()
const game = useGameStore() // the book waits until an earned verse is written
</script>

<template>
  <button v-if="!game.songPending" type="button" class="turn-to" @click="$emit('go')">
    <span class="turn-to__label">{{ props.label || t('play.continue') }}</span>
    <span class="turn-to__num" :aria-label="t('play.turnTo', { number: sectionNumber(to) })">
      {{ sectionNumber(to) }}
    </span>
  </button>
</template>
