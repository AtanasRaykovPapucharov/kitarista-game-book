/* =====================================================
   Creator and support links, from QCLI_* env variables
   (.env in production, .env.example in development until
   a .env exists – see quasar.config.js). Empty values hide
   the entry. Each variable is read by its full name because
   Vite replaces import.meta.env.QCLI_* at build time.
===================================================== */

const clean = (v) => (typeof v === 'string' ? v.trim() : '')

export const creator = {
  name: clean(import.meta.env.QCLI_CREATOR_NAME),
  github: clean(import.meta.env.QCLI_CREATOR_GITHUB),
  website: clean(import.meta.env.QCLI_CREATOR_WEBSITE),
  email: clean(import.meta.env.QCLI_CREATOR_EMAIL),
}

/*
  kind 'link'    – opens a payment page
  kind 'address' – a wallet address to copy; `uri` opens a wallet app
*/
const ALL_METHODS = [
  // {
  //   id: 'buymeacoffee',
  //   kind: 'link',
  //   icon: 'local_cafe',
  //   value: clean(import.meta.env.QCLI_SUPPORT_BUYMEACOFFEE),
  // },
  {
    id: 'revolut',
    kind: 'link',
    icon: 'credit_card',
    value: clean(import.meta.env.QCLI_SUPPORT_REVOLUT),
  },
  // {
  //   id: 'paypal',
  //   kind: 'link',
  //   icon: 'account_balance_wallet',
  //   value: clean(import.meta.env.QCLI_SUPPORT_PAYPAL),
  // },
  {
    id: 'lightning',
    kind: 'address',
    icon: 'bolt',
    value: clean(import.meta.env.QCLI_SUPPORT_LIGHTNING),
    uri: (v) => `lightning:${v}`,
  },
  // {
  //   id: 'btc',
  //   kind: 'address',
  //   icon: 'currency_bitcoin',
  //   value: clean(import.meta.env.QCLI_SUPPORT_BTC),
  //   uri: (v) => `bitcoin:${v}`,
  // },
  // {
  //   id: 'eth',
  //   kind: 'address',
  //   icon: 'diamond',
  //   value: clean(import.meta.env.QCLI_SUPPORT_ETH),
  //   uri: (v) => `ethereum:${v}`,
  // },
  // {
  //   id: 'usdt',
  //   kind: 'address',
  //   icon: 'paid',
  //   value: clean(import.meta.env.QCLI_SUPPORT_USDT_TRC20),
  // },
]

export const supportMethods = ALL_METHODS.filter((m) => m.value)

/* ---------- more ways to help (all optional, from .env) ---------- */

// QCLI_SUPPORTERS="Мария, Иван; Петър" – names for the thank-you wall
export const supporters = clean(import.meta.env.QCLI_SUPPORTERS)
  .split(/[;,]/)
  .map((n) => n.trim())
  .filter(Boolean)

// QCLI_LESSONS_URL – where people can book real guitar lessons with the author
export const lessonsUrl = clean(import.meta.env.QCLI_LESSONS_URL)

// QCLI_FEEDBACK_URL – a form or an issues page; falls back to the creator's e-mail
export const feedbackUrl =
  clean(import.meta.env.QCLI_FEEDBACK_URL) ||
  (creator.email ? `mailto:${creator.email}?subject=Kitarista` : '')

// the method a "support" tier opens: the first one that is a plain link
export const primaryMethod = supportMethods.find((m) => m.kind === 'link') ?? null
