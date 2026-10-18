import { ref } from 'vue'
import { createAudioContext, stringBuffer } from 'src/components/music/guitarSynth'
import { voiceChord } from 'src/components/claude/music'
import { KEYS, readJson, writeJson } from 'src/services/storage'

/* =====================================================
   Sound for the game-book: soft, short and never sharp.

   Everything runs through one gentle chain:
     voices → (dry + small-room reverb) → soft limiter → volume
   Voices are rounded off (slow-ish attacks, high frequencies
   filtered), and chimes use a pentatonic scale, so any two
   sounds that overlap still agree with each other.
   It all follows the volume slider and the mute button.
===================================================== */

const MAX_GAIN = 0.5 // master gain at 100 % volume
const REVERB_MIX = 0.3

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

/* Browsers only allow sound after the person has interacted with the page.
   Until then nothing is scheduled, so no backlog of sounds plays later. */
let interacted = false
if (typeof window !== 'undefined') {
  const mark = () => (interacted = true)
  for (const ev of ['pointerdown', 'keydown', 'touchstart']) {
    window.addEventListener(ev, mark, { capture: true, passive: true })
  }
}

/* ---------- the shared chain ---------- */
let ctx = null
let bus = null
let duck = 1 // < 1 while the narrator speaks, so cues sit under the voice

/** Lowers (or restores) the cues while the narrator is talking. */
export function setDuck(on) {
  duck = on ? 0.35 : 1
  if (bus && ctx) bus.master.gain.setTargetAtTime(MAX_GAIN * volume.value * duck, ctx.currentTime, 0.15)
}

function impulse(seconds = 2.2) {
  const sr = ctx.sampleRate
  const length = Math.floor(sr * seconds)
  const buf = ctx.createBuffer(2, length, sr)
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    let lp = 0
    for (let i = 0; i < length; i++) {
      const decay = Math.pow(1 - i / length, 3.2)
      lp += 0.22 * (Math.random() * 2 - 1 - lp) // darken the tail
      data[i] = lp * decay
    }
  }
  return buf
}

function buildBus() {
  const input = ctx.createGain()
  const dry = ctx.createGain()
  const wet = ctx.createGain()
  const verb = ctx.createConvolver()
  const tone = ctx.createBiquadFilter()
  const limiter = ctx.createDynamicsCompressor()
  const master = ctx.createGain()

  verb.buffer = impulse()
  dry.gain.value = 1
  wet.gain.value = REVERB_MIX
  tone.type = 'lowpass'
  tone.frequency.value = 5200 // nothing piercing gets through
  tone.Q.value = 0.5
  limiter.threshold.value = -20
  limiter.knee.value = 18
  limiter.ratio.value = 3
  limiter.attack.value = 0.01
  limiter.release.value = 0.25

  input.connect(dry).connect(tone)
  input.connect(verb).connect(wet).connect(tone)
  tone.connect(limiter).connect(master).connect(ctx.destination)
  return { input, master }
}

/** The chain's input at the current volume, or null when silent. */
function out() {
  if (!interacted || !soundOn.value || volume.value <= 0 || typeof window === 'undefined')
    return null
  ctx ??= createAudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  bus ??= buildBus()
  bus.master.gain.setTargetAtTime(MAX_GAIN * volume.value * duck, ctx.currentTime, 0.02)
  return bus.input
}

const rand = (min, max) => min + Math.random() * (max - min)
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12)

/** Runs a sound, quietly ignoring audio errors – sound is a nicety. */
function play(fn) {
  try {
    const dest = out()
    if (dest) fn(dest, ctx.currentTime + 0.02)
  } catch {
    // never break the game over audio
  }
}

/* Repeated triggers within a moment (e.g. a component remounting) play once. */
const lastPlayed = new Map()
function once(key, ms = 120) {
  const now = performance.now()
  if (now - (lastPlayed.get(key) ?? 0) < ms) return false
  lastPlayed.set(key, now)
  return true
}

