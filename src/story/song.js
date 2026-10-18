/* =====================================================
   The reader's song.
   Each verse = a mood + one line of lyrics + a chord progression.
   Line texts and mood names live in content/bg.js and en.js
   (content.song); here are only ids and chords.
   Every chord is an open chord a beginner can play, drawn with
   the practice room's ChordDiagram and played by its synth.
===================================================== */

export const MOODS = ['tender', 'sad', 'brave', 'starry']

export const LINES_PER_MOOD = 6

export const PROGRESSIONS = {
  tender: [
    ['C', 'Am', 'F', 'G'],
    ['G', 'Em', 'C', 'D'],
    ['D', 'G', 'A', 'D'],
  ],
  sad: [
    ['Am', 'F', 'C', 'G'],
    ['Am', 'G', 'F', 'E'], // the Andalusian cadence, as in flamenco
    ['Em', 'C', 'G', 'D'],
  ],
  brave: [
    ['G', 'D', 'Em', 'C'],
    ['A', 'D', 'E', 'A'],
    ['E', 'G', 'A', 'E'],
  ],
  starry: [
    ['Cmaj7', 'Fmaj7', 'Cmaj7', 'Fmaj7'],
    ['Am7', 'Dm7', 'G', 'Cmaj7'],
    ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7'],
  ],
}

/** Three lines to choose from, never one already used, varying verse to verse. */
export function lineOptions(mood, verses) {
  const used = new Set(verses.filter((v) => v.mood === mood).map((v) => v.line))
  const free = Array.from({ length: LINES_PER_MOOD }, (_, i) => i).filter((i) => !used.has(i))
  const shift = verses.length % Math.max(1, free.length)
  return [...free.slice(shift), ...free.slice(0, shift)].slice(0, 3)
}

export const progression = (mood, index) => PROGRESSIONS[mood]?.[index] ?? []
