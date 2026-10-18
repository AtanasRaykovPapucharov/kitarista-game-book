/* =====================================================
   Guitar achievements.
   Each one either has a `rule(save, profile)` checked after
   every step in the book, or is an `event` awarded directly
   by the practice room, the narrator or the avatar builder.
   Titles and descriptions live in i18n: achievements.<id>.
   `secret` ones hide their description until unlocked.
===================================================== */

const flag = (save, name) => !!save?.flags?.[name]
const verses = (save) => save?.song?.verses?.length ?? 0

export const ACHIEVEMENT_GROUPS = ['path', 'song', 'story', 'practice']

export const ACHIEVEMENTS = [
  // ---------- the guitarist's path ----------
  {
    id: 'first_strum',
    group: 'path',
    icon: 'music_note',
    rule: (s) => s?.trail?.includes('firstStrum'),
  },
  { id: 'own_ear', group: 'path', icon: 'hearing', rule: (s) => flag(s, 'own_ear') },
  {
    id: 'all_lessons',
    group: 'path',
    icon: 'school',
    rule: (s) =>
      ['lesson_chords', 'lesson_tuning', 'lesson_intervals', 'lesson_rhythm'].every((f) =>
        flag(s, f),
      ),
  },
  { id: 'duel_won', group: 'path', icon: 'bolt', rule: (s) => flag(s, 'beat_kristian') },
  { id: 'open_stage', group: 'path', icon: 'mic_external_on', rule: (s) => flag(s, 'played_own') },
  {
    id: 'rhythm_section',
    group: 'path',
    icon: 'graphic_eq',
    rule: (s) => flag(s, 'belyan_friend'),
  },
  { id: 'duet', group: 'path', icon: 'groups', rule: (s) => flag(s, 'played_duet') },

  // ---------- your song ----------
  { id: 'first_verse', group: 'song', icon: 'edit_note', rule: (s) => verses(s) >= 1 },
  { id: 'three_verses', group: 'song', icon: 'library_music', rule: (s) => verses(s) >= 3 },
  {
    id: 'song_named',
    group: 'song',
    icon: 'bookmark_added',
    rule: (s, p) => (p?.songs?.length ?? 0) >= 1,
  },

  // ---------- the story ----------
  { id: 'witness', group: 'story', icon: 'flutter_dash', rule: (s) => flag(s, 'witness') },
  { id: 'no_look_back', group: 'story', icon: 'wb_twilight', rule: (s) => flag(s, 'chose_light') },
  {
    id: 'dark_talk',
    group: 'story',
    icon: 'forum',
    secret: true,
    rule: (s) => flag(s, 'dark_understood'),
  },
  {
    id: 'clean_strings',
    group: 'story',
    icon: 'auto_awesome',
    rule: (s) =>
      s?.status === 'ended' && s.endingId !== 'silence' && (s.stats?.darkness ?? 1) === 0,
  },
  { id: 'ending_guitarist', group: 'story', icon: 'star', rule: (s, p) => !!p?.endings?.guitarist },
  {
    id: 'ending_light',
    group: 'story',
    icon: 'flare',
    secret: true,
    rule: (s, p) => !!p?.endings?.light,
  },
  {
    id: 'ending_puppet',
    group: 'story',
    icon: 'theater_comedy',
    secret: true,
    rule: (s, p) => !!p?.endings?.puppet,
  },
  {
    id: 'all_endings',
    group: 'story',
    icon: 'workspace_premium',
    rule: (s, p) => Object.keys(p?.endings ?? {}).length >= 5,
  },

  // ---------- the practice room and the app ----------
  { id: 'tone_chord', group: 'practice', icon: 'piano', event: true },
  { id: 'tone_mode', group: 'practice', icon: 'blur_circular', event: true },
  { id: 'tuner', group: 'practice', icon: 'tune', event: true },
  { id: 'listener', group: 'practice', icon: 'record_voice_over', event: true },
  { id: 'new_face', group: 'practice', icon: 'face', event: true },
]

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]))

/** Ids of rule-based achievements the save and profile now earn but don't have yet. */
export function newlyEarned(save, profile) {
  const have = profile?.achievements ?? {}
  return ACHIEVEMENTS.filter((a) => a.rule && !have[a.id] && a.rule(save, profile)).map((a) => a.id)
}
