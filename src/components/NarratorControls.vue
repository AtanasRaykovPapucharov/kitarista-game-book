<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from 'src/stores/settings-store'
import { soundOn } from 'src/game/sound'
import {
  narrator,
  narratorSupported,
  speaking,
  canRead,
  readCurrent,
  stop,
  voicesFor,
  voiceFor,
  chooseVoice,
} from 'src/game/narrator'

/* The narrator's controls, in the app header – out of the story text.
   A play/stop button appears only where there is something to read;
   the menu holds the on/off switch, the settings and any notice
   (no voice for this language, sound muted). */

const { t } = useI18n()
const settings = useSettingsStore()

const locale = computed(() => settings.locale)
const voice = computed(() => voiceFor(locale.value))
const voiceOptions = computed(() =>
  voicesFor(locale.value).map((v) => ({ label: v.name, value: v.voiceURI })),
)
const langName = computed(() => t(`narrator.lang.${locale.value.startsWith('bg') ? 'bg' : 'en'}`))
const canPlay = computed(() => narrator.on && canRead.value && !!voice.value && soundOn.value)
const notice = computed(() => {
  if (!narrator.on) return ''
  if (!voice.value) return t('narrator.noVoice', { lang: langName.value })
  if (!soundOn.value) return t('narrator.soundMuted')
  return ''
})

function toggleRead() {
  if (speaking.value) stop()
  else readCurrent(locale.value)
}
</script>

<template>
  <template v-if="narratorSupported">
    <q-btn
      v-if="canPlay"
      flat
      dense
      round
      :icon="speaking ? 'stop_circle' : 'play_circle'"
      :aria-label="speaking ? t('narrator.stop') : t('narrator.read')"
      :title="speaking ? t('narrator.stop') : t('narrator.read')"
      @click="toggleRead"
    />

    <q-btn
      flat
      dense
      round
      :icon="narrator.on ? 'record_voice_over' : 'voice_over_off'"
      :aria-label="t('narrator.settings')"
      :title="t('narrator.settings')"
    >
      <q-badge
        v-if="notice"
        floating
        rounded
        color="warning"
        class="narrator-dot"
        aria-hidden="true"
      />
      <q-menu anchor="bottom middle" self="top middle" :offset="[0, 6]">
        <div class="narrator-menu">
          <q-toggle
            v-model="narrator.on"
            :label="t('narrator.on')"
            color="accent"
            checked-icon="record_voice_over"
            unchecked-icon="voice_over_off"
          />

          <p v-if="notice" class="narrator-menu__notice" role="status">{{ notice }}</p>

          <template v-if="narrator.on">
            <button
              v-if="canPlay"
              type="button"
              class="gb-btn gb-btn--small narrator-menu__read"
              @click="toggleRead"
            >
              <q-icon :name="speaking ? 'stop' : 'play_arrow'" size="18px" />
              {{ speaking ? t('narrator.stop') : t('narrator.read') }}
            </button>
            <q-toggle v-model="narrator.auto" :label="t('narrator.auto')" color="accent" />
            <q-toggle v-model="narrator.choices" :label="t('narrator.choices')" color="accent" />
            <q-select
              v-if="voiceOptions.length"
              :model-value="voice?.voiceURI"
              :options="voiceOptions"
              emit-value
              map-options
              dense
              outlined
              :label="t('narrator.voice')"
              @update:model-value="(uri) => chooseVoice(locale, uri)"
            />
            <div class="narrator-menu__rate">
              <span>{{ t('narrator.speed') }}</span>
              <q-slider
                v-model="narrator.rate"
                :min="0.7"
                :max="1.4"
                :step="0.05"
                color="accent"
                :aria-label="t('narrator.speed')"
              />
              <span class="narrator-menu__value">{{ narrator.rate.toFixed(2) }}×</span>
            </div>
          </template>
        </div>
      </q-menu>
    </q-btn>
  </template>
</template>

<style scoped>
.narrator-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
  max-width: calc(100vw - 24px);
  padding: 12px 14px;
}

.narrator-menu__notice {
  margin: 0;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--app-surface-soft);
  color: var(--app-text);
  font-size: 0.9rem;
  line-height: 1.4;
}

.narrator-menu__read {
  align-self: flex-start;
  gap: 4px;
}

.narrator-menu__rate {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
}

.narrator-menu__value {
  min-width: 3.4em;
  text-align: right;
  font-variant-numeric: lining-nums tabular-nums;
}

.narrator-dot {
  top: 2px;
  right: 2px;
  min-width: 8px;
  min-height: 8px;
  padding: 0;
}
</style>
