import { ref } from 'vue'
import { createAudioContext, stringBuffer } from 'src/components/music/guitarSynth'
import { voiceChord } from 'src/components/claude/music'
import { KEYS, readJson, writeJson } from 'src/services/storage'

/* =====================================================
   Small guitar cues for the game-book, reusing the
   nylon-string synth from the practice room:
   success → a major chord, failure → a minor one.
===================================================== */

export const soundOn = ref(readJson(KEYS.sound, true))

export function toggleSound() {
  soundOn.value = !soundOn.value
  writeJson(KEYS.sound, soundOn.value)
}

let ctx = null

export function strum(chordName, { down = true, gap = 0.028 } = {}) {
  if (!soundOn.value || typeof window === 'undefined') return
  const voicing = voiceChord(chordName)
  if (!voicing) return
  try {
    ctx ??= createAudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    const master = ctx.createGain()
    master.gain.value = 0.32
    master.connect(ctx.destination)
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

export const cues = {
  success: () => strum('G'),
  failure: () => strum('Em', { down: false }),
  dice: () => strum('E5', { gap: 0.012 }),
  ending: (tone) => strum(tone === 'bad' ? 'Am' : 'Cmaj7', { gap: 0.06 }),
}
