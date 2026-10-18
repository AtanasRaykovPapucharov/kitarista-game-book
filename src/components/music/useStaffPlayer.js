import { onBeforeUnmount, ref } from 'vue'
import { STRING_DURATION, createAudioContext, stringBuffer } from './guitarSynth'

/* =====================================================
   Plays a note sheet timeline (see buildTimeline in notation.js)
   - every note rings for its written length, then is damped
   - tied notes are held, not played again
   - optional click on each beat, accented on the downbeat
   - `current` follows the note that is sounding, for highlighting
===================================================== */

export function useStaffPlayer() {
  const isPlaying = ref(false)
  const current = ref(null) // { staff, index }

  let ctx = null
  let bus = null
  let raf = null
  let endTimer = null
  let marks = []

  function ensureContext() {
    if (!ctx) ctx = createAudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }

  function pluck(voices, { midi, string }, time, seconds) {
    const src = ctx.createBufferSource()
    src.buffer = stringBuffer(ctx, midi)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.26, time)
    src.connect(g)
    g.connect(bus)

    // a new note on the same string stops the one before
    const prev = voices.get(string)
    if (prev && prev.end > time) prev.gain.gain.setTargetAtTime(0, time, 0.01)

    const ring = Math.min(seconds, STRING_DURATION)
    const end = time + ring + 0.2
    g.gain.setTargetAtTime(0, time + ring, 0.05)
    src.start(time)
    src.stop(end)
    voices.set(string, { gain: g, end })
  }

  function click(time, accent) {
    const osc = ctx.createOscillator()
    osc.frequency.value = accent ? 1500 : 1000
    const g = ctx.createGain()
    g.gain.setValueAtTime(accent ? 0.22 : 0.12, time)
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.04)
    osc.connect(g)
    g.connect(bus)
    osc.start(time)
    osc.stop(time + 0.05)
  }

  function frame() {
    const now = ctx.currentTime
    let latest = null
    for (const m of marks) {
      if (m.time <= now) latest = m
      else break
    }
    const next = latest ? { staff: latest.staff, index: latest.index } : null
    if (next?.staff !== current.value?.staff || next?.index !== current.value?.index)
      current.value = next
    raf = requestAnimationFrame(frame)
  }

  /**
   * @param timeline { events, barStarts }
   * @param options  { tempo, loop, click, from: { staff, index } }
   */
  function play(timeline, options = {}) {
    stop()
    const { tempo = 90, loop = false, from = null } = options
    const events = timeline.events || []
    let first = from ? events.findIndex((e) => e.staff === from.staff && e.index === from.index) : 0
    if (first < 0) first = 0
    // starting on a held note: go back to where it was played
    while (first > 0 && events[first].tiedIn) first--
    const list = events.slice(first)
    if (!list.length || list.every((e) => e.rest)) return

    ensureContext()
    bus = ctx.createGain()
    bus.connect(ctx.destination)

    const spb = 60 / tempo
    const offset = list[0].start
    const t0 = ctx.currentTime + 0.1
    const at = (beats) => t0 + (beats - offset) * spb
    const voices = new Map()

    marks = []
    for (const e of list) {
      marks.push({ time: at(e.start), staff: e.staff, index: e.index })
      if (e.rest || e.tiedIn) continue
      for (const n of e.notes) pluck(voices, n, at(e.start), e.soundBeats * spb)
    }

    const last = list[list.length - 1]
    const endBeats = last.start + last.beats
    if (options.click) {
      const bars = new Set((timeline.barStarts || []).map((b) => Math.round(b * 1000)))
      for (let b = Math.ceil(offset - 1e-6); b < endBeats - 1e-6; b++) {
        click(at(b), bars.has(Math.round(b * 1000)))
      }
    }

    isPlaying.value = true
    raf = requestAnimationFrame(frame)
    endTimer = setTimeout(
      () => (loop ? play(timeline, options) : stop()),
      (endBeats - offset) * spb * 1000 + 150,
    )
  }

  function stop() {
    clearTimeout(endTimer)
    if (raf) cancelAnimationFrame(raf)
    endTimer = null
    raf = null
    if (bus && ctx) {
      const old = bus
      old.gain.setTargetAtTime(0, ctx.currentTime, 0.02)
      setTimeout(() => old.disconnect(), 300)
    }
    bus = null
    marks = []
    current.value = null
    isPlaying.value = false
  }

  // sound one note or chord right away, for feedback while writing
  let previewBus = null
  function preview(positions, seconds = 0.9) {
    if (!positions?.length || isPlaying.value) return
    ensureContext()
    if (!previewBus) {
      previewBus = ctx.createGain()
      previewBus.connect(ctx.destination)
    }
    const saved = bus
    bus = previewBus
    const voices = new Map()
    for (const n of positions) pluck(voices, n, ctx.currentTime + 0.02, seconds)
    bus = saved
  }

  onBeforeUnmount(() => {
    stop()
    if (ctx) ctx.close()
    ctx = null
  })

  return { isPlaying, current, play, stop, preview }
}
