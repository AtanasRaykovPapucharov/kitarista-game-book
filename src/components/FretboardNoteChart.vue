<template>
  <q-card flat bordered class="fretboard-note-chart">
    <!-- ===== Selection readout + Clear ===== -->
    <q-card-section class="fnc-toolbar">
      <div class="fnc-selection">
        <template v-if="selectedList.length">
          <q-chip
            v-for="p in selectedList"
            :key="p.key"
            dense
            removable
            class="fnc-chip"
            :remove-aria-label="t('remove')"
            @remove="toggle(p.key)"
            @mouseenter="hovered = p.key"
            @mouseleave="unhover(p.key)"
          >
            <span class="fnc-chip-pos">{{ posLabel(p.c, p.fret) }}</span
            >{{ p.name }}
          </q-chip>
        </template>
        <span v-else class="fnc-hint">{{ t('hint') }}</span>
      </div>
      <q-btn
        flat
        dense
        no-caps
        padding="xs md"
        :label="t('clear')"
        :disable="!selectedList.length"
        @click="clear"
      />
    </q-card-section>

    <q-card-section class="q-pa-sm">
      <svg
        :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`"
        class="fretboard-note-chart__svg"
        xmlns="http://www.w3.org/2000/svg"
        role="group"
        :aria-label="`${t('title')} ${t('subtitle')}`"
      >
        <defs>
          <!-- Glyph outlines from the Bravura font (SIL Open Font License) -->
          <path
            :id="ids.clef"
            d="M376 415C374 427 376 428 382 434C398 449 419 470 438 491C522 583 572 702 572 815C572 902 548 988 507 1048C492 1070 466 1098 455 1098C441 1098 410 1072 390 1050C316 968 292 843 292 739C292 681 299 616 306 575C308 563 309 561 297 551C233 498 164 437 112 373C43 287 0 194 0 87C0 -87 119 -252 364 -252C387 -252 413 -250 433 -246C444 -244 446 -243 448 -255C460 -322 475 -409 475 -456C475 -604 375 -622 316 -622C262 -622 236 -606 236 -593C236 -586 245 -583 268 -576C299 -567 335 -540 335 -482C335 -427 300 -380 239 -380C172 -380 132 -433 132 -495C132 -560 171 -658 322 -658C389 -658 519 -628 519 -458C519 -401 501 -306 490 -244C488 -232 489 -233 503 -227C604 -187 671 -102 671 11C671 139 577 252 430 252C404 252 404 252 401 270ZM470 943C503 943 530 916 530 861C530 792 497 728 419 650C403 634 379 611 356 591C349 585 345 586 343 599C339 625 337 659 337 691C337 847 409 943 470 943ZM361 262C364 243 364 244 346 238C258 208 201 129 201 44C201 -46 248 -110 316 -133C324 -136 336 -139 343 -139C351 -139 355 -134 355 -128C355 -121 347 -118 340 -115C298 -97 268 -54 268 -8C268 49 307 92 368 109C384 113 386 112 388 101L438 -197C440 -208 439 -208 424 -211C408 -214 388 -216 368 -216C193 -216 80 -119 80 20C80 79 90 158 173 252C233 319 279 356 326 394C336 402 338 401 340 390ZM430 103C428 115 429 118 441 117C522 110 589 42 589 -46C589 -109 551 -160 495 -188C483 -194 481 -194 479 -182Z"
          />
          <path
            :id="ids.sharp"
            d="M237 118C244 121 249 129 249 135V206C249 211 246 214 242 214C240 214 239 214 237 213C237 213 217 205 212 204C205 204 198 209 198 217V339C198 345 192 350 184 350C174 350 168 345 168 339V209C167 199 164 186 155 180C143 173 109 159 92 155C83 155 80 167 80 175V295C80 301 73 306 66 306C56 306 50 301 50 295V160C50 146 44 136 38 133C32 130 12 122 12 122C5 120 0 112 0 106V35C0 29 3 26 8 26C9 26 11 27 12 27C12 27 27 33 34 37C35 37 36 38 37 38C44 38 50 28 50 20V-79C50 -90 45 -99 39 -102C33 -104 12 -113 12 -113C5 -115 0 -123 0 -129V-200C0 -206 3 -209 8 -209C9 -209 11 -208 12 -208C12 -208 26 -202 35 -199C36 -198 37 -198 38 -198C45 -198 50 -209 50 -214V-337C50 -343 56 -348 63 -348C73 -348 80 -343 80 -337V-198C80 -185 85 -178 90 -176L151 -151C152 -151 154 -150 155 -150C163 -150 168 -162 168 -168V-293C168 -299 174 -304 181 -304C192 -304 198 -299 198 -293V-151C198 -143 202 -131 209 -128C216 -125 237 -117 237 -117C244 -114 249 -106 249 -100V-29C249 -24 246 -21 242 -21C240 -21 239 -21 237 -22L211 -32C205 -32 198 -26 198 -14V79C198 86 203 105 211 108ZM168 -45C162 -65 115 -85 92 -85C86 -85 81 -83 80 -80C78 -76 77 -54 77 -30C77 1 78 36 80 44C82 61 128 82 153 82C160 82 166 80 168 76C170 71 172 46 172 19C172 -8 170 -36 168 -45Z"
          />
          <path
            :id="ids.flat"
            d="M12 -170C15 -174 18 -175 21 -175C24 -175 27 -173 27 -173C57 -156 81 -129 106 -112C195 -50 226 11 226 57C226 114 182 150 136 153C129 153 122 152 115 150C104 147 92 143 81 136C75 131 64 122 59 122C57 122 56 122 54 123C47 126 43 133 43 140C44 162 50 402 50 422C50 433 41 439 31 439C17 439 1 429 0 411C0 411 4 -160 12 -170ZM47 -81C47 -81 44 -21 44 19C44 35 45 47 46 51C50 63 76 85 90 93C99 98 108 100 116 100C126 100 135 96 141 89C151 78 157 61 157 42C157 24 152 3 140 -18C127 -42 98 -74 68 -93C64 -95 61 -96 58 -96C49 -96 47 -86 47 -81Z"
          />
          <path
            :id="ids.head"
            d="M97 -125C186 -125 295 -43 295 42C295 93 255 125 198 125C88 125 0 44 0 -42C0 -94 43 -125 97 -125Z"
          />
          <pattern
            :id="ids.hatch"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" stroke-width="1.6" />
          </pattern>
        </defs>

        <!-- ===== Title ===== -->
        <text :x="VIEW_W / 2" y="62" text-anchor="middle" class="fnc-title">{{ t('title') }}</text>
        <text :x="VIEW_W / 2" y="100" text-anchor="middle" class="fnc-subtitle">
          {{ t('subtitle') }}
        </text>

        <!-- ===== Fretboard (left) ===== -->
        <g class="fnc-fretboard" stroke="currentColor" fill="none">
          <!-- string names above the headstock -->
          <text
            v-for="s in board.strings"
            :key="`sn-${s.index}`"
            :x="s.xTop"
            :y="board.nutY - 62"
            text-anchor="middle"
            class="fnc-label"
            stroke="none"
            fill="currentColor"
          >
            {{ s.name }}
          </text>

          <!-- headstock corners -->
          <polyline :points="board.headLeft" stroke-width="1.5" />
          <polyline :points="board.headRight" stroke-width="1.5" />

          <!-- edges of the fingerboard -->
          <line v-bind="board.edgeLeft" stroke-width="1.6" />
          <line v-bind="board.edgeRight" stroke-width="1.6" />

          <!-- nut -->
          <line v-bind="board.nut" stroke-width="5" />

          <!-- frets + labels -->
          <g v-for="f in board.frets" :key="`fret-${f.n}`">
            <line :x1="f.x1" :y1="f.y" :x2="f.x2" :y2="f.y" stroke-width="1.6" />
            <text
              :x="f.x1 - 16"
              :y="f.y + 6"
              text-anchor="end"
              class="fnc-fret-label"
              stroke="none"
              fill="currentColor"
            >
              {{ t('fret', { n: f.n }) }}
            </text>
          </g>

          <!-- strings -->
          <line
            v-for="s in board.strings"
            :key="`st-${s.index}`"
            :x1="s.xHead"
            :y1="board.nutY - 40"
            :x2="s.xBottom"
            :y2="board.bottomY"
            :stroke-width="s.width"
          />

          <!-- position markers -->
          <circle
            v-for="d in board.dots"
            :key="`dot-${d.fret}`"
            :cx="d.x"
            :cy="d.y"
            r="12"
            :fill="`url(#${ids.hatch})`"
            stroke-width="1.4"
          />

          <!-- circled string numbers -->
          <g v-for="s in board.strings" :key="`sc-${s.index}`">
            <circle :cx="s.xBottom" :cy="board.circleY" r="14" stroke-width="1.6" />
            <text
              :x="s.xBottom"
              :y="board.circleY + 6"
              text-anchor="middle"
              class="fnc-circle-num"
              stroke="none"
              fill="currentColor"
            >
              {{ 6 - s.index }}
            </text>
          </g>
        </g>

        <!-- clickable positions on the fretboard (open string + every fret) -->
        <g class="fnc-board-cells">
          <g
            v-for="cell in board.cells"
            :key="cell.key"
            class="fnc-cell fnc-pos"
            :class="cellClass(cell.key)"
            role="button"
            tabindex="0"
            :aria-pressed="selectedSet.has(cell.key)"
            :aria-label="cellLabel(cell)"
            v-on="cellEvents(cell.key)"
          >
            <title>{{ cell.name }}</title>
            <rect class="fnc-hit" v-bind="cell.hit" />
            <circle
              :class="['fnc-marker', { 'fnc-marker--open': cell.fret === 0 }]"
              :cx="cell.cx"
              :cy="cell.cy"
              :r="cell.fret === 0 ? 10 : 13"
            />
          </g>
        </g>

        <!-- ===== Notation (right) ===== -->
        <g class="fnc-staves">
          <text :x="(colX(0) + colX(6)) / 2" y="200" text-anchor="middle" class="fnc-heading">
            {{ t('strings') }}
          </text>
          <text
            v-for="(name, c) in STRING_NAMES"
            :key="`col-${c}`"
            :x="colX(c) + COL_W / 2"
            y="250"
            text-anchor="middle"
            class="fnc-label"
          >
            {{ name }}
          </text>

          <g v-for="row in rows" :key="`row-${row.fret}`">
            <!-- staff lines -->
            <line
              v-for="ly in row.staffLines"
              :key="ly"
              :x1="row.x0"
              :y1="ly"
              :x2="colX(6)"
              :y2="ly"
              stroke="currentColor"
              stroke-width="1"
            />
            <!-- bar lines -->
            <line
              v-for="bx in row.bars"
              :key="`b-${bx}`"
              :x1="bx"
              :y1="row.staffLines[0]"
              :x2="bx"
              :y2="row.staffLines[4]"
              stroke="currentColor"
              stroke-width="1.3"
            />
            <!-- treble clef -->
            <use
              :href="`#${ids.clef}`"
              :transform="glyph(row.x0 + 8, row.gLineY)"
              fill="currentColor"
            />

            <!-- notes (one clickable cell per string × fret) -->
            <g
              v-for="cell in row.cells"
              :key="cell.key"
              class="fnc-cell fnc-note"
              :class="cellClass(cell.key)"
              role="button"
              tabindex="0"
              :aria-pressed="selectedSet.has(cell.key)"
              :aria-label="cellLabel(cell)"
              v-on="cellEvents(cell.key)"
            >
              <title>{{ cell.name }}</title>
              <rect class="fnc-hit" v-bind="cell.hit" rx="6" />
              <g v-for="(note, i) in cell.heads" :key="i">
                <line
                  v-for="(l, j) in note.ledgers"
                  :key="`l-${j}`"
                  :x1="l.x1"
                  :y1="l.y"
                  :x2="l.x2"
                  :y2="l.y"
                  stroke="currentColor"
                  stroke-width="1.3"
                />
                <use
                  v-if="note.acc"
                  :href="`#${ids[note.acc]}`"
                  :transform="glyph(note.accX, note.y)"
                  fill="currentColor"
                />
                <use
                  :href="`#${ids.head}`"
                  :transform="glyph(note.headX, note.y)"
                  fill="currentColor"
                />
                <line
                  :x1="note.stem.x"
                  :y1="note.stem.y1"
                  :x2="note.stem.x"
                  :y2="note.stem.y2"
                  stroke="currentColor"
                  stroke-width="1.2"
                />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, getCurrentInstance, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/* ------------------------------------------------------------------ *
 *  i18n — the three translations live inside the component, so it
 *  needs no entries in src/i18n and works with any vue-i18n setup
 *  (legacy or composition mode, v9–v11) or even without vue-i18n.
 *  Language: `locale` prop, otherwise it live-follows the app's vue-i18n
 *  locale, Quasar's $q.lang and <html lang> (no page refresh needed).
 * ------------------------------------------------------------------ */
const MESSAGES = {
  bg: {
    title: 'ТАБЛИЦА',
    subtitle: 'за разположението на тоновете върху струните и прагчетата:',
    strings: 'СТРУНИ',
    fret: '{n} прагче',
    open: 'празна',
    clear: 'Изчисти',
    remove: 'Премахни',
    hint: 'Щракнете върху нота или върху място на грифа, за да го отбележите.',
  },
  en: {
    title: 'CHART',
    subtitle: 'of note positions on the strings and frets:',
    strings: 'STRINGS',
    fret: 'Fret {n}',
    open: 'Open',
    clear: 'Clear',
    remove: 'Remove',
    hint: 'Click a note or a spot on the fretboard to mark it.',
  },
  zh: {
    title: '音位表',
    subtitle: '各弦与各品上的音符位置：',
    strings: '弦',
    fret: '第 {n} 品',
    open: '空弦',
    clear: '清除',
    remove: '移除',
    hint: '点击音符或指板上的位置进行标记。',
  },
}

const props = defineProps({
  /** Force a language: 'bg' | 'en' | 'zh' (also 'en-US', 'zh-CN', …). */
  locale: { type: String, default: null },
  /**
   * Optional v-model: the marked positions as [{ string: 1–6, fret: 0–17 }]
   * (string 6 = low E, fret 0 = open). Leave it out and the chart keeps
   * its own selection.
   */
  modelValue: { type: Array, default: undefined },
})

const emit = defineEmits(['update:modelValue'])

const instance = getCurrentInstance()

/** 'bg-BG' → 'bg', 'zh-CN' → 'zh', any other non-empty code → 'en', empty → null */
function normalize(code) {
  const c = String(code ?? '')
    .trim()
    .toLowerCase()
  if (!c) return null
  if (c.startsWith('bg')) return 'bg'
  if (c.startsWith('zh')) return 'zh'
  return 'en'
}

// the app-wide vue-i18n instance, if the app installed one
const app = instance?.appContext.app
const i18n = app?.__VUE_I18N_SYMBOL__ ? inject(app.__VUE_I18N_SYMBOL__, null) : null

// Quasar's $q (its lang pack is reactive), if the app uses Quasar
const $q = instance?.appContext.config.globalProperties.$q

// <html lang="…"> — set by Quasar's $q.lang.set() and by many language switchers
const htmlLang = ref(typeof document !== 'undefined' ? document.documentElement.lang : '')
let htmlLangObserver = null
onMounted(() => {
  const el = document.documentElement
  htmlLang.value = el.lang
  htmlLangObserver = new MutationObserver(() => {
    htmlLang.value = el.lang
  })
  htmlLangObserver.observe(el, { attributes: true, attributeFilter: ['lang'] })
})
onBeforeUnmount(() => htmlLangObserver?.disconnect())

/*
 * Every place an app may keep its current language. The chart follows
 * whichever of them changed most recently, so it re-renders immediately
 * no matter how the app's language switcher is implemented.
 */
const languageSources = [
  () => {
    // legacy mode: global.locale is a string; composition mode: a ref
    const g = i18n?.global?.locale
    return normalize(typeof g === 'string' ? g : g?.value)
  },
  () => normalize($q?.lang?.isoName),
  () => normalize(htmlLang.value),
]

const browserLang = normalize(typeof navigator !== 'undefined' ? navigator.language : '') ?? 'en'
const detectedLang = ref(languageSources.map((get) => get()).find(Boolean) ?? browserLang)

watch(languageSources, (now, before) => {
  const changed = now.findIndex((code, i) => code && code !== before[i])
  if (changed !== -1) detectedLang.value = now[changed]
})

const lang = computed(() => normalize(props.locale) ?? detectedLang.value)

function t(key, params = {}) {
  const msg = MESSAGES[lang.value][key] ?? MESSAGES.en[key] ?? key
  return msg.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ''))
}

