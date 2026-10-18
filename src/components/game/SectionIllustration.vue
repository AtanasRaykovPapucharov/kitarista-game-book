<script setup>
import { computed } from 'vue'
import { ILLUSTRATION_URLS } from 'src/story/illustrations'
import { useStory } from 'src/game/useStory'

/* A section's illustration: it rises out of the dark and drifts
   slowly closer, like a memory coming into focus. */
const props = defineProps({ name: { type: String, required: true } })

const { illustrationAlt } = useStory()
const src = computed(() => ILLUSTRATION_URLS[props.name])
</script>

<template>
  <figure v-if="src" class="gb-illustration">
    <img :src="src" :alt="illustrationAlt(name)" width="1200" height="600" decoding="async" />
  </figure>
</template>

<style scoped>
.gb-illustration {
  position: relative;
  margin: 0 0 24px;
  aspect-ratio: 2 / 1;
  overflow: hidden;
  border-radius: 14px;
  background: #05060f;
  box-shadow: 0 10px 40px -18px rgba(0, 0, 0, 0.8);
}

.gb-illustration--end {
  margin: 32px 0 0;
}

.gb-illustration img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation:
    gb-illustration-rise 1.4s ease-out both,
    gb-illustration-drift 22s ease-out both;
}

/* the edges melt into the page */
.gb-illustration::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 60px 10px rgba(4, 5, 16, 0.55);
}

@keyframes gb-illustration-rise {
  from {
    opacity: 0;
    filter: brightness(0.25) blur(2px);
  }
  to {
    opacity: 1;
    filter: none;
  }
}

@keyframes gb-illustration-drift {
  from {
    transform: scale(1.08);
  }
  to {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .gb-illustration img {
    animation: none;
  }
}
</style>
