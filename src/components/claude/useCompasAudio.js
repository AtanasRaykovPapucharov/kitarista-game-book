import { onBeforeUnmount, ref, watch } from 'vue'
import { parseNotes, staffGroups, voiceChord } from './music'
import {
  STRING_DURATION,
  createAudioContext,
  stringBuffer as sharedStringBuffer,
} from 'src/components/music/guitarSynth'

/* =====================================================
   Audio engine for the compás editor
   - look-ahead scheduler (Web Audio clock)
   - palmas / wood / cymbal clicks
   - plucked-string guitar (Karplus-Strong) for chords & notes
   - techniques: rasgueo, abanico, alzapúa, arpegio, trémolo,
     apagado, ligado, golpe
===================================================== */

const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD = 0.12

export function useCompasAudio(sheet, { loopBar } = {}) {
  const isPlaying = ref(false)
  const position = ref(null) // { bar, beat, countIn }

  let ctx = null
  let master = null
  let playBus = null
  let previewBus = null
  let timer = null
  let raf = null
  let nextTime = 0
  let cursor = null
  let compasCount = 0
  let queue = []
  let lastCell = null // previous beat played, for ties into the next beat
  const voices = new Map()

  /* ---------------- context & buses ---------------- */

  function ensureContext() {
    if (!ctx) {
      ctx = createAudioContext()
      master = ctx.createGain()
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }

  function createBus() {
    const out = ctx.createGain()
    out.connect(master)

    const click = ctx.createGain()
    click.gain.value = sheet.settings.clickVolume
    click.connect(out)

    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 4200
    tone.Q.value = 0.4
    tone.connect(out)

    const guitar = ctx.createGain()
    guitar.gain.value = sheet.settings.guitarVolume
    guitar.connect(tone)

    return { out, click, guitar }
  }

  function closeBus(bus) {
    if (!bus || !ctx) return
    bus.out.gain.setTargetAtTime(0, ctx.currentTime, 0.02)
    setTimeout(() => bus.out.disconnect(), 400)
  }

  watch(
    () => [sheet.settings.clickVolume, sheet.settings.guitarVolume],
    ([clickVol, guitarVol]) => {
      for (const bus of [playBus, previewBus]) {
        if (!bus) continue
        bus.click.gain.setTargetAtTime(clickVol, ctx.currentTime, 0.02)
        bus.guitar.gain.setTargetAtTime(guitarVol, ctx.currentTime, 0.02)
      }
    },
  )

  /* ---------------- noise helper ---------------- */

  function noiseSource(seconds, shape = (i, n) => 1 - i / n) {
    const size = Math.max(1, Math.floor(ctx.sampleRate * seconds))
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * shape(i, size)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    return src
  }

  /* ---------------- clicks ---------------- */

  function clap(bus, time, accented, scale = 1) {
    const noise = noiseSource(0.015)
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = accented ? 2200 : 1400
    band.Q.value = accented ? 1.6 : 1.0
    const high = ctx.createBiquadFilter()
    high.type = 'highpass'
    high.frequency.value = 700

    const gain = ctx.createGain()
    const peak = (accented ? 1.0 : 0.5) * scale
    const decay = accented ? 0.07 : 0.045
    gain.gain.setValueAtTime(0.001, time)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.002, peak), time + 0.003)
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay)

    noise.connect(band)
    band.connect(high)
    high.connect(gain)
    gain.connect(bus.click)
    noise.start(time)
    noise.stop(time + decay + 0.01)
  }

  function wood(bus, time, accented, scale = 1) {
    const osc = ctx.createOscillator()
    osc.frequency.value = accented ? 880 : 440
    const og = ctx.createGain()
    og.gain.setValueAtTime((accented ? 0.25 : 0.15) * scale, time)
    og.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
    osc.connect(og)
    og.connect(bus.click)
    osc.start(time)
    osc.stop(time + 0.06)

    const noise = noiseSource(0.02, () => 1)
    const filter = ctx.createBiquadFilter()
    filter.type = accented ? 'bandpass' : 'lowpass'
    filter.frequency.value = accented ? 1800 : 800
    filter.Q.value = accented ? 1.2 : 0.7
    const ng = ctx.createGain()
    ng.gain.setValueAtTime((accented ? 0.9 : 0.5) * scale, time)
    ng.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
    noise.connect(filter)
    filter.connect(ng)
    ng.connect(bus.click)
    noise.start(time)
    noise.stop(time + 0.06)
  }

  function cymbal(bus, time, accented, scale = 1) {
    const noise = noiseSource(0.5, () => 1)
    const high = ctx.createBiquadFilter()
    high.type = 'highpass'
    high.frequency.value = accented ? 4000 : 2500
    const b1 = ctx.createBiquadFilter()
    b1.type = 'bandpass'
    b1.frequency.value = 6000
    b1.Q.value = 3
    const b2 = ctx.createBiquadFilter()
    b2.type = 'bandpass'
    b2.frequency.value = 9000
    b2.Q.value = 4

    const gain = ctx.createGain()
    const peak = (accented ? 0.6 : 0.3) * scale
    const decay = accented ? 0.6 : 0.35
    gain.gain.setValueAtTime(0.001, time)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.002, peak), time + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay)

    noise.connect(high)
    high.connect(b1)
    b1.connect(b2)
    b2.connect(gain)
    gain.connect(bus.click)
    noise.start(time)
    noise.stop(time + decay + 0.1)
  }

  function playClick(bus, time, accented, scale = 1) {
    const sounds = sheet.settings.sounds
    if (sounds.includes('clapping')) clap(bus, time, accented, scale)
    if (sounds.includes('percussion')) wood(bus, time, accented, scale)
    if (sounds.includes('cymbal')) cymbal(bus, time, accented, scale)
  }

  /* ---------------- guitar ---------------- */

  // Karplus-Strong plucked string, shared with the note sheet player
  const stringBuffer = (midi) => sharedStringBuffer(ctx, midi)

  function pluck(bus, { midi, string }, time, { gain = 0.24, damp = 0 } = {}) {
    const src = ctx.createBufferSource()
    src.buffer = stringBuffer(midi)
    const g = ctx.createGain()
    g.gain.setValueAtTime(gain, time)
    src.connect(g)
    g.connect(bus.guitar)

    // a new note on the same string stops the previous one
    const prev = voices.get(string)
    if (prev && prev.end > time) prev.gain.gain.setTargetAtTime(0, time, 0.01)

    let end = time + STRING_DURATION
    if (damp) {
      g.gain.setTargetAtTime(0, time + damp, 0.015)
      end = time + damp + 0.15
    }
    src.start(time)
    src.stop(end)
    voices.set(string, { gain: g, end })
  }

  function strum(bus, notes, time, direction, { velocity = 1, damp = 0, only } = {}) {
    let list = direction === 'up' ? [...notes].reverse() : notes
    if (only === 'bass') list = list.filter((n) => n.string >= 4)
    if (only === 'treble' || direction === 'up') list = list.filter((n) => n.string <= 4)
    const gap = direction === 'up' ? 0.009 : 0.013
    list.forEach((n, i) => {
      pluck(bus, n, time + i * gap, { gain: 0.2 * velocity * (1 - i * 0.04), damp })
    })
  }

  function golpe(bus, time, velocity = 1) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, time)
    osc.frequency.exponentialRampToValueAtTime(55, time + 0.08)
    const og = ctx.createGain()
    og.gain.setValueAtTime(0.0001, time)
    og.gain.exponentialRampToValueAtTime(0.7 * velocity, time + 0.004)
    og.gain.exponentialRampToValueAtTime(0.0001, time + 0.12)
    osc.connect(og)
    og.connect(bus.guitar)
    osc.start(time)
    osc.stop(time + 0.14)

    const tap = noiseSource(0.03)
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = 900
    band.Q.value = 0.9
    const tg = ctx.createGain()
    tg.gain.value = 0.5 * velocity
    tap.connect(band)
    band.connect(tg)
    tg.connect(bus.guitar)
    tap.start(time)
    tap.stop(time + 0.04)
  }

  function transpose(notes, capo) {
    return notes.map((n) => ({ string: n.string, midi: n.midi + capo }))
  }

  function scheduleGuitar(bus, cell, time, secondsPerBeat, accented, { tiedIn = false } = {}) {
    const tech = new Set(cell.techniques || [])
    const capo = Number(sheet.capo) || 0
    const velocity = accented ? 1.15 : 0.9
    const damp = tech.has('apagado') ? 0.09 : 0
    const voicing = cell.chord ? voiceChord(cell.chord) : null

    if (voicing && voicing.notes.length) {
      const notes = transpose(voicing.notes, capo)
      const direction = cell.stroke || 'down'

      if (tech.has('rasgueo')) {
        const step = secondsPerBeat / 4
        for (let i = 0; i < 4; i++) {
          strum(bus, notes, time + i * step, 'down', {
            velocity: velocity * (i === 3 ? 1.1 : 0.75),
            damp,
          })
        }
      } else if (tech.has('abanico')) {
        const step = secondsPerBeat / 3
        ;['down', 'down', 'up'].forEach((dir, i) => {
          strum(bus, notes, time + i * step, dir, { velocity: velocity * 0.9, damp })
        })
      } else if (tech.has('alzapua')) {
        const step = secondsPerBeat / 3
        pluck(bus, notes[0], time, { gain: 0.26 * velocity, damp })
        strum(bus, notes, time + step, 'down', { velocity, damp, only: 'bass' })
        strum(bus, notes, time + 2 * step, 'up', { velocity: velocity * 0.85, damp })
      } else if (tech.has('arpegio')) {
        const step = secondsPerBeat / notes.length
        notes.forEach((n, i) => pluck(bus, n, time + i * step, { gain: 0.22 * velocity, damp }))
      } else {
        strum(bus, notes, time, direction, { velocity, damp })
      }
    }

    const { groups } = parseNotes(cell.notes)
    if (groups.length) {
      const repeats = tech.has('tremolo') ? 4 : 1
      const step = secondsPerBeat / (groups.length * repeats)
      let k = 0
      groups.forEach((group, gi) => {
        for (let r = 0; r < repeats; r++) {
          const soft = (tech.has('ligado') && gi > 0) || (repeats > 1 && r > 0)
          for (const n of transpose(group, capo)) {
            pluck(bus, n, time + k * step, { gain: (soft ? 0.15 : 0.25) * velocity, damp })
          }
          k++
        }
      })
    }

    // staff notes play one after another; a quarter note is one beat,
    // longer values ring on into the following beats
    // a note tied from the one before is held, not played again
    const staff = staffGroups(cell.staff, { tiedIn })
    if (staff.length) {
      let at = time
      staff.forEach((group, gi) => {
        if (group.rest || group.tiedIn) {
          at += group.beats * secondsPerBeat
          return
        }
        const length = group.beats * secondsPerBeat
        const repeats = tech.has('tremolo') ? Math.max(1, Math.round(group.beats * 4)) : 1
        for (let r = 0; r < repeats; r++) {
          const soft = (tech.has('ligado') && gi > 0) || r > 0
          for (const n of transpose(group.notes, capo)) {
            pluck(bus, n, at + (r * length) / repeats, {
              gain: (soft ? 0.15 : 0.25) * velocity,
              damp,
            })
          }
        }
        at += length
      })
    }

    if (tech.has('golpe')) golpe(bus, time, velocity)
  }

  /* ---------------- transport ---------------- */

  function scheduleStep(time, secondsPerBeat) {
    const n = sheet.pattern.length
    const beatIndex = cursor.beat % n
    const beat = sheet.pattern[beatIndex]
    const s = sheet.settings

    if (cursor.countIn > 0) {
      if (s.click) playClick(playBus, time, beat.accent)
      return
    }

    const bar = sheet.bars[cursor.bar]
    const cell = bar?.cells[beatIndex]
    const prevStaff = lastCell?.staff
    const tiedIn = !!prevStaff?.length && !!prevStaff[prevStaff.length - 1]?.tie
    lastCell = cell ?? null
    if (s.click && !cell?.silent) playClick(playBus, time, beat.accent)
    if (s.click && s.offbeat) playClick(playBus, time + secondsPerBeat / 2, false, 0.4)
    if (s.guitar && cell)
      scheduleGuitar(playBus, cell, time, secondsPerBeat, beat.accent, { tiedIn })
  }

  function nextBar(index) {
    const loop = loopBar?.value
    if (loop !== null && loop !== undefined && loop < sheet.bars.length) return loop
    return (index + 1) % sheet.bars.length
  }

  function onCompasDone() {
    compasCount++
    const t = sheet.settings.trainer
    if (t.enabled && t.every > 0 && compasCount % t.every === 0) {
      sheet.tempo = Math.min(Number(t.max) || 300, sheet.tempo + Number(t.step || 0))
    }
  }

  function advance() {
    const n = sheet.pattern.length
    if (cursor.countIn > 0) {
      cursor.countIn--
      cursor.beat = (cursor.beat + 1) % n
      return
    }
    cursor.beat++
    if (cursor.beat >= n) {
      cursor.beat = 0
      onCompasDone()
      const bar = sheet.bars[cursor.bar]
      cursor.rep++
      if (cursor.rep >= (bar?.repeat || 1)) {
        cursor.rep = 0
        cursor.bar = nextBar(cursor.bar)
      }
    }
    if (cursor.bar >= sheet.bars.length) cursor.bar = 0
  }

  function tick() {
    if (!sheet.pattern.length || !sheet.bars.length) return
    while (nextTime < ctx.currentTime + SCHEDULE_AHEAD) {
      const secondsPerBeat = 60 / sheet.tempo
      const countIn = cursor.countIn > 0
      scheduleStep(nextTime, secondsPerBeat)
      queue.push({
        time: nextTime,
        bar: countIn ? null : cursor.bar,
        beat: cursor.beat % sheet.pattern.length,
        countIn,
      })
      nextTime += secondsPerBeat
      advance()
    }
  }

  function frame() {
    const now = ctx.currentTime
    let latest = null
    while (queue.length && queue[0].time <= now) latest = queue.shift()
    if (latest) position.value = { bar: latest.bar, beat: latest.beat, countIn: latest.countIn }
    raf = requestAnimationFrame(frame)
  }

  function start(fromBar = 0) {
    stop()
    if (!sheet.pattern.length || !sheet.bars.length) return

    ensureContext()
    playBus = createBus()

    const loop = loopBar?.value
    const firstBar = loop !== null && loop !== undefined ? loop : fromBar
    cursor = {
      bar: Math.min(Math.max(0, firstBar), sheet.bars.length - 1),
      beat: 0,
      rep: 0,
      countIn: sheet.settings.countIn ? sheet.pattern.length : 0,
    }
    compasCount = 0
    lastCell = null
    queue = []
    nextTime = ctx.currentTime + 0.08

    timer = setInterval(tick, LOOKAHEAD_MS)
    tick()
    raf = requestAnimationFrame(frame)
    isPlaying.value = true
  }

  function stop() {
    if (timer) clearInterval(timer)
    if (raf) cancelAnimationFrame(raf)
    timer = null
    raf = null
    closeBus(playBus)
    playBus = null
    voices.clear()
    queue = []
    position.value = null
    isPlaying.value = false
  }

  function toggle(fromBar = 0) {
    if (isPlaying.value) stop()
    else start(fromBar)
  }

  // play one beat immediately, for instant feedback while editing
  function preview(cell, accented = true) {
    if (!cell) return
    ensureContext()
    if (!previewBus) previewBus = createBus()
    scheduleGuitar(previewBus, cell, ctx.currentTime + 0.03, 60 / sheet.tempo, accented)
  }

  onBeforeUnmount(() => {
    stop()
    if (ctx) ctx.close()
    ctx = null
  })

  return { isPlaying, position, start, stop, toggle, preview }
}
