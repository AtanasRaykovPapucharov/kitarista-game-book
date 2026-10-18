/* Part II (b) – The lecture and Viktoria. */

export default {
  lecture: {
    title: 'What is nothing?',
    text: [
      { ifNotFlag: 'fought', text: '“Come on, the guest professor’s lecture is starting!”' },
      {
        ifFlag: 'fought',
        text: 'You walk into the hall half an hour late, with a note from the principal. The professor just nods at an empty chair without stopping.',
      },
      'The guest professor is a thin, white-haired man whose eyes are red from sleeplessness. They say he works nights at the Rozhen Observatory, listening to the radio noise of distant galaxies. He speaks quietly, as though afraid someone else might be listening too.',
      '“What is nothing?” he asks. “The absence of matter, mass, charge, energy, time, space and any information whatsoever. Let us limit ourselves to the first four. We will call it a vacuum, and it will be our starting point.”',
      'He talks about the global and the local – about light, which travels as a wave but is emitted and absorbed in portions, quanta. Your classmates stare with glazed eyes. But you understand every word, as if you already knew it – as if someone in you had known it before you were born.',
      '“You are light, little soul,” the voice whispers. In the third row, Viktoria tucks a strand of hair behind her ear.',
    ],
    choices: {
      listen: 'Listen carefully',
      melody: 'Write down the melody the lecture puts in your head',
      viktoria: 'Daydream about Viktoria and talk to her at break',
    },
  },

  lecture2: {
    title: 'Anything is possible',
    text: [
      '“We can never be sure exactly where the electron is,” the professor says. “It sits in a ‘cloud’ of possible positions. In the world of quantum mechanics anything is possible, if only with a small probability.”',
      '“Anything is possible,” you repeat to yourself, and the voice in you repeats it after you, like an echo arriving a little late.',
      '“In the vacuum, particle–antiparticle pairs are constantly born and annihilated. When they meet, they destroy each other and give off quanta of energy. Nothing is not empty, children. It seethes. And sometimes, very rarely, something is born in that seething that does not vanish.”',
      '“Sounds like love,” you think, and glance at Viktoria. She has come for only one year, to stay with her aunt – your form teacher. At the end of the month she leaves.',
      'The professor takes off his glasses and wipes them for a long time. “The universe is expanding faster and faster. It was born from nothing and strives to return to it. Once something has been created, nothing is more natural than for it to disappear.” A pause, longer than it should be. “Unless it finds a way to stay. Thank you.”',
    ],
    choices: {
      ask: 'Go up to the professor after the lecture',
      viktoria: 'Find Viktoria at break',
      home: 'Go home',
    },
  },

  melody: {
    title: 'A melody from nothing',
    text: [
      'While the professor talks about waves and quanta, you write notes in Grandma’s songbook. A quiet, round melody that is born from nothing and returns to it again, like breathing.',
      'The voice tries to suggest the next note – stranger, older. You write your own. For a moment it seems to frown, if something without a face can frown.',
      'The first bars of your own song.',
    ],
    choices: {
      ask: 'Go up to the professor after the lecture',
      viktoria: 'Find Viktoria at break',
      home: 'Go home',
    },
  },

  professor: {
    title: 'The silence between the notes',
    text: [
      'The professor gathers his papers and raises his eyebrows when you ask what happens to something once it has been created.',
      '“Have you read the Book of Changes? ‘Every event, once it reaches its peak, turns into its opposite.’”',
      'He looks at your fingers, then at your eyes – longer than is comfortable. “You play, don’t you? It shows. Listen to the silence between the notes, [boy|girl|kid]. Everything is there.”',
      'He reaches into his bag and takes out a worn notebook with dog-eared corners. He opens it at a page and hands it to you. In small, nervous handwriting it reads: “Rozhen Observatory, night shift. The noise between the stars is not entirely random. At times there is something like a beat in it. As if someone were listening – and waiting.”',
      'Then he lowers his voice, as if the walls had ears. “For years I have recorded the noise between the stars. Last week, for the first time, there was something like a melody in it. It stopped on the day when, I believe, someone on Earth picked up a guitar.” He smiles wearily. “Don’t mind me, I’m an old man. But be careful with voices that know too much.”',
    ],
  },

  viktoria: {
    title: 'Viktoria',
    text: [
      'Viktoria is standing by the window with her headphones on. The light falls on her so that for a moment she seems to belong to another, calmer time. When she sees you, she takes the headphones off and smiles.',
      '“You were the only one who didn’t fall asleep in the lecture.”',
      'Your heart starts racing. The voice in you is silent – and in its silence there is something like jealousy.',
    ],
    choices: {
      invite: 'Tell her you play and invite her to the school concert',
      silent: 'Nod and run away',
    },
  },

  invite: {
    title: 'If…',
    text: ['You take a breath. “I… play. Guitar. There’s a concert at the end of the month, and if…”'],
    success:
      '“I’ll come,” she says before you can finish – and stops, as if she had heard something behind your words. “I leave the next day. So it’ll be the last thing I hear here. Make it good.”',
    failure:
      'The bell rings right on “if”. Viktoria smiles apologetically and disappears into the crowd. “Annihilation,” you think. “Like a particle and an antiparticle. I managed to annihilate myself.”',
  },

  silent: {
    title: 'Some day',
    text: [
      'You nod, mumble something about homework and flee.',
      'Later you look in the mirror and tell yourself that some day you will tell her. Some day. Your reflection nods – a little more slowly than it should.',
    ],
  },
}
