/* =====================================================
   npm run check-story
   Checks the game-book after any change to the story:
   - every link leads to an existing section, no dead ends
   - all text exists in Bulgarian and English
     (titles, paragraphs, choices, dice outcomes, test/lesson
     results, enemies, endings, items, song moods and lines)
   - every [m|f|n] word form has exactly three forms
   - every section can be reached (random playthroughs)
   Exits with code 1 when something is wrong.
===================================================== */
import { register } from 'node:module'

register('./story-loader-hooks.mjs', import.meta.url)

const { SECTIONS, START, ENDINGS, SECTION_COUNT } = await import('src/story/book.js')
const { ITEMS } = await import('src/story/items.js')
const { MOODS, LINES_PER_MOOD } = await import('src/story/song.js')
const E = await import('src/game/engine.js')
const bg = (await import('src/story/content/bg.js')).default
const en = (await import('src/story/content/en.js')).default

const GAMES = Number(process.argv[2]) || 5000
const problems = []
const LANGS = [
  ['bg', bg],
  ['en', en],
]

/* ---------- structure and text ---------- */
for (const [key, s] of Object.entries(SECTIONS)) {
  const targets = [
    s.next,
    ...(s.choices ?? []).map((c) => c.to),
    s.test?.success.to,
    s.test?.failure.to,
    s.lesson?.success.to,
    s.lesson?.failure.to,
    ...(s.roll?.outcomes ?? []).map((o) => o.to),
    s.duel?.win,
    s.duel?.lose,
  ].filter(Boolean)
  for (const t of targets) if (!SECTIONS[t]) problems.push(`${key}: links to missing section "${t}"`)
  if (!s.ending && !targets.length) problems.push(`${key}: dead end (no way out)`)
  if (s.ending && !ENDINGS[s.ending]) problems.push(`${key}: unknown ending "${s.ending}"`)

  for (const [lang, c] of LANGS) {
    const t = c.sections[key]
    if (!t) {
      problems.push(`${lang}: no text for section "${key}"`)
      continue
    }
    if (!t.title || !t.text?.length) problems.push(`${lang}: ${key} has no title or text`)
    for (const ch of s.choices ?? []) if (!t.choices?.[ch.id]) problems.push(`${lang}: ${key} choice "${ch.id}" has no text`)
    for (const o of s.roll?.outcomes ?? []) if (!t.outcomes?.[o.id]) problems.push(`${lang}: ${key} dice outcome "${o.id}" has no text`)
    if ((s.test || s.lesson) && (!t.success || !t.failure)) problems.push(`${lang}: ${key} needs success and failure text`)
    if (s.duel && !c.enemies?.[s.duel.enemy]) problems.push(`${lang}: no name for enemy "${s.duel.enemy}"`)
  }
}
for (const [lang, c] of LANGS) {
  for (const id of Object.keys(ENDINGS)) if (!c.endings?.[id]?.title) problems.push(`${lang}: ending "${id}" has no title`)
  for (const id of Object.keys(ITEMS)) if (!c.items?.[id]?.name) problems.push(`${lang}: item "${id}" has no name`)
  for (const m of MOODS) {
    if (!c.song?.moods?.[m]?.name) problems.push(`${lang}: song mood "${m}" has no name`)
    if ((c.song?.lines?.[m] ?? []).length !== LINES_PER_MOOD)
      problems.push(`${lang}: song mood "${m}" needs ${LINES_PER_MOOD} lines`)
  }
  for (const key of Object.keys(c.sections)) if (!SECTIONS[key]) problems.push(`${lang}: text for unknown section "${key}"`)
}

