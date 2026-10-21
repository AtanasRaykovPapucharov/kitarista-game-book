/* =====================================================
   "Next time…": after any ending but the brightest,
   up to three hints chosen from what this reader did –
   pointing the way without giving the story away.
===================================================== */
import { topicsOf } from 'src/story/missions'

const HINTS = [
  { id: 'darkness', when: (s) => (s.stats?.darkness ?? 0) >= 5 },
  { id: 'song', when: (s) => (s.song?.verses?.length ?? 0) < 3 },
  { id: 'feather', when: (s) => !s.items?.feather && !s.flags?.witness },
  { id: 'ask', when: (s) => !s.flags?.dark_understood },
  { id: 'missions', when: (s) => topicsOf(s.missions).length === 0 },
  { id: 'well', when: (s) => !s.flags?.colour_home },
  { id: 'mom', when: (s) => !s.flags?.told_mom },
  { id: 'window', when: (s) => !s.flags?.zann_saved },
]

export function hintsFor(save, max = 3) {
  if (!save || save.endingId === 'light') return []
  return HINTS.filter((h) => h.when(save))
    .slice(0, max)
    .map((h) => h.id)
}
