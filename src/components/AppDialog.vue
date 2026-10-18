<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import logo from '@/assets/logo.png'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  persistent: { type: Boolean, default: false },
  position: { type: String, default: undefined },
  maximized: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
  width: { type: String, default: 'auto' },
  title: { type: String, default: '' },
  showClose: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'hide'])
const { t } = useI18n({ useScope: 'global' })

const isDialogOpen = ref(props.modelValue)
const isOpen = computed({
  get: () => isDialogOpen.value,
  set: (value) => {
    isDialogOpen.value = value
    emit('update:modelValue', value)
  },
})

watch(
  () => props.modelValue,
  (value) => {
    isDialogOpen.value = value
  },
)

defineExpose({
  show: () => {
    isDialogOpen.value = true
  },
  hide: () => {
    isDialogOpen.value = false
  },
})
</script>

<template>
  <q-dialog
    ref="dialog"
    v-model="isOpen"
    :position="position"
    :persistent="persistent"
    :full-width="fullWidth"
    :maximized="maximized"
    transition-duration="500"
    @hide="$emit('hide')"
  >
    <q-card class="app-dialog" :style="{ width, minWidth: '320px' }">
      <q-bar class="app-dialog__header">
        <q-toolbar-title class="app-title">
          <img :src="logo" alt="" role="button" tabindex="0" class="app-dialog__logo" />
          <span class="text-h5 q-ml-sm" style="position: relative; top: -6px">{{
            t('appName')
          }}</span>
        </q-toolbar-title>
        <q-btn
          v-if="showClose"
          class="app-dialog__close"
          dense
          flat
          icon="close"
          color="red-5"
          v-close-popup
        >
          <q-tooltip>{{ t('common.close') }}</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section class="app-dialog__content">
        <div v-if="title" class="app-dialog__title q-ml-sm">{{ title }}</div>
        <slot />
      </q-card-section>
      <q-card-actions v-if="$slots.actions" align="right">
        <slot name="actions" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.app-dialog__header {
  position: relative;
  height: 50px;
  background: linear-gradient(105deg, var(--app-header-start), var(--app-header-end));
}

.app-dialog__logo {
  width: 30px;
  height: 30px;
  margin-top: 10px;
  border-radius: 6px;
  object-fit: cover;
  flex: 0 0 auto;
  cursor: pointer;
}

.app-dialog__title {
  padding: 0 32px 0 12px;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-align: center;
}

.app-dialog__close {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
}

.app-dialog__content {
  max-height: 70vh;
  overflow: auto;
}

.app-dialog {
  background: var(--app-surface);
  color: var(--app-text);
}
</style>
