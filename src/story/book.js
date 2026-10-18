/* =====================================================
   „Докато слушаш звездите“ – the game-book structure.

   Only mechanics live here (where each section leads,
   what it tests, what it changes). The words live in
   ./content/bg.js and ./content/en.js under the same keys.

   Section fields (all optional):
     effects  – applied once, when the reader enters the section
     next     – a single "continue" link
     choices  – [{ id, to, requires?, effects? }]
     test     – { stat: 'luck' | 'skill', success: { to, effects? }, failure: { to, effects? } }
     roll     – { dice, outcomes: [{ range: [min, max], id, to, effects? }] }
     duel     – { enemy, skill, stamina, yieldAfter, win, lose, enemyMods?, playerMods? }
     ending   – id from ENDINGS; the adventure stops here

   Conditions (requires):
     item, notItem, flag, notFlag, anyFlag: [],
     statMin / statMax: { stat: n }, counterMin / counterMax: { counter: n }
===================================================== */

export const START = 'prologue'
export const SILENCE = 'silenceEnd'
export const DARKNESS_MAX = 10

// The reader's three classic stats plus the story's own: Darkness.
export const STATS = ['skill', 'inspiration', 'luck', 'darkness']

export const ENDINGS = {
  light: { section: 'lightEnd', tone: 'best' },
  guitarist: { section: 'guitaristEnd', tone: 'good' },
  start: { section: 'goodStartEnd', tone: 'good' },
  puppet: { section: 'puppetEnd', tone: 'bad' },
  silence: { section: 'silenceEnd', tone: 'bad' },
}

/* ---------- effect helpers ---------- */
const add = (stat, n) => ({ stat, add: n })
const raise = (stat, n = 1) => ({ stat, raise: n })
const restore = (stat) => ({ stat, restore: true })
const give = (item, n = 1) => ({ item, add: n })
const take = (item) => ({ item, remove: true })
const flag = (name) => ({ flag: name })
const count = (counter, n = 1) => ({ counter, add: n })
const setCount = (counter, n) => ({ counter, set: n })

