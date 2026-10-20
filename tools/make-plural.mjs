/* =====================================================
   Builds the Bulgarian "вие" edition of the story
   (src/story/content/bg-plural.js) from the "ти" text.
   Used when a reader chooses the plural form of address.

   Run after changing the Bulgarian story:
     node tools/make-plural.mjs           # write the file
     node tools/make-plural.mjs --review  # also print what to check

   1. word forms [m|f|n|p] are resolved to the plural/neutral form
   2. rules turn "ти"-forms into "вие"-forms:
      verbs (лежиш → лежите), "си" → "сте" (not the reflexive "си"),
      ти/теб/те/твой… → вие/ви/вас/ваш…
   3. lines where Tommy speaks to someone else stay as they are
   4. a table of manual fixes covers past tenses and imperatives
===================================================== */
import { writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const bg = (await import('../src/story/content/bg.js')).default
const REVIEW = process.argv.includes('--review')
const MAIN = import.meta.url === `file://${process.argv[1]}`

/* ---------- 1. resolve the word forms ---------- */
const FORM = /\[([^[\]|]*(?:\|[^[\]|]*)+)\]/g
const resolve = (t) => t.replace(FORM, (m, b) => { const x = b.split('|'); return x[3] ?? x[2] ?? x[0] })

/* ---------- 3. Tommy talking to others: never converted ---------- */
const KEEP = [
  'Какво искаш всъщност, Белян?',
  'А ти откъде знаеш? Кой си ти?',
  'Мълчи. Искам да свиря своята музика.',
  'Ела у нас. Ще свирим – ти на тенджерите, аз на китарата.',
  'Какво искаш?',
  'Разкарай се бе, Сумо!',
  'Здравей, въображаеми приятелю.',
  'Защо точно аз?',
  // Tommy to the voice by the Thracian well
  '„Ще се справя без теб.“',
  '„Помогни ми да го изпратим у дома. Без цена.“',
  // the voice (and Tommy's borrowed mouth) say this to Belyan
  'Някой ден ще те изям',
  // Tommy's own note to himself in the recipe
  'Приеми, че твоето желание няма никакво значение. Дори нищо да не стане – голяма работа, животът продължава. Самият живот е най-големият късмет, който можеш да извадиш. Радвай му се.',
]

/* ---------- 4. manual fixes (applied after the rules) ---------- */
const FIXES = [
  // imperatives addressed to Tommy
  ['Томи, ставай вече!', 'Томи, ставайте вече!'],
  ['Лягай!', 'Лягайте!'],
  ['Пази го – перцето', 'Пазете го – перцето'],
  ['Само не пиши в нея', 'Само не пишете в нея'],
  ['Повярвай ми.', 'Повярвайте ми.'],
  ['Гледай пръстите ми.', 'Гледайте пръстите ми.'],
  ['Хвърли зар', 'Хвърлете зар'],
  ['Слушай тишината между нотите', 'Слушайте тишината между нотите'],
  ['Не ме слушай, старец съм. Но внимавай', 'Не ме слушайте, старец съм. Но внимавайте'],
  ['Постарай се.', 'Постарайте се.'],
  ['Не губи време', 'Не губете време'],
  ['Наричай ме Слушащия', 'Наричайте ме Слушащия'],
  ['Позволи ми', 'Позволете ми'],
  ['Вслушай се в предците си', 'Вслушайте се в предците си'],
  ['Само не свири нощем', 'Само не свирете нощем'],
  ['Не ме будалкай', 'Не ме будалкайте'],
  ['събуди се. Днес ще', 'събудете се. Днес ще'],
  ['Напълни го.', 'Напълнете го.'],
  ['хвани се за моя глас', 'хванете се за моя глас'],
  ['Дай ми ръцете си', 'Дайте ми ръцете си'],
  ['Просто ми отвори вратата', 'Просто ми отворете вратата'],
  ['отвори ми вратата', 'отворете ми вратата'],
  ['Изяж една', 'Изяжте една'],
  ['Пръстите те болят', 'Пръстите ви болят'],
  ['думите те настигнат', 'думите ви настигнат'],
  ['когато някой те хвали', 'когато някой ви хвали'],
  ['Вътре си.', 'Вътре сте.'],
  ['Сега си намери глас', 'Сега си намерете глас'],
  ['Ваше е. Извинявай.', 'Ваше е. Извинявайте.'],
  ['Хвани се за гласа ми', 'Хванете се за гласа ми'],
  ['„Слушай тишината.“', '„Слушайте тишината.“'],
  ['Затваряй я.', 'Затваряйте я.'],
  // the Thracian well
  ['– Ви – казва той. – Разбира се, че ще си ви.', '– Вие – казва той. – Разбира се, че ще сте вие.'],
  ['„Не яж нищо', '„Не яжте нищо'],
  ['Не, не ви. Аз.', 'Не, не вие. Аз.'],
  ['С мен си силни', 'С мен сте силни'],
  ['Пази го. Показва пътя.', 'Пазете го. Показва пътя.'],
  // the misty shore and the mine
  ['Сложи го до ухото си, когато ви е тежко', 'Сложете го до ухото си, когато ви е тежко'],
  ['Слушай ме.', 'Слушайте ме.'],
  ['не викай името си. Не му давай гласа си.', 'не викайте името си. Не му давайте гласа си.'],
  ['Томи, тук съм. Ела.', 'Томи, тук съм. Елате.'],
  ['С ваша глас', 'С вашия глас'],
  ['Тогава знай:', 'Тогава знайте:'],
  ['сте късметлия', 'сте късметлии'],
  ['Прочети я веднъж', 'Прочетете я веднъж'],
  // past tenses of "you"
  ['Чел ли сте', 'Чели ли сте'],
  ['Вие беше единственият човек, който не заспа на лекцията.', 'Вие бяхте единствените, които не заспаха на лекцията.'],
  ['песента, която писа през седмицата', 'песента, която писахте през седмицата'],
  ['Всичко, което събра по пътя', 'Всичко, което събрахте по пътя'],
  ['После ви докосна струните', 'После вие докоснахте струните'],
  ['както ви гледаше китарата си', 'както вие гледахте китарата си'],
  ['когато беше бебе', 'когато бяхте бебе'],
  ['Ако имаше перце', 'Ако имахте перце'],
  ['Гласът е бил тих', 'Гласът е бил тих'],
  // endings: the summaries speak of what you did
  ['Изсвири на мрака своята песен', 'Изсвирихте на мрака своята песен'],
  ['Победи мрака и изсвири своята песен', 'Победихте мрака и изсвирихте своята песен'],
  ['Свири чисто, но', 'Свирихте чисто, но'],
]

/* ---------- 2. the rules ---------- */
const NOT_VERBS = new Set(['сякаш', 'пустош', 'наш', 'ваш', 'душ', 'тиш', 'кош'])
const isVerb2sg = (w) => w.length > 2 && /ш$/.test(w) && !NOT_VERBS.has(w.toLowerCase())
const pluralVerb = (w) => w.replace(/иш$/, 'ите').replace(/еш$/, 'ете').replace(/аш$/, 'ате').replace(/яш$/, 'яте')
const AUX_BEFORE = new Set(['ти', 'вие', 'дали', 'не', 'колко', 'ли', 'вече', 'наистина', 'още', 'също', 'когато', 'където', 'че', 'сякаш', 'ако', 'като', 'докато', 'щом', 'защото'])
const isParticiple = (w) => /(ал|ял|ил|ел|ъл|ли|ла|ло)$/.test(w) && w.length > 3
const BETWEEN = new Set(['също', 'обаче', 'наистина', 'поне', 'не', 'вече', 'още', 'ме', 'го', 'я', 'се', 'ги', 'му', 'ѝ', 'им'])
const POSS = { твоят: 'вашият', твоята: 'вашата', твоето: 'вашето', твоите: 'вашите', твоя: 'ваша', твой: 'ваш', твое: 'ваше' }
const keepCase = (src, out) => (src[0] === src[0].toUpperCase() ? out[0].toUpperCase() + out.slice(1) : out)

function convert(text) {
  // protect what must stay
  const kept = []
  let t = text
  KEEP.forEach((k) => {
    while (t.includes(k)) {
      t = t.replace(k, `\u0000${kept.length}\u0000`)
      kept.push(k)
    }
  })
  const tokens = t.split(/([А-Яа-яЁёѝЍ]+)/u) // words at odd indices
  const word = (i) => (i >= 1 && i < tokens.length ? tokens[i] : '')
  const lower = (i) => word(i).toLowerCase()
  const nextWords = (i, n) => {
    const out = []
    for (let j = i + 2; j < tokens.length && out.length < n; j += 2) {
      if (/[.!?;:,–„“"]/.test(tokens[j - 1])) break // stop at the end of the clause
      out.push(tokens[j])
    }
    return out
  }
  for (let i = 1; i < tokens.length; i += 2) {
    const w = tokens[i]
    const lw = w.toLowerCase()
    const prev = lower(i - 2)
    const LOG = process.env.PLURAL_LOG
    const around = () => tokens.slice(Math.max(0, i - 6), i + 7).join('').replace(/\s+/g, ' ')
    if (lw === 'ти') {
      const ahead = nextWords(i, 4)
      let subject = false
      for (const a of ahead) {
        const la = a.toLowerCase()
        // "Ти и ритъмът…" starts a sentence; "ръката ти и…" does not
        if (isVerb2sg(la) || la === 'си' || la === 'беше' || la === 'ще' || (la === 'и' && w === 'Ти')) { subject = true; break }
        if (!BETWEEN.has(la)) break
      }
      tokens[i] = subject ? keepCase(w, 'вие') : keepCase(w, 'ви')
      if (LOG === 'ти') console.log(`ти→${tokens[i]}: …${around()}…`)
    } else if (lw === 'теб' || lw === 'тебе') {
      tokens[i] = keepCase(w, 'вас')
    } else if (lw === 'те') {
      // "те" as "you" (те прави, те гледа) – but not "they" (Те бяха, те са)
      const next = lower(i + 2)
      const after = next === 'се' ? lower(i + 4) : next
      const they = /(ха|ат|ят|ли)$/.test(after) || ['са', 'бяха', 'не'].includes(next) || w === 'Те'
      if (!they) tokens[i] = 'ви'
      if (LOG === 'те') console.log(`те→${tokens[i]}: …${around()}…`)
    } else if (POSS[lw]) {
      tokens[i] = keepCase(w, POSS[lw])
    } else if (lw === 'си') {
      const next = lower(i + 2)
      // "си" before a verb is reflexive (мислиш си, си шепнат); "си се научил" is still the auxiliary
      const reflexive = isVerb2sg(next) || /(ат|ят|ха)$/.test(next) || (next === 'се' && !isParticiple(lower(i + 4)))
      if (!reflexive && (AUX_BEFORE.has(prev) || isParticiple(next))) tokens[i] = 'сте'
      if (LOG === 'си') console.log(`си→${tokens[i]}: …${around()}…`)
    } else if (isVerb2sg(lw)) {
      tokens[i] = keepCase(w, pluralVerb(lw))
    }
  }
  t = tokens.join('')
  // "Ти и ритъмът" etc. read as "Вие и…"; the rules already did that
  for (const [a, b] of FIXES) t = t.split(a).join(b)
  // "в вас" → "във вас" (Bulgarian: в before в/ф becomes във)
  t = t.replace(/(?<![А-Яа-я])([Вв]) (вас|ваш\p{L}*)/gu, '$1ъв $2')
  return t.replace(/\u0000(\d+)\u0000/g, (m, n) => kept[+n])
}

/* ---------- build ---------- */
const used = new Set()
function convertDeep(o) {
  if (typeof o === 'string') {
    const out = convert(resolve(o))
    for (const [a] of FIXES) if (out.includes(FIXES.find((f) => f[0] === a)[1])) used.add(a)
    return out
  }
  if (Array.isArray(o)) return o.map(convertDeep)
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, k.startsWith('if') ? v : convertDeep(v)]))
  return o
}

