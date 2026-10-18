/* =====================================================
   What do the marked notes make?
   Pure functions (no Vue) used by the Tones page:
   - names of notes, intervals between two notes
   - chord recognition (root, quality, inversion, slash bass)
   - scales and modes that contain the notes
   Pitches are MIDI numbers (sounding pitch, E2 = 40).
===================================================== */

// the usual guitarist's spelling: sharps for C♯ and F♯, flats for E♭, A♭, B♭
export const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']
const ASCII_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

export const pc = (midi) => ((midi % 12) + 12) % 12
export const noteName = (midi) => NOTE_NAMES[pc(midi)]
export const noteWithOctave = (midi) => `${NOTE_NAMES[pc(midi)]}${Math.floor(midi / 12) - 1}`

/* ---------- intervals ----------
   Interval names by semitones, 0–24; i18n keys under tones.intervals. */
export function interval(low, high) {
  const semis = Math.abs(high - low)
  if (semis <= 24) return { semis, key: `s${semis}`, octaves: 0 }
  // wider than two octaves: "N octaves and a …"
  return { semis, key: `s${semis % 12}`, octaves: Math.floor(semis / 12) }
}

/* ---------- chords ----------
   Templates are intervals from the root. Order = preference when several fit. */
export const CHORDS = [
  { q: '', iv: [0, 4, 7], key: 'major' },
  { q: 'm', iv: [0, 3, 7], key: 'minor' },
  { q: '5', iv: [0, 7], key: 'power' },
  { q: '7', iv: [0, 4, 7, 10], key: 'dom7' },
  { q: 'maj7', iv: [0, 4, 7, 11], key: 'maj7' },
  { q: 'm7', iv: [0, 3, 7, 10], key: 'm7' },
  { q: 'sus4', iv: [0, 5, 7], key: 'sus4' },
  { q: 'sus2', iv: [0, 2, 7], key: 'sus2' },
  { q: 'dim', iv: [0, 3, 6], key: 'dim' },
  { q: 'aug', iv: [0, 4, 8], key: 'aug' },
  { q: '6', iv: [0, 4, 7, 9], key: 'six' },
  { q: 'm6', iv: [0, 3, 7, 9], key: 'm6' },
  { q: 'm7b5', iv: [0, 3, 6, 10], key: 'm7b5' },
  { q: 'dim7', iv: [0, 3, 6, 9], key: 'dim7' },
  { q: 'mmaj7', iv: [0, 3, 7, 11], key: 'mmaj7' },
  { q: '7sus4', iv: [0, 5, 7, 10], key: 'sus7' },
  { q: 'add9', iv: [0, 2, 4, 7], key: 'add9' },
  { q: 'madd9', iv: [0, 2, 3, 7], key: 'madd9' },
  { q: '9', iv: [0, 2, 4, 7, 10], key: 'nine' },
  { q: 'maj9', iv: [0, 2, 4, 7, 11], key: 'maj9' },
  { q: 'm9', iv: [0, 2, 3, 7, 10], key: 'm9' },
]

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x))
const display = (s) => s.replace('#', '♯').replace(/b(?=\d|$)/g, '♭')