/* unique ids so several charts can live on one page */
const uid = `fnc-${instance?.uid ?? 0}`
const ids = {
  clef: `${uid}-clef`,
  sharp: `${uid}-sharp`,
  flat: `${uid}-flat`,
  head: `${uid}-head`,
  hatch: `${uid}-hatch`,
}

/* ------------------------------------------------------------------ *
 *  Layout constants
 * ------------------------------------------------------------------ */
const VIEW_W = 1540
const S = 8 // staff space (px)
const K = S / 250 // Bravura: 250 font units = 1 staff space
const FRETS = 17
const ROW0_Y = 330 // middle staff line of the "open strings" row = nut
const GAP0 = 104 // distance nut → fret 1
const RATIO = 0.985 // frets get gradually closer

const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E']
// written pitch for guitar (sounds an octave lower): E3 A3 D4 G4 B4 E5
const OPEN_MIDI = [52, 57, 62, 67, 71, 76]

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const PC_TO_LETTER = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 }
const E4_STEP = 2 + 7 * 4 // bottom staff line

/** c = column 0–5 (low E … high E), fret = 0–17 */
const keyOf = (c, fret) => `${c}-${fret}`
const noteName = (c, fret) =>
  spell(OPEN_MIDI[c] + fret)
    .map((n) => n.name)
    .join(' / ')

