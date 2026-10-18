/* Part I – The gift. A paragraph is a string or { ifFlag | ifNotFlag | ifItem, text }.
   [masculine|feminine|neutral] – picked by the reader's form of address. */

export default {
  prologue: {
    title: 'Dark',
    text: [
      'From the guest professor’s notebook, Rozhen Observatory, night shift: “The noise between the stars is not entirely random. At times there is something like a beat in it. As if someone were listening – and waiting.”',
      'The dark pierced [him|her|them] at the speed of light. [He|She|They] felt it with every fibre of [his|her|their] bodiless being. They were one, and yet they were not. [His|Her|Their] mind defined [him|her|them] as separate.',
      'Where to and for how long meant nothing. Time and space had no meaning. Knowledge was part of [him|her|them], as ancient as the first trembling of the vacuum from which it had surfaced. Everything is nothing, and nothing gives birth to everything. Chance. Deliberate accident. Creation.',
      'For aeons it drifted through the gulfs between the galaxies – where the light of dead suns crawls like ash, and the angles of space bend in ways no human mind could bear to follow. It could not hear. It could not see. It could only listen to the nothing seethe.',
      '[He|She|They] knew that one day [he|she|they] would find light, and then everything would change. Everything would gain meaning. And it would be real. Real?',
      'Somewhere very far away, on a small blue planet, a [boy|girl|child] was falling asleep – and for a moment, only a moment, something like a note sounded in the noise between the stars.',
    ],
  },

  eve: {
    title: 'The night before the birthday',
    text: [
      'You are Tome – one of those [boys|girls|kids] who seem as if they will never grow up. And yet anyone perceptive enough notices a hidden wisdom in you, as though someone much older looks out from behind your eyes. Maybe an old soul lives in your body.',
      'You lie in bed, drifting off, impatient for tomorrow. Tomorrow is your birthday. All the relatives will gather and you know it: at last you will have your own guitar. You have no friend. The guitar will be your friend. Your comfort when you are alone.',
      'The music is in your heart. You feel it in your belly – bubbling, waiting to be born. Sometimes it seems not entirely yours: as though it comes from very far away, looking for someone to sound through.',
      'Outside, the stars burn unusually bright, as if they have drawn close to the window to peer in. From the living room comes the rustle of wrapping paper.',
    ],
    choices: {
      sneak: 'Peek into the living room – just for a moment',
      sleep: '“Impatience makes you weak. I am different.” Close your eyes',
    },
  },

  sneak: {
    title: 'On tiptoe',
    text: [
      'You slip out from under the blanket. The floor creaks treacherously and your heart pounds in your ears. The corridor is longer than you remember, and dark in a peculiar way – not merely without light, but as though light was never welcome here.',
      'The living-room door is ajar.',
    ],
    success:
      'Nobody hears you. Through the gap you see a hard black case leaning against the sofa, glossy as water on a moonless night. You go back to bed, but sleep is slow to come – and when it does, it is dark and fast. Something far away has sensed your impatience and turned towards it, the way a flower turns towards the sun.',
    failure:
      'You step on the cat’s tail. Meow! A lamp clicks on and the shadows shrink back into their corners. “Tome!” Mum is standing in the doorway, hands on her hips. “You’ll see tomorrow. Bed!” You feel silly. Impatience really does make you weak.',
  },

  dream: {
    title: 'The dream',
    text: [
      'You rush at an unimaginable speed through pitch darkness. There is no up and no down, no yesterday and no tomorrow – only endless falling that might be flight.',
      'Someone is watching you. A presence that is like the dark itself: part of it, and yet not. It is vast, older than the mountains, older than the stars that made the mountains – and at the same time strangely alone.',
      'Far, far away, a single light flickers. From somewhere in you rises an old, borrowed memory: in certain stories, whoever walks through the dark must not look back.',
    ],
    choices: {
      look: 'Turn around and look at the presence',
      light: 'Fly towards the distant light without looking back',
    },
  },

  dreamLook: {
    title: 'No face',
    text: [
      'You turn. The dark has no face, but you know it sees you – the way an abyss sees the stone that falls into it.',
      '“Interesting,” says something without a voice, and the words appear directly in your mind, cold and perfectly clear. “You can see me. Few can.”',
      'You wake for a moment, sweating, and sink back down – without dreams this time. But until morning the room keeps a faint smell of ozone, as after a storm nobody heard.',
    ],
  },

  dreamLight: {
    title: 'A tone in the distance',
    text: [
      'You fly towards the light without looking back, though your spine prickles under the gaze that follows it.',
      'The light grows until it becomes a warm, ringing tone – like a string someone has touched on the far side of the universe.',
      'The presence behind you hisses like steam and vanishes. You sleep like a baby, and in the morning that tone still rings in your ears – the purest you have ever heard.',
    ],
  },

  birthday: {
    title: 'The gift of gifts',
    text: [
      '“Tome, get up! The pancakes are getting cold!”',
      '“I love pancakes. Pancakes… rays… sunrays. Yes, little sun, you own my day.” The morning is so ordinary and bright that the shadows of the night seem like someone else’s invention.',
      'The living room is full. Grandma pinches your cheek: “Grandma’s [boy|girl|darling], how big you’ve grown!” Grandpa shakes your hand like a grown-up’s: “Grow up big, my [boy|girl|dear].”',
      '“And finally – the gift of gifts! Guess what Dad Vladko and I got you?”',
      'The case is heavy and smells new. Inside, smooth and gleaming, lies the guitar. Your guitar. Its wood is warm, and when you touch the strings they sigh softly, as if they had been waiting for exactly you. Mum wraps three pancakes for you – just in case.',
      'But Grandpa winks: there is something else. Roll a die to find out what.',
    ],
    outcomes: {
      pick: 'Grandpa takes an old bone pick out of his pocket, yellowed like an old map. “I used it to serenade your grandma under her window. Now it’s yours. Keep it safe – a pick remembers the hands that held it.”',
      songbook:
        'Grandma hands you a hardback notebook with a single star stamped in faded gold on the cover. “For your songs. Because you’ll have your own – I know it. Only don’t write anyone else’s words in it.”',
      strings:
        'Dad Vladko hands you an envelope of spare strings. “Strings break at the worst possible moment. Trust me. Every broken string is a small catastrophe, and catastrophes come when you least expect them.”',
    },
  },

  firstStrum: {
    title: 'Light',
    text: [
      'You shut yourself in your room and touch the strings. The sound spills out, and something inside you seems to crack open – like a shell that has guarded something for too long. Light.',
      'And in that moment, at an immeasurable distance, something that has drifted through the dark for aeons hears for the very first time.',
      '“How beautifully you play, [young sir|young miss|young friend],” says a voice. Not from outside – from within. The voice is courteous and old, with a peculiar softness that makes the hairs on your arms stand up.',
      '“Thank you. I know,” you answer without thinking. Ta-ta-ra-pa-ra-ta-ta.',
      '“I believe you should have pressed one fret higher.”',
      '“I’m talking to myself. How interesting,” you think. And the voice laughs – quietly, distantly, as though its laughter had travelled for millennia to reach you: “To yourself?!”',
    ],
    choices: {
      obey: 'Listen to the voice and move your finger',
      ear: 'Find the right note yourself, by ear',
      dad: 'Call Dad Vladko to show you the first chords',
    },
  },

  dadLesson: {
    title: 'The first chords',
    text: [
      'Dad Vladko sits on the edge of the bed and picks up the guitar with the careful tenderness grown-ups use for babies. “Every great guitarist started with three or four chords. Watch my fingers.”',
      'While he talks, the voice in you is silent. It hasn’t gone – it is simply silent, like someone standing in the next room, listening through the wall.',
    ],
    success: 'Dad smiles. “Well, you don’t need me any more. Your fingers remember more than I showed them – as if they knew already.”',
    failure:
      '“Never mind,” says Dad. “Fingers remember more slowly than heads. Again tomorrow.” He ruffles your hair, and the voice in you clicks its tongue softly, like a teacher who already knows how the lesson will end.',
  },

  voiceTip: {
    title: 'The good teacher',
    text: [
      'You move your finger – and the note shines. The voice is right.',
      'You play for an hour, two, three. Your fingers know where to go on their own, as though someone were guiding them on invisible threads. The tunes that come out from under them are strange – beautiful, but with intervals you can’t remember ever hearing, and with pauses in which something vast seems to draw breath.',
      'Only in the evening do you realise you can’t remember how you learned. And that it has long been dark outside, and you never switched on the light.',
    ],
  },

  byEar: {
    title: 'By ear',
    text: [
      '“Thanks, I’ll manage,” you say, and start searching. Fret by fret, note by note, like a traveller feeling the wall of an unknown cave.',
      'The voice doesn’t insist. You only feel it watching – patiently, unhurried, like a being for whom an evening is less than an instant.',
    ],
    success:
      'You find it! The note is yours – not whispered, but discovered. It sounds plainer than the ones the voice whispered, but it is warm and true. The voice is silent, and you feel it watching with interest – and perhaps with a little unease.',
    failure:
      'Your fingers hurt and the notes clank, beating against each other like birds against glass. Around midnight you finally hit the right one – tired, but proud it is yours.',
  },
}
