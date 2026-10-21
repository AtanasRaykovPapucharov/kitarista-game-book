<script setup>
import { useCast } from 'src/game/useCast'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from 'src/stores/game-store'
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS } from 'src/game/achievements'

/* The guitar achievements, grouped: unlocked ones with their date,
   locked ones with what to do – except secret ones, which stay hidden. */
const { t, locale } = useI18n()
const game = useGameStore()

const have = computed(() => game.profile.achievements ?? {})
const count = computed(() => ACHIEVEMENTS.filter((a) => have.value[a.id]).length)
const percent = computed(() => Math.round((count.value / ACHIEVEMENTS.length) * 100))
const groups = computed(() =>
  ACHIEVEMENT_GROUPS.map((g) => ({ key: g, items: ACHIEVEMENTS.filter((a) => a.group === g) })),
)
const date = (iso) => new Date(iso).toLocaleDateString(locale.value)
// names for texts that mention the protagonist or the friend
const names = useCast()
</script>

<template>
  <section class="achievements">
    <div class="achievements__progress">
      <span>{{ t('achievements.progress', { n: count, total: ACHIEVEMENTS.length }) }}</span>
      <div
        class="achievements__bar"
        role="progressbar"
        :aria-valuenow="count"
        aria-valuemin="0"
        :aria-valuemax="ACHIEVEMENTS.length"
      >
        <span :style="{ width: `${percent}%` }" />
      </div>
    </div>

    <div v-for="g in groups" :key="g.key" class="achievements__group">
      <h3 class="achievements__group-title">{{ t(`achievements.groups.${g.key}`) }}</h3>
      <ul class="achievements__grid">
        <li
          v-for="a in g.items"
          :key="a.id"
          class="achievement"
          :class="{ 'is-on': have[a.id], 'is-secret': a.secret && !have[a.id] }"
        >
          <span class="achievement__badge" aria-hidden="true">
            <q-icon :name="a.secret && !have[a.id] ? 'question_mark' : a.icon" size="26px" />
          </span>
          <span class="achievement__text">
            <span class="achievement__title">
              {{
                a.secret && !have[a.id]
                  ? t('achievements.secret')
                  : t(`achievements.list.${a.id}.title`)
              }}
            </span>
            <span class="achievement__desc">
              {{
                a.secret && !have[a.id]
                  ? t('achievements.secretHint')
                  : t(`achievements.list.${a.id}.desc`, names)
              }}
            </span>
            <span v-if="have[a.id]" class="achievement__date">
              {{ t('achievements.unlockedOn', { date: date(have[a.id]) }) }}
            </span>
          </span>
          <span class="sr-only">{{
            have[a.id] ? t('achievements.unlockedLabel') : t('achievements.lockedLabel')
          }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.achievements__progress {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  margin-bottom: 18px;
  font-weight: 500;
  font-variant-numeric: lining-nums;
}

.achievements__bar {
  flex: 1 1 12rem;
  height: 8px;
  border-radius: 999px;
  background: var(--gb-rule);
  overflow: hidden;
}

.achievements__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--gb-accent);
  transition: width 0.6s ease;
}

.achievements__group + .achievements__group {
  margin-top: 18px;
}

.achievements__group-title {
  margin: 0 0 10px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--gb-muted);
}

.achievements__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.achievement {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--gb-rule);
  border-radius: 14px;
  opacity: 0.6;
}

.achievement.is-on {
  opacity: 1;
  border-color: color-mix(in srgb, var(--gb-accent) 55%, var(--gb-rule));
  background: color-mix(in srgb, var(--gb-accent) 8%, transparent);
}

.achievement__badge {
  display: grid;
  flex: none;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--gb-hover);
  color: var(--gb-muted);
}

.achievement.is-on .achievement__badge {
  background: var(--gb-accent);
  color: var(--gb-paper);
  box-shadow: 0 0 16px color-mix(in srgb, var(--gb-accent) 45%, transparent);
}

.achievement__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.achievement__title {
  font-family: var(--gb-serif);
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.25;
}

.achievement.is-secret .achievement__title {
  font-style: italic;
  font-weight: 400;
}

.achievement__desc {
  font-size: 0.88rem;
  line-height: 1.4;
  color: var(--gb-muted);
}

.achievement__date {
  margin-top: 4px;
  font-size: 0.8rem;
  color: var(--gb-accent);
}

@media (prefers-reduced-motion: reduce) {
  .achievements__bar span {
    transition: none;
  }
}
</style>