const rowY = [ROW0_Y]
for (let i = 0; i < FRETS; i++) rowY.push(rowY[i] + GAP0 * RATIO ** i)

const glyph = (x, y) => `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${K} ${-K})`

/* ------------------------------------------------------------------ *
 *  Fretboard geometry
 * ------------------------------------------------------------------ */
const NUT_Y = ROW0_Y
const BOTTOM_Y = rowY[FRETS] + 30
const VIEW_H = Math.round(BOTTOM_Y + 76)

const EDGE = {
  top: { l: 205, r: 455 },
  bottom: { l: 185, r: 475 },
}
const lerp = (a, b, k) => a + (b - a) * k
const edgeAt = (y) => {
  const k = (y - NUT_Y) / (BOTTOM_Y - NUT_Y)
  return { l: lerp(EDGE.top.l, EDGE.bottom.l, k), r: lerp(EDGE.top.r, EDGE.bottom.r, k) }
}
const stringX = (i, y) => {
  const e = edgeAt(y)
  return lerp(e.l, e.r, 0.06 + (0.88 * i) / 5)
}

const board = (() => {
  const top = edgeAt(NUT_Y)
  const bot = edgeAt(BOTTOM_Y)
  const midDG = (y) => (stringX(2, y) + stringX(3, y)) / 2
  const dotY = (n) => (rowY[n - 1] + rowY[n]) / 2
  return {
    nutY: NUT_Y,
    bottomY: BOTTOM_Y,
    circleY: BOTTOM_Y + 36,
    nut: { x1: top.l, y1: NUT_Y, x2: top.r, y2: NUT_Y },
    edgeLeft: { x1: top.l, y1: NUT_Y, x2: bot.l, y2: BOTTOM_Y },
    edgeRight: { x1: top.r, y1: NUT_Y, x2: bot.r, y2: BOTTOM_Y },
    headLeft: `${top.l},${NUT_Y} ${top.l - 22},${NUT_Y - 30}`,
    headRight: `${top.r},${NUT_Y} ${top.r + 22},${NUT_Y - 30}`,
    strings: STRING_NAMES.map((name, index) => ({
      index,
      name,
      xTop: stringX(index, NUT_Y),
      xHead: stringX(index, NUT_Y),
      xBottom: stringX(index, BOTTOM_Y),
      width: 2.2 - index * 0.25,
    })),
    frets: Array.from({ length: FRETS }, (_, i) => {
      const n = i + 1
      const e = edgeAt(rowY[n])
      return { n, y: rowY[n], x1: e.l, x2: e.r }
    }),
    dots: [5, 7, 12].map((fret) => ({ fret, x: midDG(dotY(fret)), y: dotY(fret) })),
    // one clickable spot per string × fret; fret 0 sits just above the nut
    cells: STRING_NAMES.flatMap((_, c) =>
      Array.from({ length: FRETS + 1 }, (_, fret) => {
        const top = fret === 0 ? NUT_Y - 44 : rowY[fret - 1]
        const bottom = fret === 0 ? NUT_Y : rowY[fret]
        const cy = fret === 0 ? NUT_Y - 20 : (top + bottom) / 2
        const cx = stringX(c, cy)
        const w = stringX(1, cy) - stringX(0, cy)
        return {
          key: keyOf(c, fret),
          c,
          fret,
          cx,
          cy,
          name: noteName(c, fret),
          hit: { x: cx - w / 2, y: top, width: w, height: bottom - top },
        }
      }),
    ),
  }
})()

