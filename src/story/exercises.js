/* =====================================================
   "Play with me": exercises on the real guitar.
   Each step is one note at one place on the neck
   (string 1 = high E … 6 = low E; MIDI = how it sounds).
   An exercise with the id of a book mission also
   completes that mission.
===================================================== */

const at = (string, fret) => ({ string, fret, midi: [64, 59, 55, 50, 45, 40][string - 1] + fret })

export const EXERCISES = {
  chord_c: { icon: 'piano', steps: [at(5, 3), at(4, 2), at(3, 0), at(2, 1), at(1, 0)] },
  fifth: { icon: 'straighten', steps: [at(6, 0), at(5, 2)] },
  chord_am: { icon: 'piano', steps: [at(5, 0), at(4, 2), at(3, 2), at(2, 1), at(1, 0)] },
  pentatonic: {
    icon: 'graphic_eq',
    steps: [at(5, 0), at(5, 3), at(4, 0), at(4, 2), at(3, 0), at(3, 2)],
  },
  dorian: {
    icon: 'waves',
    steps: [at(4, 0), at(4, 2), at(4, 3), at(3, 0), at(3, 2), at(2, 0), at(2, 1), at(2, 3)],
  },
  // E Phrygian dominant – the old man's song: E F G♯ A B C D E
  zann: {
    icon: 'nights_stay',
    steps: [at(6, 0), at(6, 1), at(6, 4), at(5, 0), at(5, 2), at(5, 3), at(4, 0), at(4, 2)],
  },
}

export const EXERCISE_IDS = Object.keys(EXERCISES)
