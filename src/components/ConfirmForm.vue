<script setup>
defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="text-h6 text-center q-pa-sm">
    {{ modelValue.message }}
  </div>
</template>
