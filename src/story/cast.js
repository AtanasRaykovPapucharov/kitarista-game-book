/* =====================================================
   Who is who, by the reader's form of address.
   In the story text:
     {hero}   – the protagonist's name
     {friend} – the friend from school (the one who leaves at the end of the month)
     ‹for her|for him› – words about the friend: the first form when the
                        friend is a girl (Виктория / Вики), the second when
                        the friend is a boy (Виктор)
   A boy reader is Томи with Виктория; a girl reader is Таня with Виктор.
   "Other": masculine address → like a boy, feminine → like a girl,
   neutral or plural → Ники with Вики (both names are used for anyone).
===================================================== */

export const CAST = {
  bg: {
    m: { hero: 'Томи', friend: 'Виктория', friendIs: 'f' },
    f: { hero: 'Таня', friend: 'Виктор', friendIs: 'm' },
    n: { hero: 'Ники', friend: 'Вики', friendIs: 'f' },
  },
  en: {
    m: { hero: 'Tome', friend: 'Victoria', friendIs: 'f' },
    f: { hero: 'Tanya', friend: 'Victor', friendIs: 'm' },
    n: { hero: 'Niki', friend: 'Vicky', friendIs: 'f' },
  },
}

export function castFor(locale, address) {
  const lang = String(locale ?? '').startsWith('bg') ? 'bg' : 'en'
  const a = address === 'p' ? 'n' : address
  return CAST[lang][a] ?? CAST[lang].m
}

export const FRIEND_FORM = /‹([^‹›|]*)\|([^‹›|]*)›/g

/** Puts the names and the friend's word forms into a text. */
export function applyCast(text, cast) {
  return String(text ?? '')
    .replace(FRIEND_FORM, (m, her, him) => (cast.friendIs === 'm' ? him : her))
    .replace(/\{hero\}/g, cast.hero)
    .replace(/\{friend\}/g, cast.friend)
}
