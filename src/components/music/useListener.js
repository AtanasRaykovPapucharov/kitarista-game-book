import { onBeforeUnmount, ref } from 'vue'
import { detectPitch, noteOf } from './pitch'

/* Listens to the microphone and reports the note being played.
   Audio is analysed in the browser only – never recorded or sent. */
export function useListener() {
  const listening = ref(false)
  const error = ref('') // 'denied' | 'nomic' | 'unsupported' | 'other'
  const heard = ref(null) // { midi, cents } of a steady note, or null
  const level = ref(0) // 0–1, for a simple input meter

  let ctx = null
  let stream = null
  let analyser = null
  let timer = null
  let lastMidi = null
  let sameCount = 0
  const buf = new Float32Array(4096)

  function tick() {
    analyser.getFloatTimeDomainData(buf)
    const r = detectPitch(buf, ctx.sampleRate)
    level.value = Math.min(1, (r?.rms ?? 0) * 8)
    if (!r || r.clarity < 0.85) {
      sameCount = 0
      lastMidi = null
      heard.value = null
      return
    }
    const n = noteOf(r.freq)
    sameCount = n.midi === lastMidi ? sameCount + 1 : 1
    lastMidi = n.midi
    // the same note in 3 frames in a row (~150 ms) counts as played
    heard.value = sameCount >= 3 ? n : heard.value && heard.value.midi === n.midi ? n : null
  }

  async function start() {
    error.value = ''
    if (!navigator.mediaDevices?.getUserMedia) {
      error.value = 'unsupported'
      return false
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
    } catch (e) {
      error.value =
        e?.name === 'NotAllowedError' ? 'denied' : e?.name === 'NotFoundError' ? 'nomic' : 'other'
      return false
    }
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC()
    if (ctx.state === 'suspended') await ctx.resume()
    analyser = ctx.createAnalyser()
    analyser.fftSize = 4096
    ctx.createMediaStreamSource(stream).connect(analyser)
    timer = setInterval(tick, 50)
    listening.value = true
    return true
  }

  function stop() {
    clearInterval(timer)
    timer = null
    stream?.getTracks().forEach((t) => t.stop())
    stream = null
    ctx?.close().catch(() => {})
    ctx = null
    listening.value = false
    heard.value = null
    level.value = 0
  }

  onBeforeUnmount(stop)
  return { listening, error, heard, level, start, stop }
}
