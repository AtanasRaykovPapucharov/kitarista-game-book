<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useGameStore } from 'src/stores/game-store'
import { useStory } from 'src/game/useStory'
import { ITEMS } from 'src/story/items'
import { DARKNESS_MAX, sectionNumber } from 'src/story/book'
import { cues } from 'src/game/sound'
import UserAvatar from 'src/components/avatar/UserAvatar.vue'
import { useStory as useSongText } from 'src/game/useStory'

/* sticky: keep the sheet in view while the reader scrolls the page.
   It only sticks when it fits in the window, so the sheet never needs
   a scrollbar of its own and nothing is ever cut off. */
const props = defineProps({
  sticky: { type: Boolean, default: false },
})

const HEADER = 50 // app header height
const GAP = 24 // breathing room above and below when stuck

const { t } = useI18n()
const $q = useQuasar()
const inner = ref(null)
const fits = ref(false)
let observer = null

function measure() {
  if (!inner.value) return
  fits.value = inner.value.offsetHeight <= window.innerHeight - HEADER - GAP * 2
}

onMounted(() => {
  if (!props.sticky) return
  observer = new ResizeObserver(measure)
  if (inner.value) observer.observe(inner.value)
  window.addEventListener('resize', measure)
  measure()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('resize', measure)
})
const game = useGameStore()
const { itemName, itemDesc } = useStory()

const save = computed(() => game.save)
const items = computed(() =>
  Object.entries(save.value?.items ?? {})
    .filter(([, n]) => n > 0)
    .map(([id, n]) => ({ id, n, def: ITEMS[id] ?? {} })),
)
const trail = computed(() => (save.value?.trail ?? []).slice(-14).map(sectionNumber))
const song = computed(() => save.value?.counters?.song ?? 0)
const { lyric } = useSongText()
const verses = computed(() => (save.value?.song?.verses ?? []).map((v) => lyric(v.mood, v.line)))

// the inner wrapper only exists while there is a save; re-observe when it appears
watch(save, async () => {
  if (!observer) return
  await nextTick()
  observer.disconnect()
  if (inner.value) observer.observe(inner.value)
  measure()
})

function used(item) {
  const once = item.def.use?.once
  return !!(once && save.value.flags[once])
}

function use(id) {
  game.useItem(id)
  cues.useItem()
}

function abandon() {
  $q.dialog({
    title: t('play.abandonTitle'),
    message: t('play.abandonBody'),
    cancel: { label: t('common.cancel'), flat: true, noCaps: true },
    ok: { label: t('play.abandon'), color: 'negative', noCaps: true, unelevated: true },
  }).onOk(() => game.abandon())
}
</script>

