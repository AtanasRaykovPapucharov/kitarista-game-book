/* =====================================================
   Game-book engine. Pure functions over a plain save
   object, so the store only has to persist the result.

   Rules (after the classic Fighting Fantasy books):
   - Skill       1d6 + 6   tests: roll 2d6, success if total ≤ Skill
   - Inspiration 2d6 + 12  your stamina; at 0 the guitar goes silent
   - Luck        1d6 + 6   tests: 2d6 ≤ Luck, then Luck drops by 1
   - Darkness    starts at 0; how much of you belongs to the voice
   A stat never rises above its starting value unless the book
   says it "rises" (raise effect), which lifts the ceiling too.
===================================================== */

import { SECTIONS, START, SILENCE, DARKNESS_MAX, ENDINGS } from 'src/story/book'
import { ITEMS } from 'src/story/items'

export const SAVE_VERSION = 1

// Saves are plain JSON. A JSON round-trip also works on Pinia's reactive
// proxies, which structuredClone refuses to copy.
const clone = (obj) => JSON.parse(JSON.stringify(obj))

/* ---------- dice ---------- */
export function rollD6() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1)
    // rejection sampling keeps every face equally likely
    const limit = Math.floor(0xffffffff / 6) * 6
    do crypto.getRandomValues(buf)
    while (buf[0] >= limit)
    return (buf[0] % 6) + 1
  }
  return Math.floor(Math.random() * 6) + 1
}

export const rollDice = (n) => Array.from({ length: n }, rollD6)
export const sum = (arr) => arr.reduce((a, b) => a + b, 0)

/* ---------- hero creation ---------- */
export function rollHero() {
  const skill = rollDice(1)
  const inspiration = rollDice(2)
  const luck = rollDice(1)
  return {
    dice: { skill, inspiration, luck },
    stats: {
      skill: sum(skill) + 6,
      inspiration: sum(inspiration) + 12,
      luck: sum(luck) + 6,
    },
  }
}

export function newGame(hero) {
  const now = new Date().toISOString()
  const state = {
    version: SAVE_VERSION,
    status: 'playing',
    stats: { ...hero.stats, darkness: 0 },
    initial: { ...hero.stats },
    items: {},
    flags: {},
    counters: {},
    section: null,
    visit: 0,
    resolved: null,
    duel: null,
    trail: [],
    endingId: null,
    startedAt: now,
    updatedAt: now,
  }
  return enterSection(state, START)
}

/* ---------- conditions ---------- */
export function meets(state, req) {
  if (!req) return true
  const has = (id) => (state.items[id] ?? 0) > 0
  if (req.item && !has(req.item)) return false
  if (req.notItem && has(req.notItem)) return false
  if (req.flag && !state.flags[req.flag]) return false
  if (req.notFlag && state.flags[req.notFlag]) return false
  if (req.anyFlag && !req.anyFlag.some((f) => state.flags[f])) return false
  for (const [k, v] of Object.entries(req.statMin ?? {})) if (state.stats[k] < v) return false
  for (const [k, v] of Object.entries(req.statMax ?? {})) if (state.stats[k] > v) return false
  for (const [k, v] of Object.entries(req.counterMin ?? {}))
    if ((state.counters[k] ?? 0) < v) return false
  for (const [k, v] of Object.entries(req.counterMax ?? {}))
    if ((state.counters[k] ?? 0) > v) return false
  return true
}

/* ---------- effects ---------- */
export function statCap(state, stat) {
  return stat === 'darkness' ? DARKNESS_MAX : state.initial[stat]
}

function clampStat(state, stat) {
  const cap = statCap(state, stat)
  state.stats[stat] = Math.max(0, Math.min(cap, state.stats[stat]))
}

/** Applies effects in place and returns a list of what changed, for the UI. */
export function applyEffects(state, effects = []) {
  const changes = []
  for (const e of effects) {
    if (e.stat) {
      const before = state.stats[e.stat]
      if (e.raise) {
        state.initial[e.stat] += e.raise
        state.stats[e.stat] += e.raise
      } else if (e.restore) {
        state.stats[e.stat] = state.initial[e.stat]
      } else if (e.add) {
        state.stats[e.stat] += e.add
      }
      clampStat(state, e.stat)
      const delta = state.stats[e.stat] - before
      if (delta || e.raise) changes.push({ kind: 'stat', id: e.stat, delta, raised: !!e.raise })
    } else if (e.item) {
      const before = state.items[e.item] ?? 0
      if (e.remove) delete state.items[e.item]
      else state.items[e.item] = before + (e.add ?? 1)
      const after = state.items[e.item] ?? 0
      if (after !== before) changes.push({ kind: 'item', id: e.item, delta: after - before })
    } else if (e.flag) {
      state.flags[e.flag] = true
    } else if (e.counter) {
      const before = state.counters[e.counter] ?? 0
      state.counters[e.counter] = e.set ?? before + (e.add ?? 1)
      if (e.counter === 'song' && state.counters.song > before)
        changes.push({ kind: 'song', delta: state.counters.song - before })
    }
  }
  return changes
}

