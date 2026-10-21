/* Part V¼ – The window above the wall. After Lovecraft's "The Music of Erich Zann". */

export default {
  zannNote: {
    title: 'The note',
    text: [
      'As you leave the Star String, the owner stops you at the door. The dry old man with the bright bird’s eyes. In the neighbourhood they call him Old Tsanko. No one remembers ever hearing him speak.',
      'He presses a folded sheet into your hand, yellowed like an old score. In small, shaking handwriting it says: “Come tonight. Upstairs. Bring the guitar. I can’t hold it alone any more.”',
      'The old man glances up at the shop ceiling, then at you, and in his eyes there is something you have never seen in a grown-up: a plea.',
    ],
    choices: {
      go: 'Go tonight',
      skip: 'Don’t go – it’s too strange',
    },
  },

  zannSkip: {
    title: 'Closed',
    text: [
      'You don’t go. That night you dream of music – distant, frantic, like a gadulka played far too fast – and of a window opening slowly, slowly, inwards.',
      'In the morning a sign hangs on the door of the Star String: “Closed”. It doesn’t say until when.',
    ],
  },

  zannStreet: {
    title: 'The steep street',
    text: [
      'Behind the shop begins a street you have never noticed before. It is so steep that in places it turns into steps, and the houses on both sides lean towards each other as if they wanted to touch above your head.',
      'It ends at the old city wall – high, black, older than anything else in town. The last house is built right against it and is taller than the others. Only its attic window looks out over the wall.',
      'From there, barely audible, comes music. Sad, drawn out, eastern – and there is something in it that makes you look around, though the street is empty.',
      '“I know that music,” whispers the voice inside you. And for the first time since you have known it, it sounds unsure.',
    ],
  },

  zannRoom: {
    title: 'The attic',
    text: [
      'The room is bare: a bed, a chair, music stands, piles of written scores. An old gadulka hangs on the wall, and on the chair lies another, worn shiny with use. The only window is covered with heavy wooden shutters and a thick curtain.',
      'Old Tsanko writes on a small slate: “Every night I play. So that it stays shut.” He wipes it and writes again: “I can’t alone any more. My hands.” He shows you his fingers – swollen and trembling.',
      'Then he takes the gadulka and begins to play. The melody is strange and beautiful: it starts on E, then steps only a half-tone up, then leaps, as if the road suddenly bent. It sounds like a Rhodope song and like flamenco at the same time. Like something older than both.',
      'He stops and writes: “Learn it.”',
    ],
    choices: {
      learn: 'Try to learn his melody',
      ask: '“What is behind the window?”',
    },
  },

  zannLesson: {
    title: 'The melody',
    text: [
      'You play together – he on the gadulka, you on the guitar. Again and again, until your fingers stop searching and start knowing.',
    ],
    success:
      'And there comes a moment when you play as one. Old Tsanko closes his eyes and, for the first time, smiles. On the slate he writes only: “Yes.”',
    failure:
      'The melody slips away from you – where it bends, your fingers keep going to the wrong place. The old man nods wearily. It will have to do.',
  },

  zannWarning: {
    title: 'Don’t look',
    text: [
      'Old Tsanko turns pale. His hand with the chalk shakes so much that the letters come out crooked: “Don’t look outside. Whatever you hear. Whatever it tells you.”',
      'He underlines the words three times, until the chalk breaks.',
    ],
  },

  zannNight: {
    title: 'Midnight',
    text: [
      'Towards midnight the shutters begin to tremble. There is no wind outside – the candle on the table burns straight and still. But the shutters shake, as if someone were pushing them from outside, slowly and patiently.',
      'From behind them comes a sound. Not wind, not the town. It is the noise between the stars the professor talked about – only close, very close, like breathing at your ear.',
      'Old Tsanko plays faster and faster. The melody turns wild, frantic, the gadulka shrieks, the bow flies, sweat runs down his forehead. He plays the way a drowning man holds on to a rope.',
      '“There,” whispers the voice inside you, and this time there is something like longing in the whisper. “That is where I came from.”',
    ],
    choices: {
      join: 'Play with him – his melody on your guitar',
      look: 'Peer through the gap between the shutters',
      shut: 'Press against the shutters with all your weight',
      voice: 'Let the voice open the window',
    },
  },

  zannDuel: {
    title: 'Two against the dark',
    text: [
      'You strike the strings. The old man’s melody and yours intertwine into something like a wall of sound – two voices holding on to each other. Outside, something pushes harder and harder.',
      'If you lose three rounds, the window will open.',
    ],
  },

  zannLook: {
    title: 'The gap',
    text: [
      'You lean towards the gap between the shutters. You expect to see the roofs of the town, the lights, the towers. But beyond the wall there is no town.',
      'There is nothing. Only darkness – endless, alive, moving, with points of light that are not stars, because they are in colours stars do not have. And something in that darkness notices you.',
    ],
    success:
      'You tear yourself away in time. Your heart is racing, but you are here. Old Tsanko doesn’t look at you – he only plays harder. You grab the guitar.',
    failure:
      'You can’t look away. The dark pulls at you, the voice in you sings, the candle goes out. When at last you tear free, it is too late: the shutters bend inwards.',
  },

  zannShut: {
    title: 'The shutters',
    text: [
      'You throw yourself at the window and press the shutters with your shoulder, your hands, your whole body. They shake beneath you as if alive.',
    ],
    success:
      'The pressure from outside weakens – once, twice – and stops. You hold them until the sky in the cracks turns grey. The old man’s music held you up the whole time.',
    failure:
      'The shutters fly open with a crash that throws you to the floor. The curtain billows inwards like a sail.',
  },

  zannVoice: {
    title: 'Open it',
    text: [
      '“Let me,” begs the voice. “Just one look. That is my home.” And your hand reaches for the latch on its own.',
      'The shutters swing open. The darkness looks into the room – not like darkness, but like a gaze. Old Tsanko screams without a sound, throws himself before the window and plays as no human has ever played.',
      'You run. Down the steps, down the steep street, without looking back, and behind you the gadulka shrieks higher, higher…',
    ],
  },

  zannDawn: {
    title: 'Dawn',
    text: [
      'When the sky in the cracks turns grey, the pressure from outside stops as suddenly as it began. The noise fades. The candle burns down.',
      'Old Tsanko puts down the gadulka and breathes for a long time, hands on his knees. Then he writes on the slate: “There are two of us. It will hold.”',
      'He takes a thick folder of scores from his chest, written in his small shaking hand, and gives it to you. On the first page it says: “For {hero}. When things are hard – play from here.”',
      'You walk down the steep street into the pink morning. For the first time in weeks the voice inside you is completely silent – not offended, but thoughtful.',
    ],
  },

  zannGone: {
    title: 'The street that isn’t there',
    text: [
      'The music stops all at once – like a string cut with a knife. Then silence, more terrible than any sound. You run down the steps and don’t stop until you are home.',
      'In the morning you go back. The Star String is where it always was. But behind it there is no street – only a blank wall overgrown with ivy. You walk round the neighbourhood three times. You ask the neighbours. No one has heard of a steep street that ends at the city wall.',
      'Behind the counter stands a young man you don’t know. “Old Tsanko?” he repeats, puzzled. “It’s always been me here.” The black piano at the back is shut and locked, and the key is gone.',
      {
        ifFlag: 'voice_opened',
        text: 'The voice inside you is silent all day. That evening, as you switch off the light, you think you hear it softly humming Old Tsanko’s melody – with those bent notes – like someone who has seen their home through a window and can’t forget it.',
      },
    ],
  },
}
