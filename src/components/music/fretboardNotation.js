/* =====================================================
   The staves beside the fretboard chart.

   Two readings of the same notes:
   - vertical board  → one staff per fret, a column per string
   - horizontal board → one staff per string, a column per fret,
     so the notation runs the same way as the board above it.

   Pure geometry: no Vue, no DOM. The component draws what it gets.
===================================================== */

export const S = 8 // staff space (px)
export const K = S / 250 // Bravura: 250 font units = 1 staff space
export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const PC_TO_LETTER = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 }
const E4_STEP = 2 + 7 * 4 // bottom staff line
const HEAD_W = 295 * K
const ACC_W = { sharp: 249 * K, flat: 226 * K }
const PAIR_DX = 24

/** One pitch → one natural, or a sharp/flat enharmonic pair. */
export function spell(midi) {
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

export const noteNameOf = (midi) =>
  spell(midi)
    .map((n) => n.name)
    .join(' / ')

/** Note heads, accidentals, ledger lines and stems for one pitch, centred on cx. */
function headsFor(midi, cx, bottomLine) {
  const spelled = spell(midi)
  return spelled.map((n, k) => {
    const hx = spelled.length === 1 ? cx : cx + (k === 0 ? -PAIR_DX : PAIR_DX)
    const headX = hx - HEAD_W / 2
    const y = bottomLine - (n.pos * S) / 2
    const ledgers = []
    const lx1 = headX - 0.4 * S
    const lx2 = headX + HEAD_W + 0.4 * S
    for (let p = -2; p >= n.pos; p -= 2)
      ledgers.push({ x1: lx1, x2: lx2, y: bottomLine - (p * S) / 2 })
    for (let p = 10; p <= n.pos; p += 2)
      ledgers.push({ x1: lx1, x2: lx2, y: bottomLine - (p * S) / 2 })
    const up = n.pos < 4
    return {
      y,
      headX,
      acc: n.acc,
      accX: n.acc ? headX - 0.25 * S - ACC_W[n.acc] : 0,
      ledgers,
      stem: up
        ? { x: headX + HEAD_W - 0.6, y1: y - 0.17 * S, y2: y - 3.5 * S }
        : { x: headX + 0.6, y1: y + 0.17 * S, y2: y + 3.5 * S },
    }
  })
}

const staffLines = (y) => [y - 2 * S, y - S, y, y + S, y + 2 * S]

/**
 * @param {object} o
 * @param {'vertical'|'horizontal'} o.orientation
 * @param {number[]} o.openMidi   written pitch of each open string, low to high
 * @param {string[]} o.stringNames
 * @param {number} o.frets
 * @param {number[]} o.rowY       y of each fret row (vertical layout)
 * @param {number} o.boardW       where the notation starts (vertical layout)
 * @param {number} o.viewW, o.viewH
 * @param {(c:number, fret:number) => string} o.keyOf
 * @param {string} o.labelHeading text above the column labels
 */
export function buildNotation(o) {
  return o.orientation === 'horizontal' ? byString(o) : byFret(o)
}

/* ---------- vertical board: one staff per fret ---------- */
export const TOP_CROP = 150 // the band the hidden title used to fill

function byFret({ openMidi, stringNames, frets, rowY, boardW, viewW, viewH, keyOf, labelHeading }) {
  const X0 = boardW + 30
  const CLEF_W = 64
  const COL_W = 140
  const colX = (c) => X0 + CLEF_W + c * COL_W

  const rows = rowY.map((y, fret) => {
    // every row holds all six strings, frets 13–17 included
    const bottomLine = y + 2 * S
    const cells = []
    for (let c = 0; c < 6; c++) {
      const top = fret === 0 ? y - 56 : (rowY[fret - 1] + y) / 2
      const bottom = fret === frets ? y + 48 : (y + rowY[fret + 1]) / 2
      cells.push({
        key: keyOf(c, fret),
        c,
        fret,
        name: noteNameOf(openMidi[c] + fret),
        heads: headsFor(openMidi[c] + fret, colX(c) + COL_W / 2, bottomLine),
        hit: { x: colX(c) + 3, y: top + 2, width: COL_W - 6, height: bottom - top - 4 },
      })
    }
    const bars = []
    for (let c = 1; c <= 6; c++) bars.push(colX(c))
    return {
      id: `fret-${fret}`,
      x0: X0,
      x1: colX(6),
      bars,
      cells,
      clef: { x: X0 + 8, y: y + S },
      staffLines: staffLines(y),
    }
  })

  return {
    rows,
    viewBox: `${boardW} ${TOP_CROP} ${viewW - boardW} ${viewH - TOP_CROP}`,
    titleX: (boardW + viewW) / 2,
    heading: { x: (colX(0) + colX(6)) / 2, y: TOP_CROP + 26, text: labelHeading },
    labels: stringNames.map((name, c) => ({
      key: `col-${c}`,
      x: colX(c) + COL_W / 2,
      y: TOP_CROP + 76,
      text: name,
    })),
  }
}

/* ---------- horizontal board: one staff per string ---------- */
function byString({ openMidi, stringNames, frets, keyOf, labelHeading }) {
  const X0 = 40
  const CLEF_W = 64
  const COL_W = 132
  const ROW_H = 124 // room for ledger lines above and below each staff
  const TOP = 180
  const colX = (fret) => X0 + CLEF_W + fret * COL_W
  const width = colX(frets + 1) + 40
  const height = TOP + 6 * ROW_H + 40

  // the high E on top, as in tab and as on the horizontal board
  const order = [...stringNames.keys()].reverse()
  const rows = order.map((c, i) => {
    const y = TOP + i * ROW_H
    const bottomLine = y + 2 * S
    const cells = []
    for (let fret = 0; fret <= frets; fret++) {
      cells.push({
        key: keyOf(c, fret),
        c,
        fret,
        name: noteNameOf(openMidi[c] + fret),
        heads: headsFor(openMidi[c] + fret, colX(fret) + COL_W / 2, bottomLine),
        hit: { x: colX(fret) + 3, y: y - ROW_H / 2 + 6, width: COL_W - 6, height: ROW_H - 12 },
      })
    }
    const bars = []
    for (let fret = 1; fret <= frets + 1; fret++) bars.push(colX(fret))
    return {
      id: `string-${c}`,
      x0: X0,
      x1: colX(frets + 1),
      bars,
      cells,
      clef: { x: X0 + 8, y: y + S },
      staffLines: staffLines(y),
      // which string this staff belongs to, written at the left
      label: { x: X0 - 12, y: y + S, text: stringNames[c] },
    }
  })

  return {
    rows,
    viewBox: `0 0 ${width} ${height}`,
    // the staves scroll sideways, so the headings stay near the left edge,
    // where they are visible without scrolling
    titleX: 300,
    heading: { x: 300, y: 62, text: labelHeading },
    labels: Array.from({ length: frets + 1 }, (_, fret) => ({
      key: `col-${fret}`,
      x: colX(fret) + COL_W / 2,
      y: 112,
      text: String(fret),
    })),
  }
}
