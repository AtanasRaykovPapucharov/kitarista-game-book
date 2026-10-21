/* Part V½ – The misty shore. After Lovecraft's "The Shadow over Innsmouth". */

export default {
  seaTrip: {
    title: 'A trip to the sea',
    text: [
      'On Monday your form teacher announces a surprise: a three-day class trip to the sea before the concert. “To Maglitsa,” she says, glancing at {friend}. “Where my sister was born. {friend}’s mother.”',
      '{friend} doesn’t smile. The whole way she stares out of the bus window, headphones on, but with no music. When the sea appears on the horizon – grey, motionless, like molten lead – ‹she takes|he takes› the headphones off and whispers, more to ‹herself|himself›: “Can you hear it?”',
      'You hear nothing. But the voice inside you sits up like a dog that has smelled a wolf.',
    ],
  },

  fogTown: {
    title: 'Maglitsa',
    text: [
      'Maglitsa is an old fishing harbour huddled in a bay beneath low cliffs. The fog comes in from the sea every afternoon and doesn’t leave until morning. The houses are wooden, their paint peeling to the colour of faded seaweed, their roofs sagging like the backs of tired animals. Half the jetties have rotted away. It smells of salt, fish and something older – of stone that has lain under water for centuries.',
      'The locals are few and silent. They watch you without blinking. All of them have the same pale, wide-set eyes – old men, women, even the children playing on the shore, who fall silent as you pass.',
      'At dusk, as the fog thickens, a sound comes from the sea. Not waves. A low, even hum, like a string the length of the bay being drawn across by a distant bow. {friend} stops in the middle of the street and closes ‹her|his› eyes.',
    ],
    choices: {
      lighthouse:
        'Go to the old lighthouse – they say the only man who talks to strangers lives there',
      harbour: 'Go with {friend} towards the harbour',
      group: 'Stay with the class at the hotel and don’t go out',
    },
  },

  lighthouse: {
    title: 'The lighthouse keeper',
    text: [
      'The lighthouse stands on the furthest rock, white and cracked. The keeper is an old man with skin furrowed by the wind and eyes that – strangely – are not pale like the others’.',
      '“You want to know why the sea sings?” He pours tea from a blackened pot and is silent for a long time. “Three hundred years ago the fish ran out. The children starved. So the old fishermen went out on the darkest night and sang to the deep. And something answered. The Old One in the deep – that’s what we call her. She is as big as the bay and as old as the sea.”',
      '“She fills the nets. In return she wants songs. And sometimes…” he turns to the window, “sometimes she wants singers too. Those with the sea in their blood can hear her. And one night they simply walk into the water and don’t come back. ‹That girl’s|That boy’s› mother was one of them. She got away in time. But blood is blood.”',
      'He looks at you with his sharp dark eyes. “You hear more too, don’t you? Then know this: you can’t shout her song down. You lead away from it. Someone must lead the listener out, never stopping playing. And never looking back.”',
    ],
  },

  harbour: {
    title: 'The harbour',
    text: [
      'Night falls fast. The fog is so thick that the street lamps are only pale smudges. The hum from the sea swells, and now there is a melody in it – slow, drawn out, impossibly beautiful, like a lullaby sung by something that has never slept.',
      '{friend} walks ahead of you. Slowly at first, then more and more surely, towards the long stone pier that vanishes into the fog. ‹Her|His› eyes are open, but they look straight through you. “It’s so beautiful,” ‹she says|he says› in a strange, flat voice. “She’s calling me by name.”',
      '“That is an old one,” whispers the voice inside you. “Older than me, perhaps. She doesn’t drink, like the colour. She collects. Collects songs. And singers.”',
    ],
    choices: {
      hold: 'Take ‹her|his› hand and try to hold ‹her|him› back',
      follow: 'Follow ‹her|him› along the pier',
      voice: 'Let the voice speak to the Sea',
    },
  },

  holdHand: {
    title: 'Her hand',
    text: ['You take ‹her|his› hand. It is cold, wet with fog, and heavy as stone.'],
    success:
      'For a moment ‹her|his› fingers squeeze yours. ‹Her|His› eyes clear. “{hero}?” ‹she whispers|he whispers›. But the song rises again and ‹she walks|he walks› on, and you walk with ‹her|him› – at least now you know ‹she is|he is› still there, inside.',
    failure:
      '‹Her|His› hand slips out of yours like a fish. ‹She doesn’t|He doesn’t› even turn round. The fog swallows ‹her|him› and you run after ‹her|him›, breathless with fear.',
  },

  pier: {
    title: 'The end of the pier',
    text: [
      'The pier ends suddenly, as if someone had cut it off. {friend} stands on the very edge. Below ‹her|him› the water is not black – it glows from beneath with a cold, greenish light.',
      'And then the sea before you rises. Not a wave – a slow, smooth hill of water as wide as the bay, swelling and sinking, swelling and sinking. Like a chest breathing. The song comes from there. From something so enormous your eyes refuse to see all of it.',
      'You think of Grandpa. Of Orpheus, who went down into the dark to lead his beloved out. Of the only condition.',
    ],
    choices: {
      lead: 'Play your own song and walk back along the pier without looking back',
      answer: 'Answer the Sea’s song with yours – sound against sound',
      voice: 'Ask the voice to speak to the Sea for you',
    },
  },

  songBack: {
    title: 'Without looking back',
    text: [
      'You begin to play. Softly, then more clearly – not against the sea’s song, but to one side of it, like a path that branches off the main road. And you walk back along the pier.',
      'Behind you it is quiet. You hear only the fog and your own footsteps. You don’t know whether ‹she is|he is› following. Your whole back screams at you to turn round.',
    ],
    success:
      'You don’t turn. Step, note, step. And somewhere behind you, faintly, you hear a second pair of footsteps – bare, wet, closer and closer. You reach the shore, and only then do you turn. ‹She is|He is› there.',
    failure:
      'Halfway there you can’t bear it. You turn. {friend} is three steps behind you – and the moment you look at ‹her|him›, ‹she stops as if she|he stops as if he› had hit an invisible wall. The sea’s song pulls ‹her|him› back.',
  },

  deepDuel: {
    title: 'Sound against sound',
    text: [
      'You stand on the edge beside ‹her|him› and strike the strings. The sea’s song washes over you like a tide – heavy, slow, endlessly old. You answer it with something small, quick and alive.',
      'If you lose three rounds, the sea’s song will win.',
    ],
  },

  ledOut: {
    title: 'Led out',
    text: [
      '{friend} stands on the shore, wet to the knees, shivering. Then suddenly ‹she bursts|he bursts› into tears – and laughs at the same time. “I was dreaming,” ‹she says|he says›. “I dreamed I was under the water and it was so beautiful there, and then I heard a guitar. Yours.”',
      'Behind you the sea sinks. The hum dies away and returns to the deep it came from – not angrily, but somehow politely, like an old lady who has realised she was invited by mistake.',
      'In the morning the lighthouse keeper is waiting outside the hotel. Without a word he gives {friend} a large sea-snail shell, and you another. “Hold it to your ear when things are hard,” he says. “The sea gives back what it took. A little.”',
      'On the way back {friend} sleeps on your shoulder. Without headphones.',
    ],
  },

  lookedBack: {
    title: 'You looked back',
    text: [
      '‹She stands|He stands› motionless, ‹her|his› eyes turning pale and distant again. Then the lighthouse beam sweeps through the fog and lights ‹her|him› up – and the lighthouse bell starts ringing, loud and urgent. The keeper. For a moment the sea’s song tears.',
      '{friend} collapses on the pier. You run to ‹her|him› and drag ‹her|him› to the shore.',
      '‹She is|He is› alive and well. But in the morning ‹she remembers|he remembers› nothing of the night – not the pier, not the sea, not you at the edge. ‹She looks|He looks› at you politely and a little puzzled, like a stranger. Something of ‹her|him› the sea has kept.',
    ],
  },

  deepVoice: {
    title: 'A talk between old ones',
    text: [
      'You relax and the voice comes out of your mouth – but not in words. In a low, drawn-out hum, like whale song, like the sound of a stone rolling along the seabed.',
      'The sea falls quiet. The two ancient things talk over your head in a language older than words. Then the hill of water slowly sinks. {friend} blinks and sags backwards, into your arms.',
      '“She let ‹her|him› go,” says the voice, pleased. “As a favour between old acquaintances. Now ‹the girl|the boy› owes me. And so do you.” You don’t know what frightens you more: that the sea agreed – or that it listened to him of all things.',
    ],
  },

  stayGroup: {
    title: 'At the hotel',
    text: [
      'You stay with the class. You play cards; your form teacher counts heads every hour. Outside, the sea sings.',
      'Towards midnight you look out of the window. In the fog, on the long pier, stands a small figure. Then another. And another. White nightgowns, bare feet, pale faces turned to the sea.',
      'In the morning {friend} comes down to breakfast last. ‹She is|He is› pale and silent. ‹Her|His› hair is wet and smells of salt. When you ask what happened, ‹she looks|he looks› at you politely, like a stranger, and says ‹she|he› slept deeply.',
    ],
  },

  seaReturn: {
    title: 'The way back',
    text: [
      'The bus climbs the hairpin bends and Maglitsa vanishes into the fog, as if it had never been.',
      {
        ifFlag: 'viktoria_saved',
        text: '{friend} holds the shell in ‹her|his› lap and now and then puts it to ‹her|his› ear. “It sings softly now,” ‹she says|he says›. “It doesn’t call any more.”',
      },
      {
        ifFlag: 'sea_took',
        text: '{friend} sits alone on the back seat, watching the sea until it disappears behind the hills. Something of ‹her|him› has stayed there.',
      },
      {
        ifFlag: 'voice_deal_sea',
        text: 'The voice inside you hums the sea’s song – all of it, without a mistake – like someone who has just learned a new and very expensive trick.',
      },
      'That evening at home you listen to the silence. In it, if you listen well, there is still the sound of waves.',
    ],
  },
}
