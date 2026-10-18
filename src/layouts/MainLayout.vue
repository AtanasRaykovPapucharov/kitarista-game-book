<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import { soundOn, toggleSound, volume, setVolume, cues } from '@/game/sound'
import NarratorControls from '@/components/NarratorControls.vue'
import UserAvatar from '@/components/avatar/UserAvatar.vue'
import logo from '@/assets/logo.png'

const { t } = useI18n()
const $q = useQuasar()
const settings = useSettingsStore()
const auth = useAuthStore()
const router = useRouter()
const drawerWidth = 300

function logout() {
  auth.logout()
  $q.notify({ message: t('auth.loggedOut') })
  router.push({ name: 'cover' })
}

const localeOptions = [
  { value: 'en-US', label: 'English' },
  { value: 'bg', label: 'Български' },
]

const currentLocaleLabel = computed(
  () => localeOptions.find((l) => l.value === settings.locale)?.label ?? settings.locale,
)

const bookItems = [
  { to: '/', label: 'nav.book', icon: 'auto_stories' },
  { to: '/rules', label: 'nav.rules', icon: 'casino' },
  { to: '/profile', label: 'nav.profile', icon: 'person' },
]

const navItems = [
  { to: '/tones', label: 'nav.tones', icon: 'music_note' },
  { to: '/intervals', label: 'nav.intervals', icon: 'timeline' },
  { to: '/chords', label: 'nav.chords', icon: 'image_aspect_ratio' },
  { to: '/scales', label: 'nav.scales', icon: 'music_note' },
  { to: '/notes', label: 'nav.notes', icon: 'library_music' },
  { to: '/compas', label: 'nav.compas', icon: 'fa fa-guitar' },
  { to: '/tuner', label: 'nav.tuner', icon: 'tune' },

  // { to: '/flamenco', label: 'nav.flamenco', icon: 'fa fa-guitar' },
  // { to: '/about', label: 'nav.about', icon: 'info' },
]

const footerItems = [
  { to: '/creators', label: 'nav.creators', icon: 'groups' },
  { to: '/support', label: 'nav.support', icon: 'favorite' },
  { to: '/privacy', label: 'nav.privacy', icon: 'shield' },
]

const volumePercent = computed(() => Math.round(volume.value * 100))
const volumeIcon = computed(() => {
  if (!soundOn.value || volume.value === 0) return 'volume_off'
  return volume.value < 0.5 ? 'volume_down' : 'volume_up'
})

// play a short chord when the slider is released, so the level can be heard
function previewVolume() {
  cues.chime()
}

const leftDrawerOpen = ref(false)

// same breakpoint as NoteSheet's settings drawer
const isMobile = computed(() => $q.screen.lt.sm)

function openLeftDrawer() {
  leftDrawerOpen.value = true
}

