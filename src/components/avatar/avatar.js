/* =====================================================
   Avatars: a small face built from parts (after the
   key-app-client UserProfile builder), plus an optional
   uploaded picture.

   An avatar is stored on the user as either
     { kind: 'built', config: { skin, hair, … } }
     { kind: 'image', src: 'data:image/webp;base64,…' }
   Every value is checked against the lists below before it
   is drawn, so a hand-edited backup file can't inject markup.
===================================================== */

export const AVATAR_OPTIONS = {
  skin: ['#f7d7bc', '#f2c39b', '#d9a27a', '#c8865d', '#8d5524', '#5c3a21'],
  hair: ['short', 'wave', 'long', 'curly', 'bun', 'bald'],
  hairColor: [
    '#121212',
    '#2f2118',
    '#6f4e37',
    '#b36b24',
    '#f0d06a',
    '#c0c0c8',
    '#7b5cd6',
    '#2fa6c1',
  ],
  eyes: ['calm', 'bright', 'focus', 'wink'],
  eyeColor: ['#1b1b1b', '#5b3a29', '#1f5f8b', '#2e7d32', '#7e57c2'],
  nose: ['soft', 'round', 'sharp'],
  mouth: ['smile', 'grin', 'line', 'open'],
  accessory: ['none', 'headphones', 'cap', 'beanie', 'glasses', 'stars'],
  shirt: ['#1f2347', '#2fa6c1', '#5b4a9e', '#b23a4e', '#2f7a52', '#e8e6f4'],
  background: ['#141731', '#1f2347', '#2a2458', '#3b3170', '#0a6c80', '#5b4a9e'],
}

export const AVATAR_PARTS = Object.keys(AVATAR_OPTIONS)
const COLOR_PARTS = new Set(['skin', 'hairColor', 'eyeColor', 'shirt', 'background'])
export const isColorPart = (part) => COLOR_PARTS.has(part)

/* ---------- configs ---------- */

function hash(text) {
  let h = 2166136261
  for (const ch of String(text)) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0
  return h
}

/** The same name always gives the same face – a default for everyone. */
export function seededConfig(seed) {
  let h = hash(seed || 'kitarista')
  const config = {}
  for (const part of AVATAR_PARTS) {
    const list = AVATAR_OPTIONS[part]
    config[part] = list[h % list.length]
    h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0
  }
  return config
}

export function randomConfig() {
  const config = {}
  for (const part of AVATAR_PARTS) {
    const list = AVATAR_OPTIONS[part]
    config[part] = list[Math.floor(Math.random() * list.length)]
  }
  return config
}

/** Keeps only known values; anything else falls back to the seeded default. */
export function sanitizeConfig(config, seed) {
  const base = seededConfig(seed)
  const out = {}
  for (const part of AVATAR_PARTS) {
    out[part] = AVATAR_OPTIONS[part].includes(config?.[part]) ? config[part] : base[part]
  }
  return out
}

const IMAGE_RE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/
export const MAX_IMAGE_LENGTH = 400_000

/** A stored avatar, cleaned; null when it can't be trusted. */
export function sanitizeAvatar(avatar, seed) {
  if (!avatar || typeof avatar !== 'object') return null
  if (avatar.kind === 'image') {
    return typeof avatar.src === 'string' &&
      avatar.src.length <= MAX_IMAGE_LENGTH &&
      IMAGE_RE.test(avatar.src)
      ? { kind: 'image', src: avatar.src }
      : null
  }
  if (avatar.kind === 'built') return { kind: 'built', config: sanitizeConfig(avatar.config, seed) }
  return null
}

/* ---------- drawing (200 × 200) ---------- */

