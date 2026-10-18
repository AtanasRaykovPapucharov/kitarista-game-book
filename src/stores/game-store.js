import { defineStore, acceptHMRUpdate } from 'pinia'
import { watch } from 'vue'
import { KEYS, readJson, writeJson, removeKey } from 'src/services/storage'
import { useAuthStore } from 'src/stores/auth-store'
import * as engine from 'src/game/engine'
import { SECTIONS, sectionNumber } from 'src/story/book'
import { Notify } from 'quasar'
import { i18n } from 'src/boot/i18n'
import { ACHIEVEMENT_BY_ID, newlyEarned } from 'src/game/achievements'
import { cues } from 'src/game/sound'

/* =====================================================
   One save slot per user, plus a profile that remembers
   which endings the user has reached across adventures.
   Every action replaces `save` with the engine's result
   and writes it straight to localStorage, so a reload
   never lets the reader re-roll a die.
===================================================== */

const emptyProfile = () => ({
  endings: {},
  adventures: 0,
  bestSkill: 0,
  songs: [],
  achievements: {},
})
const MAX_SONGS = 30

export const useGameStore = defineStore('game', {
  state: () => ({
    userId: null,
    save: null,
    profile: emptyProfile(),
  }),

  getters: {
    hasSave: (state) => !!state.save,
    isPlaying: (state) => state.save?.status === 'playing',
    section: (state) => (state.save ? SECTIONS[state.save.section] : null),
    sectionNumber: (state) => (state.save ? sectionNumber(state.save.section) : 0),
    choices: (state) => (state.save ? engine.visibleChoices(state.save) : []),
    pendingChallenge: (state) => (state.save ? engine.hasPendingChallenge(state.save) : false),
    canDuelLuck: (state) => (state.save ? engine.canDuelLuck(state.save) : false),
    song: (state) => (state.save ? engine.songOf(state.save) : { title: '', verses: [] }),
    songPending: (state) => (state.save ? engine.pendingVerses(state.save) > 0 : false),
  },

  actions: {
    /** Loads the save and profile of whoever is logged in. */
    bindToUser(userId) {
      this.userId = userId
      if (!userId) {
        this.save = null
        this.profile = emptyProfile()
        return
      }
      const save = readJson(KEYS.save(userId), null)
      this.save = engine.isValidSave(save) ? save : null
      this.profile = { ...emptyProfile(), ...readJson(KEYS.profile(userId), {}) }
      this.checkAchievements({ quiet: true })
    },

    persist() {
      if (!this.userId) return
      if (this.save) writeJson(KEYS.save(this.userId), this.save)
      else removeKey(KEYS.save(this.userId))
      writeJson(KEYS.profile(this.userId), this.profile)
    },

    commit(next) {
      const endedNow = next.status === 'ended' && this.save?.status !== 'ended'
      this.save = next
      if (endedNow) this.recordEnding(next)
      this.checkAchievements()
      this.persist()
    },

    /* ---------- achievements ---------- */

    /** Unlocks whatever the current save and profile have earned. */
    checkAchievements({ quiet = false } = {}) {
      const earned = newlyEarned(this.save, this.profile)
      if (!earned.length) return
      const now = new Date().toISOString()
      this.profile.achievements = { ...this.profile.achievements }
      for (const id of earned) this.profile.achievements[id] = now
      if (quiet) this.persist()
      else this.announce(earned)
    },

    /** For things that happen outside the book (practice room, narrator, avatar). */
    award(id) {
      if (!this.userId || !ACHIEVEMENT_BY_ID[id] || this.profile.achievements?.[id]) return
      this.profile.achievements = { ...this.profile.achievements, [id]: new Date().toISOString() }
      this.persist()
      this.announce([id])
    },

    announce(ids) {
      const t = i18n.global.t
      cues.achievement()
      for (const id of ids.slice(0, 3)) {
        Notify.create({
          position: 'top',
          color: 'dark',
          textColor: 'white',
          icon: ACHIEVEMENT_BY_ID[id].icon,
          iconColor: 'accent',
          message: t('achievements.unlocked'),
          caption: t(`achievements.list.${id}.title`),
          timeout: 4500,
          actions: [
            { label: t('achievements.see'), color: 'accent', noCaps: true, to: '/profile' },
          ],
        })
      }
    },

    recordEnding(save) {
      if (!this.profile.endings[save.endingId]) {
        this.profile.endings[save.endingId] = new Date().toISOString()
      }
      this.profile.bestSkill = Math.max(this.profile.bestSkill, save.stats.skill)
    },

    start(hero) {
      this.profile.adventures += 1
      this.commit(engine.newGame(hero))
    },

    choose(choiceId) {
      this.commit(engine.choose(this.save, choiceId))
    },
    continueOn() {
      this.commit(engine.continueOn(this.save))
    },
    rollTest() {
      this.commit(engine.resolveTest(this.save))
    },
    rollTable() {
      this.commit(engine.resolveRoll(this.save))
    },
    duelRound() {
      this.commit(engine.duelRound(this.save))
    },
    duelLuck() {
      this.commit(engine.duelLuck(this.save))
    },
    finishLesson(result) {
      this.commit(engine.resolveLesson(this.save, result))
    },
    composeVerse(verse) {
      this.commit(engine.composeVerse(this.save, verse))
    },
    /** Names the song and keeps it in the profile ("songs you wrote"). */
    nameSong(title) {
      const next = engine.nameSong(this.save, title)
      if (next === this.save) return
      const song = engine.songOf(next)
      const id = next.startedAt // one song per adventure
      const entry = {
        id,
        title: song.title,
        verses: song.verses,
        endingId: next.endingId,
        at: new Date().toISOString(),
      }
      const songs = (this.profile.songs ?? []).filter((x) => x.id !== id)
      this.profile.songs = [entry, ...songs].slice(0, MAX_SONGS)
      this.commit(next)
    },
    removeSong(id) {
      this.profile.songs = (this.profile.songs ?? []).filter((x) => x.id !== id)
      this.persist()
    },
    useItem(id) {
      this.commit(engine.useItem(this.save, id))
    },
    canUseItem(id) {
      return this.save ? engine.canUseItem(this.save, id) : false
    },

    /** Everything worth keeping, as plain data for a backup file (no password). */
    exportData(user) {
      return {
        app: 'kitarista',
        version: 1,
        exportedAt: new Date().toISOString(),
        user: user
          ? {
              username: user.username,
              displayName: user.displayName,
              gender: user.gender,
              genderName: user.genderName,
              address: user.address,
              avatar: user.avatar,
            }
          : null,
        save: this.save,
        profile: this.profile,
      }
    },

    /**
     * Restores a backup into the logged-in profile. Endings and songs are
     * added to what is already here; a saved adventure replaces the current one.
     * Returns false when the file isn't a Kitarista backup.
     */
    importData(data) {
      if (!data || data.app !== 'kitarista' || data.version !== 1) return false
      const incoming = data.profile ?? {}
      const songs = [...(incoming.songs ?? []), ...(this.profile.songs ?? [])]
      this.profile = {
        ...this.profile,
        endings: { ...(incoming.endings ?? {}), ...this.profile.endings },
        adventures: Math.max(this.profile.adventures ?? 0, incoming.adventures ?? 0),
        bestSkill: Math.max(this.profile.bestSkill ?? 0, incoming.bestSkill ?? 0),
        songs: songs
          .filter((s, i) => s?.id && songs.findIndex((x) => x.id === s.id) === i)
          .slice(0, MAX_SONGS),
      }
      this.profile.achievements = { ...(incoming.achievements ?? {}), ...this.profile.achievements }
      if (engine.isValidSave(data.save)) this.save = data.save
      this.checkAchievements({ quiet: true })
      this.persist()
      return true
    },

    abandon() {
      this.save = null
      this.persist()
    },
  },
})

/** Keeps the game store pointed at the logged-in user. Call once at startup. */
export function syncGameWithAuth(pinia) {
  const auth = useAuthStore(pinia)
  const game = useGameStore(pinia)
  watch(
    () => auth.userId,
    (id) => game.bindToUser(id),
    { immediate: true },
  )
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot))
}