/* ---------- voices ---------- */

function envelope(param, t, peak, attack, decay) {
  param.setValueAtTime(0.0001, t)
  param.exponentialRampToValueAtTime(peak, t + attack)
  param.exponentialRampToValueAtTime(0.0001, t + attack + decay)
}

/** A soft bell: a sine with a faint, quickly fading octave shimmer. */
function bell(dest, t, freq, { gain = 0.12, decay = 1.6 } = {}) {
  const g = ctx.createGain()
  envelope(g.gain, t, gain, 0.012, decay)
  g.connect(dest)
  const fundamental = ctx.createOscillator()
  fundamental.frequency.value = freq
  fundamental.connect(g)
  const shimmer = ctx.createOscillator()
  shimmer.frequency.value = freq * 2.004
  const sg = ctx.createGain()
  envelope(sg.gain, t, 0.18, 0.006, decay * 0.35)
  shimmer.connect(sg).connect(g)
  for (const o of [fundamental, shimmer]) {
    o.start(t)
    o.stop(t + decay + 0.1)
  }
}

/** A nylon string, rounded off with a lowpass. `cents` detunes it (tuning lesson). */
function pluck(dest, t, midi, gain = 0.32, cents = 0) {
  const src = ctx.createBufferSource()
  src.buffer = stringBuffer(ctx, midi)
  if (cents) src.playbackRate.value = 2 ** (cents / 1200)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 2000
  lp.Q.value = 0.4
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015) // no hard pick attack
  src.connect(lp).connect(g).connect(dest)
  src.start(t)
}

/** A slow, brushed strum or an arpeggio (gap between strings in seconds). */
function chord(dest, t, name, { gap = 0.06, gain = 0.26, up = false } = {}) {
  const voicing = voiceChord(name)
  if (!voicing) return
  const notes = up ? [...voicing.notes].reverse() : voicing.notes
  notes.forEach((n, i) => pluck(dest, t + i * gap, n.midi, gain))
}

let noise = null
function noiseBuffer() {
  if (noise && noise.sampleRate === ctx.sampleRate) return noise
  const length = Math.floor(ctx.sampleRate * 1)
  noise = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return noise
}

/** Filtered noise with a gentle swell – paper, air, cloth. */
function breath(dest, t, { dur = 0.4, from = 500, to = 2200, gain = 0.06, q = 0.7 } = {}) {
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer()
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = q
  band.frequency.setValueAtTime(from, t)
  band.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.35)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(band).connect(g).connect(dest)
  src.start(t, rand(0, 0.5), dur + 0.05)
}

/** One soft knock of a die on a felt-covered table. */
function tap(dest, t, force) {
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer()
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = rand(900, 1600)
  band.Q.value = rand(0.7, 1.1)
  const g = ctx.createGain()
  envelope(g.gain, t, force, 0.004, rand(0.035, 0.05))
  src.connect(band).connect(g).connect(dest)
  src.start(t, rand(0, 0.8), 0.08)

  const body = ctx.createOscillator()
  body.frequency.setValueAtTime(rand(130, 180), t)
  body.frequency.exponentialRampToValueAtTime(70, t + 0.06)
  const bg = ctx.createGain()
  envelope(bg.gain, t, force * 0.7, 0.006, 0.07)
  body.connect(bg).connect(dest)
  body.start(t)
  body.stop(t + 0.1)
}

/* C major pentatonic, by step: C D E G A, octaves 5–7 */
const PENTA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96]

/* ---------- cues ---------- */

