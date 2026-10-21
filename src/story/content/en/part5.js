/* Part V – The stage. */

export default {
  belyanAmbush: {
    title: 'Ambush',
    text: [
      'The Star String music shop stands in an old part of town, where the houses lean towards one another over the narrow streets as though whispering. On the corner outside it, Belyan is waiting. Two older boys are with him.',
      '“Told you we’d see each other again, Metal.” He nods at your case. “Nice guitar. Shame if it got broken.”',
      'Inside you, the voice stirs, quiet and hungry.',
    ],
    choices: {
      talk: '“There are drums in there, Belyan. Real ones.”',
      run: 'Clutch the case and dash for the shop door',
      fight: 'Put the case down and raise your fists',
      voice: 'Let the voice speak',
    },
  },

  ambushTalk: {
    title: 'Real drums',
    text: [
      'The words come out calmer than you expect. “There are drums in there, Belyan. Real ones. The owner lets people play.”',
    ],
    success:
      'Belyan hesitates. His eyes slide towards the shop window, and the anger in him goes out like a candle when someone opens a window.',
    failure: '“Don’t mess with me,” he growls, and steps forward.',
  },

  ambushRun: {
    title: 'The door',
    text: ['You clutch the case to your chest and run.'],
    success:
      'The bell above the door jingles behind you – an old, silvery chime, as if from another century. You’re inside. Belyan won’t come in – there are grown-ups here.',
    failure: 'One of the older boys blocks your way. Nowhere to go.',
  },

  ambushFight: {
    title: 'On the corner',
    text: [
      'His friends don’t step in – they just shout. Belyan wants to fight you himself. The old houses around watch with their dark windows, indifferent as stars.',
      'If you lose three rounds, the case is his.',
    ],
  },

  ambushPeace: {
    title: 'The drums',
    text: [
      'Behind the window, in the corner, stands an old drum kit with a faded gold rim on the bass drum. Belyan looks at it the way you looked at your guitar on the first day.',
      '“Just a look,” he mutters. His friends wander off, bored.',
      'Inside, Belyan sits down behind the drums as if he’s come home.',
    ],
  },

  ambushWon: {
    title: 'The case is safe',
    text: [
      'Belyan is stronger, but you are protecting something you love, and that gives a strength no muscles have. In the end he steps back, out of breath, while you stay over your case without moving.',
      '“All right, Metal,” he says. “All right.” For the first time it sounds like respect.',
    ],
  },

  ambushLost: {
    title: 'A broken string',
    text: [
      'Belyan pushes you aside, opens the case and yanks the strings. One snaps with a pitiful twang that seems to go on ringing long after it has faded. They laugh and walk off.',
      {
        ifFlag: 'used_spare',
        text: 'Sitting on the pavement, you fit the spare string from Dad. Your hands shake, but you tune it up.',
      },
      {
        ifNotFlag: 'used_spare',
        text: 'The shop owner sees your face and, without a word, hands you a new string – on the house.',
      },
    ],
  },

  ambushVoice: {
    title: 'Back off',
    text: [
      'You open your mouth and the voice comes out – quiet, old, strange, with that echo from the bottom of a well: “Back off.”',
      'Belyan turns pale. His friends are already on the far corner. He follows them without looking back. The pigeons on the roofs take off all at once.',
      'You walk into the shop. Your hands are cold and stay cold for a long time.',
    ],
  },

  openMic: {
    title: 'The Star String',
    text: [
      'The shop smells of lacquer, dust and old books. Instruments from every age hang on the walls – lutes with worn frets, violins with cracks like cobwebs, a glossy black grand piano at the back that no one remembers ever seeing open. The owner – a dry old man with eyes as bright as a bird’s – greets you with a nod, as though he had been expecting you.',
      'The stage is small, the audience about twenty people.',
      {
        ifFlag: 'belyan_friend',
        text: 'Belyan is already behind the old drums in the corner, tapping quietly with the sticks.',
      },
      {
        ifFlag: 'guitar_damaged',
        text: 'The new string hasn’t stretched yet and is slightly out of tune.',
      },
      'Before you plays Kristian – an older boy with a red electric guitar. He plays fast and flashy, then looks at you with a grin: “[Little guy’s|Little lady’s|Kid’s] turn.”',
    ],
    choices: {
      cover: 'Play a song everyone knows, no risks',
      duet: 'Nod to Belyan and play together',
      battle: 'Challenge Kristian to a guitar duel',
      own: 'Play your own song',
      voice: 'Let the voice play for you',
    },
  },

  cover: {
    title: 'A familiar song',
    text: [
      'You choose a song you could play in your sleep – old and loved, worn smooth by thousands of hands before yours.',
    ],
    success:
      'You sing, you play, people clap along. Not a revolution, but good. The old man behind the counter nods approvingly.',
    failure:
      'Halfway through you forget a chord. You finish somehow, and the applause is polite – the worst kind of applause.',
  },

  kristianDuel: {
    title: 'Guitar duel',
    text: [
      'Kristian grins and plugs in. The audience perks up – a duel! A phrase from him, a phrase from you, like two old wizards hurling spells at each other.',
      'If you lose three rounds, the stage is his.',
    ],
  },

  beatKristian: {
    title: 'Rhythm is everything',
    text: [
      'Your last phrase hangs in the air and the shop erupts.',
      'Kristian raises his hands. “All right, [little guy|little lady|kid], all right.” Then he hands you an old mechanical metronome with a brass pendulum. “A gift. Rhythm is everything. They gave it to me here, years ago. Told me to pass it on when I found someone who plays… their own.”',
    ],
  },

  lostKristian: {
    title: 'Hands without a voice',
    text: [
      'Kristian is faster, louder, more confident.',
      'But as you step off the stage he stops you: “You’ve got the hands. Now find a voice – your own, not someone else’s.” And he looks at you a little longer, as though he had heard something in your playing he was not meant to hear.',
    ],
  },

  duet: {
    title: 'The two of you',
    text: [
      'You nod to Belyan. He raises the sticks. The first bars are shaky – then he finds the beat, and you find him.',
      'People in the shop start tapping along. Someone whistles. Belyan grins from ear to ear. In a song played by two, the voice has no place – and it is silent the whole time.',
      'When you finish, he reaches across the cymbals to shake your hand.',
    ],
  },

  ownSong: {
    title: 'Your own song',
    text: [
      'You play the song you wrote this week. At first it’s quiet – so quiet you can hear someone set down a glass, and the old piano at the back softly resonating with one of your notes, as if answering.',
      'Then someone starts tapping the beat. By the end everyone is on their feet. The voice is silent the whole time – and there is something new in its silence: attention. As though, for the first time, it is listening not to you but to the song.',
    ],
  },

  voicePlays: {
    title: 'Someone else’s hands',
    text: [
      'You relax and let it in. Your hands fly. The tunes that fill the shop are impossibly beautiful and impossibly strange – with intervals that set the old instruments on the walls softly sounding by themselves. The audience screams; Kristian gapes.',
      'When it’s over, you don’t remember a single note. The applause sounds like it belongs to someone else. And the old man behind the counter doesn’t clap – he watches you with his bright bird’s eyes and slowly shakes his head.',
    ],
  },
}
