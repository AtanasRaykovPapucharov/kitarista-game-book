<script setup>
import { useI18n } from 'vue-i18n'
import { useStory } from 'src/game/useStory'

defineProps({ changes: { type: Array, default: () => [] } })

const { t } = useI18n()
const { itemName } = useStory()

const sign = (n) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`)

function label(c) {
  if (c.kind === 'stat') return `${sign(c.delta)} ${t(`stats.${c.id}`)}`
  if (c.kind === 'item') return `${c.delta > 0 ? '+' : '−'} ${itemName(c.id)}`
  if (c.kind === 'song') return `${sign(c.delta)} ${t('stats.song')}`
  return ''
}

const tone = (c) => {
  if (c.kind === 'stat' && c.id === 'darkness') return c.delta > 0 ? 'dark' : 'good'
  return c.delta > 0 ? 'good' : 'bad'
}
</script>

<template>
  <ul v-if="changes.length" class="stat-changes">
    <li v-for="(c, i) in changes" :key="i" :class="`is-${tone(c)}`">{{ label(c) }}</li>
  </ul>
</template>

<style scoped>
.stat-changes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: var(--gb-sans);
  font-size: 0.92rem;
  font-weight: 500;
}

.is-good {
  color: var(--gb-good);
}

.is-bad {
  color: var(--gb-bad);
}

.is-dark {
  color: var(--gb-nebula);
}
</style>
