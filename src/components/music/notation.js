import { ref } from 'vue'

/* =====================================================
   Shared staff notation
   Used by SingleFiveLines, NoteSheet and the compás editor.

   A staff item:
     note: { note: ['E', 'G#'], octave: 'm' | 1 | 2 | 3, type: 1..64, dot?, tie? }
     rest: { rest: true, note: [], octave, type, dot? }

   - Letters may carry an accidental: '#' sharp, 'b' flat, 'n' natural.
     An accidental lasts to the end of its measure for that letter and
     octave, as in standard notation. With no time signature it applies to
     its own note only ('note' scope), or to the whole list ('list' scope,
     used for one beat of the compás editor).
   - `dot` makes the item half as long again; `tie` holds a note into the
     next one instead of playing it again.
   - Guitar notation: written on the treble clef an octave above how it
     sounds. Octave 'm' E is the open 6th string, octave 3 E is the 1st
     string at the 12th fret.
===================================================== */

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

export const ALTER = { '#': 1, b: -1, n: 0 }
export const ACCIDENTAL_SIGN = { '#': '♯', b: '♭', n: '♮' }
export const ACCIDENTALS = [
  { value: '', label: 'None' },
  { value: '#', label: '♯' },
  { value: 'b', label: '♭' },
  { value: 'n', label: '♮' },
]

// written octaves the staff can show, and the letters that fit on each
export const OCTAVES = [
  { value: 'm', label: 'Low', written: 3, letters: ['E', 'F', 'G', 'A', 'B'] },
  { value: 1, label: '1', written: 4, letters: LETTERS },
  { value: 2, label: '2', written: 5, letters: LETTERS },
  { value: 3, label: 'High', written: 6, letters: ['C', 'D', 'E'] },
]
const OCTAVE_MAP = new Map(OCTAVES.map((o) => [o.value, o]))

export const NOTE_TYPES = [
  { value: 1, label: 'Whole (4 beats)' },
  { value: 2, label: 'Half (2 beats)' },
  { value: 4, label: 'Quarter (1 beat)' },
  { value: 8, label: 'Eighth (½ beat)' },
  { value: 16, label: 'Sixteenth (¼ beat)' },
  { value: 32, label: 'Thirty-second (⅛ beat)' },
  { value: 64, label: 'Sixty-fourth (1/16 beat)' },
]
const TYPE_VALUES = NOTE_TYPES.map((t) => t.value)

export const lettersFor = (octave) => OCTAVE_MAP.get(octave)?.letters ?? LETTERS

export function normalizeOctave(o) {
  if (o === 'm') return 'm'
  return OCTAVE_MAP.has(Number(o)) ? Number(o) : 1
}

/* ---------- letters ---------- */