/* ---------- illustrations ---------- */
{
  const fs = await import('node:fs')
  const src = fs.readFileSync(new URL('../src/story/illustrations.js', import.meta.url), 'utf8')
  const block = src.slice(src.indexOf('SECTION_ILLUSTRATIONS'))
  const map = Object.fromEntries([...block.matchAll(/^\s+(\w+): '(\w+)',$/gm)].map((m) => [m[1], m[2]]))
  for (const [section, name] of Object.entries(map)) {
    if (!SECTIONS[section]) problems.push(`illustration for unknown section "${section}"`)
    if (!fs.existsSync(new URL(`../src/assets/illustrations/${name}.webp`, import.meta.url)))
      problems.push(`missing picture src/assets/illustrations/${name}.webp`)
    for (const [lang, c] of LANGS) if (!c.illustrations?.[name]) problems.push(`${lang}: illustration "${name}" has no description`)
  }
}

/* ---------- word forms [m|f|n] ---------- */
const FORM = /\[([^[\]|]*(?:\|[^[\]|]*)+)\]/g
const strings = (o, acc = []) => {
  if (typeof o === 'string') acc.push(o)
  else if (o && typeof o === 'object') for (const v of Object.values(o)) strings(v, acc)
  return acc
}
for (const [lang, c] of LANGS) {
  for (const s of strings(c)) {
    for (const m of s.matchAll(FORM)) {
      if (m[1].split('|').length !== 3) problems.push(`${lang}: "${m[0]}" should have three forms [m|f|n]`)
    }
    if (/\[[^\]]*$|^[^[]*\]/.test(s.replace(FORM, ''))) problems.push(`${lang}: unbalanced [ ] in "${s.slice(0, 50)}…"`)
  }
}

function report(list, extra = '') {
  const unique = [...new Set(list)]
  console.log(`Sections: ${SECTION_COUNT} (start: ${START})${extra}`)
  if (!unique.length) return
  console.log(`\n✗ ${unique.length} problem(s):`)
  for (const p of unique.slice(0, 60)) console.log(`  - ${p}`)
  process.exit(1)
}

// broken links or missing text first – playing a broken book makes no sense
if (problems.length) report(problems)

/* ---------- reachability: random playthroughs ---------- */
const visited = new Set()
const endings = {}
let stuck = 0
for (let g = 0; g < GAMES; g++) {
  let s = E.newGame(E.rollHero())
  for (let guard = 0; s.status === 'playing' && guard < 800; guard++) {
    visited.add(s.section)
    const sec = SECTIONS[s.section]
    const before = s
    if (E.pendingVerses(s) > 0) s = E.composeVerse(s, { mood: MOODS[g % 4], line: s.song.verses.length % LINES_PER_MOOD, prog: 0 })
    else if (sec.lesson && !s.resolved) s = E.resolveLesson(s, { score: Math.floor(Math.random() * 4), total: 3 })
    else if (sec.test && !s.resolved) s = E.resolveTest(s)
    else if (sec.roll && !s.resolved) s = E.resolveRoll(s)
    else if (sec.duel && !s.resolved) s = E.duelRound(s)
    else if (s.resolved?.to || sec.next) s = E.continueOn(s)
    else {
      const ch = E.visibleChoices(s)
      if (!ch.length) {
        stuck++
        problems.push(`no visible choice in "${s.section}" (flags: ${Object.keys(s.flags).join(', ')})`)
        break
      }
      s = E.choose(s, ch[Math.floor(Math.random() * ch.length)].id)
    }
    if (s === before) {
      stuck++
      problems.push(`stuck in "${s.section}"`)
      break
    }
  }
  visited.add(s.section)
  endings[s.endingId ?? 'none'] = (endings[s.endingId ?? 'none'] ?? 0) + 1
}
const unreached = Object.keys(SECTIONS).filter((k) => !visited.has(k))
for (const k of unreached) problems.push(`section "${k}" was never reached in ${GAMES} games`)

/* ---------- report ---------- */
const summary = Object.entries(endings)
  .map(([k, v]) => `${k} ${v}`)
  .join(', ')
report(problems, `\nRandom games: ${GAMES}, endings: ${summary}`)
console.log('\n✓ The story is complete: every section reachable, no dead ends, all text in both languages.')