/* ------------------------------------------------------------------ *
 *  Notation
 * ------------------------------------------------------------------ */
const STAFF_X0 = 590
const CLEF_W = 64
const COL_W = 140
const colX = (c) => STAFF_X0 + CLEF_W + c * COL_W

/** One pitch → one natural, or a sharp/flat enharmonic pair (as in the original chart). */
function spell(midi) {
  const pc = midi % 12
  const oct = Math.floor(midi / 12) - 1
  const mk = (li, acc) => ({
    pos: li + 7 * oct - E4_STEP, // 0 = bottom line, 8 = top line
    acc,
    name: `${LETTERS[li]}${acc === 'sharp' ? '♯' : acc === 'flat' ? '♭' : ''}${oct}`,
  })
  if (pc in PC_TO_LETTER) return [mk(PC_TO_LETTER[pc], null)]
  return [mk(PC_TO_LETTER[pc - 1], 'sharp'), mk(PC_TO_LETTER[pc + 1], 'flat')]
}

const HEAD_W = 295 * K
const ACC_W = { sharp: 249 * K, flat: 226 * K }
const PAIR_DX = 24

const rows = rowY.map((y, fret) => {
  const start = fret <= 12 ? 0 : fret - 12 // staircase for frets 13-17
  const bottomLine = y + 2 * S
  const x0 = start === 0 ? STAFF_X0 : colX(start) - CLEF_W
  const bars = []
  for (let c = start + 1; c <= 6; c++) bars.push(colX(c))

  const cells = []
  for (let c = start; c < 6; c++) {
    const spelled = spell(OPEN_MIDI[c] + fret)
    const cx = colX(c) + COL_W / 2
    const heads = spelled.map((n, k) => {
      const hx = spelled.length === 1 ? cx : cx + (k === 0 ? -PAIR_DX : PAIR_DX)
      const headX = hx - HEAD_W / 2
      const ny = bottomLine - (n.pos * S) / 2
      const ledgers = []
      const lx1 = headX - 0.4 * S
      const lx2 = headX + HEAD_W + 0.4 * S
      for (let p = -2; p >= n.pos; p -= 2)
        ledgers.push({ x1: lx1, x2: lx2, y: bottomLine - (p * S) / 2 })
      for (let p = 10; p <= n.pos; p += 2)
        ledgers.push({ x1: lx1, x2: lx2, y: bottomLine - (p * S) / 2 })
      const up = n.pos < 4
      return {
        y: ny,
        headX,
        acc: n.acc,
        accX: n.acc ? headX - 0.25 * S - ACC_W[n.acc] : 0,
        ledgers,
        stem: up
          ? { x: headX + HEAD_W - 0.6, y1: ny - 0.17 * S, y2: ny - 3.5 * S }
          : { x: headX + 0.6, y1: ny + 0.17 * S, y2: ny + 3.5 * S },
      }
    })
    // hit area: the column, from halfway to the row above to halfway to the row below
    const top = fret === 0 ? y - 56 : (rowY[fret - 1] + y) / 2
    const bottom = fret === FRETS ? y + 48 : (y + rowY[fret + 1]) / 2
    cells.push({
      key: keyOf(c, fret),
      c,
      fret,
      name: spelled.map((n) => n.name).join(' / '),
      heads,
      hit: { x: colX(c) + 3, y: top + 2, width: COL_W - 6, height: bottom - top - 4 },
    })
  }

  return {
    fret,
    x0,
    bars,
    cells,
    gLineY: y + S,
    staffLines: [y - 2 * S, y - S, y, y + S, y + 2 * S],
  }
})

