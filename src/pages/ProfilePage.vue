<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth-store'
import { useGameStore } from 'src/stores/game-store'
import { useStory } from 'src/game/useStory'
import { ENDINGS } from 'src/story/book'
import GenderFields from 'src/components/game/GenderFields.vue'
import SongCard from 'src/components/game/SongCard.vue'
import UserAvatar from 'src/components/avatar/UserAvatar.vue'
import AvatarBuilder from 'src/components/avatar/AvatarBuilder.vue'
import AchievementList from 'src/components/game/AchievementList.vue'

const { t, locale } = useI18n()
const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()
const game = useGameStore()
const { ending } = useStory()

const date = (iso) => new Date(iso).toLocaleDateString(locale.value)
const endings = computed(() =>
  Object.entries(ENDINGS).map(([id, meta]) => ({
    id,
    tone: meta.tone,
    at: game.profile.endings[id] ?? null,
  })),
)

const identity = ref(null)
const showIdentityErrors = ref(false)

function resetIdentity() {
  const u = auth.currentUser
  if (!u) return
  identity.value = {
    gender: u.gender,
    genderName: u.genderName,
    address: u.gender === 'x' ? u.address : null,
  }
  showIdentityErrors.value = false
}
watch(() => auth.currentUser, resetIdentity, { immediate: true })

const identityChanged = computed(() => {
  const u = auth.currentUser
  const v = identity.value
  if (!u || !v) return false
  if (v.gender !== u.gender) return true
  return v.gender === 'x' && (v.genderName.trim() !== u.genderName || v.address !== u.address)
})

function saveIdentity() {
  showIdentityErrors.value = true
  const err = auth.setIdentity(identity.value)
  if (err) return
  $q.notify({
    message: t('profile.genderSaved', {
      form: t(`auth.addressForms.${auth.grammar}`).toLowerCase(),
    }),
  })
  resetIdentity()
}

const songs = computed(() => game.profile.songs ?? [])
const builderOpen = ref(false)

/* ---------- backup: download / restore everything ---------- */
const fileInput = ref(null)

