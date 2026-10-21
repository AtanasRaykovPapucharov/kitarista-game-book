/* =====================================================
   Questions for the duel's "music move", built from the
   topics the reader unlocked with practice-room missions.
===================================================== */

const pick = (list) => list[Math.floor(Math.random() * list.length)]
const shuffle = (list) => [...list].sort(() => Math.random() - 0.5)
const NOTE = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']

const SCALES = {
  minorPentatonic: { root: 9, pcs: [9, 0, 2, 4, 7] }, // A C D E G
  dorian: { root: 2, pcs: [2, 4, 5, 7, 9, 11, 0] }, // D E F G A B C
  phrygianDominant: { root: 4, pcs: [4, 5, 8, 9, 11, 0, 2] }, // E F G♯ A B C D
}

export function makeQuestion(topics) {
  const topic = pick(topics)

  if (topic === 'chords') {
    const pool = ['C', 'Am', 'G', 'Em', 'D', 'E', 'A', 'Dm']
    const answer = pick(pool)
    const options = shuffle([answer, ...shuffle(pool.filter((c) => c !== answer)).slice(0, 2)])
    return { topic, kind: 'diagram', chord: answer, options, answer }
  }

  if (topic === 'intervals') {
    const all = [3, 4, 5, 7, 12]
    const answer = pick(all)
    const options = shuffle([answer, ...shuffle(all.filter((n) => n !== answer)).slice(0, 2)])
    return { topic, kind: 'interval', root: 48 + Math.floor(Math.random() * 10), options, answer }
  }

  if (topic === 'scales') {
    const key = pick(Object.keys(SCALES))
    const { root, pcs } = SCALES[key]
    const outside = shuffle([...Array(12).keys()].filter((p) => !pcs.includes(p)))[0]
    const inside = shuffle(pcs).slice(0, 2)
    const options = shuffle([outside, ...inside]).map((p) => NOTE[p])
    return {
      topic,
      kind: 'odd-note',
      scaleKey: key,
      rootName: NOTE[root],
      options,
      answer: NOTE[outside],
    }
  }

  // tuning
  const cents = 30 * (Math.random() < 0.5 ? -1 : 1)
  return {
    topic: 'tuning',
    kind: 'tuning',
    midi: pick([40, 45, 50, 55, 59, 64]),
    cents,
    options: ['lower', 'higher'],
    answer: cents > 0 ? 'higher' : 'lower',
  }
}