/* ------------------------------------------------------------------ *
 *  Selection — shared by the fretboard and the notation, so marking
 *  a spot on one side marks the matching note on the other.
 * ------------------------------------------------------------------ */
const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥']

const localKeys = ref([])

function keysFromModel(list) {
  const out = []
  for (const p of list ?? []) {
    const s = Number(p?.string)
    const f = Number(p?.fret)
    if (!Number.isInteger(s) || s < 1 || s > 6) continue
    if (!Number.isInteger(f) || f < 0 || f > FRETS) continue
    const k = keyOf(6 - s, f)
    if (!out.includes(k)) out.push(k)
  }
  return out
}

// follow the parent's v-model when there is one
watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) localKeys.value = keysFromModel(v)
  },
  { immediate: true, deep: true },
)

const selectedKeys = computed(() => localKeys.value)
const selectedSet = computed(() => new Set(selectedKeys.value))

function setKeys(keys) {
  localKeys.value = keys
  emit(
    'update:modelValue',
    keys.map((k) => {
      const [c, fret] = k.split('-').map(Number)
      return { string: 6 - c, fret }
    }),
  )
}

function toggle(key) {
  const keys = selectedKeys.value
  setKeys(keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key])
}

function clear() {
  setKeys([])
  hovered.value = null
}

