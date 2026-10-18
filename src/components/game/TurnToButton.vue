<script setup>
import { useI18n } from 'vue-i18n'
import { sectionNumber } from 'src/story/book'

/* The book's signature move: "turn to 27". */
const props = defineProps({
  to: { type: String, required: true },
  label: { type: String, default: '' },
})
defineEmits(['go'])
const { t } = useI18n()
</script>

<template>
  <button type="button" class="turn-to" @click="$emit('go')">
    <span class="turn-to__label">{{ props.label || t('play.continue') }}</span>
    <span class="turn-to__num" :aria-label="t('play.turnTo', { number: sectionNumber(to) })">
      {{ sectionNumber(to) }}
    </span>
  </button>
</template>
