<script setup>
import { useStory } from 'src/game/useStory'
import TurnToButton from './TurnToButton.vue'

defineProps({
  section: { type: String, required: true },
  choices: { type: Array, required: true },
})
defineEmits(['choose'])
const { choiceText } = useStory()
</script>

<template>
  <nav class="choice-list">
    <TurnToButton
      v-for="c in choices"
      :key="c.id"
      :to="c.to"
      :label="choiceText(section, c.id)"
      @go="$emit('choose', c.id)"
    />
  </nav>
</template>

<style scoped>
.choice-list {
  display: flex;
  flex-direction: column;
}
</style>