function exportBackup() {
  const data = game.exportData(auth.currentUser)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kitarista-${auth.currentUser.username}-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function chooseBackup() {
  fileInput.value?.click()
}

async function importBackup(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  let data = null
  try {
    data = JSON.parse(await file.text())
  } catch {
    data = null
  }
  if (!data || data.app !== 'kitarista') {
    $q.notify({ message: t('profile.importFailed'), color: 'negative' })
    return
  }
  $q.dialog({
    title: t('profile.importTitle'),
    message: t('profile.importBody'),
    cancel: { label: t('common.cancel'), flat: true, noCaps: true },
    ok: { label: t('profile.importAction'), color: 'primary', noCaps: true, unelevated: true },
  }).onOk(() => {
    const ok = game.importData(data)
    if (ok && data.user?.gender) auth.setIdentity(data.user)
    if (ok && data.user?.avatar) auth.setAvatar(data.user.avatar)
    $q.notify({
      message: ok ? t('profile.imported') : t('profile.importFailed'),
      color: ok ? 'positive' : 'negative',
    })
  })
}

function removeSong(song) {
  $q.dialog({
    title: t('song.removeTitle'),
    message: song.title,
    cancel: { label: t('common.cancel'), flat: true, noCaps: true },
    ok: { label: t('common.delete'), color: 'negative', noCaps: true, unelevated: true },
  }).onOk(() => game.removeSong(song.id))
}

function logout() {
  auth.logout()
  $q.notify({ message: t('auth.loggedOut') })
  router.push({ name: 'cover' })
}

function remove() {
  $q.dialog({
    title: t('profile.deleteTitle'),
    message: t('profile.deleteBody'),
    cancel: { label: t('common.cancel'), flat: true, noCaps: true },
    ok: { label: t('common.delete'), color: 'negative', noCaps: true, unelevated: true },
  }).onOk(() => {
    auth.deleteAccount()
    router.push({ name: 'cover' })
  })
}
</script>

<template>
  <q-page v-if="auth.currentUser" class="gb gb-profile">
    <div class="gb-narrow">
      <div class="gb-profile__head">
        <button
          type="button"
          class="gb-profile__avatar"
          :aria-label="t('avatar.change')"
          @click="builderOpen = true"
        >
          <UserAvatar :size="96" alt="" />
          <span class="gb-profile__avatar-edit"><q-icon name="edit" size="16px" /></span>
        </button>
        <div>
          <h1 class="gb-page-title">{{ auth.currentUser.displayName }}</h1>
          <button type="button" class="gb-link" @click="builderOpen = true">
            {{ t('avatar.change') }}
          </button>
        </div>
      </div>
      <p class="gb-lead">
        @{{ auth.currentUser.username }}.
        <template v-if="auth.currentUser.genderName">{{ auth.currentUser.genderName }}.</template>
        {{ t('profile.since', { date: date(auth.currentUser.createdAt) }) }}
      </p>

      <dl class="gb-profile__numbers">
        <div>
          <dt>{{ t('profile.adventures') }}</dt>
          <dd>{{ game.profile.adventures }}</dd>
        </div>
        <div>
          <dt>{{ t('profile.bestSkill') }}</dt>
          <dd>{{ game.profile.bestSkill || '–' }}</dd>
        </div>
      </dl>
      <GenderFields
        v-if="identity"
        v-model="identity"
        :legend="t('profile.gender')"
        :show-errors="showIdentityErrors"
        name="profile-gender"
      />
      <div v-if="identityChanged" class="gb-profile__actions gb-profile__actions--tight">
        <button type="button" class="gb-btn gb-btn--primary" @click="saveIdentity">
          {{ t('profile.saveGender') }}
        </button>
        <button type="button" class="gb-btn" @click="resetIdentity">
          {{ t('common.cancel') }}
        </button>
      </div>

      <h2 class="gb-subtitle">{{ t('achievements.title') }}</h2>
      <AchievementList />

      <h2 class="gb-subtitle">{{ t('profile.endings') }}</h2>
      <ul class="gb-endings">
        <li
          v-for="e in endings"
          :key="e.id"
          class="gb-endings__item"
          :class="[`is-${e.tone}`, { 'is-locked': !e.at }]"
        >
          <template v-if="e.at">
            <h3>{{ ending(e.id).title }}</h3>
            <p>{{ ending(e.id).summary }}</p>
            <p class="gb-note">{{ t('profile.unlockedOn', { date: date(e.at) }) }}</p>
          </template>
          <template v-else>
            <h3>{{ t('profile.locked') }}</h3>
            <p class="gb-note">{{ t('profile.lockedHint') }}</p>
          </template>
        </li>
      </ul>

      <h2 class="gb-subtitle">{{ t('song.songsTitle') }}</h2>
      <p v-if="!songs.length" class="gb-note">{{ t('song.noSongs') }}</p>
      <div v-for="s in songs" :key="s.id" class="gb-profile__song">
        <SongCard :song="s" :heading="t('song.writtenOn', { date: date(s.at) })" />
        <button type="button" class="gb-link gb-profile__song-remove" @click="removeSong(s)">
          {{ t('song.remove') }}
        </button>
      </div>

      <h2 class="gb-subtitle">{{ t('profile.backupTitle') }}</h2>
      <p class="gb-note gb-note--body">{{ t('profile.backupLead') }}</p>
      <div class="gb-profile__actions gb-profile__actions--tight">
        <button type="button" class="gb-btn" @click="exportBackup">
          {{ t('profile.export') }}
        </button>
        <button type="button" class="gb-btn" @click="chooseBackup">
          {{ t('profile.import') }}
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          hidden
          @change="importBackup"
        />
      </div>

      <h2 class="gb-subtitle">{{ t('profile.dangerZone') }}</h2>
      <div class="gb-profile__actions">
        <button type="button" class="gb-btn" @click="logout">{{ t('profile.logout') }}</button>
        <button type="button" class="gb-btn gb-btn--danger" @click="remove">
          {{ t('profile.deleteAccount') }}
        </button>
      </div>
      <p class="gb-note">{{ t('auth.localNotice') }}</p>
    </div>
    <AvatarBuilder v-model="builderOpen" />
  </q-page>
</template>
