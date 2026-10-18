/* =====================================================
   Thin, failure-safe wrapper around localStorage.
   Every key the app writes is listed here, so moving to
   a real backend later means replacing this one file.
===================================================== */

const PREFIX = 'kitarista'

export const KEYS = {
  users: `${PREFIX}-users`,
  session: `${PREFIX}-session`,
  save: (userId) => `${PREFIX}-save:${userId}`,
  profile: (userId) => `${PREFIX}-profile:${userId}`,
  sound: `${PREFIX}-sound`,
  volume: `${PREFIX}-volume`,
}

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // storage unavailable — nothing to remove
  }
}
