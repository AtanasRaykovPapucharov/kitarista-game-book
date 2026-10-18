import bg from './bg'
import en from './en'

const BY_LOCALE = { bg, 'en-US': en }

export function storyContent(locale) {
  return BY_LOCALE[locale] ?? (locale?.startsWith('bg') ? bg : en)
}
