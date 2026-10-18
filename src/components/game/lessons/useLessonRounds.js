import { computed, ref } from 'vue'

/* Shared quiz flow for the ear and eye lessons:
   a few rounds, one answer each, then a score. */
export function useLessonRounds(makeRound, total = 3) {
  const rounds = ref(Array.from({ length: total }, (_, i) => makeRound(i)))
  const index = ref(0)
  const answer = ref(null)
  const score = ref(0)
  const round = computed(() => rounds.value[index.value])
  const answered = computed(() => answer.value !== null)
  const last = computed(() => index.value === total - 1)

  function choose(value) {
    if (answered.value) return
    answer.value = value
    if (value === round.value.correct) score.value += 1
  }

  /** Moves on; returns the final result after the last round, else null. */
  function next() {
    if (!answered.value) return null
    if (last.value) return { score: score.value, total }
    index.value += 1
    answer.value = null
    return null
  }

  return { round, index, answer, answered, score, last, total, choose, next }
}

export const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
