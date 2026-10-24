import part1 from './en/part1.js'
import part2a from './en/part2a.js'
import part2b from './en/part2b.js'
import part3 from './en/part3.js'
import part3b from './en/part3b.js'
import part4 from './en/part4.js'
import part5 from './en/part5.js'
import part5z from './en/part5z.js'
import part5b from './en/part5b.js'
import part6 from './en/part6.js'
import epilogue from './en/epilogue.js'
import part6b from './en/part6b.js'

/* The game-book text in English.
   Keys match src/story/book.js.
   A paragraph is a string or { ifFlag | ifNotFlag | ifItem, text }.
   Square brackets with three forms, e.g. [boy|girl|child] – picked by
   the form of address chosen at sign-up (masculine, feminine, neutral). */

export default {
  title: 'While You Listen to the Stars',
  byline: 'A game-book after the story by Atanas Papucharov',
  // the cover shows this as three parts, so the middle one can open the story as a PDF
  bylineParts: { before: 'A game-book after ', link: 'the story by Atanas Papucharov', after: '' },
  pitch:
    'The protagonist receives a guitar for [his|her|their] birthday, and with it, a voice from the depths of space. Will [he|she|they] become a guitarist? And whose hands will actually be playing?',

  song: {
    moods: {
      tender: { name: 'Tender', hint: 'Light and quiet, like a lullaby' },
      sad: { name: 'Sad', hint: 'Minor keys, memories, goodbyes' },
      brave: { name: 'Brave', hint: 'Loud and straight ahead' },
      starry: { name: 'Starry', hint: 'Dreamy, with maj7 chords' },
    },
    lines: {
      tender: [
        'Softly I play, and soft is the night,',
        'Mum is singing somewhere in my dream,',
        'the light tiptoes into my room,',
        'every string remembers its home,',
        'Grandpa says: listen to the grass grow,',
        'pancakes, sunshine and a guitar –',
      ],
      sad: [
        'the little bird fell asleep under the linden,',
        'my room is full of silence,',
        'everything created fades away,',
        'I’m alone, but the song is with me,',
        'you leave tomorrow and I say nothing,',
        'I said goodbye without a sound,',
      ],
      brave: [
        'I won’t step back, not one inch,',
        'with a guitar in my hands I’m not afraid,',
        'hear me, dark – this is my voice,',
        'if I fall, I’ll get up again,',
        'I play loud – let the whole block hear,',
        'my hands, my song,',
      ],
      starry: [
        'I’m stardust, singing to the stars,',
        'nothing gave birth to you and me,',
        'while I listen to the stars, they whisper,',
        'a song grows in the empty place,',
        'the light has travelled a million years,',
        'the dark shines when I hear it,',
      ],
    },
  },

  enemies: {
    belyan: 'Belyan “Sumo”',
    belyanFist: 'Belyan',
    gang: 'Belyan and his crew',
    shadow: 'The Shadow in the Dream',
    colour: 'The colour from the well',
    deep: 'The song from the deep',
    echo: 'The echo',
    beyond: 'What is behind the window',
    kristian: 'Kristian',
    dark: 'The Dark',
  },

  items: {
    guitar: { name: 'Guitar', desc: 'Yours. It smells of fresh lacquer.' },
    pancakes: { name: 'Mum’s pancakes', desc: 'Eat one to restore 4 Inspiration.' },
    pick: { name: 'Bone pick', desc: 'Grandpa’s. +1 to your attack in duels.' },
    starglass: {
      name: 'Star-glass',
      desc: 'A piece of the fallen star. It rings when the dark is near. +1 to attack in a duel.',
    },
    seashell: {
      name: 'Shell from Maglitsa',
      desc: 'Hold it to your ear to regain 3 Inspiration. Once.',
    },
    zannsheets: {
      name: 'Old Tsanko’s scores',
      desc: 'Play from them when things are hard: +4 Inspiration. Once.',
    },
    songbook: { name: 'Songbook', desc: 'A gift from Grandma. Composing comes easier with it.' },
    strings: { name: 'Spare strings', desc: 'Strings break at the worst possible moment.' },
    feather: {
      name: 'Grey feather',
      desc: 'From the little bird under the linden. It guards you from the dark.',
    },
    metronome: { name: 'Old metronome', desc: 'From Kristian. +1 to your attack in duels.' },
    recipe: {
      name: 'Recipe for luck',
      desc: 'Read it once to restore your Luck to its starting value.',
    },
  },

  endings: {
    light: {
      title: 'The Dark Shines',
      summary: 'You played your own song to the dark, and it turned to light.',
    },
    guitarist: {
      title: 'The Guitarist',
      summary: 'You beat the dark and played your own song for everyone.',
    },
    start: {
      title: 'A Good Start',
      summary: 'You played cleanly, but your own song is still waiting to be born.',
    },
    puppet: {
      title: 'Puppet',
      summary: 'The voice plays with your hands. You watch from the side.',
    },
    silence: {
      title: 'Silence',
      summary: 'Your inspiration died out and the guitar went under the bed.',
    },
  },

  illustrations: {
    void: 'Endless space with a violet nebula. In the centre, a vast faceless swirl of darker dark; far below, a small blue planet glows.',
    window:
      'A night window with bright stars peering in. Below it, a child sleeps under a blanket.',
    guitar: 'A guitar with rays of light streaming from its soundhole towards the starry sky.',
    corridor:
      'A dark school corridor with lockers. Two figures – one big, one smaller – stand facing each other.',
    observatory:
      'An observatory dome and a radio telescope on a mountain ridge beneath the Milky Way. A thin beam rises from the slit in the dome.',
    linden:
      'A linden tree on a hill at dusk. A child kneels beside it while a small light rises into the sky.',
    silhouette:
      'A colossal dark silhouette with sharp, ill-fitting angles above a tiny figure. A thin golden thread leads upward – Mum’s voice.',
    orpheus:
      'A figure with a lyre walks through a tunnel towards bright light. Behind it, in the dark, a shadow waits with two pale points.',
    shop: 'Old leaning houses on a narrow street. A shop window with a star above the door glows blue-green; a guitar and a drum are inside.',
    stage:
      'A stage under a single spotlight. A guitarist sits on a chair; the heads of the audience are in front.',
    dark: 'A figure stands before a vast circle of darkness with a violet rim. A feather glows in its hand, casting a beam into the dark.',
    light:
      'A guitarist on a hill beneath a sky crossed by five faint lines of light, like a musical staff, with stars sitting on them like notes.',
    puppet:
      'A figure under a spotlight with raised arms. Bright threads rise from its hands, head and feet – like a puppet’s.',
    well: 'An ancient stone well in a meadow at the edge of a pine forest. Grey dust covers the ground around it, and a pillar of light in a nameless colour rises from the water.',
    sea: 'A long stone pier in thick fog. At its end stands a small figure, and the sea before it rises like a vast, breathing hill. A lighthouse beam cuts through the fog.',
    mine: 'The mouth of an old mine in a mountainside at night. Rusty rails run into the dark, and deep inside a lantern glimmers.',
    zann: 'A steep street that turns into steps and ends at a black city wall. Above the wall glows the attic window of the last house, and beyond the wall there is no town – only darkness with points of light in unearthly colours.',
    silence:
      'A dark room. A moonbeam falls on a guitar case under the bed. The strings inside glow faintly.',
  },

  // the story itself, part by part (src/story/content/en/)
  // the endings close with an epilogue made of the threads the reader touched
  sections: withEpilogue({
    ...part1,
    ...part2a,
    ...part2b,
    ...part3,
    ...part3b,
    ...part4,
    ...part5,
    ...part5z,
    ...part5b,
    ...part6b,
    ...part6,
  }),
}

function withEpilogue(sections) {
  const add = (key, extra) =>
    (sections[key] = { ...sections[key], text: [...sections[key].text, ...extra] })
  for (const key of ['lightEnd', 'guitaristEnd', 'goodStartEnd']) add(key, epilogue.good)
  add('puppetEnd', epilogue.dark)
  return sections
}
