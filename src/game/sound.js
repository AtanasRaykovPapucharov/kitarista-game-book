import { ref } from 'vue'
import { createAudioContext, stringBuffer } from 'src/components/music/guitarSynth'
import { voiceChord } from 'src/components/claude/music'
import { KEYS, readJson, writeJson } from 'src/services/storage'

/* =====================================================
   Sound cues for the game-book.
   - dice: synthesized dice tumbling on a wooden table
   - success / failure / ending: chords from the nylon-string
     synth of the practice room
   Everything follows the volume slider and the mute button.
===================================================== */

const MAX_GAIN = 0.46 // master gain at 100 % volume

export const soundOn = ref(readJson(KEYS.sound, true))
/** 0–1, remembered between visits */
export const volume = ref(Math.min(1, Math.max(0, Number(readJson(KEYS.volume, 0.7)) || 0)))

export function toggleSound() {
  soundOn.value = !soundOn.value
  writeJson(KEYS.sound, soundOn.value)
}

export function setVolume(value) {
  volume.value = Math.min(1, Math.max(0, value))
  writeJson(KEYS.volume, volume.value)
  // turning the volume up is a clear wish to hear something
  if (volume.value > 0 && !soundOn.value) toggleSound()
}

let ctx = null

/** A fresh master output at the current volume, or null when silent. */
function output() {
  if (!soundOn.value || volume.value <= 0 || typeof window === 'undefined') return null
  ctx ??= createAudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  const master = ctx.createGain()
  master.gain.value = MAX_GAIN * volume.value
  master.connect(ctx.destination)
  return master
}

export function strum(chordName, { down = true, gap = 0.028 } = {}) {
  const voicing = voiceChord(chordName)
  if (!voicing) return
  try {
    const master = output()
    if (!master) return
    const notes = down ? voicing.notes : [...voicing.notes].reverse()
    const start = ctx.currentTime + 0.02
    notes.forEach((n, i) => {
      const src = ctx.createBufferSource()
      src.buffer = stringBuffer(ctx, n.midi)
      src.connect(master)
      src.start(start + i * gap)
    })
  } catch {
    // audio is a nicety; never break the game over it
  }
}

/* ---------- dice ----------
   Each die is a short run of knocks: a bright click (the
   corner hitting the wood) plus a soft low thump (the table).
   The gaps and the force shrink with every bounce, so the
   die visibly – audibly – comes to rest. */

let noise = null
function noiseBuffer() {
  if (noise && noise.sampleRate === ctx.sampleRate) return noise
  const length = Math.floor(ctx.sampleRate * 0.25)
  noise = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return noise
}

const rand = (min, max) => min + Math.random() * (max - min)

function envelope(gain, t, peak, decay) {
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay)
}

function knock(out, t, force) {
  // click: a sliver of noise through a resonant band – plastic on wood
  const click = ctx.createBufferSource()
  click.buffer = noiseBuffer()
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = rand(2400, 4200)
  band.Q.value = rand(1.2, 2.2)
  const clickGain = ctx.createGain()
  envelope(clickGain, t, force, rand(0.025, 0.045))
  click.connect(band).connect(clickGain).connect(out)
  click.start(t, rand(0, 0.15), 0.06)

  // thump: a quick falling sine – the table answering
  const body = ctx.createOscillator()
  body.type = 'sine'
  body.frequency.setValueAtTime(rand(170, 260), t)
  body.frequency.exponentialRampToValueAtTime(80, t + 0.05)
  const bodyGain = ctx.createGain()
  envelope(bodyGain, t, force * 0.55, 0.06)
  body.connect(bodyGain).connect(out)
  body.start(t)
  body.stop(t + 0.08)
}

/** The sound of `count` dice thrown onto a table (about half a second). */
export function rollDice(count = 2) {
  try {
    const master = output()
    if (!master) return
    const start = ctx.currentTime + 0.02
    const n = Math.max(1, Math.min(4, count))
    for (let d = 0; d < n; d++) {
      let t = start + rand(0, 0.05) // dice leave the hand a hair apart
      let gap = rand(0.11, 0.15)
      let force = rand(1.2, 1.6) / Math.sqrt(n) // several dice shouldn't get louder overall
      const bounces = Math.floor(rand(6, 9))
      for (let b = 0; b < bounces; b++) {
        knock(master, t, force)
        t += gap
        gap *= rand(0.62, 0.74)
        force *= rand(0.62, 0.78)
      }
    }
  } catch {
    // audio is a nicety; never break the game over it
  }
}

export const cues = {
  success: () => strum('G'),
  failure: () => strum('Em', { down: false }),
  dice: (count = 2) => rollDice(count),
  ending: (tone) => strum(tone === 'bad' ? 'Am' : 'Cmaj7', { gap: 0.06 }),
}