const outOfInspiration = (state) => state.stats.inspiration <= 0

/* ---------- moving through the book ---------- */
export function enterSection(state, key, viaEffects = []) {
  const s = clone(state)
  const changes = applyEffects(s, viaEffects)

  // a choice's own effects can already empty the reader
  const target = outOfInspiration(s) && !SECTIONS[key]?.ending ? SILENCE : key
  const section = SECTIONS[target]

  s.section = target
  s.visit += 1
  s.resolved = null
  s.duel = null
  s.trail = [...s.trail, target].slice(-60)
  s.lastChanges = [...changes, ...applyEffects(s, section.effects)]

  if (outOfInspiration(s) && !section.ending) return enterSection(s, SILENCE)

  if (section.ending) {
    s.status = 'ended'
    s.endingId = section.ending
  }
  if (section.duel) s.duel = startDuel(s, section.duel)

  s.updatedAt = new Date().toISOString()
  return s
}

export function choose(state, choiceId) {
  const section = SECTIONS[state.section]
  const choice = section.choices?.find((c) => c.id === choiceId)
  if (!choice || !meets(state, choice.requires)) return state
  if (hasPendingChallenge(state)) return state
  return enterSection(state, choice.to, choice.effects)
}

export function continueOn(state) {
  const section = SECTIONS[state.section]
  if (state.resolved?.to) return enterSection(state, state.resolved.to)
  if (section.next && !hasPendingChallenge(state)) return enterSection(state, section.next)
  return state
}

export function hasPendingChallenge(state) {
  const section = SECTIONS[state.section]
  return !!(section.test || section.roll || section.duel) && !state.resolved
}

export function visibleChoices(state) {
  const section = SECTIONS[state.section]
  if (!section.choices || hasPendingChallenge(state)) return []
  return section.choices.filter((c) => meets(state, c.requires))
}

/* ---------- tests (2d6 against a stat) ---------- */
export function resolveTest(state) {
  const section = SECTIONS[state.section]
  if (!section.test || state.resolved) return state
  const s = clone(state)
  const { stat } = section.test
  const dice = rollDice(2)
  const total = sum(dice)
  const target = s.stats[stat]
  const success = total <= target
  if (stat === 'luck') {
    s.stats.luck = Math.max(0, s.stats.luck - 1)
  }
  const outcome = success ? section.test.success : section.test.failure
  const changes = applyEffects(s, outcome.effects)
  if (stat === 'luck') changes.unshift({ kind: 'stat', id: 'luck', delta: -1 })
  s.resolved = {
    kind: 'test',
    stat,
    dice,
    total,
    target,
    success,
    to: outOfInspiration(s) ? SILENCE : outcome.to,
  }
  s.lastChanges = changes
  s.updatedAt = new Date().toISOString()
  return s
}

/* ---------- dice tables ---------- */
export function resolveRoll(state) {
  const section = SECTIONS[state.section]
  if (!section.roll || state.resolved) return state
  const s = clone(state)
  const dice = rollDice(section.roll.dice)
  const total = sum(dice)
  const outcome = section.roll.outcomes.find((o) => total >= o.range[0] && total <= o.range[1])
  s.lastChanges = applyEffects(s, outcome.effects)
  s.resolved = {
    kind: 'roll',
    dice,
    total,
    outcomeId: outcome.id,
    to: outOfInspiration(s) ? SILENCE : outcome.to,
  }
  s.updatedAt = new Date().toISOString()
  return s
}

/* ---------- duels ----------
   Each round both sides roll 2d6 and add their Skill.
   Higher total wins the round: the loser loses 2 points
   (the opponent's Nerve, or the reader's Inspiration).
   After a decided round the reader may test Luck once:
     won  + lucky → 2 more damage,   won  + unlucky → 1 back
     lost + lucky → 1 Inspiration back, lost + unlucky → 1 more lost
   The reader wins at 0 Nerve and loses after `yieldAfter` lost rounds.
-------------------------------- */
function modsTotal(state, mods = []) {
  let total = 0
  for (const m of mods) {
    if (m.stat) total += state.stats[m.stat] ?? 0
    else if (m.flag && state.flags[m.flag]) total += m.add
    else if (m.item && (state.items[m.item] ?? 0) > 0) total += m.add
  }
  return total
}

