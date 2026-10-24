/* =====================================================
   Practice-room missions.
   A section with `mission: '<id>'` hands the reader a task
   in the practice room. The practice tools report what the
   reader does (a chord, an interval, a scale, a tuned guitar);
   a matching active mission is completed, its reward applied,
   and its topic unlocks "music moves" in duels.
===================================================== */

export const MISSIONS = {
  chord_c: {
    topic: 'chords',
    tool: '/tones',
    icon: 'piano',
    reward: [{ stat: 'inspiration', raise: 1 }],
    check: (e) => e.type === 'chord' && e.root === 0 && e.quality === 'major',
  },
  tune: {
    topic: 'tuning',
    tool: '/tuner',
    icon: 'tune',
    reward: [{ stat: 'luck', raise: 1 }],
    check: (e) => e.type === 'tuned',
  },
  fifth: {
    topic: 'intervals',
    tool: '/tones',
    icon: 'straighten',
    reward: [{ stat: 'skill', raise: 1 }],
    check: (e) => e.type === 'interval' && e.semis === 7,
  },
  chord_am: {
    topic: 'chords',
    tool: '/tones',
    icon: 'piano',
    reward: [{ stat: 'luck', raise: 1 }],
    check: (e) => e.type === 'chord' && e.root === 9 && e.quality === 'minor',
  },
  pentatonic: {
    topic: 'scales',
    tool: '/tones',
    icon: 'graphic_eq',
    reward: [{ stat: 'inspiration', raise: 1 }],
    check: (e) => e.type === 'scale' && e.key === 'minorPentatonic' && e.root === 9,
  },
  dorian: {
    topic: 'scales',
    tool: '/tones',
    icon: 'waves',
    reward: [{ stat: 'luck', raise: 1 }],
    check: (e) => e.type === 'scale' && e.key === 'dorian' && e.root === 2,
  },
  zann: {
    topic: 'scales',
    tool: '/tones',
    icon: 'nights_stay',
    reward: [{ stat: 'luck', raise: 1 }],
    check: (e) => e.type === 'scale' && e.key === 'phrygianDominant' && e.root === 4,
  },
  compose: {
    topic: 'scales',
    tool: '/composer',
    icon: 'edit_note',
    reward: [{ stat: 'inspiration', raise: 1 }],
    check: (e) => e.type === 'composed' && e.notes >= 8,
  },
}

export const MISSION_IDS = Object.keys(MISSIONS)

/** Topics unlocked by finished missions – the music moves a duel offers. */
export const topicsOf = (missions = {}) => [
  ...new Set(MISSION_IDS.filter((id) => missions[id] === 'done').map((id) => MISSIONS[id].topic)),
]