/** marked positions, low string first, then by fret */
const selectedList = computed(() =>
  selectedKeys.value
    .map((key) => {
      const [c, fret] = key.split('-').map(Number)
      return { key, c, fret, name: noteName(c, fret) }
    })
    .sort((a, b) => a.c - b.c || a.fret - b.fret),
)

/* hovering (or keyboard-focusing) one side previews the other */
const hovered = ref(null)
function unhover(key) {
  if (hovered.value === key) hovered.value = null
}

function cellClass(key) {
  return { 'is-selected': selectedSet.value.has(key), 'is-hover': hovered.value === key }
}

function cellEvents(key) {
  return {
    click: () => toggle(key),
    keydown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggle(key)
      }
    },
    pointerenter: (e) => {
      if (e.pointerType !== 'touch') hovered.value = key
    },
    pointerleave: () => unhover(key),
    focus: (e) => {
      let keyboard = true
      try {
        keyboard = e.target.matches(':focus-visible')
      } catch {
        /* older browsers */
      }
      if (keyboard) hovered.value = key
    },
    blur: () => unhover(key),
  }
}

function posLabel(c, fret) {
  return `${CIRCLED[5 - c]} ${fret === 0 ? t('open') : t('fret', { n: fret })}`
}

function cellLabel(cell) {
  return `${posLabel(cell.c, cell.fret)}: ${cell.name}`
}

