/* =====================================================
   Items the reader can carry. Names and descriptions are
   in the story content files (content.items[id]).

   attack – added to the reader's attack in every duel
   use    – the reader can use it from the adventure sheet
            (never in the middle of a duel)
       effects – what it does
       consume – remove one after use
       once    – a flag set after the first use; blocks reuse
===================================================== */

export const ITEMS = {
  guitar: { icon: 'fa fa-guitar' },
  pancakes: {
    icon: 'bakery_dining',
    use: { effects: [{ stat: 'inspiration', add: 4 }], consume: true },
  },
  pick: { icon: 'change_history', attack: 1 },
  songbook: { icon: 'menu_book' },
  strings: { icon: 'linear_scale' },
  feather: { icon: 'flutter_dash' },
  metronome: { icon: 'timer', attack: 1 },
  // a shard from the fallen star; it rings like a bell when the dark is near
  starglass: { icon: 'diamond', attack: 1 },
  // the old man's notes: play from them to get back on your feet
  zannsheets: {
    icon: 'library_music',
    use: { effects: [{ stat: 'inspiration', add: 4 }], consume: true },
  },
  // a sea snail shell from the misty shore: hold it to your ear and the sea gives back a little warmth
  seashell: {
    icon: 'waves',
    use: { effects: [{ stat: 'inspiration', add: 3 }], consume: true },
  },
  recipe: {
    icon: 'receipt_long',
    use: { effects: [{ stat: 'luck', restore: true }], once: 'recipe_used' },
  },
}