export const SECTIONS = {
  /* ---------- Part I: the gift ---------- */
  prologue: { next: 'eve' },

  eve: {
    choices: [
      { id: 'sneak', to: 'sneak' },
      { id: 'sleep', to: 'dream' },
    ],
  },

  sneak: {
    test: {
      stat: 'luck',
      success: { to: 'birthday', effects: [add('darkness', 1)] },
      failure: { to: 'birthday', effects: [add('inspiration', -2)] },
    },
  },

  dream: {
    choices: [
      { id: 'look', to: 'dreamLook' },
      { id: 'light', to: 'dreamLight' },
    ],
  },
  dreamLook: { effects: [add('darkness', 1), flag('saw_dark')], next: 'birthday' },
  dreamLight: { effects: [add('luck', 1), flag('chose_light')], next: 'birthday' },

  birthday: {
    effects: [give('guitar'), give('pancakes', 3)],
    roll: {
      dice: 1,
      outcomes: [
        { range: [1, 2], id: 'pick', to: 'firstStrum', effects: [give('pick')] },
        { range: [3, 4], id: 'songbook', to: 'firstStrum', effects: [give('songbook')] },
        { range: [5, 6], id: 'strings', to: 'firstStrum', effects: [give('strings')] },
      ],
    },
  },

  firstStrum: {
    choices: [
      { id: 'obey', to: 'voiceTip' },
      { id: 'ear', to: 'byEar' },
    ],
  },
  voiceTip: {
    effects: [raise('skill'), add('darkness', 1), flag('voice_friend')],
    next: 'school',
  },
  byEar: {
    test: {
      stat: 'skill',
      success: { to: 'school', effects: [raise('skill'), flag('own_ear')] },
      failure: { to: 'school', effects: [add('inspiration', -2), flag('own_ear')] },
    },
  },

  /* ---------- Part II: school ---------- */
  school: {
    choices: [
      { id: 'up', to: 'corridor' },
      { id: 'snooze', to: 'snooze' },
    ],
  },
  snooze: {
    roll: {
      dice: 1,
      outcomes: [
        { range: [1, 2], id: 'late', to: 'corridor', effects: [add('inspiration', -2)] },
        { range: [3, 6], id: 'rested', to: 'corridor', effects: [add('inspiration', 2)] },
      ],
    },
  },

  corridor: {
    choices: [
      { id: 'ignore', to: 'ignore' },
      { id: 'joke', to: 'belyanDuel' },
      { id: 'voice', to: 'voiceScares' },
    ],
  },
  ignore: {
    test: {
      stat: 'luck',
      success: { to: 'lecture' },
      failure: { to: 'belyanDuel' },
    },
  },
  belyanDuel: {
    duel: {
      enemy: 'belyan',
      skill: 7,
      stamina: 6,
      yieldAfter: 3,
      win: 'beatBelyan',
      lose: 'lostBelyan',
    },
  },
  beatBelyan: { effects: [add('luck', 1), flag('beat_belyan')], next: 'lecture' },
  lostBelyan: {
    effects: [add('inspiration', -2), take('pick'), flag('lost_belyan')],
    next: 'lecture',
  },
  voiceScares: { effects: [add('darkness', 2), flag('voice_scared')], next: 'lecture' },

  lecture: {
    choices: [
      { id: 'listen', to: 'lecture2' },
      { id: 'melody', to: 'melody', requires: { item: 'songbook' } },
      { id: 'viktoria', to: 'viktoria' },
    ],
  },
  lecture2: {
    effects: [add('luck', 1), flag('listened')],
    choices: [
      { id: 'ask', to: 'professor' },
      { id: 'viktoria', to: 'viktoria' },
      { id: 'home', to: 'walkHome' },
    ],
  },
  melody: {
    effects: [add('inspiration', 2), count('song')],
    choices: [
      { id: 'ask', to: 'professor' },
      { id: 'viktoria', to: 'viktoria' },
      { id: 'home', to: 'walkHome' },
    ],
  },
  professor: { effects: [flag('professor_hint')], next: 'walkHome' },

  viktoria: {
    choices: [
      { id: 'invite', to: 'invite' },
      { id: 'silent', to: 'silent' },
    ],
  },
  invite: {
    test: {
      stat: 'luck',
      success: { to: 'walkHome', effects: [add('inspiration', 3), flag('viktoria_comes')] },
      failure: { to: 'walkHome', effects: [add('inspiration', -2)] },
    },
  },
  silent: { effects: [add('inspiration', -1), flag('self_annihilated')], next: 'walkHome' },

  /* ---------- Part III: the voice ---------- */
  walkHome: {
    choices: [
      { id: 'stop', to: 'bird' },
      { id: 'pass', to: 'passBird' },
    ],
  },
  bird: { effects: [give('feather'), add('luck', 1), flag('witness')], next: 'atHome' },
  passBird: { effects: [add('darkness', 1)], next: 'atHome' },

  atHome: {
    choices: [
      { id: 'ask', to: 'origin' },
      { id: 'quiet', to: 'ownMusic' },
    ],
  },
  origin: { effects: [add('darkness', 1), flag('knows_origin')], next: 'nightmare' },
  ownMusic: {
    test: {
      stat: 'skill',
      success: { to: 'nightmare', effects: [add('inspiration', 2), flag('own_music')] },
      failure: { to: 'nightmare', effects: [add('darkness', 1)] },
    },
  },

  nightmare: {
    duel: {
      enemy: 'shadow',
      skill: 6,
      stamina: 6,
      yieldAfter: 3,
      enemyMods: [{ stat: 'darkness' }],
      win: 'wake',
      lose: 'heldDark',
    },
  },
  wake: { effects: [add('inspiration', -1), add('luck', 1)], next: 'announcement' },
  heldDark: { effects: [add('darkness', 1)], next: 'announcement' },

  /* ---------- Part IV: the practice week ---------- */
  announcement: { effects: [setCount('day', 1)], next: 'practice' },

  practice: {
    choices: [
      { id: 'scales', to: 'scales' },
      { id: 'voiceLesson', to: 'voiceLesson' },
      { id: 'compose', to: 'compose', requires: { item: 'songbook' } },
      { id: 'napkins', to: 'napkins', requires: { notItem: 'songbook' } },
      { id: 'rest', to: 'rest' },
    ],
  },
  scales: {
    test: {
      stat: 'skill',
      success: { to: 'event', effects: [raise('skill')] },
      failure: { to: 'event', effects: [add('inspiration', -1)] },
    },
  },
  voiceLesson: { effects: [raise('skill'), add('darkness', 1)], next: 'event' },
  compose: { effects: [count('song'), add('inspiration', 1)], next: 'event' },
  napkins: {
    test: {
      stat: 'luck',
      success: { to: 'event', effects: [count('song')] },
      failure: { to: 'event', effects: [add('inspiration', -1)] },
    },
  },
  rest: { effects: [add('inspiration', 3)], next: 'event' },

  event: {
    roll: {
      dice: 1,
      outcomes: [
        { range: [1, 1], id: 'string', to: 'stringBreaks' },
        { range: [2, 2], id: 'neighbor', to: 'neighbor' },
        { range: [3, 3], id: 'grandpa', to: 'grandpa' },
        { range: [4, 5], id: 'quiet', to: 'dayEnd', effects: [add('inspiration', 1)] },
        { range: [6, 6], id: 'whisper', to: 'whisper' },
      ],
    },
  },
  stringBreaks: {
    choices: [
      { id: 'spare', to: 'dayEnd', requires: { item: 'strings' }, effects: [take('strings')] },
      {
        id: 'five',
        to: 'dayEnd',
        requires: { notItem: 'strings' },
        effects: [add('inspiration', -2)],
      },
    ],
  },
  neighbor: {
    test: {
      stat: 'luck',
      success: { to: 'dayEnd', effects: [add('inspiration', 2)] },
      failure: { to: 'dayEnd', effects: [add('inspiration', -2)] },
    },
  },
  grandpa: { effects: [add('luck', 1), flag('ancestors')], next: 'dayEnd' },
  whisper: {
    choices: [
      { id: 'listen', to: 'dayEnd', effects: [add('darkness', 1), raise('skill')] },
      { id: 'headphones', to: 'dayEnd', effects: [add('inspiration', 1)] },
    ],
  },
  dayEnd: {
    effects: [count('day')],
    choices: [
      { id: 'next', to: 'practice', requires: { counterMax: { day: 3 } } },
      { id: 'saturday', to: 'openMic', requires: { counterMin: { day: 4 } } },
    ],
  },

  /* ---------- Part V: the stage ---------- */
  openMic: {
    choices: [
      { id: 'cover', to: 'cover' },
      { id: 'battle', to: 'kristianDuel' },
      { id: 'own', to: 'ownSong', requires: { counterMin: { song: 2 } } },
      { id: 'voice', to: 'voicePlays' },
    ],
  },
  cover: {
    test: {
      stat: 'skill',
      success: { to: 'recipe', effects: [add('luck', 1)] },
      failure: { to: 'recipe', effects: [add('inspiration', -2)] },
    },
  },
  kristianDuel: {
    duel: {
      enemy: 'kristian',
      skill: 9,
      stamina: 8,
      yieldAfter: 3,
      win: 'beatKristian',
      lose: 'lostKristian',
    },
  },
  beatKristian: {
    effects: [add('inspiration', 3), flag('beat_kristian'), give('metronome')],
    next: 'recipe',
  },
  lostKristian: { effects: [add('inspiration', -2)], next: 'recipe' },
  ownSong: {
    effects: [add('luck', 2), add('inspiration', 2), flag('played_own')],
    next: 'recipe',
  },
  voicePlays: {
    effects: [add('darkness', 2), add('inspiration', 2), flag('voice_played')],
    next: 'recipe',
  },

  /* ---------- Part VI: the recipe for luck ---------- */
  recipe: {
    effects: [give('recipe')],
    choices: [
      { id: 'dictated', to: 'recipeVoice' },
      {
        id: 'own',
        to: 'recipeOwn',
        requires: { anyFlag: ['own_music', 'own_ear', 'played_own'] },
      },
    ],
  },
  recipeVoice: { effects: [add('darkness', 1), flag('recipe_voice')], next: 'mom' },
  recipeOwn: { effects: [restore('luck'), flag('recipe_own')], next: 'mom' },

  mom: {
    choices: [
      { id: 'tell', to: 'tellMom' },
      { id: 'hide', to: 'hideMom' },
    ],
  },
  tellMom: {
    effects: [add('darkness', -2), add('inspiration', 2), flag('told_mom')],
    next: 'concertEve',
  },
  hideMom: { effects: [add('darkness', 1)], next: 'concertEve' },

  /* ---------- Part VII: the dark ---------- */
  concertEve: {
    choices: [
      { id: 'accept', to: 'deal' },
      { id: 'refuse', to: 'finalDream', requires: { statMax: { darkness: 5 } } },
      { id: 'tryRefuse', to: 'struggle', requires: { statMin: { darkness: 6 } } },
    ],
  },
  deal: { next: 'puppetEnd' },
  struggle: {
    test: {
      stat: 'luck',
      success: { to: 'finalDream' },
      failure: { to: 'puppetEnd' },
    },
  },

  finalDream: {
    choices: [
      { id: 'fight', to: 'darkDuel' },
      {
        id: 'play',
        to: 'lightEnd',
        requires: { item: 'feather', counterMin: { song: 3 } },
      },
    ],
  },
  darkDuel: {
    duel: {
      enemy: 'dark',
      skill: 9,
      stamina: 12,
      yieldAfter: 4,
      enemyMods: [
        { stat: 'darkness' },
        { item: 'feather', add: -1 },
        { flag: 'professor_hint', add: -1 },
        { flag: 'told_mom', add: -1 },
        { flag: 'recipe_own', add: -1 },
      ],
      playerMods: [
        { flag: 'ancestors', add: 1 },
        { flag: 'chose_light', add: 1 },
      ],
      win: 'concert',
      lose: 'puppetEnd',
    },
  },

  concert: {
    choices: [
      { id: 'own', to: 'guitaristEnd', requires: { counterMin: { song: 2 } } },
      { id: 'cover', to: 'goodStartEnd' },
    ],
  },

  /* ---------- Endings ---------- */
  lightEnd: { ending: 'light' },
  guitaristEnd: { ending: 'guitarist' },
  goodStartEnd: { ending: 'start' },
  puppetEnd: { ending: 'puppet' },
  silenceEnd: { ending: 'silence' },
}

/* =====================================================
   Section numbers.
   Like a printed game-book, sections are numbered out of
   order so the reader can't peek at what comes next.
   The shuffle is seeded (the date the story was written),
   so numbers stay the same between visits.
===================================================== */
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildNumbers() {
  const keys = Object.keys(SECTIONS).filter((k) => k !== START)
  const rand = mulberry32(8022016)
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[keys[i], keys[j]] = [keys[j], keys[i]]
  }
  const numbers = { [START]: 1 }
  keys.forEach((k, i) => (numbers[k] = i + 2))
  return numbers
}

export const SECTION_NUMBERS = buildNumbers()
export const SECTION_COUNT = Object.keys(SECTIONS).length

export const sectionNumber = (key) => SECTION_NUMBERS[key] ?? 0
