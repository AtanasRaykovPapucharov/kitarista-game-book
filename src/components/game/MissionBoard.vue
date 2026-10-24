<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import { MISSIONS, MISSION_IDS } from 'src/story/missions'
import { EXERCISES } from 'src/story/exercises'

/* Every mission in the book, in one place: the ones you have, the ones
   you finished, and the ones the book hasn't given you yet. So a mission
   can always be found again, whatever the adventure took you past. */
const { t, locale } = useI18n()
const game = useGameStore()

const state = (id) =>
  game.save?.missions?.[id] ?? (game.profile.realPlayed?.[id] ? 'played' : 'later')
const rows = computed(() =>
  MISSION_IDS.map((id) => ({ id, m: MISSIONS[id], state: state(id), real: !!EXERCISES[id] })).sort(
    (a, b) =>
      ['active', 'later', 'played', 'done'].indexOf(a.state) -
      ['active', 'later', 'played', 'done'].indexOf(b.state),
  ),
)
const doneCount = computed(() => rows.value.filter((r) => r.state === 'done').length)
const playedOn = (id) => game.profile.realPlayed?.[id]
const date = (iso) => new Date(iso).toLocaleDateString(locale.value)
</script>

<template>
  <section class="mboard">
    <p class="mboard__count">{{ t('missions.progress', { n: doneCount, total: rows.length }) }}</p>
    <ul class="mboard__list">
      <li v-for="r in rows" :key="r.id" class="mboard__item" :class="`is-${r.state}`">
        <q-icon
          :name="
            r.state === 'done' ? 'check_circle' : r.state === 'active' ? r.m.icon : 'lock_clock'
          "
          size="24px"
          class="mboard__icon"
        />
        <div class="mboard__text">
          <p class="mboard__name">{{ t(`missions.list.${r.id}.title`) }}</p>
          <p class="mboard__task">{{ t(`missions.list.${r.id}.task`) }}</p>
          <p class="mboard__meta">
            <template v-if="r.state === 'done'">{{ t('missions.doneLabel') }}</template>
            <template v-else-if="r.state === 'active'">{{ t('missions.label') }}</template>
            <template v-else-if="r.state === 'played'">{{ t('missions.onlyReal') }}</template>
            <template v-else>{{ t('missions.later') }}</template>
            <template v-if="playedOn(r.id)">
              · {{ t('coach.playedOn', { date: date(playedOn(r.id)) }) }}</template
            >
          </p>
          <p v-if="r.state !== 'done'" class="mboard__links">
            <router-link :to="{ path: r.m.tool, query: { m: r.id } }" class="gb-btn gb-btn--small">
              {{ t(`missions.tools.${r.m.tool.slice(1)}`) }}
            </router-link>
            <router-link
              v-if="r.real"
              :to="{ path: '/coach', query: { ex: r.id } }"
              class="gb-btn gb-btn--small"
            >
              <q-icon name="mic" size="16px" class="q-mr-xs" />{{ t('missions.playReal') }}
            </router-link>
          </p>
        </div>
      </li>
    </ul>
    <p class="gb-note">{{ t('missions.boardNote') }}</p>
  </section>
</template>

<style scoped>
.mboard__count {
  margin: 0 0 10px;
  font-weight: 600;
  font-variant-numeric: lining-nums;
}

.mboard__list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mboard__item {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--gb-rule);
  border-radius: 14px;
}

.mboard__item.is-done {
  border-color: color-mix(in srgb, var(--gb-good) 55%, var(--gb-rule));
}

.mboard__item.is-active {
  border-color: var(--gb-accent);
}

.mboard__item.is-later {
  opacity: 0.72;
}

.mboard__icon {
  flex: none;
  color: var(--gb-accent);
}

.is-done .mboard__icon {
  color: var(--gb-good);
}

.is-later .mboard__icon {
  color: var(--gb-muted);
}

.mboard__text p {
  margin: 0;
}

.mboard__name {
  font-family: var(--gb-serif);
  font-size: 1.08rem;
  font-weight: 700;
}

.mboard__task {
  font-size: 0.9rem;
  line-height: 1.45;
  color: var(--gb-muted);
}

.mboard__meta {
  margin-top: 2px !important;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gb-accent);
}

.is-later .mboard__meta {
  color: var(--gb-muted);
}

.mboard__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px !important;
}

.mboard__links a {
  text-decoration: none;
}
</style>
