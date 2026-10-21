/* Parts VI and VII – The recipe, the dark and the endings. */

export default {
  recipe: {
    title: 'A recipe for luck',
    text: [
      'The next morning the voice wakes you before the alarm: “{hero}, wake up. Today you will write down the recipe for luck. How to make your wishes come true. I will tell it to you.”',
      'Your hand reaches for the pen on its own. You write: First – a wish from the heart. Second – unbending intent. Third – humble patience.',
      'The words are true. You feel it with the part of you that knows things without having learned them. And then the voice lowers its tone, soft as velvet on a coffin lid: “And fourth – open the door for me.”',
    ],
    choices: {
      dictated: 'Write down the fourth line too',
      own: 'Cross out the fourth line and write your own',
    },
  },

  recipeVoice: {
    title: 'The fourth line',
    text: [
      'You write it down. The letters come out darker than the rest, as if the ink were different – thicker, older, taken from a place where there should be no ink at all.',
      'When you look up, the room seems a little darker, though the sun is shining.',
    ],
  },

  recipeOwn: {
    title: 'Humble patience',
    text: [
      'You cross out the line and write beneath it: “Accept that your wish doesn’t matter at all. Even if nothing happens – so what, life goes on. Life itself is the greatest luck you can draw. Rejoice in it.”',
      'The voice hisses – a sound like cold water on a red-hot stone. You smile. For the first time, it doesn’t know what to say.',
    ],
  },

  mom: {
    title: 'Mother',
    text: [
      'Your mother comes into your room while you are at school. The bed isn’t made, of course. “Why make it?” she thinks. “Mum will take care of it, won’t she?”',
      'Her eye falls on a sheet of paper: “Recipe for luck”. She reads it once, then again, and stands at the window for a long time, looking at the sky as though searching it for something she saw long ago.',
      { ifFlag: 'fought', text: 'The school has already called about the fight. Mum says nothing about it – for now.' },
      'In the evening, at dinner, she asks quietly: “Who taught you this, {hero}?”',
    ],
    choices: {
      tell: 'Tell her about the voice',
      hide: '“It’s homework. For philosophy class.”',
    },
  },

  tellMom: {
    title: 'Hold on to my voice',
    text: [
      'You tell her everything – about the dark, about the voice that calls itself the Listener, about the shadow in the dream. Mum doesn’t laugh. She takes your hand, and her fingers are cold.',
      '“When I was little, I dreamed of darkness too,” she says slowly. “So did my grandmother. In our family we all hear a little more than we should. My grandmother used to say: the dark isn’t an enemy, it’s the empty place where there’s no song yet. Fill it.”',
      '“And if you ever can’t wake up – hold on to my voice. I’ll call until you come back.”',
    ],
  },

  hideMom: {
    title: 'Homework',
    text: [
      'Mum nods, but she doesn’t believe you. You don’t believe yourself either.',
      'The night is darker than usual. The stars above the town shine cold and motionless, like eyes that do not blink.',
    ],
  },

  concertEve: {
    title: 'The deal',
    text: [
      'The night before the concert. You can’t sleep. The voice is stronger than ever – no longer a whisper, but something like a tide rising from within.',
      '“Tomorrow I will play,” it says. “You’ll be the best. You’ll have everything: applause, fame, {friend}. For aeons I waited to hear music. Let me make it. Just open the door for me. Only tonight.”',
      'Somewhere at the back of your mind, Grandpa is telling the story of Orpheus. The dark is patient. It always waits for you to turn around.',
    ],
    choices: {
      accept: '“All right. Only tonight.”',
      refuse: '“No. Tomorrow I play.”',
      tryRefuse: 'You try to say “no”, but your voice won’t come…',
    },
  },

  deal: {
    title: 'The open door',
    text: [
      'You say “yes”. Something warm and heavy slides into you like water into an empty glass – slowly, irresistibly, filling every corner.',
      'You fall asleep peacefully – for the first time in weeks. And you dream of nothing, because there is no longer anyone to dream.',
    ],
  },

  struggle: {
    title: 'The last chance',
    text: ['The dark is so deep in you that your words are its words. Your lips are already shaping the “yes”. All you have left is luck.'],
    success:
      'At the last moment you hear Mum’s voice from the next room – she is singing softly, as on the nights when you were a baby – and you cling to it. “No!” you shout. The dark draws back – and waits for you in the dream.',
    failure: 'You try, but your mouth says “yes”. The door opens by itself, without a sound.',
  },

  finalDream: {
    title: 'The Dark',
    text: [
      'You rush through pitch darkness. This time you don’t run.',
      'The presence thickens before you into a silhouette – vast, faceless, as old as nothing itself. Around it, space bends into angles that do not exist, and the stars behind it tremble, as though their light hesitated to pass.',
      '“I am what you came from and what you will return to,” it says. “Nothing gives birth to everything. For aeons I listened to silence. Give me your hands, and at last I will sing.”',
      { ifItem: 'feather', text: 'The grey feather in your pocket is warm, like a small living heart.' },
      { ifFlag: 'zann_saved', text: 'Somewhere far away, as if through a thick wall, you hear Old Tsanko’s gadulka. He is still playing. The window is still shut.' },
      { ifFlag: 'echo_learned', text: 'And then the Dark speaks in Mum’s voice – gentle, warm, familiar. Only it is one heartbeat late. You know what that is now.' },
      { ifItem: 'starglass', text: 'The star-glass in your pocket rings softly – like a little bell that remembers the way home.' },
    ],
    choices: {
      ask: '“What do you want?”',
      fight: 'Stand up to the Dark',
      play: 'Hold the feather tight and play your own song to the Dark',
    },
  },

  darkTalk: {
    title: 'What do you want?',
    text: [
      '“What do you want?” you ask. Your voice doesn’t tremble. Almost.',
      'The dark is silent for a long time. Then it answers – not with words but with a feeling that floods you like a cold sea: endlessness, silence, a loneliness older than the stars. Aeons without a single sound. Countless worlds it drifted past, deaf.',
      '“I was looking for light,” it says at last. “I thought I had to take it. That if I had your hands, I would have the song.”',
      { ifFlag: 'colour_home', text: '“You sent the other one home,” it says. “The small, hungry one. I saw it rise towards the Swan. No one had ever shown the way to a thing like us.”' },
      'It isn’t so frightening any more. You know what it is – and you know you can answer it.',
    ],
    choices: {
      fight: 'Stand up to the Dark',
      play: 'Hold the feather tight and play your own song to the Dark',
    },
  },

  darkDuel: {
    title: 'The battle in the dream',
    text: [
      'You clash not with fists but with will. The Dark is as strong as the Darkness in you. Everything you gathered on the way – the feather, the professor’s words, your mother’s voice, the songs of your ancestors – protects you now.',
      'If you lose four rounds, the dark swallows you.',
    ],
  },

  concert: {
    title: 'The concert',
    text: [
      'You wake at sunrise – quiet and light, as if someone had washed your soul. The voice is somewhere deep down, quiet and small, like an echo in a distant cave.',
      'That evening the hall is full. Grandma, Grandpa, Mum and Dad Vladko are in the front row. In the last row, half hidden in shadow, sits the guest professor with his tired eyes.',
      { ifFlag: 'belyan_friend', text: 'By the wall, Belyan is drumming his fingers on his knee. He gives you a thumbs-up.' },
      { ifFlag: 'viktoria_comes', text: '{friend} sits in the last row, headphones round ‹her|his› neck. ‹She waves|He waves›.' },
      { ifNotFlag: 'viktoria_comes', text: 'You look for {friend}, but ‹she isn’t|he isn’t› there. Maybe that’s how it should be.' },
      'You sit down on the chair. The voice is silent – or it is no longer a voice, just the silence between the notes.',
    ],
    choices: {
      own: 'Play your own song',
      cover: 'Play the song everyone knows',
    },
  },

  lightEnd: {
    title: 'The Dark Shines',
    text: [
      'The feather trembles in your fingers. You don’t look back. You start to play – the song written on napkins and in notebooks, a little crooked and entirely yours.',
      'The dark goes still. The sound spreads through it like light through an old cathedral, illuminating vaults no one has seen since creation. For the first time, the endless silence has an echo.',
      '“So that’s what it was,” it says, almost tenderly. “That’s why I was looking for light. Not to eat it – to hear it.”',
      'It doesn’t vanish. It becomes the silence between your notes – the pause in which a song draws breath. At the concert you play your own song, and some swear that during the last chord the lights in the hall flicker like stars. In the last row, the guest professor takes off his glasses and wipes them for a long time.',
      'That same night, at the Rozhen Observatory, the receivers record something no one can explain: in the noise between the stars, very softly, a melody is playing. Yours.',
      { ifFlag: 'colour_home', text: 'And from the direction of Cygnus, barely audible, a second one answers it – short and grateful, like a greeting from someone who is home.' },
      'The dark shines. Nothing gives birth to everything.',
    ],
  },

  guitaristEnd: {
    title: 'The Guitarist',
    text: [
      'You play your own song. The first note is hesitant, the second firm, the third yours.',
      { ifFlag: 'viktoria_comes', text: 'In the last row, {friend} has taken off ‹her|his› headphones.' },
      { ifFlag: 'viktoria_saved', text: '‹She is|He is› holding the shell from Maglitsa. When you finish, ‹she puts|he puts› it to ‹her|his› ear and smiles – as if the sea had heard too.' },
      'When you finish, for a moment there is total silence – that full, living silence in which a whole hall holds its breath. Then the hall erupts.',
      'The voice is somewhere far away, defeated but not destroyed – the dark never dies, it only waits. But tonight the song is stronger than it.',
      'That night you dream of stars. You aren’t rushing through the dark – you stand on a hill and listen to them. You are a guitarist.',
    ],
  },

  goodStartEnd: {
    title: 'A Good Start',
    text: [
      'You play cleanly, beautifully, without a mistake. People clap, Grandma cries, Grandpa whistles through two fingers.',
      'But as you bow, something unborn is still bubbling in your belly – your own song. It isn’t ready. It will be. And somewhere very deep, the voice is waiting too – patient as the dark it came from.',
      'This is a good start. Every guitarist started here.',
    ],
  },

  puppetEnd: {
    title: 'Puppet',
    text: [
      'At the concert you play like a god. The tunes are so beautiful and so alien that some listeners weep without knowing why, and others leave in the middle of the song, pale. The hall is on its feet.',
      'Only you are watching it all from the side, as if through thick glass – your hands move, but you aren’t moving them.',
      '“Thank you. I know,” the voice says with your mouth when someone praises you.',
      'Somewhere deep inside, a [boy|girl|child] is waiting to wake up. Maybe some day someone will call [him|her|them] by [his|her|their] name – with a voice strong enough to reach the bottom of the dark.',
    ],
  },

  silenceEnd: {
    title: 'Silence',
    text: [
      'Your inspiration goes out like a candle in the wind. One evening you put the guitar in its case and push it under the bed, next to the old lesson book.',
      'Weeks pass. Sometimes at night you think the strings are ringing on their own – softly, faintly, like someone calling you from far away. But you don’t open the case.',
      'They say silence is music too. But not this kind. This is the silence the Listener knew for an eternity – and now you know how cold it is.',
    ],
  },
}
