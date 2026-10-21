import { computed } from 'vue'
import { useSettingsStore } from 'src/stores/settings-store'
import { useAuthStore } from 'src/stores/auth-store'
import { castFor } from 'src/story/cast'

/** The names for UI texts: t('…', names.value) fills {hero} and {friend}. */
export function useCast() {
  const settings = useSettingsStore()
  const auth = useAuthStore()
  return computed(() => {
    const c = castFor(settings.locale, auth.grammar)
    return { hero: c.hero, friend: c.friend }
  })
}
