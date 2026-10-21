<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { cues } from 'src/game/sound'
import { useAuthStore } from 'src/stores/auth-store'

const { t } = useI18n()
const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const busy = ref(false)

const required = (v) => !!v || t('auth.errors.required')

async function submit() {
  error.value = ''
  busy.value = true
  const err = await auth.login({ username: username.value, password: password.value })
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
  router.replace(
    typeof route.query.redirect === 'string' ? route.query.redirect : { name: 'cover' },
  )
}
</script>

<template>
  <q-page class="gb gb-auth">
    <div class="gb-auth__card">
      <h1 class="gb-page-title">{{ t('auth.loginTitle') }}</h1>
      <p class="gb-lead">{{ t('auth.loginLead') }}</p>

      <q-form class="gb-auth__form" @submit.prevent="submit">
        <q-input
          v-model="username"
          outlined
          :label="t('auth.username')"
          autocomplete="username"
          autofocus
          :rules="[required]"
          lazy-rules
        />
        <q-input
          v-model="password"
          outlined
          :type="showPassword ? 'text' : 'password'"
          :label="t('auth.password')"
          autocomplete="current-password"
          :rules="[required]"
          lazy-rules
        >
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              role="button"
              tabindex="0"
              @click="showPassword = !showPassword"
              @keydown.enter.prevent="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <p v-if="error" class="gb-error" role="alert">{{ error }}</p>

        <button type="submit" class="gb-btn gb-btn--primary gb-btn--block" :disabled="busy">
          {{ t('auth.loginAction') }}
        </button>
      </q-form>

      <p class="gb-auth__switch">
        {{ t('auth.noAccount') }}
        <router-link :to="{ name: 'register', query: route.query }" class="gb-link">{{
          t('auth.registerAction')
        }}</router-link>
      </p>
      <p class="gb-note">{{ t('auth.localNotice') }}</p>
    </div>
  </q-page>
</template>
