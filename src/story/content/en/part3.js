/* Part III – The voice. */

export default {
  walkHome: {
    title: '41 degrees',
    text: [
      'It is terribly hot – 41 degrees Celsius. The asphalt shimmers and the street bends in the distance like a reflection in water. The town has gone quiet in that unnatural way places go quiet when something invisible hangs over them.',
      'Suddenly, out of the corner of your eye, you catch a movement by the roadside. A little bird is thrashing and twitching in the dust. You don’t know how, but you understand at once that it is dying.',
      '“Don’t waste time,” says the voice. “Everything created disappears. You heard the professor. What does one more tiny spark matter, going out in the endless dark?”',
    ],
    choices: {
      stop: 'Crouch down and stroke it',
      pass: 'Keep walking',
    },
  },

  bird: {
    title: 'Witness',
    text: [
      'You stroke it very gently. Sensing it is not alone, the bird calms and stops trembling. Its breathing slows, and a moment later its tiny soul has flown away – upwards, into a sky that, in broad daylight, suddenly seems full of stars.',
      'They say we all die alone. But not all of us die alone. Death is kind to the witnesses who humbly pay their last respects.',
      'You bury it under the linden tree. A single grey feather stays in your palm – light, warm and strangely alive. You aren’t sad. You feel a quiet, dull elation, as if something in you remembers times when people sang as they saw off their dead. Maybe the spirit of the old Thracians is stirring in you.',
      'The voice is silent. For the first time, its silence is bewildered.',
    ],
  },

  passBird: {
    title: 'A cold spot',
    text: [
      'You walk on. Behind you, the fluttering fades, and after it comes a silence deeper than silence.',
      'The voice is pleased, and you don’t know why a cold spot stays in your chest – like the print of a hand that isn’t yours.',
    ],
  },

  atHome: {
    title: 'Host',
    text: [
      'You get home and start playing. Your thoughts evaporate and you float on the swaying sound waves, while the room gradually disappears – the walls, the bed, the window – until only the strings remain, and the dark behind them.',
      '“Hey, {hero}.” “Hello, imaginary friend.” “What do you dream of? I can teach you how to make your dreams come true.”',
      'You really are lucky – you nearly always get what you want. Maybe because you never want it at any cost. The more passionately you desire something, the further it drifts away. But the voice promises something else: wishes that come true the moment you think them – and a price nobody mentions.',
    ],
    choices: {
      ask: '“And how would you know? Who are you?”',
      quiet: '“Be quiet. I want to play my own music.”',
    },
  },

  origin: {
    title: 'From the depths',
    text: [
      '“Because I come from the depths of space,” the voice answers, and the words fall into your mind heavily, like stones into a bottomless well. “I was born of a trembling in the nothing, before the first star lit its fire. Knowledge is part of my origin.”',
      '“For aeons I drifted in the dark, unable to hear. Infinity is silent, {hero}. You cannot imagine how silent. Then you touched the strings and I heard. For the first time.”',
      '“Call me the Listener. You are my host.”',
      '“Yeah, right. Seems my imagination is wilder than I thought.” You laugh. The voice doesn’t. And through the window, in the middle of a summer night, a breath of cold drifts in, the kind that only comes from very far away.',
    ],
  },

  ownMusic: {
    title: 'Your own music',
    text: [
      'You close your eyes and look for the music inside you – not the music being whispered to you, but that quiet, uncertain tune that was there before the voice came.',
    ],
    success:
      'The melody comes slowly – yours, a little crooked and completely real. The voice falls silent. For the first time the quiet in the room is yours alone, and it is warm, not bottomless.',
    failure:
      'Your fingers tangle and the voice laughs – patiently, like a grown-up watching a child struggle to lift a stone: “Without me you’ll be strumming till you’re old, {hero}.”',
  },

  nightmare: {
    title: 'The silhouette of the dark',
    text: [
      'You dream the dream again. You rush through pitch darkness, your heart pounding, an unknown fear crawling up your spine. But this time the dark is not empty. There are shapes in it – vast, vague, with angles the eye cannot follow – and something like a choir of voices that do not sing, but listen.',
      'The most frightening thing is the thought that you will never wake – that something is holding you and you are entirely in its control.',
      'From the next room comes your mother’s voice – distant, muffled, but real. You wake inside the dream and glimpse the silhouette of the dark. It stands between you and the voice.',
    ],
    choices: {
      fight: 'Turn and face the shadow',
      climb: 'Hold on to Mum’s voice and pull yourself out',
      feather: 'Clutch the little bird’s feather',
      drift: 'Stop struggling and float with the dark',
    },
  },

  climbOut: {
    title: 'The rope',
    text: ['You hold on to Mum’s voice like a rope let down into an abyss, and pull.'],
    success:
      'The voice grows clearer, the dark thinner, like a curtain with morning showing through. One more pull…',
    failure:
      'The voice slips away. The shadow is between you and it – and this time it won’t move.',
  },

  shadowDuel: {
    title: 'The shadow',
    text: [
      'You turn to face the shadow. It has no face, but you know it is watching you – not with eyes, but with the whole of its vast, patient attention.',
      'The Shadow is as strong as your Darkness. If you lose three rounds, it will hold you until morning.',
    ],
  },

  featherDream: {
    title: 'The feather',
    text: [
      'You clutch the feather in your dream – and it lights up, warm and silvery like dawn over a hill you have never seen but remember.',
      'The shadow draws back from the light. It doesn’t flee – it simply makes way for you, the way water parts around a stone it cannot carry off.',
      'You wake with the feather in your fist. Outside, birds are singing as if nothing had happened. Perhaps, for them, nothing has.',
    ],
  },

  drift: {
    title: 'The current',
    text: [
      'You stop fighting. The dark is warm and quiet, like the sea at the end of summer. It carries you past things that have no names – past stars that went out before the Earth was born.',
      'You wake more rested than ever. Only you can’t remember the dream – and somehow that worries you, as though some part of you stayed behind.',
    ],
  },

  wake: {
    title: 'A sewing-machine needle',
    text: [
      'After a long struggle you make it. You sit up in bed, your heart hammering like a sewing-machine needle. Only your youth, you think, saved you from a heart attack.',
      'Outside, it is starting to get light. A grey morning has never looked so beautiful.',
    ],
  },

  heldDark: {
    title: 'All night',
    text: [
      'The Shadow holds you all night. It doesn’t hurt you – it just watches, and you cannot move, and in its gaze there is something almost like tenderness, and that is the most terrible thing of all.',
      'The alarm rings and you open your eyes exhausted, as if you had not slept at all.',
    ],
  },
}
