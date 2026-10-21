/* Part III½ – The Thracian well.
   After Lovecraft's "The Colour Out of Space": a star falls by an
   ancient well in Grandpa's village under Rozhen. */

export default {
  villageTrip: {
    title: 'Into the Rhodopes',
    text: [
      'On Friday evening Grandpa phones. His voice is quiet and somehow strange. “Vladko, come tomorrow. Bring the child. Something fell from the sky by the old well. And… it isn’t good.”',
      'In the morning you drive south. The plain falls behind you and the road begins to wind upward between mountains so thick with pines that even at noon it is half dark beneath them. The trees grow at strange angles on the steep slopes, as if leaning down to hear something coming from the earth.',
      'High above, on a ridge, the white dome of the Rozhen Observatory flashes for a moment. The voice inside you stirs, like a sleeper who has heard their name.',
    ],
  },

  village: {
    title: 'The village under Rozhen',
    text: [
      'The village is half empty. The stone houses huddle together on the slope, their eaves pulled down like caps over their eyes, and many windows have long been boarded up. The silence here is the kind you can hear – thick, attentive, without a single dog, without a single bird.',
      'Grandpa meets you at the gate. He looks older than last time. “Three nights ago,” he says, “the sky over the Thracian well lit up like day. There was a crash, then a hiss, like water on embers. In the morning there was a stone by the well the size of an oven. Hot. And soft – like wax.”',
      '“And now the stone is shrinking,” he adds more quietly. “And the grass around it is growing.”',
    ],
    choices: {
      grandpa: '“Grandpa, tell me about the well.”',
      observatory: 'Climb up to the observatory and look for the professor',
      well: 'Go straight to the well',
    },
  },

  keepers: {
    title: 'The keepers',
    text: [
      'Grandpa sits on the bench under the vine and looks for a long time towards the edge of the village, where the forest begins.',
      '“The well is older than the village. Older than the church, older than the Roman roads. The Thracians dug it. They say they didn’t dig it for water.”',
      '“My grandmother used to say our family were its keepers. Every year, on the longest night, they went to it and sang to the stars – not a prayer, but a song that ‘shows the way’. To whom, and where, she didn’t know. The song is lost. Only the saying is left: ‘What falls from the sky goes back to the sky – if someone sings it the way.’”',
      'He looks at you with peculiar attention. “You hear more than others, don’t you? So did your mother. So did your grandmother. That’s how it is in our family.”',
    ],
  },

  observatory: {
    title: 'The observatory',
    text: [
      'The path to Rozhen is steep and runs through a pine forest where sounds die strangely fast, as if the trees were swallowing them. The dome appears suddenly – white, round and silent against the sky.',
      'The guest professor is there. He isn’t surprised to see you – or not as surprised as he should be. “You,” he says. “Of course it would be you.”',
      'He shows you a printout: a band of colours – the spectrum of the light from the fallen star. In the middle of it is a line of a colour that resembles nothing. “Not red, not blue, nothing in between,” he says quietly. “A colour with no place in our rainbow. It isn’t from this universe, child. Or not entirely.”',
      'And then, for the first time, you feel something you didn’t expect: the voice inside you is afraid. “That isn’t me,” it whispers. “I listen. That thing only drinks.”',
    ],
  },

  well: {
    title: 'The Thracian well',
    text: [
      'The well stands in a meadow at the edge of the forest – a round wall of old, lichen-covered stones, with a stone arch above it bearing worn carvings. The fallen stone lies beside it, no bigger than a barrel now, dark and faintly glistening, like something wet that never dries.',
      'Around the well the grass has grown waist-high. The wild pear trees are laden with fruit, huge and glossy. The colours of the meadow are bright – but there is something unhealthy in their brightness, a deviation from every colour you know, as if the light itself fell here at a slightly wrong angle.',
      'And in the middle, right around the wall, the ground is covered in fine grey dust. Nothing grows there. The wind doesn’t lift it. And the birds, you notice, don’t fly over the meadow – they go around it.',
    ],
    choices: {
      carvings: 'Study the carvings on the arch',
      fruit: 'Taste one of the huge pears',
      look: 'Look down into the well',
      leave: 'Go back to Grandpa’s before dark',
    },
  },

  carvings: {
    title: 'The carvings',
    text: [
      'You rub the lichen away with your sleeve. Beneath it, figures carved more than two thousand years ago emerge: a man with a lyre standing by a well, and above him a star with a long tail, rising upward, back into the sky.',
      'Along the edge of the arch runs a line of notches – short and long, high and low, arranged in groups of five. Your fingers trace them on their own, the way they follow a fretboard. These are not decorations. These are notes.',
      'The keepers’ song. Written in stone so that no one would forget it. And almost forgotten all the same.',
    ],
  },

  fruit: {
    title: 'Fruit from the sky',
    text: [
      'You pick one of the pears. It is heavy, cold and perfectly smooth. You take a bite.',
      'At first it’s sweet – sweeter than anything you have ever tasted. Then a bitterness spreads through your mouth like ash, like rust, like the taste of something that was never alive. You spit it out, but the bitterness stays, and with it a strange tiredness, as if something had sipped at your strength.',
      '“Never eat what grows from a fallen star,” says the voice inside you. It sounds serious. Almost worried.',
    ],
  },

  lookIn: {
    title: 'In the water',
    text: [
      'You lean over the wall. A chill breathes up from below, and the smell of wet stone, and something else – sharp, unknown, like the air after lightning.',
      'The water is far below, black and still. But as your eyes adjust, you see it isn’t quite black. Beneath the surface something is slowly moving – not a fish, not a reflection, but a colour. A colour that writhes as if alive and has no name.',
    ],
    success:
      'The colour rises towards you – and stops, as if it had sensed something in you, older and larger than itself. The voice. The colour shudders and shrinks back into the depths. You step away with a pounding heart, but now you know what is down there.',
    failure:
      'The colour rises and you feel something pulling – not at your body, but at the warmth in it, the joy, the wish to play. You leap back and fall into the grey dust. Your hands shake and stay cold for a long time.',
  },

  nightStorm: {
    title: 'Storm over the mountain',
    text: [
      'Towards evening, clouds black as tar loom from the west. The storm hits the village so hard the windows ring. Lightning strikes – again and again – always in the same place: by the well, as if the stone were drawing it.',
      'The power goes out. In the flashes you see the meadow through the window: the trees at the edge of the forest sway and writhe, though between two thunderclaps the wind dies away entirely. Their branches reach towards the well like fingers.',
      'And above the wall, faint but clear, trembles a pillar of pale light in that nameless colour. Grandpa’s dog howls under the bed. Grandpa lights a candle and says nothing.',
    ],
    choices: {
      stay: 'Stay by the stove with Grandpa',
      ask: 'Ask the voice what that thing is',
      out: 'Go out into the storm, to the well',
    },
  },

  byStove: {
    title: 'Grandpa’s songs',
    text: [
      'You sit by the stove. Grandpa quietly begins an old Rhodope song – drawn out, with high, winding notes that sound like an echo in a deep gorge. Then another. You pick up the tune on your guitar.',
      'The storm rages, but the room is warm. There is something in the songs that keeps the night outside – like a thick wall built by many generations.',
      'Towards midnight the storm dies down. You fall asleep on the bench. But when you step into the yard in the morning, you see that the grey circle around the well has grown.',
    ],
  },

  listenerFear: {
    title: 'What is it?',
    text: [
      '“What is that thing?” you ask silently.',
      'The voice answers slowly, as if searching for words in a language not made for such things. “A colour. A small, hungry thing from the gulfs between the galaxies. It travelled inside the star like a seed. It doesn’t listen, {hero}. It doesn’t sing. It only drinks – light, warmth, life. It will drink the meadow, then the village, then it will grow big enough to go back up. And leave nothing behind but grey dust.”',
      '“Or it could leave now,” it adds quietly, “if someone showed it the way.”',
      'For a moment it is silent. Then it says something it has never said before: “I was lost once too. Not you. Me.”',
    ],
    choices: {
      together: '“Help me send it home. No price.”',
      alone: '“I’ll manage without you.”',
    },
  },

  pact: {
    title: 'No price',
    text: ['The voice is silent for a long time. The storm beats on the windows. You wait.'],
    success:
      '“Very well,” it says at last. “No price. Just this once.” And in its voice there is something you have never heard before: something like relief. As if it had long been waiting for someone to ask it, instead of listening to it.',
    failure:
      '“Nothing is without a price,” the voice replies. “I will help you. And you will owe me.” A chill creeps down your back. You know that one day it will ask for its debt.',
  },

  stormDuel: {
    title: 'In the storm',
    text: [
      'You run out into the storm before Grandpa can stop you. The rain is icy, the lightning floods the meadow with white. Above the well a mist rises – not grey, but that nameless colour – and reaches towards you like a hand.',
      'You have no weapon. You have only yourself – and the music in you. You stand up to the colour.',
      'If you lose three rounds, it will drink from you.',
    ],
  },

  colourWeak: {
    title: 'Retreat',
    text: [
      'The mist tears apart as if it had struck a wall. The colour shrinks, shudders and drains back into the well like water down a gutter.',
      'You stand in the middle of the meadow, soaked to the bone, your heart thudding in your ears. Something in you has become firmer – like a string pulled up to exactly the right note.',
    ],
  },

  colourDrinks: {
    title: 'Drunk from',
    text: [
      'The mist wraps around you. It doesn’t hurt. Everything just suddenly grows more distant and greyer – the rain, the lightning, your own thoughts. As if someone had sucked the colour out of the world.',
      'Grandpa finds you sprawled in the wet grass and carries you inside. By morning your fingers are cold as stone.',
    ],
  },

  dawnWell: {
    title: 'Dawn',
    text: [
      'At daybreak an old Lada loaded with equipment comes up the dirt road to the village. The guest professor. His eyes are red, as if he hasn’t slept for a week.',
      'The three of you – you, Grandpa and the professor – go to the well. The stone has vanished completely. In its place gapes a pit with smooth, almost melted edges. The grey circle has swallowed several more metres of grass, and above the water in the well, even in daylight, a faint pillar of that colour trembles.',
      '“If it stays, it will grow,” says the professor. “If it leaves, it will go back where it came from.” He looks at the carved arch, then at you. “People once knew how. I don’t.”',
      'Grandpa says nothing. The guitar is in your hands.',
    ],
    choices: {
      keepers: 'Play the keepers’ song from the carvings',
      own: 'Play your own song',
      improvise: 'Improvise – search for the note the colour will follow',
      voice: 'Let the voice play instead of you',
    },
  },

  improviseWell: {
    title: 'Improvisation',
    text: [
      'You close your eyes and search for the sound that points upward – note after note, like steps on a staircase you can’t see.',
    ],
    success:
      'And you find it. Somewhere between two notes there is a third that sounds like a road. The colour above the well quivers and turns towards it.',
    failure:
      'The notes scatter. The colour above the water sways as if hesitating, then slowly sinks back into the deep.',
  },

  sendHome: {
    title: 'Sent home',
    text: [
      'You begin to play. The sound spreads over the meadow and the pillar of colour above the well quivers – once, twice – and begins to rise. Slowly, then faster and faster, like smoke that has found the chimney.',
      'The colour passes you, and for a moment you feel something you don’t expect: not hunger, but something like relief. Like a lost animal that has finally glimpsed the way home.',
      'It rises above the pines, above the ridge, above the white dome of Rozhen, and vanishes through a round, astonishingly regular hole in the clouds. The professor stares upward, mouth open. “Cygnus,” he whispers. “It’s going towards the Swan.”',
      'Grandpa weeps without shame. The grey circle remains – dead and dusty. But at its very edge, you notice, a single green blade of grass has sprouted.',
      'The voice inside you is silent for a long time. Then it says, very quietly: “It went home. And I… I have no home.”',
    ],
  },

  colourStays: {
    title: 'Sealed',
    text: [
      'The colour sinks and does not return. All day the professor and Grandpa haul stones and cover the well with a heavy lead plate from the observatory. Grandpa cuts a long pole from the acacia and drives it in beside the wall – a sign, so people will know.',
      '“It will sleep,” says the professor. “Let’s hope it sleeps a long time.”',
      'Nobody looks at ease. When you leave, Grandpa looks back at the meadow the way you look at a wound that won’t heal soon.',
    ],
  },

  voiceSends: {
    title: 'The stranger’s song',
    text: [
      'You relax and let it in. Your fingers play a melody no human ever invented – notes sharp as ice, intervals that set your teeth on edge. The pines around groan. The dogs in the village howl as one.',
      'The colour doesn’t rise. It flees – tearing into pieces and scattering into the mist in every direction, like a flock of frightened birds.',
      'When it’s over, the meadow is silent. The professor looks at you the way you look at something dangerous. Grandpa says nothing all the way home.',
      '“You see?” the voice whispers, pleased. “With me, you are strong.”',
    ],
  },

  returnHome: {
    title: 'Back',
    text: [
      'On Sunday afternoon you drive back to town. The mountains fall behind you, bluish and quiet, as if nothing had happened.',
      {
        ifFlag: 'colour_home',
        text: 'Before you leave, Grandpa gives you a piece of the fallen star – thin, clear glass that rings like a small bell when you touch it. “Keep it safe. It shows the way.”',
      },
      {
        ifFlag: 'colour_stays',
        text: 'You think of the lead plate over the well, and of what sleeps beneath it. One day you will have to go back.',
      },
      {
        ifFlag: 'voice_sent',
        text: 'All the way the voice hums something to itself – softly, contentedly, like a cat that has eaten a bird.',
      },
      'That evening, at home, you look at the stars for a long time. Somewhere out there, towards the Swan, a nameless colour is going home. Or isn’t. The stars don’t say.',
    ],
  },
}
