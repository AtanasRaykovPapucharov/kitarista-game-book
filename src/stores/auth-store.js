import { defineStore, acceptHMRUpdate } from 'pinia'
import { KEYS, readJson, writeJson, removeKey } from 'src/services/storage'

/* =====================================================
   Local accounts.
   Users live in localStorage only — good for a prototype,
   not real security: anyone with access to the browser can
   read the data. Passwords are salted and hashed (SHA-256)
   so they are at least never stored as plain text.
   Swap this store's actions for API calls when a backend exists.
===================================================== */

export const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,20}$/
export const PASSWORD_MIN = 6
export const GENDERS = ['m', 'f', 'x'] // boy, girl, other
export const ADDRESS_FORMS = ['m', 'f', 'n'] // masculine, feminine, neutral word forms
export const GENDER_NAME_MAX = 30

/** Returns an i18n error key, or null when the identity is complete. */
export function identityError({ gender, genderName, address }) {
  if (!GENDERS.includes(gender)) return 'auth.errors.genderRequired'
  if (gender !== 'x') return null
  const name = (genderName ?? '').trim()
  if (!name || name.length > GENDER_NAME_MAX) return 'auth.errors.genderNameRequired'
  if (!ADDRESS_FORMS.includes(address)) return 'auth.errors.addressRequired'
  return null
}

/** The word forms the story uses for this person. */
function grammarOf(u) {
  if (u.gender === 'f') return 'f'
  if (u.gender === 'x' && ADDRESS_FORMS.includes(u.address)) return u.address
  return 'm'
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function randomId(bytes = 16) {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return toHex(arr.buffer)
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  if (crypto?.subtle) return toHex(await crypto.subtle.digest('SHA-256', data))
  // crypto.subtle needs https or localhost; this fallback only avoids plain text
  let h = 0x811c9dc5
  for (const b of data) h = Math.imul(h ^ b, 0x01000193) >>> 0
  return `fnv-${h.toString(16)}`
}

const publicUser = (u) =>
  u && {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    // profiles made before gender existed read as 'm'
    gender: GENDERS.includes(u.gender) ? u.gender : 'm',
    genderName: u.gender === 'x' ? (u.genderName ?? '') : '',
    address: grammarOf(u),
    createdAt: u.createdAt,
  }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    users: readJson(KEYS.users, []),
    userId: readJson(KEYS.session, null)?.userId ?? null,
  }),

  getters: {
    currentUser: (state) => publicUser(state.users.find((u) => u.id === state.userId)),
    isLoggedIn() {
      return !!this.currentUser
    },
    gender() {
      return this.currentUser?.gender ?? 'm'
    },
    /** Word forms for the story: 'm' | 'f' | 'n'; 'm' when logged out. */
    grammar() {
      return this.currentUser?.address ?? 'm'
    },
  },

  actions: {
    findByName(username) {
      const name = username.trim().toLowerCase()
      return this.users.find((u) => u.username.toLowerCase() === name)
    },

    /** Returns an i18n error key, or null when the account was created. */
    async register({ username, displayName, password, gender, genderName, address }) {
      const name = username.trim()
      if (!USERNAME_RE.test(name)) return 'auth.errors.usernameFormat'
      const idErr = identityError({ gender, genderName, address })
      if (idErr) return idErr
      if (password.length < PASSWORD_MIN) return 'auth.errors.passwordShort'
      if (this.findByName(name)) return 'auth.errors.usernameTaken'

      const salt = randomId()
      const user = {
        id: randomId(8),
        username: name,
        displayName: displayName.trim() || name,
        gender,
        ...(gender === 'x' ? { genderName: genderName.trim(), address } : {}),
        salt,
        hash: await hashPassword(password, salt),
        createdAt: new Date().toISOString(),
      }
      this.users.push(user)
      writeJson(KEYS.users, this.users)
      this.startSession(user.id)
      return null
    },

    async login({ username, password }) {
      const user = this.findByName(username)
      if (!user) return 'auth.errors.wrongCredentials'
      const hash = await hashPassword(password, user.salt)
      if (hash !== user.hash) return 'auth.errors.wrongCredentials'
      this.startSession(user.id)
      return null
    },

    /** Returns an i18n error key, or null when saved. */
    setIdentity({ gender, genderName, address }) {
      const user = this.users.find((u) => u.id === this.userId)
      if (!user) return 'auth.errors.wrongCredentials'
      const err = identityError({ gender, genderName, address })
      if (err) return err
      user.gender = gender
      if (gender === 'x') {
        user.genderName = genderName.trim()
        user.address = address
      } else {
        delete user.genderName
        delete user.address
      }
      writeJson(KEYS.users, this.users)
      return null
    },

    startSession(userId) {
      this.userId = userId
      writeJson(KEYS.session, { userId, at: new Date().toISOString() })
    },

    logout() {
      this.userId = null
      removeKey(KEYS.session)
    },

    deleteAccount() {
      const id = this.userId
      if (!id) return
      this.users = this.users.filter((u) => u.id !== id)
      writeJson(KEYS.users, this.users)
      removeKey(KEYS.save(id))
      removeKey(KEYS.profile(id))
      this.logout()
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
