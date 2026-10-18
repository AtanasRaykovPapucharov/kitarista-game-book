<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from 'src/stores/settings-store'
import { soundOn } from 'src/game/sound'
import {
  narrator,
  narratorSupported,
  speaking,
  speak,
  stop,
  voicesFor,
  voiceFor,
  chooseVoice,
} from 'src/game/narrator'

/* Read-aloud controls for a section: play/stop, the narrator's own
   mute, and a small settings menu (auto-read, choices, voice, speed). */
const props = defineProps({
  texts: { type: Function, required: true }, // () => string[] – what to read, fresh each time
})

const { t } = useI18n()
const settings = useSettingsStore()

const locale = computed(() => settings.locale)
const voices = computed(() => voicesFor(locale.value))
const voice = computed(() => voiceFor(locale.value))
const langName = computed(() => t(`narrator.lang.${locale.value.startsWith('bg') ? 'bg' : 'en'}`))
const voiceOptions = computed(() => voices.value.map((v) => ({ label: v.name, value: v.voiceURI })))

function toggleRead() {
  if (speaking.value) stop()
  else speak(props.texts(), locale.value)
}
</script>

<template>
  <div v-if="narratorSupported" class="narrator">
    <button
      type="button"
      class="narrator__mute"
      :aria-pressed="!narrator.on"
      :aria-label="narrator.on ? t('narrator.turnOff') : t('narrator.turnOn')"
      :title="narrator.on ? t('narrator.turnOff') : t('narrator.turnOn')"
      @click="narrator.on = !narrator.on"
    >
      <q-icon :name="narrator.on ? 'record_voice_over' : 'voice_over_off'" size="20px" />
    </button>

    <template v-if="narrator.on">
      <button
        v-if="voice"
        type="button"
        class="gb-btn gb-btn--small narrator__read"
        :disabled="!soundOn"
        :title="!soundOn ? t('narrator.soundMuted') : undefined"
        @click="toggleRead"
      >
        <q-icon :name="speaking ? 'stop' : 'play_arrow'" size="18px" />
        {{ speaking ? t('narrator.stop') : t('narrator.read') }}
      </button>
      <span v-else class="narrator__note">{{ t('narrator.noVoice', { lang: langName }) }}</span>

      <q-btn
        flat
        dense
        round
        icon="tune"
        size="sm"
        :aria-label="t('narrator.settings')"
        :title="t('narrator.settings')"
      >
        <q-menu anchor="bottom left" self="top left" :offset="[0, 6]">
          <div class="narrator__menu">
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
            <div class="narrator__rate">
              <span>{{ t('narrator.speed') }}</span>
              <q-slider
                v-model="narrator.rate"
                :min="0.7"
                :max="1.4"
                :step="0.05"
                color="accent"
                :aria-label="t('narrator.speed')"
              />
              <span class="narrator__rate-value">{{ narrator.rate.toFixed(2) }}×</span>
            </div>
          </div>
        </q-menu>
      </q-btn>
    </template>
    <span v-else class="narrator__note">{{ t('narrator.off') }}</span>
  </div>
</template>

<style scoped>
.narrator {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  margin: 0 0 18px;
}

.narrator__mute {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--gb-rule);
  border-radius: 50%;
  background: transparent;
  color: var(--gb-muted);
  cursor: pointer;
}

.narrator__mute[aria-pressed='false'] {
  color: var(--gb-accent);
  border-color: var(--gb-accent);
}

.narrator__read {
  gap: 4px;
}

.narrator__note {
  font-size: 0.88rem;
  color: var(--gb-muted);
  max-width: 34rem;
}

.narrator__menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 290px;
  padding: 12px 14px;
}

.narrator__rate {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
}

.narrator__rate-value {
  min-width: 3.4em;
  text-align: right;
  font-variant-numeric: lining-nums tabular-nums;
}
</style>
