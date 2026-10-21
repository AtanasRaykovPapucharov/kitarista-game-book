/* Part VI½ – Under the village. After Lovecraft's "The Lurking Fear". */

export default {
  mineCall: {
    title: 'Back to the mountains',
    text: [
      'Two days before the concert the phone rings in the middle of the night. Grandpa. “The Stoykovs’ boy, Mite, is lost. He went into the old mine looking for his dog, before the storm. The men won’t go in. They say…” he hesitates, “they say something in there calls with human voices.”',
      'Dad Vladko starts the car. You are already dressed. “You’re staying,” he says. But then he looks at you the way Grandpa looked at you under the vine, and says nothing more.',
      {
        ifFlag: 'colour_stays',
        text: 'When you reach the village, you see that the lead plate over the well has cracked. Across the grey dust a thin trail leads up the slope – towards the mine.',
      },
      {
        ifFlag: 'voice_sent',
        text: 'When you reach the village, here and there on the dark slopes glimmer pale patches of that nameless colour – like crumbs scattered towards the mine.',
      },
    ],
  },

  mineEntrance: {
    title: 'The mouth of the mine',
    text: [
      'Above the village the slope is riddled with old galleries – dark, square openings propped with rotten beams. Rusty rails come out of them and sink into the brambles. Lead was dug here once. Not any more.',
      'The village men stand with lanterns before the largest mouth, silent. From inside, far away, comes a cry: “Mum! Mum!” Mite’s mother sobs and lunges forward, but two men hold her back.',
      'And then another voice comes out of the dark – her own. “Mite! Mite, come to Mum!” The same voice, the same words. Only she is here, outside, and silent.',
    ],
    choices: {
      miner: 'Ask the old miner, Grandpa Stoyan, what is down there',
      goIn: 'Take Dad’s lantern and go in',
    },
  },

  oldMiner: {
    title: 'Grandpa Stoyan',
    text: [
      'Grandpa Stoyan is the oldest miner in the village. His hands are black with lead that has never quite washed off.',
      '“In sixty-two we dug too deep,” he says quietly, so the others won’t hear. “We broke into a hollow older than the mountain. Something lived there. It doesn’t eat, it doesn’t attack. It only repeats. It learns your voice and then calls your people with it, until they come.”',
      '“We lost two men that way. Then we walled the gallery up. The storm must have brought the wall down.”',
      'He grips your shoulder. “Listen to me. A true voice is warm. The echo is cold, and it’s late – by one heartbeat. And whatever you hear in there, don’t shout your own name. Don’t give it your voice.”',
    ],
  },

  tunnels: {
    title: 'The galleries',
    text: [
      'Inside, the air is cool and heavy and smells of wet stone and metal. The gallery narrows, then branches – once, twice, ten times. Some of the side tunnels are too round, too smooth, like holes not dug by people but gnawed.',
      'The lantern flame shrinks. And then the voices begin.',
      'To the left – a child crying. To the right – Mite, calling his dog. Ahead, perfectly clear, your mother’s voice: “{hero}? {hero}, I’m here. Come.” Your blood freezes. Mum is at home, three hundred kilometres away.',
      'The voices are everywhere. They come out of the stone.',
    ],
    choices: {
      mom: 'Go towards Mum’s voice',
      listen: 'Stop, close your eyes and search for the warm voice',
      glass: 'Take out the star-glass',
      shout: 'Shout: “Mite! It’s me, {hero}!”',
    },
  },

  shoutName: {
    title: 'The name',
    text: [
      'You shout. Your voice echoes through the galleries – once, twice, ten times.',
      'And then, far away, something answers. With your voice. With your words. “Mite! It’s me, {hero}!” Exactly like you. Only one heartbeat late.',
      'Now it knows your voice.',
    ],
  },

  listenTrue: {
    title: 'The warm voice',
    text: [
      'You close your eyes. You let the voices flow through you like water and search for the one that isn’t late. The one that is warm.',
    ],
    success:
      'And you find it. A weak, choked sobbing, very close, in a side gallery. Not an echo. A living child, crying.',
    failure:
      'But every voice sounds equally real, and Mum’s is the clearest of all. Your feet start towards it on their own.',
  },

  starglassWay: {
    title: 'The way',
    text: [
      'You take out the star-glass. In the dark it glows very faintly – and when you turn it towards the voices, it rings softly. Towards Mum’s voice – silence. Towards the crying on the right – silence. Towards a dark, narrow branch from which no sound comes at all – it rings like a little bell.',
      '“It shows the way,” Grandpa said. You go that way.',
    ],
  },

  falseMom: {
    title: 'The echo',
    text: [
      'Mum’s voice leads you deeper and deeper. “Just a little further, {hero}. Just a little further.” And you understand, without knowing how: it is late. By one heartbeat.',
      'The gallery ends in a round hollow full of dust. Your lantern lights only its edge. Beyond, in the dark, something large turns over – you can’t see it, you only hear the stone creak beneath it.',
      'And then it speaks in a thousand voices at once – yours, Mum’s, Grandpa’s, Belyan’s, {friend}’s. Every voice you have ever heard.',
      'If you lose three rounds, you will be lost in the dark.',
    ],
  },

  foundMite: {
    title: 'Mite',
    text: [
      'You find him curled up in a niche, hugging a shaggy dog that is trembling as much as he is. Mite is seven. His eyes are enormous.',
      '“Mum was calling me,” he says. “All night she was calling me. But she never came.”',
      'You lift him up; the dog follows. And as you walk towards the exit, the echo calls after you – with his mother’s voice, with your mother’s, sometimes with yours. You don’t answer. You don’t look back. This time you know what is behind you.',
      'When you come out into the light, the whole village cries out at once. Mite’s mother weeps and won’t let go of him.',
    ],
  },

  lostInDark: {
    title: 'In the dark',
    text: [
      'The lantern goes out. The voices grow closer, gentler, more convincing. Your wandering has no end – down, left, down.',
      'You don’t know how much time passes. Then – light. Real light. Dad, Grandpa Stoyan and three more men with ropes. Mite is already outside – they found him by his dog’s barking.',
      'Dad hugs you so hard it hurts. For the whole day afterwards you feel cold, and voices that aren’t real still sound in your ears.',
    ],
  },

  mineExit: {
    title: 'The walled-up mouth',
    text: [
      'By noon the village men have walled up the gallery with stones and lime – a thick wall, thicker than before. Grandpa Stoyan sets an old miner’s lamp on top and lights it. “Let it shine,” he says. “It doesn’t like light.”',
      {
        ifFlag: 'echo_learned',
        text: 'As you leave, you think you hear, very faintly, someone calling your name from the mountain. In your voice. You don’t look back.',
      },
      {
        ifFlag: 'mite_saved',
        text: 'Mite waves to you from the window until the car turns the corner. The dog barks after you all the way to the end of the village.',
      },
      'You drive back to town in the dark. Tomorrow is the night before the concert.',
    ],
  },
}
