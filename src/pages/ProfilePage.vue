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
      <h1 class="gb-page-title">{{ auth.currentUser.displayName }}</h1>
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

      <h2 class="gb-subtitle">{{ t('profile.dangerZone') }}</h2>
      <div class="gb-profile__actions">
        <button type="button" class="gb-btn" @click="logout">{{ t('profile.logout') }}</button>
        <button type="button" class="gb-btn gb-btn--danger" @click="remove">
          {{ t('profile.deleteAccount') }}
        </button>
      </div>
      <p class="gb-note">{{ t('auth.localNotice') }}</p>
    </div>
  </q-page>
</template>
