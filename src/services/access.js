import { ref } from 'vue'

/* =====================================================
   "Coming soon" gate.
   The build embeds only a SHA-256 hash of ACCESS_CODE
   (see quasar.config.js). A visitor who enters the right
   code is remembered on this device until the code changes.
   This keeps out casual visitors; it is not server-side
   security – anyone reading the JS can skip a client check.
===================================================== */

const SALT = 'kitarista-access:' // must match ACCESS_SALT in quasar.config.js
const STORAGE_KEY = 'kitarista-access'
const EXPECTED = import.meta.env.QCLI_ACCESS_HASH || ''

const MAX_TRIES = 5
const LOCK_MS = 30_000

export const accessRequired = EXPECTED !== ''

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/** true when no code is configured or this device already entered it */
export const unlocked = ref(!accessRequired || readStored() === EXPECTED)

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

let failures = 0
let lockedUntil = 0

/** Seconds left before another try is allowed, 0 when free to try. */
export function waitSeconds() {
  return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
}

/** Returns 'ok', 'wrong' or 'wait'. */
export async function tryCode(code) {
  if (!accessRequired) return 'ok'
  if (waitSeconds() > 0) return 'wait'
  const hash = await sha256Hex(SALT + code.trim())
  if (hash === EXPECTED) {
    failures = 0
    unlocked.value = true
    try {
      localStorage.setItem(STORAGE_KEY, hash)
    } catch {
      // storage unavailable – unlocked for this visit only
    }
    return 'ok'
  }
  failures += 1
  if (failures >= MAX_TRIES) {
    failures = 0
    lockedUntil = Date.now() + LOCK_MS
    return 'wait'
  }
  return 'wrong'
}
