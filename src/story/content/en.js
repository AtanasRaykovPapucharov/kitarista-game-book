/* The game-book text in English.
   Keys match src/story/book.js.
   A paragraph is a string or { ifFlag | ifNotFlag | ifItem, text }.
   Square brackets with three forms, e.g. [boy|girl|child] – picked by
   the form of address chosen at sign-up (masculine, feminine, neutral). */

export default {
  title: 'While You Listen to the Stars',
  byline: 'A game-book after the story by Atanas Papucharov',
  pitch:
    'Tome gets a guitar for [his|her|their] birthday – and with it, a voice from the depths of space. Will [he|she|they] become a guitarist? And whose hands will be doing the playing?',

  enemies: {
    belyan: 'Belyan “Sumo”',
    belyanFist: 'Belyan',
    gang: 'Belyan and his crew',
    shadow: 'The Shadow in the Dream',
    kristian: 'Kristian',
    dark: 'The Dark',
  },

  items: {
    guitar: { name: 'Guitar', desc: 'Yours. It smells of fresh lacquer.' },
    pancakes: { name: 'Mum’s pancakes', desc: 'Eat one to restore 4 Inspiration.' },
    pick: { name: 'Bone pick', desc: 'Grandpa’s. +1 to your attack in duels.' },
    songbook: { name: 'Songbook', desc: 'A gift from Grandma. Composing comes easier with it.' },
    strings: { name: 'Spare strings', desc: 'Strings break at the worst possible moment.' },
    feather: { name: 'Grey feather', desc: 'From the little bird under the linden. It guards you from the dark.' },
    metronome: { name: 'Old metronome', desc: 'From Kristian. +1 to your attack in duels.' },
    recipe: { name: 'Recipe for luck', desc: 'Read it once to restore your Luck to its starting value.' },
  },

  endings: {
    light: { title: 'The Dark Shines', summary: 'You played your own song to the dark, and it turned to light.' },
    guitarist: { title: 'The Guitarist', summary: 'You beat the dark and played your own song for everyone.' },
    start: { title: 'A Good Start', summary: 'You played cleanly, but your own song is still waiting to be born.' },
    puppet: { title: 'Puppet', summary: 'The voice plays with your hands. You watch from the side.' },
    silence: { title: 'Silence', summary: 'Your inspiration died out and the guitar went under the bed.' },
  },

  sections: {
    prologue: {
      title: 'Dark',
      text: [
        'The dark pierced him at the speed of light. He felt it with every fibre of his bodiless being. They were one, and yet they were not. His mind defined him as separate.',
        'Where to and for how long meant nothing. Time and space had no meaning. Knowledge was part of him. Everything is nothing, and nothing gives birth to everything. Chance. Deliberate accident. Creation.',
        'He knew that one day he would find light, and then everything would change. Everything would gain meaning. And it would be real. Real?',
        'Somewhere very far away, on a small blue planet, a [boy|girl|child] was falling asleep.',
      ],
    },

    eve: {
      title: 'The night before the birthday',
      text: [
        'You are Tome – one of those [boys|girls|kids] who seem as if they will never grow up. And yet anyone perceptive enough notices a hidden wisdom in you. Maybe an old soul lives in your body.',
        'You lie in bed, drifting off, impatient for tomorrow. Tomorrow is your birthday. All the relatives will gather and you know it: at last you will have your own guitar. You have no friend. The guitar will be your friend. Your comfort when you are alone.',
        'The music is in your heart. You feel it in your belly – bubbling, waiting to be born. From the living room comes the rustle of wrapping paper.',
      ],
      choices: {
        sneak: 'Peek into the living room – just for a moment',
        sleep: '“Impatience makes you weak. I am different.” Close your eyes',
      },
    },

    sneak: {
      title: 'On tiptoe',
      text: [
        'You slip out from under the blanket. The floor creaks treacherously and your heart pounds in your ears. The living-room door is ajar.',
      ],
      success:
        'Nobody hears you. Through the gap you see a hard black case leaning against the sofa. You go back to bed, but sleep is slow to come – and when it does, it is dark and fast. The dark has sensed your impatience.',
      failure:
        'You step on the cat’s tail. Meow! A lamp clicks on. “Tome!” Mum is standing in the doorway, hands on her hips. “You’ll see tomorrow. Bed!” You feel silly. Impatience really does make you weak.',
    },

    dream: {
      title: 'The dream',
      text: [
        'You rush at an unimaginable speed through pitch darkness. Someone is watching you – a presence that is like the dark itself. Part of it, and yet not.',
        'Far, far away, a single light flickers.',
      ],
      choices: {
        look: 'Turn around and look at the presence',
        light: 'Fly towards the distant light',
      },
    },

    dreamLook: {
      title: 'No face',
      text: [
        'You turn. The dark has no face, but you know it sees you.',
        '“Interesting,” says something without a voice. “You can see me.”',
        'You wake for a moment, sweating, and sink back down – without dreams this time.',
      ],
    },

    dreamLight: {
      title: 'A tone in the distance',
      text: [
        'You fly towards the light and it grows until it becomes a warm, ringing tone – like a string someone has just touched.',
        'The presence behind you hisses and vanishes. You sleep like a baby.',
      ],
    },

    birthday: {
      title: 'The gift of gifts',
      text: [
        '“Tome, get up! The pancakes are getting cold!”',
        '“I love pancakes. Pancakes… rays… sunrays. Yes, little sun, you own my day.”',
        'The living room is full. Grandma pinches your cheek: “Grandma’s [boy|girl|darling], how big you’ve grown!” Grandpa shakes your hand like a grown-up’s: “Grow up big, my [boy|girl|dear].”',
        '“And finally – the gift of gifts! Guess what Dad Vladko and I got you?”',
        'The case is heavy and smells new. Inside, smooth and gleaming, lies the guitar. Your guitar. Mum wraps three pancakes for you – just in case.',
        'But Grandpa winks: there is something else. Roll a die to find out what.',
      ],
      outcomes: {
        pick: 'Grandpa takes an old bone pick out of his pocket. “I used it to serenade your grandma under her window. Now it’s yours.”',
        songbook: 'Grandma hands you a hardback notebook. “For your songs. Because you’ll have your own – I know it.”',
        strings: 'Dad Vladko hands you an envelope of spare strings. “Strings break at the worst possible moment. Trust me.”',
      },
    },

    firstStrum: {
      title: 'Light',
      text: [
        'You shut yourself in your room and touch the strings. The sound spills out, and something inside you seems to crack open. Light.',
        '“How beautifully you play, [young sir|young miss|young friend],” says a voice. Not from outside – from within.',
        '“Thank you. I know,” you answer without thinking. Ta-ta-ra-pa-ra-ta-ta.',
        '“I believe you should have pressed one fret higher.”',
        '“I’m talking to myself. How interesting,” you think. And the voice laughs: “To yourself?!”',
      ],
      choices: {
        obey: 'Listen to the voice and move your finger',
        ear: 'Find the right note yourself, by ear',
      },
    },

    voiceTip: {
      title: 'The good teacher',
      text: [
        'You move your finger – and the note shines. The voice is right.',
        'You play for an hour, two, three, and your fingers know where to go on their own. Only in the evening do you realise you can’t remember how you learned.',
      ],
    },

    byEar: {
      title: 'By ear',
      text: [
        '“Thanks, I’ll manage,” you say, and start searching. Fret by fret, note by note.',
      ],
      success:
        'You find it! The note is yours – not whispered, but discovered. The voice is silent, but you feel it watching you with interest.',
      failure:
        'Your fingers hurt and the notes clank. Around midnight you finally hit the right one – tired, but proud it is yours.',
    },

    school: {
      title: 'Inhumanly early',
      text: [
        '“Tome, get up! You’ll be late for school!”',
        '“It’s inhuman to get up this early. We’re children, for God’s sake. We’re growing.”',
      ],
      choices: {
        up: 'Jump out of bed at once',
        snooze: 'Five more minutes…',
      },
    },

    snooze: {
      title: 'Five more minutes',
      text: ['You pull the blanket over your head.'],
      outcomes: {
        late: 'Five minutes become twenty. You run to school with your shoes laced wrong and walk in after the bell.',
        rested: 'Those five minutes are the sweetest sleep of your life. You get up brand new – and still aren’t late.',
      },
    },

    corridor: {
      title: 'Sumo',
      text: [
        'In the corridor, someone yanks your hair.',
        '“Hey, Metaaal!”',
        'Belyan. Big, red-faced, with a nickname no one dares say out loud. Except you – in your head: Sumo.',
        '“One day I’ll eat you,” the voice remarks. Coldly, and quite seriously.',
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
      text: ['You lift your chin and walk past him.'],
      success: 'Belyan looks around for more interesting prey and forgets about you.',
      failure: '“Where d’you think you’re going?” A huge hand grabs your backpack and swings you round against the lockers.',
    },

    belyanAsk: {
      title: 'The question',
      text: [
        'You take a breath and look him straight in the eye. “What do you actually want, Belyan?”',
        'The question catches him off guard. For a moment his hand hangs in the air.',
      ],
      success: 'Belyan glances around to see who is listening. Then he nods towards the stairwell. “Not here.”',
      failure: '“I’ll ask the questions,” he snorts, and pins you against the lockers.',
    },

    cornered: {
      title: 'The lockers',
      text: [
        'Belyan pins you against the lockers. The metal is cold through your shirt. Onlookers gather – some grin, others look away.',
        '“Well, Metal? What are you going to do now?”',
        'Your heart is in your throat. You have a moment to decide.',
      ],
      choices: {
        fight: 'Shove him as hard as you can',
        nerves: 'Look him in the eye and don’t give an inch',
        run: 'Duck under his arm and run',
      },
    },

    runAway: {
      title: 'Under his arm',
      text: ['You crouch and duck under his arm.'],
      success:
        'You slip away like a fish and race down the corridor. Belyan is too heavy to catch you. You only stop outside the staff room – out of breath, but in one piece.',
      failure: 'You trip over your own backpack. Before you can get up, Belyan is standing over you.',
    },

    fistFight: {
      title: 'Fight',
      text: [
        'Someone shouts “Fight! Fight!” and the circle closes around you. Belyan is bigger but slower. You are lighter – and a lot more scared.',
        'If you lose three rounds, you end up on the floor.',
      ],
    },

    fightWon: {
      title: 'A costly win',
      text: [
        'Belyan lunges, you twist away, and he slips on the wet floor and lands on his back. Someone laughs. Then everyone goes quiet.',
        'Belyan turns red as a tomato. “I’ll pay you back for this,” he hisses.',
        'At that moment your form teacher appears in the corridor. “Both of you. Principal’s office. Now.”',
      ],
    },

    fightLost: {
      title: 'On the floor',
      text: [
        'Belyan knocks you down with a single shove. Your elbow hits the floor and the stars you see are not the nice kind.',
        { ifFlag: 'pick_taken', text: 'When you get up, he is already twirling Grandpa’s pick between his fingers, grinning.' },
        '“Both of you! Principal’s office!” your form teacher thunders from the end of the corridor.',
      ],
    },

    principal: {
      title: 'Outside the office',
      text: [
        'You sit side by side on the bench outside the principal’s office. The clock ticks. Belyan stares at his shoes.',
        'Up close he doesn’t look frightening. He looks tired.',
      ],
      choices: {
        talk: 'Speak first',
        silent: 'Stay silent',
      },
    },

    principalTalk: {
      title: 'The first word',
      text: ['“Why me?” you ask quietly.'],
      success: 'Belyan is silent for a long time. Then he sighs. “Because at least you’ve got something to play.”',
      failure: '“None of your business,” he snaps, and turns to the wall.',
    },

    silenceOffice: {
      title: 'See you around',
      text: [
        'The principal gives you both a lecture and lets you go. At the door Belyan leans towards you. “See you around, Metal.”',
        'He says it quietly. That’s worse than if he had shouted it.',
      ],
    },

    belyanSecret: {
      title: 'The drummer',
      text: [
        'Belyan stares at one spot for a long time. When he speaks, his voice is different – no mockery in it.',
        '“I heard you yesterday. Through the window. I live in the next block.”',
        '“I had drums. Dad sold them when we moved. Said they were too loud.”',
        'He kicks the wall with the toe of his shoe. “At least you’ve got a guitar.”',
      ],
      choices: {
        invite: '“Come over. We’ll play – you on the pots and pans, me on the guitar.”',
        truce: 'Nod and leave it at that',
      },
    },

    belyanFriend: {
      title: 'Pots and a guitar',
      text: [
        'Belyan eyes you suspiciously, as if waiting for a trick. Then, for the first time, he smiles – crooked, but real.',
        '“Pots and pans, huh… Deal.”',
        { ifFlag: 'pick_taken', text: 'He digs in his pocket and hands you Grandpa’s pick. “It’s yours. Sorry.”' },
      ],
    },

    belyanTruce: {
      title: 'Truce',
      text: [
        'You nod. He nods. You aren’t friends, but you aren’t enemies any more either.',
        'As you go your separate ways, Belyan calls over his shoulder: “You play well, Metal.”',
      ],
    },

    belyanDuel: {
      title: 'A battle of nerves',
      text: [
        'Onlookers gather. This is not a fistfight but a battle of nerves and wit. Whoever flinches first loses.',
        'If you lose three rounds, Belyan wins.',
      ],
    },

    beatBelyan: {
      title: 'Respect',
      text: [
        'Your last line is so sharp that someone at the back bursts out laughing. Belyan turns red to the ears.',
        '“All right, Metal…” he mutters, and walks off. For the first time, a classmate nods at you with respect.',
        'But as he walks away, you feel his eyes on your back. Belyan doesn’t forget easily.',
      ],
    },

    lostBelyan: {
      title: 'A lighter pocket',
      text: [
        'The words stick in your throat. Belyan ruffles your hair like a puppy’s and leaves, grinning.',
        'When you turn round, your pocket feels lighter. If you had a pick, Belyan has it now.',
      ],
    },

    voiceScares: {
      title: 'A stranger’s voice',
      text: [
        'You open your mouth, but it isn’t you speaking. The voice that comes out is low, quiet and strange: “One day I’ll eat you.”',
        'Belyan turns pale and backs away. The corridor falls silent. You are afraid too – but not of him.',
      ],
    },

    lecture: {
      title: 'What is nothing?',
      text: [
        { ifNotFlag: 'fought', text: '“Come on, the guest professor’s lecture is starting!”' },
        {
          ifFlag: 'fought',
          text: 'You walk into the hall half an hour late, with a note from the principal. The professor just nods at an empty chair.',
        },
        '“What is nothing?” the professor asks. “The absence of matter, mass, charge, energy, time, space and any information whatsoever. Let us limit ourselves to the first four. We will call it a vacuum, and it will be our starting point.”',
        'He talks about the global and the local – about light, which travels as a wave but is emitted and absorbed in portions, quanta. Your classmates stare with glazed eyes. But you understand every word, as if you already knew it.',
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
        '“Anything is possible,” you repeat to yourself.',
        '“In the vacuum, particle–antiparticle pairs are constantly born and annihilated. When they meet, they destroy each other and give off quanta of energy.”',
        '“Sounds like love,” you think, and glance at Viktoria. She has come for only one year, to stay with her aunt – your form teacher. At the end of the month she leaves.',
        '“The universe is expanding faster and faster,” the professor concludes. “It was born from nothing and strives to return to it. Once something has been created, nothing is more natural than for it to disappear. Thank you.”',
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
        'While the professor talks about waves and quanta, you write notes. A quiet, round melody that is born from nothing and returns to it again.',
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
        'He looks at your fingers. “You play, don’t you? It shows. Listen to the silence between the notes, [boy|girl|kid]. Everything is there.”',
        'Then he adds, more quietly: “And be careful with voices that know too much.”',
      ],
    },

    viktoria: {
      title: 'Viktoria',
      text: [
        'Viktoria is standing by the window with her headphones on. When she sees you, she takes them off and smiles.',
        '“You were the only one who didn’t fall asleep in the lecture.”',
        'Your heart starts racing.',
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
        '“I’ll come,” she says before you can finish. “I leave the next day. So it’ll be the last thing I hear here. Make it good.”',
      failure:
        'The bell rings right on “if”. Viktoria smiles apologetically and disappears into the crowd. “Annihilation,” you think. “I managed to annihilate myself.”',
    },

    silent: {
      title: 'Some day',
      text: [
        'You nod, mumble something about homework and flee.',
        'Later you look in the mirror and tell yourself that some day you will tell her. Some day.',
      ],
    },

    walkHome: {
      title: '41 degrees',
      text: [
        'It is terribly hot – 41 degrees Celsius. The asphalt shimmers.',
        'Suddenly, out of the corner of your eye, you catch a strange movement by the roadside. A little bird is thrashing and twitching. You don’t know how, but you understand at once that it is dying.',
        '“Don’t waste time,” says the voice. “Everything created disappears. You heard the professor.”',
      ],
      choices: {
        stop: 'Crouch down and stroke it',
        pass: 'Keep walking',
      },
    },

    bird: {
      title: 'Witness',
      text: [
        'You stroke it very gently. Sensing it is not alone, the bird calms and stops trembling. Its breathing slows, and a moment later its tiny soul has flown away.',
        'They say we all die alone. But not all of us die alone. Death is kind to the witnesses who humbly pay their last respects.',
        'You bury it under the linden tree. A single grey feather stays in your palm. Strangely, you aren’t sad. Maybe the spirit of the old Thracians is stirring in you.',
      ],
    },

    passBird: {
      title: 'A cold spot',
      text: [
        'You walk on. Behind you, the fluttering fades.',
        'The voice is pleased, and you don’t know why a cold spot stays in your chest.',
      ],
    },

    atHome: {
      title: 'Host',
      text: [
        'You get home and start playing. Your thoughts evaporate and you float on the swaying sound waves.',
        '“Hey, Tome.” “Hello, imaginary friend.” “What do you dream of? I can teach you how to make your dreams come true.”',
        'You really are lucky – you nearly always get what you want. Maybe because you never want it at any cost. The more passionately you desire something, the further it drifts away.',
      ],
      choices: {
        ask: '“And how would you know?”',
        quiet: '“Be quiet. I want to play my own music.”',
      },
    },

    origin: {
      title: 'From the depths',
      text: [
        '“Because I come from the depths of space, and knowledge is part of my origin. You are my host.”',
        '“Yeah, right. Seems my imagination is wilder than I thought.”',
        'You laugh. The voice doesn’t.',
      ],
    },

    ownMusic: {
      title: 'Your own music',
      text: ['You close your eyes and look for the music inside you – not the music being whispered to you.'],
      success:
        'The melody comes slowly – yours, a little crooked and completely real. The voice falls silent. For the first time, the quiet in the room is yours alone.',
      failure: 'Your fingers tangle and the voice laughs: “Without me you’ll be strumming till you’re old, Tome.”',
    },

    nightmare: {
      title: 'The silhouette of the dark',
      text: [
        'You dream the dream again. You rush through pitch darkness, your heart pounding, an unknown fear crawling up your spine. The most frightening thing is the thought that you will never wake – that something is holding you and you are entirely in its control.',
        'From the next room comes your mother’s voice. You wake inside the dream and glimpse the silhouette of the dark. It stands between you and the voice.',
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
      text: ['You hold on to Mum’s voice like a rope and pull.'],
      success: 'The voice grows clearer, the dark thinner. One more pull…',
      failure: 'The voice slips away. The shadow is between you and it – and this time it won’t move.',
    },

    shadowDuel: {
      title: 'The shadow',
      text: [
        'You turn to face the shadow. It has no face, but you know it is watching you.',
        'The Shadow is as strong as your Darkness. If you lose three rounds, it will hold you until morning.',
      ],
    },

    featherDream: {
      title: 'The feather',
      text: [
        'You clutch the feather in your dream – and it lights up, warm and silvery like the dawn.',
        'The shadow draws back from the light. It doesn’t flee – it simply makes way for you.',
        'You wake with the feather in your fist. Outside, birds are singing.',
      ],
    },

    drift: {
      title: 'The current',
      text: [
        'You stop fighting. The dark is warm and quiet, like the sea at the end of summer. It carries you.',
        'You wake more rested than ever. Only you can’t remember the dream – and somehow that worries you.',
      ],
    },

    wake: {
      title: 'A sewing-machine needle',
      text: [
        'After a long struggle you make it. You sit up in bed, your heart hammering like a sewing-machine needle. Only your youth, you think, saved you from a heart attack.',
        'Outside, it is starting to get light.',
      ],
    },

    heldDark: {
      title: 'All night',
      text: [
        'The Shadow holds you all night. It doesn’t hurt you – it just watches, and you cannot move.',
        'The alarm rings and you open your eyes exhausted, as if you had not slept at all.',
      ],
    },

    announcement: {
      title: 'Two posters',
      text: [
        'There are two posters on the school door. The first: “Open stage at the Star String music shop – Saturday.” The second: “Annual concert – end of the month.” Viktoria’s last day.',
        'You have three days until Saturday. Three days to practise – and to face whatever fate serves up.',
      ],
    },

    practice: {
      title: 'Day {day} of 3',
      text: ['The guitar is waiting on your bed. How will you spend the day?'],
      choices: {
        scales: 'Scales up and down until your fingers ache',
        voiceLesson: 'Let the voice teach you',
        compose: 'Write your own song in the songbook',
        napkins: 'Write your own song on whatever you can find',
        rest: 'Take a break from the guitar',
      },
    },

    scales: {
      title: 'Scales till you drop',
      text: ['You play scales up and down until the metronome in your head starts ticking on its own.'],
      success: 'Something clicks. Your fingers get faster and more precise.',
      failure: 'Your hands won’t listen today. You give up, annoyed.',
    },

    voiceLesson: {
      title: 'Lessons from the dark',
      text: [
        '“Allow me,” says the voice. Your fingers race along the neck as if they belonged to someone else. In one day you learn what others work months for.',
        'But in the evening your hands tremble, and in the mirror your eyes look darker.',
      ],
    },

    compose: {
      title: 'A song of your own',
      text: [
        'You open Grandma’s songbook. Words and notes come slowly, but they come.',
        'Your song grows by another verse.',
      ],
    },

    napkins: {
      title: 'A song on napkins',
      text: ['You have no songbook, so you write on napkins, on the back of your homework, on your palm.'],
      success: 'You gather all the scraps – and they fall into place as a real verse.',
      failure: 'Mum washes your jeans along with the scraps. The verse is lost.',
    },

    rest: {
      title: 'A day off',
      text: [
        'Today you don’t touch the guitar. You ride your bike, eat ice cream, watch the clouds.',
        'In the evening you feel the music bubbling in your belly again.',
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
        whisper: 'The night is clear. The stars are closer than usual.',
      },
    },

    stringBreaks: {
      title: 'A broken string',
      text: ['In the middle of your best chord, the second string snaps and whips your fingers.'],
      choices: {
        spare: 'Fit the spare string from Dad',
        five: 'Play on five strings for the rest of the day (−2 Inspiration)',
      },
    },

    neighbor: {
      title: 'Mr Petko',
      text: ['Someone is pounding on the wall. Your neighbour, Mr Petko, works night shifts and is asleep.'],
      choices: {
        quiet: 'Play quietly – just your fingers, no pick',
        ignore: 'Keep playing the way you were',
      },
    },

    neighborQuiet: {
      title: 'Whispering strings',
      text: ['You put down the pick and touch the strings with your fingertips. The sound turns soft, almost a whisper.'],
      success: 'You discover that playing quietly is a whole new art. Your fingers grow more sensitive.',
      failure: 'Without the pick everything sounds hollow. You give up for today.',
    },

    neighborDoor: {
      title: 'The doorbell',
      text: ['The pounding stops. Then the doorbell rings. Mr Petko is on the doorstep – in pyjamas, with puffy eyes.'],
      choices: {
        apologize: 'Apologise',
        argue: '“I’m allowed to play during the day!”',
      },
    },

    neighborApology: {
      title: 'The accordion',
      text: [
        '“Sorry,” you say. “I didn’t know you were asleep.”',
        'Mr Petko sighs. “When I was young I played the accordion. People pounded on my wall too.” He almost smiles. “After six in the evening. Then play as much as you like.”',
      ],
    },

    neighborArgue: {
      title: 'Spirit',
      text: ['“I’m allowed to play during the day!” you say, louder than you meant to.'],
      success: 'Mr Petko blinks. Then he laughs out loud. “You’ve got spirit, [boy|girl|kid]. All right. But quieter.”',
      failure: 'Mum appears behind you just in time to hear everything. The guitar goes into the cupboard until evening.',
    },

    grandpa: {
      title: 'Stardust',
      text: [
        'Grandpa sits on the edge of your bed.',
        '“Did you know you’re made of stardust? Billions of stars died so that life could be born. Our ancestors, the Thracians, sang to the stars when they saw off their dead – and they rejoiced. Listen to your ancestors, Tome.”',
        'Something inside you stands up straight.',
      ],
    },

    whisper: {
      title: 'Whisper',
      text: [
        'At night, as you watch the stars through the window, the voice whispers to you: “While you listen to the stars, I will whisper to you.”',
        'It whispers secrets of notes no human ear has heard.',
      ],
      choices: {
        listen: 'Listen until dawn (+1 Skill, +1 Darkness)',
        headphones: 'Put on your headphones and fall asleep to your favourite album (+1 Inspiration)',
      },
    },

    dayEnd: {
      title: 'Night',
      text: ['You set the guitar beside your bed and switch off the light. Outside, the stars shine like frets on an endless neck.'],
      choices: {
        next: 'On to the next day',
        saturday: 'Saturday is here – off to the Star String',
        saturdayAmbush: 'Saturday is here – off to the Star String',
      },
    },

    belyanAmbush: {
      title: 'Ambush',
      text: [
        'On the corner outside the Star String, Belyan is waiting. Two older boys are with him.',
        '“Told you we’d see each other again, Metal.” He nods at your case. “Nice guitar. Shame if it got broken.”',
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
      success: 'Belyan hesitates. His eyes slide towards the shop window.',
      failure: '“Don’t mess with me,” he growls, and steps forward.',
    },

    ambushRun: {
      title: 'The door',
      text: ['You clutch the case to your chest and run.'],
      success: 'The bell above the door jingles behind you. You’re inside. Belyan won’t come in – there are grown-ups here.',
      failure: 'One of the older boys blocks your way. Nowhere to go.',
    },

    ambushFight: {
      title: 'On the corner',
      text: [
        'His friends don’t step in – they just shout. Belyan wants to fight you himself.',
        'If you lose three rounds, the case is his.',
      ],
    },

    ambushPeace: {
      title: 'The drums',
      text: [
        'Behind the window, in the corner, stands an old drum kit. Belyan looks at it the way you looked at your guitar on the first day.',
        '“Just a look,” he mutters. His friends wander off, bored.',
        'Inside, Belyan sits down behind the drums as if he’s come home.',
      ],
    },

    ambushWon: {
      title: 'The case is safe',
      text: [
        'Belyan is stronger, but you are protecting something you love, and that gives you strength. In the end he steps back, out of breath.',
        '“All right, Metal,” he says. “All right.” For the first time it sounds like respect.',
      ],
    },

    ambushLost: {
      title: 'A broken string',
      text: [
        'Belyan pushes you aside, opens the case and yanks the strings. One snaps with a pitiful twang. They laugh and walk off.',
        { ifFlag: 'used_spare', text: 'Sitting on the pavement, you fit the spare string from Dad. Your hands shake, but you tune it up.' },
        {
          ifNotFlag: 'used_spare',
          text: 'The shop owner sees your face and, without a word, hands you a new string – on the house.',
        },
      ],
    },

    ambushVoice: {
      title: 'Back off',
      text: [
        'You open your mouth and the voice comes out – quiet, old, strange: “Back off.”',
        'Belyan turns pale. His friends are already on the far corner. He follows them without looking back.',
        'You walk into the shop. Your hands are cold.',
      ],
    },

    openMic: {
      title: 'The Star String',
      text: [
        'The shop smells of lacquer and dust. The stage is small, the audience about twenty people.',
        { ifFlag: 'belyan_friend', text: 'Belyan is already behind the old drums in the corner, tapping quietly with the sticks.' },
        { ifFlag: 'guitar_damaged', text: 'The new string hasn’t stretched yet and is slightly out of tune.' },
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
      text: ['You choose a song you could play in your sleep.'],
      success: 'You sing, you play, people clap along. Not a revolution, but good.',
      failure: 'Halfway through you forget a chord. You finish somehow, and the applause is polite – the worst kind of applause.',
    },

    kristianDuel: {
      title: 'Guitar duel',
      text: [
        'Kristian grins and plugs in. The audience perks up – a duel! A phrase from him, a phrase from you.',
        'If you lose three rounds, the stage is his.',
      ],
    },

    beatKristian: {
      title: 'Rhythm is everything',
      text: [
        'Your last phrase hangs in the air and the shop erupts.',
        'Kristian raises his hands. “All right, [little guy|little lady|kid], all right.” Then he hands you an old mechanical metronome. “A gift. Rhythm is everything.”',
      ],
    },

    lostKristian: {
      title: 'Hands without a voice',
      text: [
        'Kristian is faster, louder, more confident.',
        'But as you step off the stage he stops you: “You’ve got the hands. Now find a voice – your own, not someone else’s.”',
      ],
    },

    duet: {
      title: 'The two of you',
      text: [
        'You nod to Belyan. He raises the sticks. The first bars are shaky – then he finds the beat, and you find him.',
        'People in the shop start tapping along. Someone whistles. Belyan grins from ear to ear.',
        'When you finish, he reaches across the cymbals to shake your hand.',
      ],
    },

    ownSong: {
      title: 'Your own song',
      text: [
        'You play the song you wrote this week. At first it’s quiet – so quiet you can hear someone set down a glass.',
        'Then someone starts tapping the beat. By the end everyone is on their feet. The voice is silent the whole time.',
      ],
    },

    voicePlays: {
      title: 'Someone else’s hands',
      text: [
        'You relax and let it in. Your hands fly. The audience screams; Kristian gapes.',
        'When it’s over, you don’t remember a single note. The applause sounds like it belongs to someone else.',
      ],
    },

    recipe: {
      title: 'A recipe for luck',
      text: [
        'The next morning the voice wakes you: “Tome, wake up. Today you will write down the recipe for luck. How to make your wishes come true. I will tell it to you.”',
        'You write: First – a wish from the heart. Second – unbending intent. Third – humble patience.',
        '“And fourth,” the voice whispers, “open the door for me.”',
      ],
      choices: {
        dictated: 'Write down the fourth line too',
        own: 'Cross out the fourth line and write your own',
      },
    },

    recipeVoice: {
      title: 'The fourth line',
      text: ['You write it down. The letters come out darker than the rest, as if the ink were different.'],
    },

    recipeOwn: {
      title: 'Humble patience',
      text: [
        'You cross out the line and write beneath it: “Accept that your wish doesn’t matter at all. Even if nothing happens – so what, life goes on. Life itself is the greatest luck you can draw. Rejoice in it.”',
        'The voice hisses. You smile.',
      ],
    },

    mom: {
      title: 'Mother',
      text: [
        'Your mother comes into your room while you are at school. The bed isn’t made, of course. “Why make it?” she thinks. “Mum will take care of it, won’t she?”',
        'Her eye falls on a sheet of paper: “Recipe for luck”. She reads it once, then again, and stands at the window for a long time.',
        { ifFlag: 'fought', text: 'The school has already called about the fight. Mum says nothing about it – for now.' },
        'In the evening, at dinner, she asks quietly: “Who taught you this, Tome?”',
      ],
      choices: {
        tell: 'Tell her about the voice',
        hide: '“It’s homework. For philosophy class.”',
      },
    },

    tellMom: {
      title: 'Hold on to my voice',
      text: [
        'You tell her everything – about the dark, the voice, the shadow in the dream. Mum doesn’t laugh. She takes your hand.',
        '“When I was little, I dreamed of darkness too. My grandmother used to say: the dark isn’t an enemy, it’s the empty place where there’s no song yet. Fill it. And if you ever can’t wake up – hold on to my voice.”',
      ],
    },

    hideMom: {
      title: 'Homework',
      text: ['Mum nods, but she doesn’t believe you. You don’t believe yourself either. The night is darker than usual.'],
    },

    concertEve: {
      title: 'The deal',
      text: [
        'The night before the concert. You can’t sleep. The voice is stronger than ever.',
        '“Tomorrow I will play,” it says. “You’ll be the best. You’ll have everything: applause, fame, Viktoria. Just open the door for me. Only tonight.”',
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
        'You say “yes”. Something warm and heavy slides into you like water into an empty glass.',
        'You fall asleep peacefully – for the first time in weeks.',
      ],
    },

    struggle: {
      title: 'The last chance',
      text: ['The dark is so deep in you that your words are its words. All you have left is luck.'],
      success:
        'At the last moment you hear Mum’s voice from the next room and cling to it. “No!” you shout. The dark draws back – and waits for you in the dream.',
      failure: 'You try, but your mouth says “yes”. The door opens by itself.',
    },

    finalDream: {
      title: 'The Dark',
      text: [
        'You rush through pitch darkness. This time you don’t run. The presence thickens before you into a silhouette – vast, faceless, as old as nothing itself.',
        '“I am what you came from and what you will return to,” it says. “Nothing gives birth to everything. Give me your hands.”',
        { ifItem: 'feather', text: 'The grey feather in your pocket is warm.' },
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
        'The dark is silent for a long time. Then it answers – not with words but with a feeling: endlessness, silence, a loneliness older than the stars.',
        '“I was looking for light,” it says at last. “I thought I had to take it.”',
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
        'You clash not with fists but with will. The Dark is as strong as the Darkness in you. Everything you gathered on the way – the feather, the professor’s words, your mother’s voice, your ancestors – protects you now.',
        'If you lose four rounds, the dark swallows you.',
      ],
    },

    concert: {
      title: 'The concert',
      text: [
        'You wake at sunrise – quiet and light, as if someone had washed your soul.',
        'That evening the hall is full. Grandma, Grandpa, Mum and Dad Vladko are in the front row.',
        { ifFlag: 'belyan_friend', text: 'By the wall, Belyan is drumming his fingers on his knee. He gives you a thumbs-up.' },
        { ifFlag: 'viktoria_comes', text: 'Viktoria sits in the last row, headphones round her neck. She waves.' },
        { ifNotFlag: 'viktoria_comes', text: 'You look for Viktoria, but she isn’t there. Maybe that’s how it should be.' },
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
        'The feather trembles in your fingers. You start to play – the song written on napkins and in notebooks, a little crooked and entirely yours.',
        'The dark goes still. Then, slowly, it begins to shine.',
        '“So that’s what it was,” it says, almost tenderly. “That’s why I was looking for light. Not to eat it – to hear it.”',
        'It doesn’t vanish. It becomes the silence between your notes. At the concert you play your own song, and some swear that during the last chord the lights in the hall flicker like stars.',
        'The dark shines. Nothing gives birth to everything.',
      ],
    },

    guitaristEnd: {
      title: 'The Guitarist',
      text: [
        'You play your own song. The first note is hesitant, the second firm, the third yours.',
        { ifFlag: 'viktoria_comes', text: 'In the last row, Viktoria has taken off her headphones.' },
        'When you finish, for a moment there is total silence. Then the hall erupts.',
        'That night you dream of stars. You aren’t rushing through the dark – you stand on a hill and listen to them. You are a guitarist.',
      ],
    },

    goodStartEnd: {
      title: 'A Good Start',
      text: [
        'You play cleanly, beautifully, without a mistake. People clap, Grandma cries, Grandpa whistles through two fingers.',
        'But as you bow, something unborn is still bubbling in your belly – your own song. It isn’t ready. It will be.',
        'This is a good start. Every guitarist started here.',
      ],
    },

    puppetEnd: {
      title: 'Puppet',
      text: [
        'At the concert you play like a god. The hall is on its feet. Only you are watching it all from the side, as if through glass – your hands move, but you aren’t moving them.',
        '“Thank you. I know,” the voice says with your mouth when someone praises you.',
        'Somewhere deep inside, a [boy|girl|child] is waiting to wake up. Maybe some day someone will call [him|her|them] by [his|her|their] name.',
      ],
    },

    silenceEnd: {
      title: 'Silence',
      text: [
        'Your inspiration goes out like a candle in the wind. One evening you put the guitar in its case and push it under the bed.',
        'Weeks pass. Sometimes at night you think the strings are ringing on their own. But you don’t open the case.',
        'They say silence is music too. But not this kind.',
      ],
    },
  },
}