<template>
  <aside v-if="save" class="sheet" :aria-label="t('play.sheet')">
    <div ref="inner" class="sheet__inner" :class="{ 'is-stuck': sticky && fits }">
      <div class="sheet__head">
        <UserAvatar :size="44" alt="" />

        <h2 class="sheet__title">{{ t('play.sheet') }}</h2>
      </div>

      <div class="sheet__body">
        <section class="sheet__block">
          <dl class="sheet__stats">
            <div
              v-for="stat in ['skill', 'inspiration', 'luck']"
              :key="stat"
              class="sheet__stat"
              :title="t(`statsHelp.${stat}`)"
            >
              <dt>{{ t(`stats.${stat}`) }}</dt>
              <dd>
                <strong>{{ save.stats[stat] }}</strong>
                <span class="sheet__of">/ {{ save.initial[stat] }}</span>
              </dd>
            </div>
            <div class="sheet__stat sheet__stat--dark" :title="t('statsHelp.darkness')">
              <dt>{{ t('stats.darkness') }}</dt>
              <dd class="sheet__dark" :aria-label="`${save.stats.darkness} / ${DARKNESS_MAX}`">
                <span
                  v-for="n in DARKNESS_MAX"
                  :key="n"
                  class="pip pip--dark"
                  :class="{ 'is-on': n <= save.stats.darkness }"
                />
              </dd>
            </div>
            <div class="sheet__stat">
              <dt>{{ t('stats.song') }}</dt>
              <dd>{{ t('stats.songVerses', song) }}</dd>
            </div>
          </dl>
          <ol v-if="verses.length" class="sheet__verses">
            <li v-for="(v, i) in verses" :key="i">{{ v }}</li>
          </ol>
        </section>

        <section class="sheet__block">
          <h3 class="sheet__sub sheet__sub--first">{{ t('play.items') }}</h3>
          <p v-if="!items.length" class="sheet__empty">{{ t('play.noItems') }}</p>
          <ul v-else class="sheet__items">
            <li v-for="item in items" :key="item.id" class="sheet__item">
              <q-icon :name="item.def.icon" size="20px" class="sheet__icon" />
              <div class="sheet__item-body">
                <span class="sheet__item-name">
                  {{ itemName(item.id) }}<template v-if="item.n > 1"> × {{ item.n }}</template>
                </span>
                <span class="sheet__item-desc">{{ itemDesc(item.id) }}</span>
              </div>
              <button
                v-if="item.def.use"
                type="button"
                class="gb-btn gb-btn--small"
                :disabled="!game.canUseItem(item.id)"
                @click="use(item.id)"
              >
                {{ used(item) ? t('play.used') : t('play.use') }}
              </button>
            </li>
          </ul>
        </section>

        <section class="sheet__block">
          <h3 class="sheet__sub sheet__sub--first">{{ t('play.trail') }}</h3>
          <p class="sheet__trail">{{ trail.join(', ') }}</p>

          <button v-if="save.status === 'playing'" type="button" class="gb-link" @click="abandon">
            {{ t('play.abandon') }}
          </button>
        </section>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sheet {
  font-family: var(--gb-sans);
  color: var(--gb-ink);
  font-variant-numeric: lining-nums;
  container-type: inline-size;
}

.sheet__inner.is-stuck {
  position: sticky;
  top: 74px; /* header 50px + 24px */
}

.sheet__body {
  display: grid;
  gap: 0;
}

/* when the sheet is wide, stats, items and path sit side by side */
@container (min-width: 46rem) {
  .sheet__body {
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 0 44px;
    align-items: start;
  }

  .sheet__sub--first {
    margin-top: 0;
  }
}

.sheet__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.sheet__head .sheet__title {
  margin: 0;
  line-height: 1.2;
}

.sheet__title {
  margin: 0 0 12px;
  font-family: var(--gb-serif);
  font-style: italic;
  font-size: 1.25rem;
  font-weight: 400;
}

.sheet__stats {
  margin: 0;
  display: grid;
  gap: 2px;
}

.sheet__stat {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px solid var(--gb-rule);
}

.sheet__stat dt {
  color: var(--gb-muted);
}

.sheet__stat dd {
  margin: 0;
  font-variant-numeric: lining-nums tabular-nums;
}

.sheet__stat strong {
  font-family: var(--gb-serif);
  font-size: 1.35rem;
  font-weight: 700;
}

.sheet__of {
  color: var(--gb-muted);
  margin-left: 2px;
}

.sheet__verses {
  margin: 8px 0 4px;
  padding-left: 1.3em;
  font-family: var(--gb-serif);
  font-style: italic;
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--gb-muted);
}

.sheet__dark {
  display: flex;
  gap: 3px;
}

.sheet__sub {
  margin: 20px 0 8px;
  font-size: 0.95rem;
  font-weight: 700;
}

.sheet__empty,
.sheet__trail {
  margin: 0;
  color: var(--gb-muted);
  font-variant-numeric: lining-nums tabular-nums;
}

.sheet__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.sheet__item {
  display: grid;
  grid-template-columns: 22px 1fr auto;
  align-items: start;
  gap: 10px;
}

.sheet__icon {
  color: var(--gb-accent);
  margin-top: 2px;
}

.sheet__item-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sheet__item-name {
  font-weight: 500;
}

.sheet__item-desc {
  font-size: 0.85rem;
  color: var(--gb-muted);
  line-height: 1.35;
}

.gb-link {
  margin-top: 22px;
}
</style>
