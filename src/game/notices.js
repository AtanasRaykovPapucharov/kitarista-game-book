import { Notify } from 'quasar'
import { soundOn, toggleSound } from 'src/game/sound'

/* Device and sound notices are shown at the top of the window,
   never inside the story text. One at a time. */
let dismissSound = null

export function soundNotice(t) {
  if (soundOn.value || dismissSound) return
  dismissSound = Notify.create({
    position: 'top',
    color: 'dark',
    textColor: 'white',
    icon: 'volume_off',
    message: t('lessons.soundNeeded'),
    timeout: 8000,
    actions: [
      {
        label: t('lessons.turnOnSound'),
        color: 'accent',
        noCaps: true,
        handler: () => {
          if (!soundOn.value) toggleSound()
        },
      },
      { icon: 'close', color: 'white', round: true, 'aria-label': t('common.close') },
    ],
    onDismiss: () => (dismissSound = null),
  })
}