export function parseLetter(s) {
  const clean = String(s ?? '')
    .trim()
    .replace('♯', '#')
    .replace('♭', 'b')
    .replace('♮', 'n')
  const m = /^([A-Ga-g])([#bn]?)$/.exec(clean)
  return m ? { letter: m[1].toUpperCase(), acc: m[2] } : null
}

export const letterOf = (s) => parseLetter(s)?.letter ?? null
export const accOf = (s) => parseLetter(s)?.acc ?? ''
export const withAcc = (letter, acc) => `${letter}${acc || ''}`

/** "G#" -> "G♯" */
export function displayLetter(s) {
  const p = parseLetter(s)
  return p ? p.letter + (ACCIDENTAL_SIGN[p.acc] || '') : String(s ?? '')
}

/* ---------- durations (a quarter note is one beat) ---------- */

export function itemWhole(n) {
  const type = Number(n?.type) || 4
  return (1 / type) * (n?.dot ? 1.5 : 1)
}

export const itemBeats = (n) => itemWhole(n) * 4

export function measureLength(beat) {
  if (!beat) return null
  const [top, bottom] = String(beat).split('/').map(Number)
  return top && bottom ? top / bottom : null
}

// note values that rests are built from, longest first
const REST_VALUES = []
for (const type of TYPE_VALUES) {
  REST_VALUES.push({ type, dot: true, beats: (4 / type) * 1.5 })
  REST_VALUES.push({ type, dot: false, beats: 4 / type })
}
REST_VALUES.sort((a, b) => b.beats - a.beats)

/** Rests that add up to `beats` (rounded to the 64th). */
export function restsFor(beats) {
  const out = []
  let left = Math.round(beats * 16) / 16
  while (left > 1e-6) {
    const r = REST_VALUES.find((v) => v.beats <= left + 1e-6)
    if (!r) break
    out.push(r.dot ? { rest: true, note: [], octave: 1, type: r.type, dot: true } : { rest: true, note: [], octave: 1, type: r.type })
    left -= r.beats
  }
  return out
}

/* ---------- key signature & pitch ---------- */

const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F']

export function keyAlter(letter, sharps = 0, flats = 0) {
  if (sharps > 0 && SHARP_ORDER.slice(0, sharps).includes(letter)) return 1
  if (flats > 0 && FLAT_ORDER.slice(0, flats).includes(letter)) return -1
  return 0
}

/** Diatonic step of a written note (C0 = 0). */
export function writtenStep(letter, octave) {
  return (OCTAVE_MAP.get(octave)?.written ?? 4) * 7 + LETTERS.indexOf(letter)
}

/** Written note for a diatonic step, or null when the staff can't show it. */
export function noteForStep(step) {
  const written = Math.floor(step / 7)
  const letter = LETTERS[((step % 7) + 7) % 7]
  const o = OCTAVES.find((x) => x.written === written)
  return o && o.letters.includes(letter) ? { letter, octave: o.value } : null
}

/** Sounding MIDI number (guitar sounds an octave below the written note). */
export function soundingMidi(letter, octave, alter = 0) {
  const o = OCTAVE_MAP.get(octave)
  if (!o || !(letter in LETTER_PC)) return null
  return o.written * 12 + LETTER_PC[letter] + alter
}

/**
 * Walk a staff the way it is drawn: measures, barlines, key signature and
 * accidentals that last to the barline.
 * @returns {{ rest, pitches: {letter, acc, alter, midi}[], barAfter, overfull }[]}
 */
export function resolveStaff(
  items,
  { sharps = 0, flats = 0, beat = null, measureStart = 0, freeScope = 'note' } = {},
) {
  const len = measureLength(beat)
  let fill = len ? measureStart || 0 : 0
  let state = new Map()

  return (items || []).map((n) => {
    const out = { rest: !!n?.rest, pitches: [], barAfter: false, overfull: false }
    if (!n?.rest) {
      for (const s of n?.note || []) {
        const p = parseLetter(s)
        if (!p) continue
        const k = `${p.letter}${n.octave}`
        if (p.acc) state.set(k, ALTER[p.acc])
        const alter = state.has(k) ? state.get(k) : keyAlter(p.letter, sharps, flats)
        out.pitches.push({ ...p, alter, midi: soundingMidi(p.letter, n.octave, alter) })
      }
    }
    if (len) {
      fill += itemWhole(n)
      if (fill >= len - 1e-9) {
        out.barAfter = true
        out.overfull = fill > len + 1e-9
        fill = 0
        state = new Map()
      }
    } else if (freeScope === 'note') {
      state = new Map()
    }
    return out
  })
}

/**
 * Add the accidentals needed so each item sounds as `desired` says, given the
 * key and earlier accidentals. desired[i] is null (keep as written) or the
 * alteration per letter. Signs the user wrote are kept when still right.
 */
export function respell(
  items,
  { sharps = 0, flats = 0, beat = null, measureStart = 0, freeScope = 'note' } = {},
  desired = [],
) {
  const len = measureLength(beat)
  let fill = len ? measureStart || 0 : 0
  let state = new Map()

  return items.map((it, i) => {
    let out = it
    if (!it.rest) {
      const want = desired[i]
      const note = (it.note || []).map((s, j) => {
        const p = parseLetter(s)
        if (!p) return s
        const k = `${p.letter}${it.octave}`
        const a = want?.[j]
        if (a === undefined || a === null) {
          if (p.acc) state.set(k, ALTER[p.acc])
          return s
        }
        if (p.acc && ALTER[p.acc] === a) {
          state.set(k, a)
          return s
        }
        const implied = state.has(k) ? state.get(k) : keyAlter(p.letter, sharps, flats)
        if (implied === a) return p.letter
        state.set(k, a)
        return withAcc(p.letter, a === 1 ? '#' : a === -1 ? 'b' : 'n')
      })
      out = { ...it, note }
    }
    if (len) {
      fill += itemWhole(it)
      if (fill >= len - 1e-9) {
        fill = 0
        state = new Map()
      }
    } else if (freeScope === 'note') {
      state = new Map()
    }
    return out
  })
}

/** Every altered letter spelled out, naturals plain: safe to move anywhere. */
export function toAbsolute(items, context) {
  const resolved = resolveStaff(items, context)
  return items.map((it, i) =>
    it.rest
      ? { ...it }
      : {
          ...it,
          note: resolved[i].pitches.map((p) =>
            withAcc(p.letter, p.alter === 1 ? '#' : p.alter === -1 ? 'b' : ''),
          ),
        },
  )
}

/** Alterations an absolute item asks for, per letter. */
export const absoluteAlters = (item) =>
  item.rest ? null : (item.note || []).map((s) => ALTER[accOf(s)] ?? 0)

/* ---------- cleaning ---------- */

/** Clean a note or rest so the staff can always draw it. */
export function fitItem(raw) {
  const octave = normalizeOctave(raw?.octave)
  const type = TYPE_VALUES.includes(Number(raw?.type)) ? Number(raw.type) : 4
  const extra = raw?.dot ? { dot: true } : {}
  if (raw?.rest) return { rest: true, note: [], octave, type, ...extra }

  const allowed = lettersFor(octave)
  const seen = new Set()
  const note = []
  for (const s of Array.isArray(raw?.note) ? raw.note : [raw?.note]) {
    const p = parseLetter(s)
    if (!p || !allowed.includes(p.letter) || seen.has(p.letter)) continue
    seen.add(p.letter)
    note.push(withAcc(p.letter, p.acc))
  }
  note.sort((a, b) => LETTERS.indexOf(a[0]) - LETTERS.indexOf(b[0]))
  return {
    note: note.length ? note : [allowed[0]],
    octave,
    type,
    ...extra,
    ...(raw?.tie ? { tie: true } : {}),
  }
}

/** Last item with a pitch at or before index, skipping rests. */
export function lastPitched(items, index) {
  for (let i = Math.min(index, (items?.length ?? 0) - 1); i >= 0; i--) {
    if (!items[i]?.rest && items[i]?.note?.length) return items[i]
  }
  return null
}

/** Octave that puts `letter` closest to the note `from`. */
export function nearestOctave(letter, from) {
  const options = OCTAVES.filter((o) => o.letters.includes(letter))
  const top = from?.note?.length ? letterOf(from.note[from.note.length - 1]) : null
  if (!top) return options.find((o) => o.value === 1)?.value ?? options[0].value
  const target = writtenStep(top, from.octave)
  let best = options[0]
  for (const o of options) {
    if (
      Math.abs(writtenStep(letter, o.value) - target) <
      Math.abs(writtenStep(letter, best.value) - target)
    )
      best = o
  }
  return best.value
}

/** Move a note by diatonic steps (accidentals dropped), or null if off the staff. */
export function stepItem(item, delta) {
  if (!item || item.rest) return null
  const moved = []
  for (const s of item.note) {
    const p = parseLetter(s)
    const n = p && noteForStep(writtenStep(p.letter, item.octave) + delta)
    if (!n) return null
    moved.push(n)
  }
  // all letters must share one octave in this model
  if (new Set(moved.map((n) => n.octave)).size > 1) return null
  return fitItem({ ...item, note: moved.map((n) => n.letter), octave: moved[0].octave })
}

/* ---------- guitar strings & tab ---------- */

// string 1 (high E) ... string 6 (low E), MIDI numbers
export const TUNING = [64, 59, 55, 50, 45, 40]

export function stringForMidi(midi) {
  for (let s = 1; s <= 6; s++) if (midi >= TUNING[s - 1]) return s
  return 6
}

/**
 * Give each note its own string. Chord tones keep their pitch order across
 * the strings, and the hand stretch is kept small, then the frets low.
 * @returns {{ string, midi, fret }[]} highest note first
 */
export function placeOnStrings(midis) {
  const notes = [...midis].filter((m) => m !== null && m !== undefined).sort((a, b) => b - a)
  if (!notes.length) return []

  const options = notes.map((midi) => {
    const list = []
    for (let s = 1; s <= 6; s++) {
      const fret = midi - TUNING[s - 1]
      if (fret >= 0 && fret <= 19) list.push({ string: s, midi, fret })
    }
    return list
  })

  // out of range or more notes than strings: closest string for each
  if (notes.length > 6 || options.some((o) => !o.length)) {
    return notes.map((midi) => {
      const string = stringForMidi(midi)
      return { string, midi, fret: midi - TUNING[string - 1] }
    })
  }

  let best = null
  let bestScore = Infinity
  const pick = []
  const walk = (i) => {
    if (i === notes.length) {
      const fretted = pick.filter((p) => p.fret > 0).map((p) => p.fret)
      const span = fretted.length ? Math.max(...fretted) - Math.min(...fretted) : 0
      const score = (span > 4 ? 50 : 0) + span * 3 + fretted.reduce((a, f) => a + f, 0) * 0.4
      if (score < bestScore) {
        bestScore = score
        best = [...pick]
      }
      return
    }
    for (const o of options[i]) {
      // lower notes on lower (higher-numbered) strings
      if (pick.length && o.string <= pick[pick.length - 1].string) continue
      pick.push(o)
      walk(i + 1)
      pick.pop()
    }
  }
  walk(0)
  return best ?? notes.map((midi) => {
    const string = stringForMidi(midi)
    return { string, midi, fret: midi - TUNING[string - 1] }
  })
}

/* ---------- playback timeline ---------- */

/**
 * Flatten staves into timed events. A tied note is not played again: its
 * sound is held through the notes it is tied to.
 * @param staves [{ items, context }]
 */
export function buildTimeline(staves) {
  const events = []
  const barStarts = [0]
  let t = 0
  staves.forEach(({ items, context }, staff) => {
    const resolved = resolveStaff(items, context)
    items.forEach((it, index) => {
      const beats = itemBeats(it)
      events.push({
        staff,
        index,
        start: t,
        beats,
        rest: !!it.rest,
        tie: !!it.tie && !it.rest,
        notes: it.rest ? [] : placeOnStrings(resolved[index].pitches.map((p) => p.midi)),
      })
      t += beats
      if (resolved[index].barAfter) barStarts.push(t)
    })
  })

  // hold tied sounds: a note tied into the next one with the same pitches
  for (let i = 0; i < events.length; i++) {
    const e = events[i]
    e.soundBeats = e.beats
    if (e.tiedIn) continue
    let j = i
    while (events[j]?.tie && events[j + 1] && !events[j + 1].rest && sameSound(events[j], events[j + 1])) {
      events[j + 1].tiedIn = true
      e.soundBeats += events[j + 1].beats
      j++
    }
  }
  return { events, barStarts, total: t }
}

const sameSound = (a, b) =>
  a.notes.length === b.notes.length && a.notes.every((n, i) => n.midi === b.notes[i].midi)

/* ---------- melody <-> compás beats ---------- */

/**
 * Join the staves of consecutive beats into one melody. Empty or short beats
 * are filled with rests so the rhythm is kept; trailing rests are dropped.
 * Beat items must be absolute (see toAbsolute).
 */
export function beatsToMelody(beatItems) {
  const out = []
  let carry = 0 // beats a long note already covers
  for (const items of beatItems) {
    if (!items?.length) {
      if (carry >= 1 - 1e-6) carry -= 1
      else {
        out.push(...restsFor(1 - carry))
        carry = 0
      }
      continue
    }
    // leading rests that only wait out the previous beat's long note are already covered
    let start = 0
    let covered = carry
    while (start < items.length && items[start].rest && itemBeats(items[start]) <= covered + 1e-6) {
      covered -= itemBeats(items[start])
      start++
    }
    const own = items.slice(start)
    out.push(...own.map((it) => ({ ...it, note: [...(it.note || [])] })))
    const total = carry - covered + own.reduce((sum, it) => sum + itemBeats(it), 0)
    if (total < 1 - 1e-6) out.push(...restsFor(1 - total))
    carry = Math.max(0, total - 1)
  }
  while (out.length && out[out.length - 1].rest) out.pop()
  return out
}

/**
 * Split a melody into beats: each note goes to the beat it starts in, with a
 * rest in front when it starts after the beat. Items must be absolute.
 * @returns {object[][]} one item list per beat
 */
export function melodyToBeats(items) {
  const beats = []
  let t = 0
  const placed = []
  for (const it of items) {
    if (!it.rest) placed.push({ it, at: t })
    t += itemBeats(it)
  }
  if (!placed.length) return beats

  const last = Math.floor(placed[placed.length - 1].at + 1e-6)
  for (let k = 0; k <= last; k++) beats.push([])
  const pos = beats.map((_, k) => k)
  for (const { it, at } of placed) {
    const k = Math.floor(at + 1e-6)
    if (at - pos[k] > 1e-6) beats[k].push(...restsFor(at - pos[k]))
    beats[k].push({ ...it, note: [...it.note] })
    pos[k] = at + itemBeats(it)
  }
  return beats
}

/* ---------- copy & paste between editors ---------- */

const CLIP_KEY = 'music-notes-clipboard'

function readClip() {
  try {
    const raw = JSON.parse(localStorage.getItem(CLIP_KEY) || 'null')
    return Array.isArray(raw?.items) && raw.items.length ? raw.items.map(fitItem) : null
  } catch {
    return null
  }
}

/** Notes copied in either editor, absolute spelling. Shared across tabs. */
export const copiedNotes = ref(typeof localStorage === 'undefined' ? null : readClip())

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CLIP_KEY) copiedNotes.value = readClip()
  })
}

export function copyNotes(items) {
  const clean = (items || []).map(fitItem)
  if (!clean.length) return false
  copiedNotes.value = clean
  try {
    localStorage.setItem(CLIP_KEY, JSON.stringify({ items: clean, at: Date.now() }))
  } catch {
    /* storage blocked: the copy still works in this tab */
  }
  return true
}

/** "E G♯. – B~", for short labels and text export */
export function itemsText(items) {
  return (items || [])
    .map((n) => {
      const body = n.rest ? '–' : (n.note || []).map(displayLetter).join('+')
      return `${body}${n.dot ? '.' : ''}${n.tie ? '~' : ''}`
    })
    .join(' ')
}
