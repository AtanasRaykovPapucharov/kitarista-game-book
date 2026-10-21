/* Part IV – The practice week. */

export default {
  announcement: {
    title: 'Two posters',
    text: [
      'There are two posters on the school door. The first: “Open stage at the Star String music shop – Saturday.” The second: “Annual concert – end of the month.” {friend}’s last day.',
      'The name of the shop makes you stop. “Star String.” The voice in you quietly repeats the words, like someone recognising their own name written on a stranger’s wall.',
      'You have three days until Saturday. Three days to practise – and to face whatever fate serves up.',
    ],
  },

  practice: {
    title: 'Day {day} of 3',
    text: [
      'The guitar is waiting on your bed. The morning light lies across the strings in thin golden stripes, as though someone had tuned them to the sun.',
      'How will you spend the day?',
    ],
    choices: {
      scales: 'Scales up and down until your fingers ache',
      lesson: 'Open the lesson book',
      voiceLesson: 'Let the voice teach you',
      compose: 'Write your own song in the songbook',
      napkins: 'Write your own song on whatever you can find',
      rest: 'Take a break from the guitar',
    },
  },

  scales: {
    title: 'Scales till you drop',
    text: [
      'You play scales up and down until the metronome in your head starts ticking on its own. Scales are like steps cut into a cliff – one by one, with no shortcut.',
    ],
    success:
      'Something clicks. Your fingers get faster and more precise, and for the first time you feel you command them, not they you.',
    failure: 'Your hands won’t listen today. You give up, annoyed.',
  },

  voiceLesson: {
    title: 'Lessons from the dark',
    text: [
      '“Allow me,” says the voice. Your fingers race along the neck as if they belonged to someone else. In one day you learn what others work months for – and something else no textbook holds: notes between the notes, modes no human culture ever devised.',
      'But in the evening your hands tremble, and in the mirror your eyes look darker, like a lake reflecting a sky without stars.',
    ],
  },

  lessonBook: {
    title: 'The lesson book',
    text: [
      'Under your bed there is an old book of guitar lessons. You don’t remember where it came from. The pages smell of dust and a little of stars, and in the margins someone has written in pencil – small, slanting letters you have never seen anywhere else. One page says only: “Listen to the silence.”',
      'Which lesson will you take today?',
    ],
    choices: {
      chords: 'Lesson 1: The first chords',
      tuning: 'Lesson 2: Tuning by ear',
      intervals: 'Lesson 3: Intervals',
      rhythm: 'Lesson 4: Rhythm',
      review: 'Go over what you have learned',
    },
  },

  lessonChords: {
    title: 'Lesson 1: The first chords',
    text: [
      'You open the book at the first lesson. Drawings of guitar necks, dots, circles and little crosses – like maps of unknown lands, walked by many travellers before you.',
    ],
    success:
      'Chords are no longer a mystery. Your fingers find them on their own, like old friends in a dark room.',
    failure:
      'The diagrams still muddle you. You’ll look at them again in the practice room – slowly this time.',
  },

  lessonTuning: {
    title: 'Lesson 2: Tuning by ear',
    text: [
      'A guitar goes out of tune when you move it, when it’s cold, sometimes just because. A good guitarist hears when a string has wandered off.',
      'In the margin, in pencil: “An untuned string is a door. Keep it shut.”',
    ],
    success:
      'Your ears grow sharper. You can hear even the smallest drift now – and something else: how, very far away, something listens carefully to you.',
    failure: 'The notes still sound the same to you. Ears grow slowly – like grass.',
  },

  lessonIntervals: {
    title: 'Lesson 3: Intervals',
    text: [
      'An interval is the distance between two notes. Each distance has a character: the octave sounds like an echo, the fifth like a bell, the third like the start of a song.',
      'The tritone, says the small handwriting in the margin, was once called “the devil in music”. Not because it is evil. Because it opens.',
    ],
    success:
      'You begin to hear the shape of melodies, not just the sounds – like an architect who sees not bricks but vaults.',
    failure: 'The intervals still blur together. But now you know what to listen for.',
  },

  lessonRhythm: {
    title: 'Lesson 4: Rhythm',
    text: [
      'Rhythm is the heart of every song. Without it, even the most beautiful notes scatter like beads from a broken necklace.',
      {
        ifFlag: 'belyan_friend',
        text: 'Belyan turns up with two wooden spoons and taps on the edge of your desk. “I count, you play.”',
      },
    ],
    success:
      'You and rhythm are friends at last. And in a rhythm that is wholly yours, the voice has no place.',
    failure: 'The rhythm slips away from you. The metronome is patient – it will wait.',
  },

  review: {
    title: 'Review',
    text: [
      'You leaf through the lessons you already know and play them one after another. Nothing new – and that is exactly what’s nice about it. The familiar is like a hearth on a winter night.',
    ],
  },

  compose: {
    title: 'A song of your own',
    text: [
      'You open Grandma’s songbook. The star on the cover glints when you touch it – or so it seems. Words and notes come slowly, but they come.',
      'The voice offers words of its own – beautiful, cold, incomprehensible. You write yours. Your song grows by another verse.',
    ],
  },

  napkins: {
    title: 'A song on napkins',
    text: [
      'You have no songbook, so you write on napkins, on the back of your homework, on your palm – wherever the words catch up with you.',
    ],
    success:
      'You gather all the scraps – and they fall into place as a real verse, as if they had known their order all along.',
    failure:
      'Mum washes your jeans along with the scraps. The verse is lost – carried off to wherever all unsung songs go.',
  },

  rest: {
    title: 'A day off',
    text: [
      'Today you don’t touch the guitar. You ride your bike, eat ice cream, watch the clouds – ordinary, white, harmless clouds.',
      'In the evening you feel the music bubbling in your belly again. The voice has been quiet all day, like someone waiting outside in the cold.',
    ],
  },

  event: {
    title: 'Chance',
    text: ['Life doesn’t ask whether you’re ready. Roll a die to see what the day brings.'],
    outcomes: {
      string: 'Twang! Something snaps.',
      neighbor: 'Bang-bang-bang. Someone is pounding on the wall.',
      grandpa: 'The doorbell. Grandpa is on the doorstep.',
      quiet: 'A quiet day. Nothing special – and that’s exactly why it’s good.',
      whisper: 'The night is clear. The stars are closer than usual – too close.',
    },
  },

  stringBreaks: {
    title: 'A broken string',
    text: [
      'In the middle of your best chord, the second string snaps and whips your fingers. For a moment the silence after it is strangely deep – like a hole in the sound through which something peers.',
    ],
    choices: {
      spare: 'Fit the spare string from Dad',
      five: 'Play on five strings for the rest of the day (−2 Inspiration)',
    },
  },

  neighbor: {
    title: 'Mr Petko',
    text: [
      'Someone is pounding on the wall. Your neighbour, Mr Petko, works night shifts and is asleep.',
    ],
    choices: {
      quiet: 'Play quietly – just your fingers, no pick',
      ignore: 'Keep playing the way you were',
    },
  },

  neighborQuiet: {
    title: 'Whispering strings',
    text: [
      'You put down the pick and touch the strings with your fingertips. The sound turns soft, almost a whisper – so quiet you must lean in to hear it.',
    ],
    success:
      'You discover that playing quietly is a whole new art. Your fingers grow more sensitive, and the music more personal, like a secret shared only with you.',
    failure: 'Without the pick everything sounds hollow. You give up for today.',
  },

  neighborDoor: {
    title: 'The doorbell',
    text: [
      'The pounding stops. Then the doorbell rings. Mr Petko is on the doorstep – in pyjamas, puffy-eyed, with the face of a man woken from a dream in which he was somewhere very far away.',
    ],
    choices: {
      apologize: 'Apologise',
      argue: '“I’m allowed to play during the day!”',
    },
  },

  neighborApology: {
    title: 'The accordion',
    text: [
      '“Sorry,” you say. “I didn’t know you were asleep.”',
      'Mr Petko sighs. “When I was young I played the accordion. People pounded on my wall too.” He almost smiles. “After six in the evening. Then play as much as you like.” On his way out he turns back. “Just don’t play at night with the window open. You never know who’s listening.”',
    ],
  },

  neighborArgue: {
    title: 'Spirit',
    text: ['“I’m allowed to play during the day!” you say, louder than you meant to.'],
    success:
      'Mr Petko blinks. Then he laughs out loud. “You’ve got spirit, [boy|girl|kid]. All right. But quieter.”',
    failure:
      'Mum appears behind you just in time to hear everything. The guitar goes into the cupboard until evening.',
  },

  grandpa: {
    title: 'Stardust',
    text: [
      'Grandpa sits on the edge of your bed and is silent for a long time, looking at the guitar.',
      '“Did you know you’re made of stardust? Billions of stars died so that life could be born. Our ancestors, the Thracians, sang to the stars when they saw off their dead – and they rejoiced, because they believed the soul was going home.”',
      '“And the greatest of them was Orpheus. He played so beautifully that the stones wept. When his beloved died, he went down into the dark beneath the world and charmed it with his song. The dark gave her back – on one condition: he must not look back until they reached the light.” Grandpa sighs. “He looked back. The dark is patient, {hero}. It always waits for you to turn around.”',
      '“Listen to your ancestors.” Grandpa pats your knee and leaves, and his words stay in the room like a warm, heavy stone.',
    ],
  },

  whisper: {
    title: 'Whisper',
    text: [
      'At night, as you watch the stars through the window, the voice whispers to you: “While you listen to the stars, I will whisper to you.”',
      'It whispers secrets of notes no human ear has heard – of the songs the seething nothing sings only to itself, of chords that open doors between distant places. Part of you wants to listen for ever. Another part remembers there is school tomorrow.',
    ],
    choices: {
      listen: 'Listen until dawn (+1 Skill, +1 Darkness)',
      headphones: 'Put on your headphones and fall asleep to your favourite album (+1 Inspiration)',
    },
  },

  dayEnd: {
    title: 'Night',
    text: [
      'You set the guitar beside your bed and switch off the light. Outside, the stars shine like frets on an endless neck – and if you look long enough, it seems that someone vast and patient has laid their fingers upon them.',
    ],
    choices: {
      next: 'On to the next day',
      saturday: 'Saturday is here – off to the Star String',
      saturdayAmbush: 'Saturday is here – off to the Star String',
    },
  },
}
