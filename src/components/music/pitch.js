/* =====================================================
   Pitch detection for the real guitar (YIN algorithm,
   de Cheveigné & Kawahara 2002). Pure functions: no Vue,
   no audio API – easy to test with synthetic signals.
===================================================== */

export const MIN_FREQ = 70 // a little under low E (82 Hz), for slack strings
export const MAX_FREQ = 1100 // above the 17th fret of high E

/**
 * Fundamental frequency of a mono frame, or null when there is no clear note.
 * @param {Float32Array} buf  samples in −1…1 (2048+ samples at 44.1/48 kHz)
 * @returns {{ freq: number, clarity: number, rms: number } | null}
 */
export function detectPitch(buf, sampleRate, { threshold = 0.12, minRms = 0.008 } = {}) {
  const n = buf.length
  let sum = 0
  for (let i = 0; i < n; i++) sum += buf[i] * buf[i]
  const rms = Math.sqrt(sum / n)
  if (rms < minRms) return null

  const maxLag = Math.min(Math.floor(sampleRate / MIN_FREQ), Math.floor(n / 2))
  const minLag = Math.max(2, Math.floor(sampleRate / MAX_FREQ))
  const w = n - maxLag // integration window
  const d = new Float32Array(maxLag + 1)

  // 1–2. difference function
  for (let tau = 1; tau <= maxLag; tau++) {
    let s = 0
    for (let i = 0; i < w; i++) {
      const diff = buf[i] - buf[i + tau]
      s += diff * diff
    }
    d[tau] = s
  }
  // 3. cumulative mean normalised difference
  d[0] = 1
  let running = 0
  for (let tau = 1; tau <= maxLag; tau++) {
    running += d[tau]
    d[tau] = running ? (d[tau] * tau) / running : 1
  }
  // 4. absolute threshold: the first dip below it, then its local minimum
  let tau = -1
  for (let t = minLag; t <= maxLag; t++) {
    if (d[t] < threshold) {
      while (t + 1 <= maxLag && d[t + 1] < d[t]) t++
      tau = t
      break
    }
  }
  if (tau === -1) return null
  // 5. parabolic interpolation for a finer period
  const x0 = tau > 1 ? d[tau - 1] : d[tau]
  const x2 = tau < maxLag ? d[tau + 1] : d[tau]
  const denom = 2 * (2 * d[tau] - x2 - x0)
  const better = denom ? tau + (x2 - x0) / denom : tau
  return { freq: sampleRate / better, clarity: 1 - d[tau], rms }
}

export const freqToMidi = (f) => 69 + 12 * Math.log2(f / 440)

/** Nearest MIDI note and how many cents off it the frequency is. */
export function noteOf(freq) {
  const m = freqToMidi(freq)
  const midi = Math.round(m)
  return { midi, cents: Math.round((m - midi) * 100) }
}

/**
 * Does a heard note count as the target? Same note – or the same note an
 * octave off, since a guitar's strong second harmonic can fool any detector.
 */
export const matches = (heard, target) => heard === target || Math.abs(heard - target) === 12