export const sourceHash = (content) =>
  createHash('sha256').update(JSON.stringify({ pitch: content.pitch, items: content.items, endings: content.endings, sections: content.sections })).digest('hex').slice(0, 16)

const plural = {
  ...bg,
  source: sourceHash(bg),
  pitch: convertDeep(bg.pitch),
  items: convertDeep(bg.items),
  endings: convertDeep(bg.endings),
  sections: convertDeep(bg.sections),
}

if (MAIN) {
const header = `/* GENERATED by tools/make-plural.mjs from bg.js – do not edit by hand.
   The Bulgarian story for readers addressed in the plural ("вие").
   To change it, edit the Bulgarian text (bg/part*.js) or the rules
   and fixes in tools/make-plural.mjs, then run: node tools/make-plural.mjs */\n\n`
writeFileSync(new URL('../src/story/content/bg-plural.js', import.meta.url), header + 'export default ' + JSON.stringify(plural, null, 2) + '\n')

const unused = FIXES.filter(([a, b]) => a !== b && !used.has(a)).map(([a]) => a)
console.log(`bg-plural.js written. Fixes applied: ${FIXES.length - unused.length}/${FIXES.length}`)
if (unused.length) console.log('Fixes that no longer match (check them):\n  ' + unused.join('\n  '))

if (REVIEW) {
  // anything still in the singular, for a person to look at
  const out = []
  const walk = (o, p) => {
    if (typeof o === 'string') {
      const left = o.match(/(?<![А-Яа-я])(ти|Ти|теб|твой\w*|Твой\w*|си)(?![А-Яа-я])|[А-Яа-я]+ш(?![А-Яа-я])/gu)?.filter((x) => !NOT_VERBS.has(x.toLowerCase()) && x !== 'си') ?? []
      if (left.length) out.push(`${p}: ${left.join(', ')}  ←  ${o.slice(0, 110)}`)
    } else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k)
  }
  walk(plural.sections, '')
  walk(plural.items, 'items')
  walk(plural.endings, 'endings')
  console.log('\nStill singular (Tommy speaking to others is expected):')
  console.log(out.join('\n'))
}
}
