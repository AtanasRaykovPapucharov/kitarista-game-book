/* =====================================================
   Music helpers for the flamenco compás editor
   - chord parsing ("E7b9", "Am", "F/E", "Bbmaj7")
   - automatic guitar voicing (standard tuning)
   - notes / tab parsing ("E3 G#3", "3-2 1-0", "6-0+4-2")
===================================================== */

import {
  TUNING,
  fitItem,
  itemBeats,
  itemsText,
  placeOnStrings,
  resolveStaff,
  soundingMidi,
} from 'src/components/music/notation'

export { TUNING }

const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const ACCIDENTAL = { '#': 1, '♯': 1, b: -1, '♭': -1, '': 0 }

// suffix -> intervals in semitones from the root
const QUALITY_LIST = [
  ['', [0, 4, 7]],
  ['maj', [0, 4, 7]],
  ['M', [0, 4, 7]],
  ['m', [0, 3, 7]],
  ['min', [0, 3, 7]],
  ['-', [0, 3, 7]],
  ['5', [0, 7]],
  ['6', [0, 4, 7, 9]],
  ['m6', [0, 3, 7, 9]],
  ['7', [0, 4, 7, 10]],
  ['maj7', [0, 4, 7, 11]],
  ['M7', [0, 4, 7, 11]],
  ['Δ', [0, 4, 7, 11]],
  ['Δ7', [0, 4, 7, 11]],
  ['m7', [0, 3, 7, 10]],
  ['min7', [0, 3, 7, 10]],
  ['mmaj7', [0, 3, 7, 11]],
  ['m7b5', [0, 3, 6, 10]],
  ['ø', [0, 3, 6, 10]],
  ['dim', [0, 3, 6]],
  ['°', [0, 3, 6]],
  ['dim7', [0, 3, 6, 9]],
  ['°7', [0, 3, 6, 9]],
  ['aug', [0, 4, 8]],
  ['+', [0, 4, 8]],
  ['sus2', [0, 2, 7]],
  ['sus4', [0, 5, 7]],
  ['sus', [0, 5, 7]],
  ['7sus4', [0, 5, 7, 10]],
  ['add9', [0, 4, 7, 14]],
  ['madd9', [0, 3, 7, 14]],
  ['9', [0, 4, 7, 10, 14]],
  ['m9', [0, 3, 7, 10, 14]],
  ['maj9', [0, 4, 7, 11, 14]],
  ['7b9', [0, 4, 7, 10, 13]],
  ['7♭9', [0, 4, 7, 10, 13]],
  ['b9', [0, 4, 7, 13]],
  ['♭9', [0, 4, 7, 13]],
  ['7#9', [0, 4, 7, 10, 15]],
  ['11', [0, 4, 7, 10, 14, 17]],
  ['13', [0, 4, 7, 10, 14, 21]],
  ['maj7#11', [0, 4, 7, 11, 18]],
]
const QUALITIES = new Map(QUALITY_LIST)