defineExpose({ clear })
</script>

<style scoped>
.fretboard-note-chart {
  --_accent: var(--fnc-accent, var(--q-primary, #1976d2));
}

/* ----- toolbar ----- */
.fnc-toolbar {
  position: sticky;
  top: var(--fnc-toolbar-top, 0px);
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 8px 12px;
  background: inherit;
  border-bottom: 1px solid color-mix(in srgb, currentColor 14%, transparent);
}
.fnc-selection {
  flex: 1 1 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-height: 32px;
}
.fnc-chip {
  margin: 0;
  background: var(--_accent);
  color: #fff;
}
.fnc-chip-pos {
  margin-right: 0.5em;
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
}
.fnc-hint {
  font-size: 0.875rem;
  opacity: 0.7;
}

/* ----- clickable cells ----- */
.fnc-cell {
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.fnc-hit {
  fill: var(--_accent);
  fill-opacity: 0;
  stroke: none;
  transition: fill-opacity 0.12s;
}
.fnc-cell:focus-visible .fnc-hit {
  stroke: var(--_accent);
  stroke-width: 2;
}

/* notation: tint the cell and ink the note in the accent colour */
.fnc-note.is-hover .fnc-hit {
  fill-opacity: 0.07;
}
.fnc-note.is-selected .fnc-hit {
  fill-opacity: 0.14;
}
.fnc-note.is-selected {
  color: var(--_accent);
}

/* fretboard: finger dot (ring for an open string) */
.fnc-marker {
  fill: var(--_accent);
  stroke: none;
  pointer-events: none;
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(0.6);
  transition:
    opacity 0.12s,
    transform 0.18s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.fnc-marker--open {
  fill: none;
  stroke: var(--_accent);
  stroke-width: 3;
}
.fnc-pos.is-hover .fnc-marker {
  opacity: 0.35;
  transform: scale(1);
}
.fnc-pos.is-selected .fnc-marker {
  opacity: 1;
  transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .fnc-hit,
  .fnc-marker {
    transition: none;
  }
}

.fretboard-note-chart__svg {
  display: block;
  width: 100%;
  height: auto;
  color: inherit;
  font-family:
    'PT Serif', 'Noto Serif', 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'SimSun',
    'Times New Roman', serif;
}
.fretboard-note-chart__svg text {
  fill: currentColor;
}
.fnc-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.fnc-subtitle {
  font-size: 22px;
  letter-spacing: 0.06em;
}
.fnc-heading {
  font-size: 21px;
  font-weight: 700;
  letter-spacing: 0.3em;
}
.fnc-label {
  font-size: 20px;
}
.fnc-fret-label {
  font-size: 17px;
}
.fnc-circle-num {
  font-size: 16px;
}
</style>