export const cues = {
  /** dice rolled onto a soft table (≈ half a second) */
  dice(count = 2) {
    play((dest, t0) => {
      const n = Math.max(1, Math.min(4, count))
      for (let d = 0; d < n; d++) {
        let t = t0 + rand(0, 0.05)
        let gap = rand(0.1, 0.14)
        let force = rand(0.32, 0.42) / Math.sqrt(n)
        const bounces = Math.floor(rand(4, 7))
        for (let b = 0; b < bounces; b++) {
          tap(dest, t, force)
          t += gap
          gap *= rand(0.62, 0.74)
          force *= rand(0.6, 0.75)
        }
      }
    })
  },

  /** a test, a round or luck went your way */
  success() {
    play((dest, t) => {
      chord(dest, t, 'Cmaj7', { gap: 0.055 })
      bell(dest, t + 0.3, hz(88), { gain: 0.05, decay: 1.4 })
    })
  },

  /** it didn't – a quiet, unhurried minor chord, no sting */
  failure() {
    play((dest, t) => chord(dest, t, 'Am7', { gap: 0.08, gain: 0.2, up: true }))
  },

  /** turning to a new section: a soft paper swish */
  page() {
    if (!once('page', 300)) return
    play((dest, t) => {
      breath(dest, t, { dur: 0.32, from: 700, to: 2600, gain: 0.13 })
      breath(dest, t + 0.08, { dur: 0.22, from: 1800, to: 900, gain: 0.065 })
    })
  },

  /** what changed in a section, one gentle note each (at most four) */
  changes(list = []) {
    if (!list.length || !once('changes', 200)) return
    play((dest, t0) => {
      list.slice(0, 4).forEach((c, i) => {
        const t = t0 + i * 0.16
        if (c.kind === 'song') {
          ;[76, 79, 81].forEach((m, k) =>
            bell(dest, t + k * 0.14, hz(m), { gain: 0.08, decay: 1.2 }),
          )
        } else if (c.kind === 'item') {
          if (c.delta > 0) {
            bell(dest, t, hz(84), { gain: 0.07, decay: 1.1 })
            bell(dest, t + 0.09, hz(91), { gain: 0.06, decay: 1.3 })
          } else {
            bell(dest, t, hz(62), { gain: 0.07, decay: 0.9 })
          }
        } else if (c.kind === 'stat' && c.id === 'darkness') {
          if (c.delta > 0) {
            breath(dest, t, { dur: 0.9, from: 220, to: 480, gain: 0.05, q: 1.2 })
            bell(dest, t, hz(52), { gain: 0.07, decay: 1.6 })
          } else {
            bell(dest, t, hz(91), { gain: 0.07, decay: 1.4 })
          }
        } else if (c.kind === 'stat') {
          if (c.delta > 0) bell(dest, t, hz(c.raised ? 91 : 88), { gain: 0.07, decay: 1.2 })
          else bell(dest, t, hz(69), { gain: 0.06, decay: 0.8 })
        }
      })
    })
  },

  /** eating a pancake, reading the recipe: a tiny soft pop */
  useItem() {
    play((dest, t) => {
      const o = ctx.createOscillator()
      o.frequency.setValueAtTime(520, t)
      o.frequency.exponentialRampToValueAtTime(880, t + 0.08)
      const g = ctx.createGain()
      envelope(g.gain, t, 0.12, 0.01, 0.12)
      o.connect(g).connect(dest)
      o.start(t)
      o.stop(t + 0.2)
    })
  },

  /** hero creation: each stat settles a step higher */
  tick(step = 0) {
    play((dest, t) => bell(dest, t, hz(PENTA[2 + (step % 6)]), { gain: 0.11, decay: 1 }))
  },

  /** logging in, unlocking the book: three rising notes */
  welcome() {
    play((dest, t) =>
      [72, 76, 79, 84].forEach((m, i) =>
        bell(dest, t + i * 0.12, hz(m), { gain: 0.07, decay: 1.6 }),
      ),
    )
  },

  /** the volume slider's sample */
  chime() {
    play((dest, t) => bell(dest, t, hz(79), { gain: 0.1, decay: 1.4 }))
  },

  /** the end of the book */
  ending(tone) {
    play((dest, t) => {
      if (tone === 'bad') {
        chord(dest, t, 'Am', { gap: 0.2, gain: 0.2, up: true })
        bell(dest, t + 1, hz(57), { gain: 0.06, decay: 2.4 })
      } else if (tone === 'best') {
        chord(dest, t, 'Cmaj9', { gap: 0.16, gain: 0.22 })
        ;[84, 88, 91, 96].forEach((m, i) =>
          bell(dest, t + 1 + i * 0.18, hz(m), { gain: 0.05, decay: 2 }),
        )
      } else {
        chord(dest, t, 'Gadd9', { gap: 0.15, gain: 0.22 })
        bell(dest, t + 1, hz(86), { gain: 0.05, decay: 2 })
      }
    })
  },
}