/** Every chord the notes can be read as, best first. */
export function chordCandidates(midis) {
  const pcs = [...new Set(midis.map(pc))]
  if (pcs.length < 2) return []
  const bass = pc(Math.min(...midis))
  const out = []
  for (const root of pcs) {
    const rel = pcs.map((p) => (p - root + 12) % 12)
    CHORDS.forEach((c, order) => {
      let omitted = false
      let match = sameSet(rel, c.iv)
      // 7th and 9th chords are often played without the fifth
      const hasSeventh = c.iv.includes(10) || c.iv.includes(11)
      if (!match && hasSeventh && c.iv.includes(7) && !rel.includes(7)) {
        match = sameSet(
          rel,
          c.iv.filter((i) => i !== 7),
        )
        omitted = match
      }
      if (!match) return
      const ascii = `${ASCII_NAMES[root]}${c.q}${bass !== root ? `/${ASCII_NAMES[bass]}` : ''}`
      // which chord tone is in the bass: 0 root, 1 third, 2 fifth, 3 seventh …
      const order3 = [...c.iv].sort((a, b) => a - b)
      const bassIv = (bass - root + 12) % 12
      out.push({
        root,
        bass,
        quality: c.key,
        symbol: c.q,
        ascii,
        name: display(ascii),
        rootName: NOTE_NAMES[root],
        bassName: NOTE_NAMES[bass],
        inversion: bass === root ? 0 : Math.max(1, order3.indexOf(bassIv)),
        omittedFifth: omitted,
        tones: c.iv.map((i) => NOTE_NAMES[(root + i) % 12]),
        rank: (bass === root ? 0 : 100) + (omitted ? 50 : 0) + order,
      })
    })
  }
  return out.sort((a, b) => a.rank - b.rank)
}

/* ---------- scales and modes ----------
   Major-scale modes share one set of notes; which mode it "is"
   depends on the note heard as home – here, the lowest marked note. */
export const SCALES = [
  { key: 'ionian', iv: [0, 2, 4, 5, 7, 9, 11], kind: 'mode' },
  { key: 'dorian', iv: [0, 2, 3, 5, 7, 9, 10], kind: 'mode' },
  { key: 'phrygian', iv: [0, 1, 3, 5, 7, 8, 10], kind: 'mode' },
  { key: 'lydian', iv: [0, 2, 4, 6, 7, 9, 11], kind: 'mode' },
  { key: 'mixolydian', iv: [0, 2, 4, 5, 7, 9, 10], kind: 'mode' },
  { key: 'aeolian', iv: [0, 2, 3, 5, 7, 8, 10], kind: 'mode' },
  { key: 'locrian', iv: [0, 1, 3, 5, 6, 8, 10], kind: 'mode' },
  { key: 'harmonicMinor', iv: [0, 2, 3, 5, 7, 8, 11], kind: 'scale' },
  { key: 'melodicMinor', iv: [0, 2, 3, 5, 7, 9, 11], kind: 'scale' },
  { key: 'phrygianDominant', iv: [0, 1, 4, 5, 7, 8, 10], kind: 'scale' },
  { key: 'majorPentatonic', iv: [0, 2, 4, 7, 9], kind: 'scale' },
  { key: 'minorPentatonic', iv: [0, 3, 5, 7, 10], kind: 'scale' },
  { key: 'blues', iv: [0, 3, 5, 6, 7, 10], kind: 'scale' },
  { key: 'wholeTone', iv: [0, 2, 4, 6, 8, 10], kind: 'scale' },
]

/**
 * Scales/modes containing every marked pitch class.
 * exact = the notes are the whole scale; tonic = starts on the lowest note.
 */
export function scaleCandidates(midis, { min = 3 } = {}) {
  const pcs = [...new Set(midis.map(pc))]
  if (pcs.length < min) return []
  const bass = pc(Math.min(...midis))
  const out = []
  for (let root = 0; root < 12; root++) {
    SCALES.forEach((s, order) => {
      const set = s.iv.map((i) => (root + i) % 12)
      if (!pcs.every((p) => set.includes(p))) return
      const exact = set.length === pcs.length
      const tonic = root === bass
      out.push({
        root,
        key: s.key,
        kind: s.kind,
        rootName: NOTE_NAMES[root],
        notes: set.map((p) => NOTE_NAMES[p]),
        iv: s.iv,
        exact,
        tonic,
        missing: set.length - pcs.length,
        rank: (exact ? 0 : 1000) + (tonic ? 0 : 200) + (set.length - pcs.length) * 20 + order,
      })
    })
  }
  return out.sort((a, b) => a.rank - b.rank)
}

/** Pitches for playing a scale: tonic in a comfortable middle octave, up one octave. */
export function scaleMidis(root, iv) {
  const start = 48 + root // tonic between C3 and B3
  return [...iv.map((i) => start + i), start + 12]
}
