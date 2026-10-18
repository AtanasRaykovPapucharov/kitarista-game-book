<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth-store'
import { useGameStore } from 'src/stores/game-store'
import UserAvatar from './UserAvatar.vue'
import {
  AVATAR_OPTIONS,
  isColorPart,
  randomConfig,
  sanitizeConfig,
  seededConfig,
  fileToAvatarImage,
} from './avatar'

/* Build a face from parts, or upload a picture.
   Changes stay a draft until "Save". */
const open = defineModel({ type: Boolean, default: false })

const { t } = useI18n()
const $q = useQuasar()
const auth = useAuthStore()

// the controls, grouped as a person would think of them
const GROUPS = [
  { key: 'skin', parts: ['skin'] },
  { key: 'hair', parts: ['hair', 'hairColor'] },
  { key: 'eyes', parts: ['eyes', 'eyeColor'] },
  { key: 'face', parts: ['nose', 'mouth'] },
  { key: 'accessory', parts: ['accessory'] },
  { key: 'clothes', parts: ['shirt', 'background'] },
]

const config = ref(seededConfig('kitarista'))
const image = ref(null) // data URL of an uploaded picture, or null
const fileInput = ref(null)
const busy = ref(false)

const seed = computed(() => auth.currentUser?.username ?? 'kitarista')
const draft = computed(() =>
  image.value ? { kind: 'image', src: image.value } : { kind: 'built', config: config.value },
)

// start from what is saved each time the dialog opens
watch(open, (isOpen) => {
  if (!isOpen) return
  const saved = auth.currentUser?.avatar
  image.value = saved?.kind === 'image' ? saved.src : null
  config.value = sanitizeConfig(saved?.kind === 'built' ? saved.config : null, seed.value)
})

function set(part, value) {
  image.value = null // choosing a part means building, not the photo
  config.value = { ...config.value, [part]: value }
}

function surprise() {
  image.value = null
  config.value = randomConfig()
}

function reset() {
  image.value = null
  config.value = seededConfig(seed.value)
}

async function upload(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  busy.value = true
  try {
    image.value = await fileToAvatarImage(file)
  } catch {
    $q.notify({ message: t('avatar.badImage'), color: 'negative' })
  } finally {
    busy.value = false
  }
}

function save() {
  const ok = auth.setAvatar(draft.value)
  $q.notify({
    message: ok ? t('avatar.saved') : t('avatar.badImage'),
    color: ok ? 'positive' : 'negative',
  })
  if (ok) {
    useGameStore().award('new_face')
    open.value = false
  }
}

const optionLabel = (part, value, i) =>
  isColorPart(part) ? t('avatar.colorN', { n: i + 1 }) : t(`avatar.options.${part}.${value}`)
</script>

<template>
  <q-dialog v-model="open">
    <q-card class="avatar-builder">
      <q-card-section class="ab-head">
        <div class="ab-title">{{ t('avatar.title') }}</div>
        <q-btn v-close-popup flat round dense icon="close" :aria-label="t('common.close')" />
      </q-card-section>

      <q-card-section class="ab-body">
        <div class="ab-preview">
          <UserAvatar :avatar="draft" :size="148" :alt="t('avatar.preview')" />
          <div class="ab-preview-actions">
            <button type="button" class="gb-btn gb-btn--small" @click="surprise">
              <q-icon name="casino" size="18px" class="q-mr-xs" />{{ t('avatar.surprise') }}
            </button>
            <button
              type="button"
              class="gb-btn gb-btn--small"
              :disabled="busy"
              @click="fileInput?.click()"
            >
              <q-icon name="photo_camera" size="18px" class="q-mr-xs" />{{ t('avatar.upload') }}
            </button>
            <input
              ref="fileInput"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              @change="upload"
            />
            <button v-if="image" type="button" class="gb-link" @click="image = null">
              {{ t('avatar.removePhoto') }}
            </button>
            <button v-else type="button" class="gb-link" @click="reset">
              {{ t('avatar.reset') }}
            </button>
          </div>
          <p class="ab-note">{{ image ? t('avatar.photoNote') : t('avatar.builtNote') }}</p>
        </div>

        <div class="ab-controls" :class="{ 'is-muted': image }">
          <section v-for="g in GROUPS" :key="g.key" class="ab-group">
            <h3 class="ab-group-title">{{ t(`avatar.groups.${g.key}`) }}</h3>
            <div v-for="part in g.parts" :key="part" class="ab-part">
              <span v-if="g.parts.length > 1" class="ab-part-label">{{
                t(`avatar.parts.${part}`)
              }}</span>
              <div class="ab-options" role="radiogroup" :aria-label="t(`avatar.parts.${part}`)">
                <button
                  v-for="(value, i) in AVATAR_OPTIONS[part]"
                  :key="value"
                  type="button"
                  role="radio"
                  :aria-checked="!image && config[part] === value"
                  :aria-label="optionLabel(part, value, i)"
                  :title="optionLabel(part, value, i)"
                  :class="[
                    isColorPart(part) ? 'ab-swatch' : 'ab-pill',
                    { 'is-on': !image && config[part] === value },
                  ]"
                  :style="isColorPart(part) ? { backgroundColor: value } : undefined"
                  @click="set(part, value)"
                >
                  <template v-if="!isColorPart(part)">{{ optionLabel(part, value, i) }}</template>
                </button>
              </div>
            </div>
          </section>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="ab-actions">
        <q-btn v-close-popup flat no-caps :label="t('common.cancel')" />
        <q-btn unelevated no-caps color="primary" :label="t('avatar.save')" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.avatar-builder {
  width: 860px;
  max-width: calc(100vw - 24px);
  background: var(--gb-paper);
  color: var(--gb-ink);
  font-family: var(--gb-sans);
}

.ab-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0;
}

.ab-title {
  font-family: var(--gb-serif);
  font-size: 1.5rem;
  font-weight: 800;
}

.ab-body {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.ab-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: sticky;
  top: 0;
  align-self: start;
}

.ab-preview-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  width: 100%;
}

.ab-preview-actions .gb-link {
  align-self: center;
}

.ab-note {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--gb-muted);
  text-align: center;
}

.ab-controls {
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: opacity 0.2s ease;
}

.ab-controls.is-muted {
  opacity: 0.55;
}

.ab-group-title {
  margin: 0 0 6px;
  font-size: 1rem;
  font-weight: 700;
}

.ab-part {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  margin-bottom: 6px;
}

.ab-part-label {
  min-width: 4.5rem;
  font-size: 0.88rem;
  color: var(--gb-muted);
}

.ab-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ab-swatch {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--gb-rule);
  cursor: pointer;
  padding: 0;
}

.ab-swatch.is-on {
  border-color: var(--gb-ink);
  box-shadow: 0 0 0 3px var(--gb-accent);
}

.ab-pill {
  min-height: 32px;
  padding: 4px 12px;
  border: 1.5px solid var(--gb-rule);
  border-radius: 999px;
  background: transparent;
  color: var(--gb-ink);
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
}

.ab-pill.is-on {
  border-color: var(--gb-accent);
  background: var(--gb-hover);
  font-weight: 700;
}

.ab-swatch:focus-visible,
.ab-pill:focus-visible {
  outline: 2px solid var(--gb-accent);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .ab-body {
    grid-template-columns: 1fr;
  }

  .ab-preview {
    position: static;
  }

  .ab-preview-actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ab-controls {
    transition: none;
  }
}
</style>
