<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { cues } from 'src/game/sound'
import { useAuthStore, USERNAME_RE, PASSWORD_MIN, identityError } from 'src/stores/auth-store'
import GenderFields from 'src/components/game/GenderFields.vue'

const { t } = useI18n()
const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const displayName = ref('')
const password = ref('')
const confirm = ref('')
const identity = ref({ gender: null, genderName: '', address: null })
const showIdentityErrors = ref(false)
const error = ref('')
const busy = ref(false)

const rules = {
  username: [
    (v) => !!v || t('auth.errors.required'),
    (v) => USERNAME_RE.test(v.trim()) || t('auth.errors.usernameFormat'),
  ],
  password: [
    (v) => !!v || t('auth.errors.required'),
    (v) => v.length >= PASSWORD_MIN || t('auth.errors.passwordShort'),
  ],
  confirm: [(v) => v === password.value || t('auth.errors.passwordMismatch')],
}

async function submit() {
  error.value = ''
  showIdentityErrors.value = true
  if (identityError(identity.value)) return
  if (password.value !== confirm.value) {
    error.value = t('auth.errors.passwordMismatch')
    return
  }
  busy.value = true
  const err = await auth.register({
    username: username.value,
    displayName: displayName.value,
    password: password.value,
    ...identity.value,
  })
  busy.value = false
  if (err) {
    error.value = t(err)
    return
  }
  cues.welcome()
  $q.notify({
    message: t('auth.welcome', { name: auth.currentUser.displayName }),
    color: 'positive',
  })
  router.replace(typeof route.query.redirect === 'string' ? route.query.redirect : { name: 'hero' })
}
</script>

<template>
  <q-page class="gb gb-auth">
    <div class="gb-auth__card">
      <h1 class="gb-page-title">{{ t('auth.registerTitle') }}</h1>
      <p class="gb-lead">{{ t('auth.registerLead') }}</p>

      <q-form class="gb-auth__form" @submit.prevent="submit">
        <q-input
          v-model="username"
          outlined
          :label="t('auth.username')"
          :hint="t('auth.usernameHint')"
          autocomplete="username"
          autofocus
          :rules="rules.username"
          lazy-rules
        />
        <q-input
          v-model="displayName"
          outlined
          :label="t('auth.displayName')"
          :hint="t('auth.displayNameHint')"
          autocomplete="nickname"
          maxlength="30"
        />
        <GenderFields v-model="identity" :show-errors="showIdentityErrors" />

        <q-input
          v-model="password"
          outlined
          type="password"
          :label="t('auth.password')"
          :hint="t('auth.passwordHint')"
          autocomplete="new-password"
          :rules="rules.password"
          lazy-rules
        />
        <q-input
          v-model="confirm"
          outlined
          type="password"
          :label="t('auth.passwordConfirm')"
          autocomplete="new-password"
          :rules="rules.confirm"
          lazy-rules
        />

        <p v-if="error" class="gb-error" role="alert">{{ error }}</p>

        <button type="submit" class="gb-btn gb-btn--primary gb-btn--block" :disabled="busy">
          {{ t('auth.registerAction') }}
        </button>
      </q-form>

      <p class="gb-auth__switch">
        {{ t('auth.haveAccount') }}
        <router-link :to="{ name: 'login', query: route.query }" class="gb-link">{{
          t('auth.loginAction')
        }}</router-link>
      </p>
      <p class="gb-note">{{ t('auth.localNotice') }}</p>
    </div>
  </q-page>
</template>
