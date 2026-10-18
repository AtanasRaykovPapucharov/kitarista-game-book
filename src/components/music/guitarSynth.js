/* =====================================================
   Plucked nylon string (Karplus-Strong), shared by the
   compás editor and the note sheet player.
   Buffers are cached per audio context and pitch.
===================================================== */

export const STRING_DURATION = 2.4

const caches = new WeakMap()

export function stringBuffer(ctx, midi) {
  let cache = caches.get(ctx)
  if (!cache) caches.set(ctx, (cache = new Map()))
  const cached = cache.get(midi)
  if (cached) return cached

  const sr = ctx.sampleRate
  const freq = 440 * 2 ** ((midi - 69) / 12)
  const length = Math.floor(sr * STRING_DURATION)
  const buffer = ctx.createBuffer(1, length, sr)
  const out = buffer.getChannelData(0)

  const period = Math.max(2, Math.round(sr / freq))
  const ring = new Float32Array(period)
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1
  // soften the excitation: nylon strings, flesh + nail
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 1; i < period; i++) ring[i] = (ring[i] + ring[i - 1]) * 0.5
  }
  let mean = 0
  for (let i = 0; i < period; i++) mean += ring[i]
  mean /= period
  for (let i = 0; i < period; i++) ring[i] = (ring[i] - mean) * 1.6

  const t60 = Math.max(0.9, 3.2 - freq / 350)
  const decay = Math.pow(0.001, 1 / (freq * t60))

  let idx = 0
  for (let i = 0; i < length; i++) {
    const next = idx + 1 === period ? 0 : idx + 1
    const v = ring[idx]
    out[i] = v
    ring[idx] = decay * 0.5 * (v + ring[next])
    idx = next
  }

  cache.set(midi, buffer)
  return buffer
}

export function createAudioContext() {
  const AC = window.AudioContext || window.webkitAudioContext
  return new AC()
}