export function avatarSvg(cfg) {
  const c = sanitizeConfig(cfg)

  // long hair falls behind the head and shoulders
  const hairBack =
    {
      long: `<path d="M44 92c-4 40 0 72 12 96h88c12-24 16-56 12-96z" fill="${c.hairColor}"/>`,
      curly: `<g fill="${c.hairColor}"><circle cx="50" cy="128" r="14"/><circle cx="150" cy="128" r="14"/><circle cx="46" cy="104" r="15"/><circle cx="154" cy="104" r="15"/></g>`,
    }[c.hair] ?? ''

  const hair = {
    short: `<path d="M40 88c5-35 27-55 60-55s55 20 60 55c-23-18-82-18-120 0z" fill="${c.hairColor}"/>`,
    wave: `<path d="M39 91c-1-38 26-61 61-61 28 0 50 15 59 42-14-8-24-5-35-15-14-13-41-7-59 4-10 6-17 17-26 30z" fill="${c.hairColor}"/>`,
    long: `<path d="M43 92c2-38 25-60 57-60s55 22 57 60c-12-14-22-20-35-24-14 10-30 14-44 12-14 2-26 6-35 12z" fill="${c.hairColor}"/>`,
    curly: `<g fill="${c.hairColor}"><circle cx="62" cy="66" r="18"/><circle cx="86" cy="52" r="19"/><circle cx="114" cy="52" r="19"/><circle cx="138" cy="66" r="18"/><circle cx="50" cy="86" r="15"/><circle cx="150" cy="86" r="15"/></g>`,
    bun: `<circle cx="100" cy="36" r="17" fill="${c.hairColor}"/><path d="M42 90c4-34 26-54 58-54s54 20 58 54c-22-16-80-16-116 0z" fill="${c.hairColor}"/>`,
    bald: '',
  }[c.hair]

  const eyes = {
    calm: `<path d="M76 99h18M106 99h18" stroke="${c.eyeColor}" stroke-width="5" stroke-linecap="round"/>`,
    bright: `<circle cx="84" cy="98" r="5" fill="${c.eyeColor}"/><circle cx="116" cy="98" r="5" fill="${c.eyeColor}"/><circle cx="86" cy="96" r="1.6" fill="#fff"/><circle cx="118" cy="96" r="1.6" fill="#fff"/>`,
    focus: `<path d="M75 94c7-4 14-4 20 0M105 94c7-4 14-4 20 0" stroke="${c.eyeColor}" stroke-width="4" stroke-linecap="round"/><circle cx="85" cy="101" r="4" fill="${c.eyeColor}"/><circle cx="115" cy="101" r="4" fill="${c.eyeColor}"/>`,
    wink: `<circle cx="84" cy="98" r="5" fill="${c.eyeColor}"/><path d="M107 99c5-5 12-5 17 0" stroke="${c.eyeColor}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`,
  }[c.eyes]

  const nose = {
    soft: '<path d="M101 104c-4 9-2 15 5 16" stroke="#9b6043" stroke-width="4" stroke-linecap="round" fill="none" opacity=".7"/>',
    round: '<ellipse cx="101" cy="116" rx="6" ry="4" fill="#000" opacity=".16"/>',
    sharp:
      '<path d="M101 101l-7 19h12" stroke="#9b6043" stroke-width="4" stroke-linejoin="round" fill="none" opacity=".7"/>',
  }[c.nose]

  const mouth = {
    smile:
      '<path d="M84 132c10 12 24 12 34 0" stroke="#7d2f2f" stroke-width="5" stroke-linecap="round" fill="none"/>',
    grin: '<path d="M82 129c6 16 32 16 38 0z" fill="#7d2f2f"/><path d="M86 130h30" stroke="#fff" stroke-width="3"/>',
    line: '<path d="M87 134h28" stroke="#7d2f2f" stroke-width="5" stroke-linecap="round"/>',
    open: '<ellipse cx="101" cy="134" rx="11" ry="7" fill="#7d2f2f"/>',
  }[c.mouth]

  const ears = `<circle cx="48" cy="108" r="11" fill="${c.skin}"/><circle cx="152" cy="108" r="11" fill="${c.skin}"/>`

  const accessory = {
    none: '',
    headphones:
      '<path d="M46 112c-4-48 22-74 54-74s58 26 54 74" stroke="#1b1b2e" stroke-width="9" fill="none" stroke-linecap="round"/><rect x="34" y="96" width="20" height="32" rx="9" fill="#2fa6c1"/><rect x="146" y="96" width="20" height="32" rx="9" fill="#2fa6c1"/>',
    cap: '<path d="M55 70c10-24 79-24 90 0v12H55z" fill="#2fa6c1"/><path d="M138 77h32c-8 10-19 14-32 12z" fill="#1f7a8e"/>',
    beanie:
      '<path d="M46 86c0-36 24-56 54-56s54 20 54 56z" fill="#5b4a9e"/><rect x="42" y="78" width="116" height="16" rx="8" fill="#7b68c8"/><circle cx="100" cy="28" r="9" fill="#e8e6f4"/>',
    glasses:
      '<circle cx="84" cy="100" r="13" fill="none" stroke="#111" stroke-width="4"/><circle cx="116" cy="100" r="13" fill="none" stroke="#111" stroke-width="4"/><path d="M97 100h6" stroke="#111" stroke-width="4"/>',
    stars:
      '<g fill="#ffe082"><path d="M34 44l3 8 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z"/><path d="M160 30l2.4 6 6.4.8-4.8 4 1.6 6.4-5.6-3.2-5.6 3.2 1.6-6.4-4.8-4 6.4-.8z"/><path d="M168 74l2 5 5 .6-4 3 1.3 5-4.3-2.6-4.3 2.6 1.3-5-4-3 5-.6z"/></g>',
  }[c.accessory]

  // shoulders, and a guitar strap across them
  const body = `<path d="M34 200c4-30 30-44 66-44s62 14 66 44z" fill="${c.shirt}"/><path d="M64 162l60 38" stroke="#1b1b2e" stroke-width="9" stroke-linecap="round" opacity=".85"/><circle cx="66" cy="163" r="4" fill="#c0c0c8"/>`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">` +
    `<rect width="200" height="200" fill="${c.background}"/>` +
    hairBack +
    body +
    `<rect x="88" y="150" width="24" height="18" fill="${c.skin}"/>` +
    ears +
    `<circle cx="100" cy="110" r="55" fill="${c.skin}"/>` +
    hair +
    eyes +
    nose +
    mouth +
    accessory +
    `</svg>`
  )
}

const toBase64 = (text) =>
  typeof window !== 'undefined' ? window.btoa(text) : Buffer.from(text).toString('base64') // the SVG is plain ASCII

export const svgDataUrl = (cfg) => `data:image/svg+xml;base64,${toBase64(avatarSvg(cfg))}`

/** What an <img> should show for a user (always something). */
export function avatarSrc(avatar, seed) {
  const clean = sanitizeAvatar(avatar, seed)
  if (clean?.kind === 'image') return clean.src
  return svgDataUrl(clean?.config ?? seededConfig(seed))
}

/** Shrinks an uploaded picture to a 256 × 256 square (centre crop) as WebP/JPEG. */
export function fileToAvatarImage(file, size = 256) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) return reject(new Error('not-an-image'))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      canvas
        .getContext('2d')
        .drawImage(
          img,
          (img.naturalWidth - side) / 2,
          (img.naturalHeight - side) / 2,
          side,
          side,
          0,
          0,
          size,
          size,
        )
      URL.revokeObjectURL(url)
      let src = canvas.toDataURL('image/webp', 0.85)
      if (!src.startsWith('data:image/webp')) src = canvas.toDataURL('image/jpeg', 0.85)
      resolve(src)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('unreadable'))
    }
    img.src = url
  })
}