function closeLeftDrawer() {
  leftDrawerOpen.value = false
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="app-header text-white">
      <q-toolbar>
        <q-toolbar-title class="app-title">
          <img
            :src="logo"
            alt=""
            role="button"
            tabindex="0"
            :aria-label="t('nav.openMenu')"
            class="app-logo"
            @click="openLeftDrawer"
            @keydown.enter.prevent="openLeftDrawer"
            @keydown.space.prevent="openLeftDrawer"
          />
          <span v-if="$q.screen.gt.xs" class="app-name">{{ t('appName') }}</span>
        </q-toolbar-title>

        <NarratorControls />

        <q-btn
          flat
          dense
          round
          :icon="volumeIcon"
          :aria-label="t('nav.volume')"
          :title="t('nav.volume')"
        >
          <q-menu anchor="bottom middle" self="top middle" :offset="[0, 6]">
            <div class="volume-menu">
              <q-btn
                flat
                dense
                round
                :icon="soundOn ? 'volume_up' : 'volume_off'"
                :aria-label="soundOn ? t('nav.soundOff') : t('nav.soundOn')"
                :title="soundOn ? t('nav.soundOff') : t('nav.soundOn')"
                @click="toggleSound"
              />
              <q-slider
                class="volume-slider"
                :model-value="soundOn ? volumePercent : 0"
                :min="0"
                :max="100"
                :step="5"
                color="accent"
                :aria-label="t('nav.volume')"
                @update:model-value="(v) => setVolume(v / 100)"
                @change="previewVolume"
              />
              <span class="volume-value">{{ soundOn ? volumePercent : 0 }}%</span>
            </div>
          </q-menu>
        </q-btn>

        <q-btn
          flat
          dense
          round
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          :aria-label="$q.dark.isActive ? t('nav.lightMode') : t('nav.darkMode')"
          :title="$q.dark.isActive ? t('nav.lightMode') : t('nav.darkMode')"
          @click="$q.dark.toggle()"
        />

        <q-btn-dropdown
          flat
          no-caps
          icon="translate"
          :label="$q.screen.gt.xs ? currentLocaleLabel : undefined"
          :aria-label="t('nav.language')"
        >
          <q-list>
            <q-item
              v-for="loc in localeOptions"
              :key="loc.value"
              v-close-popup
              clickable
              dense
              :active="settings.locale === loc.value"
              @click="settings.setLocale(loc.value)"
            >
              <q-item-section>{{ loc.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn-dropdown
          v-if="auth.currentUser"
          flat
          no-caps
          :aria-label="t('nav.account')"
          class="account-btn"
        >
          <template #label>
            <UserAvatar :size="30" alt="" />
            <span v-if="$q.screen.gt.xs" class="account-name">{{
              auth.currentUser.displayName
            }}</span>
          </template>
          <q-list>
            <q-item v-close-popup clickable dense :to="{ name: 'profile' }">
              <q-item-section>{{ t('nav.profile') }}</q-item-section>
            </q-item>
            <q-item v-close-popup clickable dense @click="logout">
              <q-item-section>{{ t('nav.logout') }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn
          v-else
          flat
          no-caps
          icon="login"
          :label="$q.screen.gt.xs ? t('nav.login') : undefined"
          :aria-label="t('nav.login')"
          :to="{ name: 'login' }"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="drawerWidth">
      <div class="drawer-content" :class="{ 'is-mobile': isMobile }">
        <!-- phones: title row with a close button, like NoteSheet's settings drawer -->
        <header v-if="isMobile" class="drawer-head">
          <h2 class="drawer-title">{{ t('nav.menu', 'Menu') }}</h2>
          <q-btn
            flat
            round
            dense
            class="drawer-quiet"
            icon="close"
            :aria-label="t('nav.closeMenu')"
            :title="t('nav.closeMenu')"
            @click="closeLeftDrawer"
          />
        </header>

        <q-list padding class="drawer-list">
          <q-item-label header class="drawer-group">{{ t('nav.gameBook') }}</q-item-label>
          <q-item v-for="item in bookItems" :key="item.to" clickable :to="item.to" exact>
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ t(item.label) }}</q-item-section>
          </q-item>

          <q-item-label header class="drawer-group">{{ t('nav.practiceRoom') }}</q-item-label>
          <q-item v-for="item in navItems" :key="item.to" clickable :to="item.to" exact>
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ t(item.label) }}</q-item-section>
          </q-item>
        </q-list>

        <!-- pinned to the bottom of the menu -->
        <q-list padding class="drawer-footer">
          <q-item v-for="item in footerItems" :key="item.to" clickable :to="item.to" exact>
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ t(item.label) }}</q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <q-btn
      v-if="leftDrawerOpen && !isMobile"
      class="page-drawer-close-button"
      flat
      dense
      round
      size="sm"
      icon="chevron_left"
      color="primary"
      :style="{ left: `${drawerWidth}px` }"
      :aria-label="t('nav.closeMenu')"
      :title="t('nav.closeMenu')"
      @click="closeLeftDrawer"
    />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.app-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-name {
  font-family: var(--gb-serif);
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: 0;
}

.app-logo {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  flex: 0 0 auto;
  cursor: pointer;
}

.app-logo:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 3px;
}

.drawer-content {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-footer {
  margin-top: auto;
  border-top: 1px solid var(--app-border);
}

.volume-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 260px;
  padding: 8px 14px 8px 8px;
}

.account-name {
  margin-left: 8px;
}

.volume-slider {
  flex: 1 1 auto;
}

.volume-value {
  min-width: 3.2em;
  text-align: right;
  font-variant-numeric: lining-nums tabular-nums;
}

/* phones: header stays put, only the list scrolls */
.drawer-content.is-mobile {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-content.is-mobile .drawer-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.drawer-head {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(10px + env(safe-area-inset-top, 0px)) 8px 10px 16px;
  border-bottom: 1px solid var(--app-border);
}

.drawer-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--app-text);
}

.drawer-group {
  font-family: var(--gb-sans);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--app-muted);
  padding-bottom: 6px;
}

.drawer-quiet {
  color: var(--app-muted);
}

.page-drawer-close-button {
  position: fixed;
  top: 65px;
  z-index: 3000;
  transform: translateX(-50%);
  border: 1px solid var(--app-border);
  background-color: var(--app-surface-soft);
}
</style>
