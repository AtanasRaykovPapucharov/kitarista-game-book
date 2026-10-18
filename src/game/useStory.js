import { computed } from 'vue'
import { useSettingsStore } from 'src/stores/settings-store'
import { useAuthStore } from 'src/stores/auth-store'
import { storyContent } from 'src/story/content'

/* =====================================================
   Story text for the current language, with the small
   amount of logic paragraphs need:
     [masculine|feminine|neutral] → the form of address the reader chose
     {counter} placeholders → values from the save
     { ifFlag | ifNotFlag | ifItem, text } → shown when true
===================================================== */

const GENDER_FORM = /\[([^[\]|]*(?:\|[^[\]|]*)+)\]/g
const FORM_INDEX = { m: 0, f: 1, n: 2 }

/** Picks one form from "[m|f|n]"; a missing form falls back to the first. */
export function applyGender(text, form) {
  const i = FORM_INDEX[form] ?? 0
  return text.replace(GENDER_FORM, (m, body) => {
    const forms = body.split('|')
    return forms[i] ?? forms[0]
  })
}

function interpolate(text, save) {
  return text.replace(/\{(\w+)\}/g, (m, key) => String(save?.counters?.[key] ?? m))
}

function paragraphVisible(p, save) {
  if (typeof p === 'string') return true
  if (p.ifFlag) return !!save?.flags?.[p.ifFlag]
  if (p.ifNotFlag) return !save?.flags?.[p.ifNotFlag]
  if (p.ifItem) return (save?.items?.[p.ifItem] ?? 0) > 0
  return true
}

export function useStory() {
  // the settings store owns the app language (vue-i18n runs in legacy mode)
  const settings = useSettingsStore()
  const auth = useAuthStore()
  const content = computed(() => storyContent(settings.locale))
  const gender = computed(() => auth.grammar)

  const fmt = (text, save) => interpolate(applyGender(text ?? '', gender.value), save)
  const sectionText = (key) => content.value.sections[key] ?? {}

  return {
    content,
    gender,
    fmt,
    sectionText,
    bookTitle: () => content.value.title,
    byline: () => content.value.byline,
    pitch: () => fmt(content.value.pitch),
    title: (key, save) => fmt(sectionText(key).title, save),
    paragraphs: (key, save) =>
      (sectionText(key).text ?? [])
        .filter((p) => paragraphVisible(p, save))
        .map((p) => fmt(typeof p === 'string' ? p : p.text, save)),
    choiceText: (key, id) => fmt(sectionText(key).choices?.[id] ?? id),
    outcomeText: (key, id) => fmt(sectionText(key).outcomes?.[id]),
    testText: (key, success) => fmt(sectionText(key)[success ? 'success' : 'failure']),
    itemName: (id) => fmt(content.value.items[id]?.name ?? id),
    itemDesc: (id) => fmt(content.value.items[id]?.desc),
    enemyName: (id) => content.value.enemies[id] ?? id,
    illustrationAlt: (name) => content.value.illustrations?.[name] ?? '',
    moodName: (mood) => content.value.song?.moods?.[mood]?.name ?? mood,
    moodHint: (mood) => content.value.song?.moods?.[mood]?.hint ?? '',
    lyric: (mood, line) => fmt(content.value.song?.lines?.[mood]?.[line] ?? ''),
    ending: (id) => {
      const e = content.value.endings[id] ?? { title: id, summary: '' }
      return { title: fmt(e.title), summary: fmt(e.summary) }
    },
  }
}
