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
     lesson   – a guitar lesson played in the UI: { id, success, failure, pass? }
     showSong – the reader's song is shown (and can be played) here
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
const unflag = (name) => ({ unflag: name })
const when = (cond, effect) => ({ ...effect, if: cond })
// Belyan pockets the pick – remembered, so he can give it back later
const pickTaken = [when({ item: 'pick' }, flag('pick_taken')), take('pick')]

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
      { id: 'dad', to: 'dadLesson' },
    ],
  },
  // Dad shows the first chords – the first guitar lesson
  dadLesson: {
    mission: 'chord_c',
    lesson: {
      id: 'chords',
      success: { to: 'school', effects: [raise('skill'), flag('lesson_chords')] },
      failure: { to: 'school', effects: [add('inspiration', 1)] },
    },
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
      { id: 'ask', to: 'belyanAsk' },
      { id: 'joke', to: 'belyanDuel' },
      { id: 'voice', to: 'voiceScares' },
    ],
  },
  ignore: {
    test: {
      stat: 'luck',
      success: { to: 'lecture' },
      failure: { to: 'cornered' },
    },
  },
  // talking instead of fighting
  belyanAsk: {
    test: {
      stat: 'skill',
      success: { to: 'belyanSecret' },
      failure: { to: 'cornered' },
    },
  },
  cornered: {
    choices: [
      { id: 'fight', to: 'fistFight' },
      { id: 'nerves', to: 'belyanDuel' },
      { id: 'run', to: 'runAway' },
    ],
  },
  runAway: {
    test: {
      stat: 'skill',
      success: { to: 'lecture', effects: [flag('ran')] },
      failure: { to: 'fistFight' },
    },
  },
  fistFight: {
    duel: {
      enemy: 'belyanFist',
      skill: 8,
      stamina: 6,
      yieldAfter: 3,
      win: 'fightWon',
      lose: 'fightLost',
    },
  },
  fightWon: {
    effects: [add('inspiration', -1), flag('fought'), flag('belyan_enemy')],
    next: 'principal',
  },
  fightLost: {
    effects: [add('inspiration', -3), ...pickTaken, flag('fought')],
    next: 'principal',
  },
  principal: {
    choices: [
      { id: 'talk', to: 'principalTalk' },
      { id: 'silent', to: 'silenceOffice' },
    ],
  },
  principalTalk: {
    test: {
      stat: 'luck',
      success: { to: 'belyanSecret' },
      failure: { to: 'silenceOffice' },
    },
  },
  silenceOffice: { effects: [flag('belyan_enemy')], next: 'lecture' },
  belyanSecret: {
    choices: [
      { id: 'invite', to: 'belyanFriend' },
      { id: 'truce', to: 'belyanTruce' },
    ],
  },
  belyanFriend: {
    effects: [
      add('inspiration', 2),
      unflag('belyan_enemy'),
      flag('belyan_friend'),
      when({ flag: 'pick_taken' }, give('pick')),
    ],
    next: 'lecture',
  },
  belyanTruce: { effects: [unflag('belyan_enemy'), flag('belyan_truce')], next: 'lecture' },
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
  // winning the battle of wits in front of everyone costs Belyan face – he remembers
  beatBelyan: {
    effects: [add('luck', 1), flag('beat_belyan'), flag('belyan_enemy')],
    next: 'lecture',
  },
  lostBelyan: {
    effects: [add('inspiration', -2), ...pickTaken, flag('lost_belyan')],
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
    choices: [
      { id: 'fight', to: 'shadowDuel' },
      { id: 'climb', to: 'climbOut' },
      { id: 'feather', to: 'featherDream', requires: { item: 'feather' } },
      { id: 'drift', to: 'drift' },
    ],
  },
  climbOut: {
    test: {
      stat: 'luck',
      success: { to: 'wake' },
      failure: { to: 'shadowDuel' },
    },
  },
  featherDream: { effects: [add('luck', 1)], next: 'villageTrip' },
  drift: { effects: [add('darkness', 2), add('inspiration', 2)], next: 'villageTrip' },
  shadowDuel: {
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
  wake: { effects: [add('inspiration', -1), add('luck', 1)], next: 'villageTrip' },
  heldDark: { effects: [add('darkness', 1)], next: 'villageTrip' },

  /* ---------- Part III½: the Thracian well ----------
     After Lovecraft's "The Colour Out of Space": a star falls by an
     ancient well in Grandpa's village under Rozhen. Something in it
     drinks colour from the living. Send it home – or don't. */
  villageTrip: { next: 'village' },
  village: {
    choices: [
      { id: 'grandpa', to: 'keepers', requires: { notFlag: 'knows_keepers' } },
      { id: 'observatory', to: 'observatory', requires: { notFlag: 'saw_spectrum' } },
      { id: 'well', to: 'well' },
    ],
  },
  keepers: { effects: [flag('knows_keepers'), add('inspiration', 1)], next: 'village' },
  observatory: {
    effects: [flag('saw_spectrum'), flag('professor_hint'), add('luck', 1)],
    next: 'village',
  },
  well: {
    choices: [
      { id: 'carvings', to: 'carvings', requires: { notFlag: 'read_carvings' } },
      { id: 'fruit', to: 'fruit', requires: { notFlag: 'ate_fruit' } },
      { id: 'look', to: 'lookIn' },
      { id: 'leave', to: 'nightStorm' },
    ],
  },
  carvings: { mission: 'pentatonic', effects: [flag('read_carvings')], next: 'well' },
  fruit: { effects: [flag('ate_fruit'), add('inspiration', -2)], next: 'well' },
  lookIn: {
    test: {
      stat: 'luck',
      success: { to: 'nightStorm', effects: [flag('saw_colour')] },
      failure: { to: 'nightStorm', effects: [add('inspiration', -2), add('darkness', 1)] },
    },
  },
  nightStorm: {
    choices: [
      { id: 'stay', to: 'byStove' },
      { id: 'ask', to: 'listenerFear' },
      { id: 'out', to: 'stormDuel' },
    ],
  },
  byStove: { effects: [add('inspiration', 2)], next: 'dawnWell' },
  listenerFear: {
    choices: [
      { id: 'together', to: 'pact' },
      { id: 'alone', to: 'dawnWell' },
    ],
  },
  pact: {
    test: {
      stat: 'luck',
      success: { to: 'dawnWell', effects: [flag('listener_helped')] },
      failure: { to: 'dawnWell', effects: [add('darkness', 1)] },
    },
  },
  stormDuel: {
    duel: {
      enemy: 'colour',
      skill: 7,
      stamina: 6,
      yieldAfter: 3,
      enemyMods: [{ flag: 'saw_spectrum', add: -1 }],
      win: 'colourWeak',
      lose: 'colourDrinks',
    },
  },
  colourWeak: { effects: [flag('colour_weak'), raise('skill')], next: 'dawnWell' },
  colourDrinks: { effects: [add('inspiration', -3)], next: 'dawnWell' },
  dawnWell: {
    choices: [
      { id: 'keepers', to: 'sendHome', requires: { flag: 'read_carvings' } },
      { id: 'own', to: 'sendHome', requires: { counterMin: { song: 1 } } },
      { id: 'improvise', to: 'improviseWell' },
      { id: 'voice', to: 'voiceSends' },
    ],
  },
  improviseWell: {
    test: {
      stat: 'skill',
      success: { to: 'sendHome' },
      failure: { to: 'colourStays', effects: [add('inspiration', -1)] },
    },
  },
  sendHome: {
    effects: [flag('colour_home'), give('starglass'), add('inspiration', 3), add('luck', 1)],
    next: 'returnHome',
  },
  colourStays: { effects: [flag('colour_stays')], next: 'returnHome' },
  voiceSends: {
    effects: [flag('voice_sent'), add('darkness', 2), raise('skill')],
    next: 'returnHome',
  },
  returnHome: { next: 'announcement' },

  /* ---------- Part IV: the practice week ---------- */
  announcement: { effects: [setCount('day', 1)], next: 'practice' },

  practice: {
    choices: [
      { id: 'scales', to: 'scales' },
      { id: 'lesson', to: 'lessonBook' },
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

  // the lesson book: each lesson can be passed once; review is always there
  lessonBook: {
    choices: [
      { id: 'chords', to: 'lessonChords', requires: { notFlag: 'lesson_chords' } },
      { id: 'tuning', to: 'lessonTuning', requires: { notFlag: 'lesson_tuning' } },
      { id: 'intervals', to: 'lessonIntervals', requires: { notFlag: 'lesson_intervals' } },
      { id: 'rhythm', to: 'lessonRhythm', requires: { notFlag: 'lesson_rhythm' } },
      { id: 'review', to: 'review' },
    ],
  },
  lessonChords: {
    lesson: {
      id: 'chords',
      success: { to: 'event', effects: [raise('skill'), flag('lesson_chords')] },
      failure: { to: 'event' },
    },
  },
  lessonTuning: {
    mission: 'tune',
    lesson: {
      id: 'tuning',
      success: { to: 'event', effects: [raise('skill'), flag('lesson_tuning')] },
      failure: { to: 'event' },
    },
  },
  lessonIntervals: {
    mission: 'fifth',
    lesson: {
      id: 'intervals',
      success: { to: 'event', effects: [raise('skill'), flag('lesson_intervals')] },
      failure: { to: 'event' },
    },
  },
  lessonRhythm: {
    lesson: {
      id: 'rhythm',
      success: {
        to: 'event',
        effects: [raise('skill'), add('inspiration', 1), flag('lesson_rhythm')],
      },
      failure: { to: 'event' },
    },
  },
  review: { effects: [add('inspiration', 1)], next: 'event' },
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
    choices: [
      { id: 'quiet', to: 'neighborQuiet' },
      { id: 'ignore', to: 'neighborDoor' },
    ],
  },
  neighborQuiet: {
    test: {
      stat: 'skill',
      success: { to: 'dayEnd', effects: [raise('skill')] },
      failure: { to: 'dayEnd', effects: [add('inspiration', -1)] },
    },
  },
  neighborDoor: {
    choices: [
      { id: 'apologize', to: 'neighborApology' },
      { id: 'argue', to: 'neighborArgue' },
    ],
  },
  neighborApology: { effects: [add('luck', 1), flag('neighbor_friend')], next: 'dayEnd' },
  neighborArgue: {
    test: {
      stat: 'luck',
      success: { to: 'dayEnd', effects: [add('inspiration', 1)] },
      failure: { to: 'dayEnd', effects: [add('inspiration', -3)] },
    },
  },
  grandpa: { mission: 'chord_am', effects: [add('luck', 1), flag('ancestors')], next: 'dayEnd' },
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
      {
        id: 'saturday',
        to: 'openMic',
        requires: { counterMin: { day: 4 }, notFlag: 'belyan_enemy' },
      },
      {
        id: 'saturdayAmbush',
        to: 'belyanAmbush',
        requires: { counterMin: { day: 4 }, flag: 'belyan_enemy' },
      },
    ],
  },

  /* ---------- Part V: the stage ---------- */
  belyanAmbush: {
    choices: [
      { id: 'talk', to: 'ambushTalk' },
      { id: 'run', to: 'ambushRun' },
      { id: 'fight', to: 'ambushFight' },
      { id: 'voice', to: 'ambushVoice' },
    ],
  },
  ambushTalk: {
    test: {
      stat: 'skill',
      success: { to: 'ambushPeace' },
      failure: { to: 'ambushFight' },
    },
  },
  ambushRun: {
    test: {
      stat: 'luck',
      success: { to: 'openMic' },
      failure: { to: 'ambushFight' },
    },
  },
  ambushFight: {
    duel: {
      enemy: 'gang',
      skill: 8,
      stamina: 8,
      yieldAfter: 3,
      win: 'ambushWon',
      lose: 'ambushLost',
    },
  },
  ambushPeace: {
    effects: [unflag('belyan_enemy'), flag('belyan_friend'), add('inspiration', 2)],
    next: 'openMic',
  },
  ambushWon: {
    effects: [
      add('inspiration', -1),
      add('luck', 1),
      unflag('belyan_enemy'),
      flag('belyan_respect'),
    ],
    next: 'openMic',
  },
  ambushLost: {
    effects: [
      add('inspiration', -3),
      flag('guitar_damaged'),
      when({ item: 'strings' }, flag('used_spare')),
      take('strings'),
    ],
    next: 'openMic',
  },
  ambushVoice: { effects: [add('darkness', 2), unflag('belyan_enemy')], next: 'openMic' },

  openMic: {
    choices: [
      { id: 'cover', to: 'cover' },
      { id: 'duet', to: 'duet', requires: { flag: 'belyan_friend' } },
      { id: 'battle', to: 'kristianDuel' },
      { id: 'own', to: 'ownSong', requires: { counterMin: { song: 2 } } },
      { id: 'voice', to: 'voicePlays' },
    ],
  },
  cover: {
    test: {
      stat: 'skill',
      success: { to: 'zannNote', effects: [add('luck', 1)] },
      failure: { to: 'zannNote', effects: [add('inspiration', -2)] },
    },
  },
  kristianDuel: {
    duel: {
      enemy: 'kristian',
      skill: 9,
      stamina: 8,
      yieldAfter: 3,
      playerMods: [{ flag: 'belyan_friend', add: 1 }], // Belyan keeps the beat
      win: 'beatKristian',
      lose: 'lostKristian',
    },
  },
  beatKristian: {
    effects: [add('inspiration', 3), flag('beat_kristian'), give('metronome')],
    next: 'zannNote',
  },
  lostKristian: { effects: [add('inspiration', -2)], next: 'zannNote' },
  duet: {
    effects: [add('luck', 2), add('inspiration', 2), flag('played_duet')],
    next: 'zannNote',
  },
  ownSong: {
    showSong: true,
    effects: [add('luck', 2), add('inspiration', 2), flag('played_own')],
    next: 'zannNote',
  },
  voicePlays: {
    effects: [add('darkness', 2), add('inspiration', 2), flag('voice_played')],
    next: 'zannNote',
  },

  /* ---------- Part V¼: the window above the wall ----------
     After Lovecraft's "The Music of Erich Zann": the mute old man from
     the Star String plays every night in his attic, so that a window
     above the old city wall stays shut. Tonight he asks for help. */
  zannNote: {
    choices: [
      { id: 'go', to: 'zannStreet' },
      { id: 'skip', to: 'zannSkip' },
    ],
  },
  zannSkip: { effects: [flag('zann_missed')], next: 'seaTrip' },
  zannStreet: { next: 'zannRoom' },
  zannRoom: {
    mission: 'zann',
    choices: [
      { id: 'learn', to: 'zannLesson' },
      { id: 'ask', to: 'zannWarning' },
    ],
  },
  zannLesson: {
    test: {
      stat: 'skill',
      success: { to: 'zannNight', effects: [flag('zann_learned')] },
      failure: { to: 'zannNight' },
    },
  },
  zannWarning: { effects: [flag('zann_warned')], next: 'zannNight' },
  zannNight: {
    choices: [
      { id: 'join', to: 'zannDuel' },
      { id: 'look', to: 'zannLook' },
      { id: 'shut', to: 'zannShut' },
      { id: 'voice', to: 'zannVoice' },
    ],
  },
  zannDuel: {
    duel: {
      enemy: 'beyond',
      skill: 8,
      stamina: 8,
      yieldAfter: 3,
      enemyMods: [
        { flag: 'zann_learned', add: -2 },
        { flag: 'know_scales', add: -1 },
        { flag: 'zann_warned', add: -1 },
      ],
      win: 'zannDawn',
      lose: 'zannGone',
    },
  },
  zannLook: {
    test: {
      stat: 'luck',
      success: { to: 'zannDuel', effects: [flag('saw_beyond'), add('darkness', 1)] },
      failure: { to: 'zannGone', effects: [add('darkness', 2), add('inspiration', -2)] },
    },
  },
  zannShut: {
    test: {
      stat: 'luck',
      success: { to: 'zannDawn' },
      failure: { to: 'zannGone' },
    },
  },
  zannVoice: { effects: [flag('voice_opened'), add('darkness', 2)], next: 'zannGone' },
  zannDawn: { effects: [flag('zann_saved'), give('zannsheets'), add('luck', 1)], next: 'seaTrip' },
  zannGone: { effects: [flag('zann_gone'), add('inspiration', -1)], next: 'seaTrip' },

  /* ---------- Part V½: the misty shore ----------
     After Lovecraft's "The Shadow over Innsmouth": a class trip to the
     fog-bound fishing town Viktoria's mother came from. The sea sings,
     and calls her. Lead her out of the dark without looking back. */
  seaTrip: { next: 'fogTown' },
  fogTown: {
    choices: [
      { id: 'lighthouse', to: 'lighthouse' },
      { id: 'harbour', to: 'harbour' },
      { id: 'group', to: 'stayGroup' },
    ],
  },
  lighthouse: { mission: 'dorian', effects: [flag('knows_deep'), add('luck', 1)], next: 'harbour' },
  harbour: {
    choices: [
      { id: 'hold', to: 'holdHand' },
      { id: 'follow', to: 'pier' },
      { id: 'voice', to: 'deepVoice' },
    ],
  },
  holdHand: {
    test: {
      stat: 'luck',
      success: { to: 'pier', effects: [flag('held_her')] },
      failure: { to: 'pier', effects: [add('inspiration', -2)] },
    },
  },
  pier: {
    choices: [
      { id: 'lead', to: 'songBack' },
      { id: 'answer', to: 'deepDuel' },
      { id: 'voice', to: 'deepVoice' },
    ],
  },
  songBack: {
    test: {
      stat: 'skill',
      success: { to: 'ledOut' },
      failure: { to: 'lookedBack' },
    },
  },
  deepDuel: {
    duel: {
      enemy: 'deep',
      skill: 8,
      stamina: 8,
      yieldAfter: 3,
      enemyMods: [
        { flag: 'knows_deep', add: -1 },
        { flag: 'held_her', add: -1 },
      ],
      win: 'ledOut',
      lose: 'lookedBack',
    },
  },
  ledOut: {
    effects: [
      flag('viktoria_saved'),
      flag('viktoria_comes'),
      give('seashell'),
      add('inspiration', 2),
    ],
    next: 'seaReturn',
  },
  lookedBack: { effects: [flag('sea_took'), add('inspiration', -2)], next: 'seaReturn' },
  deepVoice: {
    effects: [flag('viktoria_comes'), flag('voice_deal_sea'), add('darkness', 2)],
    next: 'seaReturn',
  },
  stayGroup: { effects: [flag('sea_took')], next: 'seaReturn' },
  seaReturn: { next: 'recipe' },

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
    next: 'mineCall',
  },
  hideMom: { effects: [add('darkness', 1)], next: 'mineCall' },

  /* ---------- Part VI½: under the village ----------
     After Lovecraft's "The Lurking Fear": a boy is lost in the old lead
     mine under Grandpa's village, and something down there calls
     with borrowed voices. Find the true one. */
  mineCall: { next: 'mineEntrance' },
  mineEntrance: {
    choices: [
      { id: 'miner', to: 'oldMiner', requires: { notFlag: 'knows_echo' } },
      { id: 'goIn', to: 'tunnels' },
    ],
  },
  oldMiner: { effects: [flag('knows_echo')], next: 'mineEntrance' },
  tunnels: {
    choices: [
      { id: 'mom', to: 'falseMom' },
      { id: 'listen', to: 'listenTrue' },
      { id: 'glass', to: 'starglassWay', requires: { item: 'starglass' } },
      { id: 'shout', to: 'shoutName' },
    ],
  },
  shoutName: { effects: [flag('echo_learned'), add('darkness', 1)], next: 'falseMom' },
  listenTrue: {
    test: {
      stat: 'luck',
      success: { to: 'foundMite' },
      failure: { to: 'falseMom' },
    },
  },
  starglassWay: { effects: [flag('starglass_way')], next: 'foundMite' },
  falseMom: {
    duel: {
      enemy: 'echo',
      skill: 7,
      stamina: 7,
      yieldAfter: 3,
      enemyMods: [
        { flag: 'knows_echo', add: -1 },
        { flag: 'told_mom', add: -1 },
      ],
      win: 'foundMite',
      lose: 'lostInDark',
    },
  },
  foundMite: {
    effects: [flag('mite_saved'), add('luck', 1), add('inspiration', 2)],
    next: 'mineExit',
  },
  lostInDark: { effects: [add('inspiration', -3)], next: 'mineExit' },
  mineExit: { next: 'concertEve' },

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
      {
        id: 'ask',
        to: 'darkTalk',
        requires: { anyFlag: ['knows_origin', 'saw_dark', 'professor_hint'] },
      },
      { id: 'fight', to: 'darkDuel' },
      {
        id: 'play',
        to: 'lightEnd',
        requires: { item: 'feather', counterMin: { song: 3 } },
      },
    ],
  },
  darkTalk: {
    effects: [flag('dark_understood')],
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
        { flag: 'dark_understood', add: -2 },
        { flag: 'colour_home', add: -1 },
        { flag: 'listener_helped', add: -1 },
        { flag: 'viktoria_saved', add: -1 },
        { flag: 'zann_saved', add: -1 },
      ],
      playerMods: [
        { flag: 'ancestors', add: 1 },
        { flag: 'chose_light', add: 1 },
        { flag: 'belyan_friend', add: 1 },
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