function parseNoteName(str) {
  const m = /^([A-Ga-g])([#b♯♭]?)$/.exec(str)
  if (!m) return null
  return (LETTER_PC[m[1].toUpperCase()] + ACCIDENTAL[m[2]] + 12) % 12
}

/**
 * Parse a chord symbol.
 * @returns {{ root:number, bass:number, pcs:number[], intervals:number[] } | null}
 */
export function parseChord(name) {
  if (!name) return null
  const clean = String(name).trim().replace(/\s+/g, '')
  const m = /^([A-Ga-g])([#b♯♭]?)(.*)$/.exec(clean)
  if (!m) return null

  const root = (LETTER_PC[m[1].toUpperCase()] + ACCIDENTAL[m[2]] + 12) % 12
  let rest = m[3]
  let bass = root

  const slash = rest.lastIndexOf('/')
  if (slash !== -1) {
    const bassPc = parseNoteName(rest.slice(slash + 1))
    if (bassPc !== null) {
      bass = bassPc
      rest = rest.slice(0, slash)
    }
  }

  // strip parentheses: "E7(b9)" -> "E7b9"
  rest = rest.replace(/[()]/g, '')

  let intervals = QUALITIES.get(rest)
  if (!intervals) {
    // unknown extension: fall back to the triad
    if (/^(m|min|-)(?!aj)/.test(rest)) intervals = [0, 3, 7]
    else if (/^\d|^maj|^M|^add|^sus|^b|^#/.test(rest)) intervals = [0, 4, 7]
    else return null
  }

  const pcs = [...new Set(intervals.map((i) => (root + i) % 12))]
  if (!pcs.includes(bass)) pcs.push(bass)
  return { root, bass, pcs, intervals }
}

/**
 * Find a playable voicing on a 6-string guitar.
 * @returns {{ frets: (number|null)[], notes: {string:number, midi:number}[] } | null}
 *   frets[0] = string 1 (high E) ... frets[5] = string 6 (low E), null = muted
 */
const voicingCache = new Map()

export function voiceChord(name) {
  if (!name) return null
  if (voicingCache.has(name)) return voicingCache.get(name)

  const chord = parseChord(name)
  if (!chord) {
    voicingCache.set(name, null)
    return null
  }

  const pcs = new Set(chord.pcs)
  const fifth = (chord.root + 7) % 12
  let best = null

  for (let w = 1; w <= 10; w++) {
    const candidates = [0, w, w + 1, w + 2, w + 3]

    for (let bassString = 6; bassString >= 4; bassString--) {
      const open = TUNING[bassString - 1]
      const bassFret = candidates.find((f) => (open + f) % 12 === chord.bass)
      if (bassFret === undefined) continue

      const frets = [null, null, null, null, null, null]
      frets[bassString - 1] = bassFret
      const covered = new Set([chord.bass])

      for (let s = bassString - 1; s >= 1; s--) {
        const o = TUNING[s - 1]
        const valid = candidates.filter((f) => pcs.has((o + f) % 12))
        if (!valid.length) continue
        const fresh = valid.filter((f) => !covered.has((o + f) % 12))
        const pool = fresh.length ? fresh : valid
        const pick = pool.includes(0) ? 0 : Math.min(...pool)
        frets[s - 1] = pick
        covered.add((o + pick) % 12)
      }

      let score = (w - 1) * 0.5 + (6 - bassString) * 0.5
      for (const pc of pcs) {
        if (!covered.has(pc)) score += pc === fifth ? 2 : 10
      }
      // muted strings in the middle of a voicing are hard to play
      for (let s = bassString - 1; s >= 2; s--) {
        if (frets[s - 1] === null) score += 6
      }
      if (frets[0] === null) score += 1

      if (!best || score < best.score) best = { score, frets }
    }
  }

  if (!best) {
    voicingCache.set(name, null)
    return null
  }

  const notes = []
  for (let s = 6; s >= 1; s--) {
    const f = best.frets[s - 1]
    if (f !== null) notes.push({ string: s, midi: TUNING[s - 1] + f })
  }

  const result = { frets: best.frets, notes }
  voicingCache.set(name, result)
  return result
}

/* =====================================================
   Notes & tab
   "E3 G#3"      -> two notes, one after another
   "3-2 1-0"     -> tab, string-fret
   "6-0+4-2"     -> "+" joins notes that sound together
===================================================== */

export function stringForMidi(midi) {
  for (let s = 1; s <= 6; s++) {
    if (midi >= TUNING[s - 1]) return s
  }
  return 6
}

export function parseNoteToken(token) {
  const t = token.trim()
  let m = /^([1-6])[-/:](\d{1,2})$/.exec(t)
  if (m) {
    const string = Number(m[1])
    return { string, midi: TUNING[string - 1] + Number(m[2]) }
  }
  m = /^([A-Ga-g])([#b♯♭]?)(\d)$/.exec(t)
  if (m) {
    const midi = (Number(m[3]) + 1) * 12 + LETTER_PC[m[1].toUpperCase()] + ACCIDENTAL[m[2]]
    return { string: stringForMidi(midi), midi }
  }
  return null
}

/** @returns {{ groups: {string:number, midi:number}[][], invalid: string[] }} */
export function parseNotes(text) {
  const groups = []
  const invalid = []
  if (!text) return { groups, invalid }

  for (const chunk of String(text)
    .split(/[\s,]+/)
    .filter(Boolean)) {
    const group = []
    for (const token of chunk.split('+').filter(Boolean)) {
      const n = parseNoteToken(token)
      if (n) group.push(n)
      else invalid.push(token)
    }
    if (group.length) groups.push(group)
  }
  return { groups, invalid }
}

/* =====================================================
   Flamenco vocabulary
===================================================== */

export const TOQUES = [
  {
    value: 'arriba',
    label: 'Por arriba (E)',
    chords: ['E', 'F', 'G', 'Am', 'Dm', 'C', 'E7', 'G7', 'C7', 'F7', 'Fmaj7', 'E7b9'],
  },
  {
    value: 'medio',
    label: 'Por medio (A)',
    chords: ['A', 'Bb', 'C', 'Dm', 'Gm', 'F', 'A7', 'C7', 'F7', 'Bb7', 'Bbmaj7', 'A7b9'],
  },
  {
    value: 'taranta',
    label: 'Por taranta (F#)',
    chords: ['F#', 'G', 'A', 'Bm', 'Em', 'D', 'F#7', 'A7', 'D7', 'G7'],
  },
  {
    value: 'granaina',
    label: 'Por granaína (B)',
    chords: ['B', 'C', 'D', 'Em', 'Am', 'G', 'B7', 'D7', 'G7', 'Cmaj7'],
  },
  {
    value: 'mayor_e',
    label: 'Mayor (E)',
    chords: ['E', 'A', 'B7', 'E7', 'F#m', 'C#m', 'G#m', 'B'],
  },
  {
    value: 'mayor_a',
    label: 'Mayor (A)',
    chords: ['A', 'D', 'E7', 'A7', 'Bm', 'F#m', 'C#m', 'E'],
  },
  {
    value: 'mayor_c',
    label: 'Mayor (C)',
    chords: ['C', 'F', 'G7', 'C7', 'Dm', 'Am', 'Em', 'G'],
  },
]

export const TECHNIQUES = [
  { value: 'rasgueo', label: 'Rasgueo', short: 'R' },
  { value: 'abanico', label: 'Abanico', short: 'Ab' },
  { value: 'golpe', label: 'Golpe', short: 'G' },
  { value: 'apagado', label: 'Apagado', short: 'Ap' },
  { value: 'alzapua', label: 'Alzapúa', short: 'Az' },
  { value: 'arpegio', label: 'Arpegio', short: 'Ar' },
  { value: 'picado', label: 'Picado', short: 'P' },
  { value: 'tremolo', label: 'Trémolo', short: 'T' },
  { value: 'pulgar', label: 'Pulgar', short: 'p' },
  { value: 'ligado', label: 'Ligado', short: 'L' },
]

export const TECHNIQUE_MAP = Object.fromEntries(TECHNIQUES.map((t) => [t.value, t]))

export const SECTION_NAMES = [
  'Introducción',
  'Llamada',
  'Falseta',
  'Paseo',
  'Remate',
  'Cierre',
  'Escobilla',
  'Subida',
  'Silencio',
  'Cante',
  'Final',
]

/* =====================================================
   Staff notes: the NoteSheet model, shared through notation.js
   { note: ['E', 'G#'], octave: 'm' | 1 | 2 | 3, type, dot?, tie? }
   { rest: true, note: [], octave, type, dot? }
   One beat of the compás is a quarter note. Each beat's staff is its own
   short list: an accidental lasts to the end of that beat.
===================================================== */

export {
  LETTERS as STAFF_LETTERS,
  OCTAVES as STAFF_OCTAVES,
  NOTE_TYPES,
  ACCIDENTALS,
  lettersFor as staffLettersFor,
  fitItem as fitStaffNote,
  lastPitched,
  placeOnStrings,
  nearestOctave,
  stepItem,
} from 'src/components/music/notation'

/** Context for one beat's staff: no key signature, accidentals last the beat. */
export const BEAT_CONTEXT = Object.freeze({ freeScope: 'list' })

/** Sounding MIDI number of a written staff note (natural unless altered). */
export const staffMidi = (letter, octave, alter = 0) => soundingMidi(letter, octave, alter)

/**
 * Timed groups for playback.
 * @param tiedIn the previous beat ended on a note tied into this one
 * @returns {{ notes, beats, rest, tiedIn }[]}
 */
export function staffGroups(staff, { tiedIn = false } = {}) {
  if (!Array.isArray(staff)) return []
  const items = staff.map(fitItem)
  const resolved = resolveStaff(items, BEAT_CONTEXT)
  let held = tiedIn
  return items.map((n, i) => {
    const group = {
      notes: n.rest ? [] : placeOnStrings(resolved[i].pitches.map((p) => p.midi)),
      beats: itemBeats(n),
      rest: !!n.rest,
      tiedIn: held && !n.rest,
    }
    held = !!n.tie && !n.rest
    return group
  })
}

export function staffBeats(staff) {
  return (staff || []).reduce((sum, n) => sum + itemBeats(n), 0)
}

/** "E G♯. –" (a dash is a rest, a dot a dotted note, ~ a tie) */
export const staffText = (staff) => itemsText(staff)