export function playerAttackBonus(state, def) {
  let bonus = modsTotal(state, def.playerMods)
  for (const [id, n] of Object.entries(state.items)) if (n > 0 && ITEMS[id]?.attack) bonus += ITEMS[id].attack
  return bonus
}

function startDuel(state, def) {
  return {
    enemy: def.enemy,
    enemySkill: Math.max(1, def.skill + modsTotal(state, def.enemyMods)),
    enemyStamina: def.stamina,
    enemyStaminaMax: def.stamina,
    playerBonus: playerAttackBonus(state, def),
    yieldAfter: def.yieldAfter,
    lost: 0,
    won: 0,
    rounds: [],
  }
}

function finishDuelIfOver(s, def) {
  const d = s.duel
  if (d.enemyStamina <= 0) s.resolved = { kind: 'duel', won: true, to: def.win }
  else if (outOfInspiration(s)) s.resolved = { kind: 'duel', won: false, to: SILENCE }
  else if (d.lost >= d.yieldAfter) s.resolved = { kind: 'duel', won: false, to: def.lose }
}

export function duelRound(state) {
  const def = SECTIONS[state.section].duel
  if (!def || state.resolved || !state.duel) return state
  const s = clone(state)
  const d = s.duel
  const playerDice = rollDice(2)
  const enemyDice = rollDice(2)
  const playerTotal = sum(playerDice) + s.stats.skill + d.playerBonus
  const enemyTotal = sum(enemyDice) + d.enemySkill
  let result = 'tie'
  if (playerTotal > enemyTotal) {
    result = 'win'
    d.won += 1
    d.enemyStamina = Math.max(0, d.enemyStamina - 2)
  } else if (enemyTotal > playerTotal) {
    result = 'lose'
    d.lost += 1
    s.stats.inspiration = Math.max(0, s.stats.inspiration - 2)
  }
  d.rounds.push({ playerDice, enemyDice, playerTotal, enemyTotal, result, luck: null })
  s.lastChanges = result === 'lose' ? [{ kind: 'stat', id: 'inspiration', delta: -2 }] : []
  finishDuelIfOver(s, def)
  s.updatedAt = new Date().toISOString()
  return s
}

export function canDuelLuck(state) {
  const round = state.duel?.rounds.at(-1)
  return !!round && round.result !== 'tie' && round.luck === null && !state.resolved && state.stats.luck > 0
}

export function duelLuck(state) {
  if (!canDuelLuck(state)) return state
  const def = SECTIONS[state.section].duel
  const s = clone(state)
  const d = s.duel
  const round = d.rounds.at(-1)
  const dice = rollDice(2)
  const lucky = sum(dice) <= s.stats.luck
  s.stats.luck = Math.max(0, s.stats.luck - 1)
  const changes = [{ kind: 'stat', id: 'luck', delta: -1 }]
  if (round.result === 'win') {
    d.enemyStamina = Math.max(0, Math.min(d.enemyStaminaMax, d.enemyStamina + (lucky ? -2 : 1)))
  } else {
    const delta = lucky ? 1 : -1
    s.stats.inspiration = Math.max(0, Math.min(s.initial.inspiration, s.stats.inspiration + delta))
    changes.push({ kind: 'stat', id: 'inspiration', delta })
  }
  round.luck = { dice, lucky }
  s.lastChanges = changes
  finishDuelIfOver(s, def)
  s.updatedAt = new Date().toISOString()
  return s
}

/* ---------- items ---------- */
export function canUseItem(state, id) {
  const use = ITEMS[id]?.use
  if (!use || !(state.items[id] > 0) || state.status !== 'playing') return false
  if (state.duel && !state.resolved) return false
  if (use.once && state.flags[use.once]) return false
  // pointless uses are blocked so a pancake isn't wasted
  return use.effects.some((e) => e.stat && state.stats[e.stat] < statCap(state, e.stat))
}

export function useItem(state, id) {
  if (!canUseItem(state, id)) return state
  const s = clone(state)
  const use = ITEMS[id].use
  const changes = applyEffects(s, use.effects)
  if (use.consume) {
    s.items[id] -= 1
    if (s.items[id] <= 0) delete s.items[id]
  }
  if (use.once) s.flags[use.once] = true
  s.lastChanges = changes
  s.updatedAt = new Date().toISOString()
  return s
}

/* ---------- validation of old saves ---------- */
export function isValidSave(save) {
  return (
    save &&
    save.version === SAVE_VERSION &&
    typeof save.section === 'string' &&
    !!SECTIONS[save.section] &&
    save.stats &&
    save.initial
  )
}

export const endingIds = Object.keys(ENDINGS)
