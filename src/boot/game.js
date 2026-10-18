import { defineBoot } from '#q-app'
import { syncGameWithAuth } from 'src/stores/game-store'

// Load the logged-in user's save before any page renders.
export default defineBoot(({ store }) => {
  syncGameWithAuth(store)
})
