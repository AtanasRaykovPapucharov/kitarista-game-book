/* Part II (a) – School and Belyan. */

export default {
  school: {
    title: 'Inhumanly early',
    text: [
      '“Tome, get up! You’ll be late for school!”',
      '“It’s inhuman to get up this early. We’re children, for God’s sake. We’re growing.”',
      'The guitar leans against the chair where you left it last night, and in the grey morning light it looks like something that is watching you. The voice is silent. Perhaps it sleeps. Perhaps beings like it never sleep – they only wait.',
    ],
    choices: {
      up: 'Jump out of bed at once',
      snooze: 'Five more minutes…',
    },
  },

  snooze: {
    title: 'Five more minutes',
    text: ['You pull the blanket over your head. Under it is warm and dark – an ordinary, cosy dark, nothing like the one in your dreams.'],
    outcomes: {
      late: 'Five minutes become twenty. You run to school with your shoes laced wrong and walk in after the bell, and your form teacher looks at you over her glasses with the look that needs no words.',
      rested: 'Those five minutes are the sweetest sleep of your life – no dark, no voices, only white and quiet. You get up brand new and still aren’t late.',
    },
  },

  corridor: {
    title: 'Sumo',
    text: [
      'The school corridor smells of chalk, wet jackets and toast. The echo in it is strange – your footsteps ring out a moment after you take them, as if someone were repeating them.',
      'Someone yanks your hair. “Hey, Metaaal!”',
      'Belyan. Big, red-faced, with fists like hammers and a nickname no one dares say out loud. Except you – in your head: Sumo.',
      '“One day I’ll eat you,” the voice remarks. Coldly, and quite seriously – not as a threat, but as the plain statement of a being whose hunger is older than words.',
    ],
    choices: {
      ignore: 'Walk past him as if he doesn’t exist',
      ask: '“What do you actually want, Belyan?”',
      joke: '“Get lost, Sumo!”',
      voice: 'Let the voice speak through you',
    },
  },

  ignore: {
    title: 'Chin up',
    text: ['You lift your chin and walk past him, eyes straight ahead, the way you walk past a dog that might bite.'],
    success: 'Belyan looks around for more interesting prey and forgets about you before you reach the stairs.',
    failure: '“Where d’you think you’re going?” A huge hand grabs your backpack and swings you round against the lockers.',
  },

  belyanAsk: {
    title: 'The question',
    text: [
      'You take a breath and look him straight in the eye. “What do you actually want, Belyan?”',
      'The question catches him off guard. For a moment his hand hangs in the air, and something crosses his face that almost looks like embarrassment – like someone caught doing a thing without knowing why.',
    ],
    success: 'Belyan glances around to see who is listening. Then he nods towards the stairwell. “Not here.”',
    failure: '“I’ll ask the questions,” he snorts, and pins you against the lockers.',
  },

  cornered: {
    title: 'The lockers',
    text: [
      'Belyan pins you against the lockers. The metal is cold through your shirt. Onlookers gather – some grin, others look away with that guilty awkwardness people have when passing someone else’s trouble.',
      '“Well, Metal? What are you going to do now?”',
      'Your heart is in your throat. At the back of your mind the voice quietly counts – one, two, three – like a metronome waiting for the song to begin.',
    ],
    choices: {
      fight: 'Shove him as hard as you can',
      nerves: 'Look him in the eye and don’t give an inch',
      run: 'Duck under his arm and run',
    },
  },

  runAway: {
    title: 'Under his arm',
    text: ['You crouch and duck under his arm, quick and supple, the way wind slips through a gap.'],
    success:
      'You slip away like a fish and race down the corridor. Belyan is too heavy to catch you. You only stop outside the staff room – out of breath, but in one piece.',
    failure: 'You trip over your own backpack. Before you can get up, Belyan is standing over you, vast as a cloud before a storm.',
  },

  fistFight: {
    title: 'Fight',
    text: [
      'Someone shouts “Fight! Fight!” and the circle closes around you like a pupil. Belyan is bigger but slower. You are lighter – and a lot more scared.',
      'If you lose three rounds, you end up on the floor.',
    ],
  },

  fightWon: {
    title: 'A costly win',
    text: [
      'Belyan lunges, you twist away, and he slips on the wet floor and lands on his back with a dull, heavy sound. Someone laughs. Then everyone goes quiet, as if the air in the corridor had suddenly thickened.',
      'Belyan turns red as a tomato. “I’ll pay you back for this,” he hisses.',
      'At that moment your form teacher appears in the corridor. “Both of you. Principal’s office. Now.”',
      'As you follow her, the voice in you is pleased – and its pleasure frightens you more than Belyan does.',
    ],
  },

  fightLost: {
    title: 'On the floor',
    text: [
      'Belyan knocks you down with a single shove. Your elbow hits the floor and the stars you see are not the nice kind – flickering, wrong, like constellations from a foreign sky.',
      { ifFlag: 'pick_taken', text: 'When you get up, he is already twirling Grandpa’s pick between his fingers, grinning.' },
      '“Both of you! Principal’s office!” your form teacher thunders from the end of the corridor.',
    ],
  },

  principal: {
    title: 'Outside the office',
    text: [
      'You sit side by side on the bench outside the principal’s office. The clock ticks with the indifferent rhythm with which clocks measure all human troubles. Belyan stares at his shoes.',
      'Up close he doesn’t look frightening. He looks tired – like someone carrying something heavy with nowhere to put it down.',
    ],
    choices: {
      talk: 'Speak first',
      silent: 'Stay silent',
    },
  },

  principalTalk: {
    title: 'The first word',
    text: ['“Why me?” you ask quietly.'],
    success: 'Belyan is silent for a long time. Then he sighs, like someone setting down a heavy load. “Because at least you’ve got something to play.”',
    failure: '“None of your business,” he snaps, and turns to the wall.',
  },

  silenceOffice: {
    title: 'See you around',
    text: [
      'The principal gives you both a lecture and lets you go. At the door Belyan leans towards you. “See you around, Metal.”',
      'He says it quietly. That’s worse than if he had shouted it. Some promises are made in a whisper because they are too heavy for a loud voice.',
    ],
  },

  belyanSecret: {
    title: 'The drummer',
    text: [
      'Belyan stares at one spot for a long time. When he speaks, his voice is different – no mockery in it, a little hoarse.',
      '“I heard you yesterday. Through the window. I live in the next block.”',
      '“I had drums. Dad sold them when we moved. Said they were too loud.” He kicks the wall with the toe of his shoe. “At least you’ve got a guitar.”',
      'And suddenly you understand that all that anger was only silence with nowhere to go.',
    ],
    choices: {
      invite: '“Come over. We’ll play – you on the pots and pans, me on the guitar.”',
      truce: 'Nod and leave it at that',
    },
  },

  belyanFriend: {
    title: 'Pots and a guitar',
    text: [
      'Belyan eyes you suspiciously, as if waiting for a trick. Then, for the first time, he smiles – crooked, but real, like sun breaking through cloud.',
      '“Pots and pans, huh… Deal.”',
      { ifFlag: 'pick_taken', text: 'He digs in his pocket and hands you Grandpa’s pick. “It’s yours. Sorry.”' },
      'The voice in you is silent. It seems it doesn’t like you having friends.',
    ],
  },

  belyanTruce: {
    title: 'Truce',
    text: [
      'You nod. He nods. You aren’t friends, but you aren’t enemies any more either – something in between, like dusk between day and night.',
      'As you go your separate ways, Belyan calls over his shoulder: “You play well, Metal.”',
    ],
  },

  belyanDuel: {
    title: 'A battle of nerves',
    text: [
      'Onlookers gather. This is not a fistfight but a battle of nerves and wit – a game as old as the world, won by whoever looks away last.',
      'If you lose three rounds, Belyan wins.',
    ],
  },

  beatBelyan: {
    title: 'Respect',
    text: [
      'Your last line is so sharp that someone at the back bursts out laughing. Belyan turns red to the ears.',
      '“All right, Metal…” he mutters, and walks off. For the first time, a classmate nods at you with respect.',
      'But as he walks away, you feel his eyes on your back. Belyan doesn’t forget easily – and humiliation in front of everyone is a seed that sprouts dark.',
    ],
  },

  lostBelyan: {
    title: 'A lighter pocket',
    text: [
      'The words stick in your throat like a bone. Belyan ruffles your hair like a puppy’s and leaves, grinning.',
      'When you turn round, your pocket feels lighter. If you had a pick, Belyan has it now.',
    ],
  },

  voiceScares: {
    title: 'A stranger’s voice',
    text: [
      'You open your mouth, but it isn’t you speaking. The voice that comes out is low, quiet and strange – with an echo no school corridor has, as if it rose from the bottom of a well as deep as the night sky: “One day I’ll eat you.”',
      'Belyan turns pale and backs away. The corridor falls silent. The lights above you flicker once. You are afraid too – but not of him.',
    ],
  },
}
