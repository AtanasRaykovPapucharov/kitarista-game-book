import { reactive, ref, watch } from 'vue'
import { KEYS, readJson, writeJson } from 'src/services/storage'
import { soundOn, volume, setDuck } from 'src/game/sound'
import { useGameStore } from 'src/stores/game-store'

/* =====================================================
   The narrator: reads the story aloud with the browser's
   own speech voices (Web Speech API) – free, no server.

   Voice quality depends on the device: Edge has natural
   Bulgarian voices, iPhone/Mac and Android usually have one,
   Chrome on Windows often has none. When there is no voice
   for the language, the controls say so instead of reading
   with the wrong accent.

   It reads exactly what is on screen (gender forms,
   conditional paragraphs, counters), follows the volume
   slider, stays silent when the sound is muted, and has
   its own on/off switch. Cues are ducked while it speaks.
===================================================== */

const synth =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
export const narratorSupported = !!synth && typeof window.SpeechSynthesisUtterance === 'function'

const saved = readJson(KEYS.narrator, {})
export const narrator = reactive({
  on: saved.on ?? true, // the narrator's own mute
  auto: saved.auto ?? false, // read every new section by itself
  choices: saved.choices ?? true, // also read the choices at the end
  rate: Math.min(1.4, Math.max(0.7, Number(saved.rate) || 1)),
  voices: saved.voices ?? {}, // chosen voiceURI per locale
})
watch(narrator, () => writeJson(KEYS.narrator, { ...narrator }), { deep: true })

export const speaking = ref(false)
/** index of the paragraph being read, -1 when silent */
export const readingIndex = ref(-1)
export const allVoices = ref([])

function loadVoices() {
  allVoices.value = synth ? synth.getVoices() : []
}
if (narratorSupported) {
  loadVoices()
  if (typeof synth.addEventListener === 'function')
    synth.addEventListener('voiceschanged', loadVoices)
  else synth.onvoiceschanged = loadVoices
}

const langPrefix = (locale) => (String(locale).toLowerCase().startsWith('bg') ? 'bg' : 'en')

// natural/neural voices first, then Google's, then whatever the device has
function score(v) {
  const name = `${v.name} ${v.voiceURI}`
  if (/natural|neural|online/i.test(name)) return 3
  if (/google/i.test(name)) return 2
  return 1
}

export function voicesFor(locale) {
  const prefix = langPrefix(locale)
  return allVoices.value
    .filter((v) => (v.lang || '').toLowerCase().replace('_', '-').startsWith(prefix))
    .sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name))
}

export function voiceFor(locale) {
  const list = voicesFor(locale)
  const chosen = narrator.voices[locale]
  return list.find((v) => v.voiceURI === chosen) ?? list[0] ?? null
}

export function chooseVoice(locale, voiceURI) {
  narrator.voices = { ...narrator.voices, [locale]: voiceURI }
}

/* Short pieces read more reliably (and can be highlighted). */
function chunks(text, max = 220) {
  if (text.length <= max) return [text]
  const sentences = text.match(/[^.!?…]+[.!?…]+["“”«»]*\s*|[^.!?…]+$/g) ?? [text]
  const out = []
  let current = ''
  for (const s of sentences) {
    if ((current + s).length > max && current) {
      out.push(current.trim())
      current = ''
    }
    current += s
  }
  if (current.trim()) out.push(current.trim())
  return out
}

// dialogue dashes and quote marks are for the eye, not the ear
const clean = (text) =>
  text
    .replace(/^\s*[–—-]\s*/, '')
    .replace(/\s[–—]\s/g, ', ')
    .replace(/[„“”«»"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

let session = 0

/* The page that is open says what "read" means (PlayPage registers its
   section); the controls in the header just ask for it. */
let reader = null
export const canRead = ref(false)

export function setReader(fn) {
  reader = typeof fn === 'function' ? fn : null
  canRead.value = !!reader
}

export function readCurrent(locale) {
  return reader ? speak(reader(), locale) : false
}

function finish() {
  speaking.value = false
  readingIndex.value = -1
  setDuck(false)
}

export function stop() {
  session += 1
  if (synth) synth.cancel()
  finish()
}

/**
 * Reads a list of texts in order; readingIndex follows along.
 * Returns false when nothing can be read (no support, muted, no voice).
 */
export function speak(texts, locale) {
  stop()
  if (!narratorSupported || !narrator.on || !soundOn.value || volume.value <= 0) return false
  const voice = voiceFor(locale)
  if (!voice) return false

  const id = session
  const parts = texts.flatMap((text, index) => chunks(clean(text)).map((t) => ({ text: t, index })))
  if (!parts.length) return false

  speaking.value = true
  setDuck(true)
  useGameStore().award('listener')
  let i = 0
  const next = () => {
    if (id !== session) return
    if (i >= parts.length) return finish()
    const part = parts[i++]
    const u = new window.SpeechSynthesisUtterance(part.text)
    u.voice = voice
    u.lang = voice.lang
    u.rate = narrator.rate
    u.volume = volume.value
    u.onstart = () => {
      if (id === session) readingIndex.value = part.index
    }
    u.onend = next
    u.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return
      next()
    }
    synth.speak(u)
  }
  next()
  return true
}

// muting the sound or the narrator stops it at once
watch(
  () => [narrator.on, soundOn.value],
  ([on, sound]) => {
    if (!on || !sound) stop()
  },
)