/* ---------- lessons and the reader's song ----------
   These are meant to be listened to, so they are a little clearer
   than the cues, but still soft. They skip the once() throttle. */

/** One guitar note; `cents` nudges it sharp or flat. */
export function playNote(midi, { cents = 0, delay = 0, gain = 0.4 } = {}) {
  play((dest, t) => pluck(dest, t + delay, midi, gain, cents))
}

/** A chord, gently strummed – for "listen" buttons. */
export function playChord(name, { delay = 0 } = {}) {
  play((dest, t) => chord(dest, t + delay, name, { gap: 0.035, gain: 0.3 }))
}

/** A soft wood-block click for the metronome; the first beat a little higher. */
function click(dest, t, accent) {
  const o = ctx.createOscillator()
  o.frequency.value = accent ? 1320 : 990
  const g = ctx.createGain()
  envelope(g.gain, t, accent ? 0.14 : 0.1, 0.002, 0.05)
  o.connect(g).connect(dest)
  o.start(t)
  o.stop(t + 0.08)
}

/**
 * Schedules `count` metronome clicks. Returns the moment of every beat
 * in performance.now() time, so taps can be compared with it,
 * or null when sound is off.
 */
export function metronome(count, bpm, { accentEvery = 4 } = {}) {
  let times = null
  play((dest, t0) => {
    const beat = 60 / bpm
    const latency = (ctx.outputLatency || ctx.baseLatency || 0) * 1000
    const perfAt = performance.now() + (t0 - ctx.currentTime) * 1000 + latency
    times = []
    for (let i = 0; i < count; i++) {
      click(dest, t0 + i * beat, i % accentEvery === 0)
      times.push(perfAt + i * beat * 1000)
    }
  })
  return times
}

/**
 * Plays the reader's song: each verse's four chords, two beats each,
 * a brushed strum on the first beat and a soft arpeggio on the second.
 * onStep(verseIndex, chordIndex) follows along; returns { stop }.
 */
export function playSong(verses, { bpm = 84, onStep = () => {}, onEnd = () => {} } = {}) {
  const timers = []
  let songGain = null
  play((dest, t0) => {
    songGain = ctx.createGain()
    songGain.gain.value = 1
    songGain.connect(dest)
    const beat = 60 / bpm
    let t = t0
    verses.forEach((chords, vi) => {
      chords.forEach((name, ci) => {
        const at = t
        timers.push(setTimeout(() => onStep(vi, ci), (at - ctx.currentTime) * 1000))
        chord(songGain, at, name, { gap: 0.045, gain: 0.26 })
        const voicing = voiceChord(name)
        if (voicing) {
          voicing.notes.slice(-3).forEach((n, k) => pluck(songGain, at + beat + k * (beat / 3), n.midi, 0.16))
        }
        t += beat * 2
      })
    })
    timers.push(setTimeout(onEnd, (t - ctx.currentTime) * 1000 + 600))
  })
  if (!songGain) {
    onEnd()
    return { stop() {} }
  }
  return {
    stop() {
      timers.forEach(clearTimeout)
      try {
        songGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08)
        setTimeout(() => songGain.disconnect(), 600)
      } catch {
        // already gone
      }
      onEnd()
    },
  }
}

/** Kept for the practice room and older calls. */
export function strum(name, { down = true, gap = 0.06 } = {}) {
  play((dest, t) => chord(dest, t, name, { gap, up: !down }))
}
