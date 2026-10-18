<script setup>
import { computed } from 'vue'
import { useAuthStore } from 'src/stores/auth-store'
import { avatarSrc } from './avatar'

/* A user's avatar as a round picture – the built face, the uploaded
   photo, or (by default) a face generated from the username. */
const props = defineProps({
  user: { type: Object, default: null }, // defaults to whoever is logged in
  avatar: { type: Object, default: undefined }, // a draft to preview instead of the saved one
  size: { type: [Number, String], default: 40 },
  alt: { type: String, default: '' },
})

const auth = useAuthStore()
const who = computed(() => props.user ?? auth.currentUser)
const src = computed(() =>
  avatarSrc(
    props.avatar !== undefined ? props.avatar : who.value?.avatar,
    who.value?.username ?? 'kitarista',
  ),
)
const px = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <img
    class="user-avatar"
    :src="src"
    :alt="alt"
    :width="px"
    :height="px"
    :style="{ width: px, height: px }"
  />
</template>

<style scoped>
.user-avatar {
  display: inline-block;
  flex: none;
  border-radius: 50%;
  object-fit: cover;
  background: var(--gb-surface, #1c2042);
}
</style>
