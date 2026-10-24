/* =====================================================
   Bulgarian for the practice-room tools (Scales & modes,
   Note sheet, Compás sheet, Tuner). These components were
   written in English; instead of rewriting them, this
   translator watches the page and, while the language is
   Bulgarian, swaps known English texts (text, title,
   aria-label, placeholder) for Bulgarian ones – and puts
   the English back when the language changes.
   Add a phrase: put it in BG below, exactly as shown.
   Chord symbols, palos and font names stay as they are.
===================================================== */

const BG = {
  // ---------- general ----------
  Add: 'Добави',
  Cancel: 'Отказ',
  Clear: 'Изчисти',
  'Clear All': 'Изчисти всичко',
  Close: 'Затвори',
  Delete: 'Изтрий',
  Done: 'Готово',
  Duplicate: 'Дублирай',
  Export: 'Експорт',
  Import: 'Импорт',
  Hide: 'Скрий',
  Show: 'Покажи',
  Name: 'Име',
  Text: 'Текст',
  Settings: 'Настройки',
  Print: 'Печат',
  Undo: 'Отмени',
  Redo: 'Повтори',
  Paste: 'Постави',
  Play: 'Свири',
  Stop: 'Спри',
  Loop: 'Повтаряй',
  Repeat: 'Повторение',
  Practice: 'Упражнение',
  Volume: 'Сила на звука',
  Auto: 'Автоматично',
  Manual: 'Ръчно',
  Custom: 'Друго',
  Empty: 'Празно',
  Deselect: 'Премахни избора',
  Tap: 'Тупни',
  'Move up': 'Премести нагоре',
  'Move down': 'Премести надолу',
  'Undo (Ctrl Z)': 'Отмени (Ctrl Z)',
  'Redo (Ctrl Shift Z)': 'Повтори (Ctrl Shift Z)',
  'Undo or redo': 'Отмени или повтори',
  'Keyboard shortcuts': 'Клавишни комбинации',
  'Print or save as PDF': 'Печат или запис като PDF',
  'Close settings': 'Затвори настройките',
  'Failed to load image': 'Картината не се зареди',
  'Clipboard is blocked by the browser. Use Export instead.':
    'Браузърът не дава достъп до клипборда. Използвай „Експорт“.',
  'The print window was blocked. Allow pop-ups for this site and try again.':
    'Прозорецът за печат беше блокиран. Разреши изскачащите прозорци за сайта и опитай пак.',
  'Copied as text': 'Копирано като текст',
  'Copy as text': 'Копирай като текст',
  Enter: 'Enter',
  Escape: 'Esc',
  Space: 'Интервал',
  Backspace: 'Backspace',

  // ---------- scales, modes, chords, fretboard ----------
  Scales: 'Гами',
  'Major Scales': 'Мажорни гами',
  'Minor Scales': 'Минорни гами',
  'Ancient Scales': 'Старинни ладове',
  'Circle of Fifths': 'Квинтов кръг',
  'Circle of fifths': 'Квинтов кръг',
  'Circle Of Fifths': 'Квинтов кръг',
  Ionian: 'Йонийски',
  Dorian: 'Дорийски',
  Phrygian: 'Фригийски',
  Lydian: 'Лидийски',
  Mixolydian: 'Миксолидийски',
  Aeolian: 'Еолийски',
  Locrian: 'Локрийски',

  Relative: 'Натурални',
  Harmonic: 'Хармоничи',
  'Double Harmonic': 'Двойно Хармонични',
  Melodic: 'Мелодични',

  Chord: 'Акорд',
  Notes: 'Ноти',
  Note: 'Нота',
  Fretboard: 'Гриф',
  Guitar: 'Китара',
  Bass: 'Бас',
  Treble: 'Сопрано',
  Sharp: 'Диез',
  Flat: 'Бемол',
  Natural: 'Бекар',
  Sharps: 'Диези',
  Flats: 'Бемоли',
  'Sharp, flat, natural': 'Диез, бемол, бекар',
  Octave: 'Октава',
  Pitch: 'Височина',
  'Play chords and notes': 'Свири акорди и ноти',
  'Frets counted from the capo.': 'Прагчетата се броят от каподастъра.',
  'No capo': 'Без каподастър',
  Cejilla: 'Каподастър',

  // ---------- note sheet ----------
  Sheet: 'Нотен лист',
  'Untitled sheet': 'Лист без име',
  'Sheet settings': 'Настройки на листа',
  'Sheet imported': 'Листът е импортиран',
  'Not a note sheet': 'Това не е нотен лист',
  'Whole sheet': 'Целият лист',
  'Clear the sheet': 'Изчисти листа',
  'Clear the sheet?': 'Да изчистя ли листа?',
  Staves: 'Петолиния',
  'Add staff': 'Добави петолиние',
  Clef: 'Ключ',
  'Bass clef': 'Ключ фа',
  'No clef': 'Без ключ',
  'Show clef': 'Покажи ключа',
  'Hide clef': 'Скрий ключа',
  Key: 'Тоналност',
  'Key signature': 'Ключови знаци',
  'No key signature': 'Без ключови знаци',
  'Remove key signature': 'Махни ключовите знаци',
  'Restore key signature': 'Върни ключовите знаци',
  'Time signature': 'Размер',
  'No time signature': 'Без размер',
  'Show time signature': 'Покажи размера',
  'Hide time signature': 'Скрий размера',
  'Clef, key and time': 'Ключ, тоналност и размер',
  'Set clef, key and time for': 'Ключ, тоналност и размер за',
  'Same as sheet': 'Като на листа',
  'Every staff uses these, unless it has its own.':
    'Важат за всяко петолиние, освен ако то няма свои.',
  'Add note': 'Добави нота',
  'Add rest': 'Добави пауза',
  'Add a rest': 'Добави пауза',
  Rest: 'Пауза',
  'Note value': 'Трайност',
  Duration: 'Трайност',
  Dotted: 'С точка',
  'Dotted note or rest': 'Нота или пауза с точка',
  'Dotted, tie to the next note': 'С точка, лига към следващата нота',
  'Tie to next': 'Лига към следващата',
  'Tie to the next note': 'Лига към следващата нота',
  'Length, from whole to sixty-fourth': 'Трайност – от цяла до шейсет и четвърт',
  'Add a note after the selected one': 'Добави нота след избраната',
  'Add a note or rest, or press A to G for a note and R for a rest.':
    'Добави нота или пауза – или натисни от A до G за нота и R за пауза.',
  'Add a rest when the Notes tab is open': 'Добави пауза, когато е отворен разделът „Ноти“',
  'All staves, notes and rests will be removed and the settings reset. You can undo this.':
    'Всички петолиния, ноти и паузи ще бъдат премахнати, а настройките – нулирани. Можеш да го отмениш.',
  'Delete the selected note or rest': 'Изтрий избраната нота или пауза',
  'Delete the selected note or rest, or clear the beat':
    'Изтрий избраната нота или пауза, или изчисти удара',
  'Copied the selected note.': 'Избраната нота е копирана.',
  'Copy notes': 'Копирай нотите',
  'Copy notes as a melody': 'Копирай нотите като мелодия',
  'Copy the note (or the staff) / paste after it':
    'Копирай нотата (или петолинието) / постави след нея',
  'The melody from the Composer has been pasted.': 'Мелодията от „Композитор“ е поставена.',
  'Paste melody': 'Постави мелодия',
  'Paste melody here': 'Постави мелодията тук',
  'Paste copied notes (Ctrl V)': 'Постави копираните ноти (Ctrl V)',
  'Paste the copied notes from this beat on, one beat per quarter note':
    'Постави копираните ноти от този удар нататък – по един удар за четвъртина',
  'Move it a step, with Shift an octave': 'Премести с една степен, със Shift – с октава',
  'Move the note a step, with Shift an octave':
    'Премести нотата с една степен, със Shift – с октава',
  'Previous or next note': 'Предишна или следваща нота',
  'Play from the selected note': 'Свири от избраната нота',
  'Play or stop': 'Свири или спри',
  'Play or stop, from the selected note': 'Свири или спри – от избраната нота',
  'Select a note or rest on a staff to change it, or type A to G to write notes.':
    'Избери нота или пауза върху петолинието, за да я промениш, или пиши от A до G.',
  'Tap a note or rest on the staff to change it.':
    'Докосни нота или пауза върху петолинието, за да я промениш.',
  'Tap a staff to write on it, or a note to change it':
    'Докосни петолиние, за да пишеш в него, или нота, за да я промениш',
  'Guitar tab under each staff': 'Табулатура под всяко петолиние',
  Tab: 'Табулатура',
  'This file is not a note sheet export. Choose a .json file saved from here.':
    'Този файл не е експорт на нотен лист. Избери .json файл, записан оттук.',
  'A to G': 'от A до G',
  'Optional. Space plays notes in order, + plays them together.':
    'По избор. Интервал – нотите една след друга, + – заедно.',

  // ---------- compás sheet ----------
  Compás: 'Компас',
  'Add compás': 'Добави компас',
  'Untitled compás': 'Компас без име',
  'Compás imported': 'Компасът е импортиран',
  Palo: 'Пало',
  Beats: 'Удари',
  'Add a beat': 'Добави удар',
  'Remove last beat': 'Махни последния удар',
  'Clear beat': 'Изчисти удара',
  'Copy beat': 'Копирай удара',
  'Paste beat': 'Постави удара',
  'Copy or paste a beat': 'Копирай или постави удар',
  'Hear this beat': 'Чуй този удар',
  'Mute the click on this beat': 'Без щракване на този удар',
  'Edit beat labels and length': 'Промени имената и дължината на ударите',
  'Close the beat editor': 'Затвори редактора на ударите',
  'Rename beats, or add and remove them at the end.':
    'Преименувай ударите или добавяй и махай удари в края.',
  'Click a number to accent it. Click a beat below to write on it.':
    'Щракни число, за да го акцентираш. Щракни удар отдолу, за да пишеш върху него.',
  'All compases and beats will be emptied. You can undo this.':
    'Всички компаси и удари ще бъдат изпразнени. Можеш да го отмениш.',
  'Clear everything': 'Изчисти всичко',
  'Clear everything?': 'Да изчистя ли всичко?',
  'This compás has no staff notes to copy.': 'В този компас няма ноти за копиране.',
  'This file is not a compás export. Choose a .json file saved from here.':
    'Този файл не е експорт на компас. Избери .json файл, записан оттук.',
  'Same beat in the previous or next compás': 'Същият удар в предишния или следващия компас',
  'Previous or next beat, or note in the Notes tab':
    'Предишен или следващ удар, или нота в раздел „Ноти“',
  'Type a chord, or add a note when the Notes tab is open':
    'Напиши акорд или добави нота, когато е отворен раздел „Ноти“',
  'Edit the chord, Enter again moves on': 'Промени акорда, още един Enter – напред',
  'Lyrics, falseta cue, reminder': 'Текст, фалсета, бележка',
  'Shown under the beat': 'Показва се под удара',
  'Loop only this compás': 'Повтаряй само този компас',
  'Stop looping this compás': 'Спри повтарянето на този компас',
  'Play the compás click': 'Пусни щракането на компаса',
  'Count in one compás': 'Отброй един компас',
  Click: 'Щракване',
  'Click volume': 'Сила на щракането',
  'Click on every beat': 'Щракване на всеки удар',
  'Guitar volume': 'Сила на китарата',
  'Sound and practice': 'Звук и упражнение',
  Tempo: 'Темпо',
  'Tap 4 times to set the tempo': 'Тупни 4 пъти, за да зададеш темпото',
  'Speed up as I play': 'Ускорявай, докато свиря',
  'Maximum BPM': 'Най-много BPM',
  'BPM to add': 'BPM за добавяне',
  'BPM, every': 'BPM на всеки',
  'compases, up to': 'компаса, до',
  'Compases between steps': 'Компаси между стъпките',
  Palmas: 'Палмас',
  'Contratiempo, soft clap between beats': 'Контратиемпо – тихо пляскане между ударите',
  Downstroke: 'Удар надолу',
  Upstroke: 'Удар нагоре',
  Wood: 'Дърво',
  Cymbal: 'Чинел',
  'Clapping Like': 'Като пляскане',
  'Cymbals Like': 'Като чинели',
  'Percussions Like': 'Като перкусии',
  '3-2 1-0  or  6-0+1-0': '3-2 1-0  или  6-0+1-0',

  // ---------- tuner ----------
  'Guitar tuner': 'Тюнер за китара',
  Tuning: 'Строй',
  Standard: 'Стандартен',
  'Half step down': 'Половин тон надолу',
  'Full step down': 'Цял тон надолу',
  'Drop D': 'Drop D',
  'Drop C': 'Drop C',
  'Open C': 'Отворен C',
  'Open D': 'Отворен D',
  'Open E': 'Отворен E',
  'Open G': 'Отворен G',
  'Start tuning': 'Започни настройването',
  'Press start': 'Натисни „Старт“',
  'Pluck a string': 'Дръпни струна',
  'In tune': 'Настроена',
  'Tune up': 'Опъни (по-високо)',
  'Tune down': 'Отпусни (по-ниско)',
  'Choose a string': 'Избери струна',
  'String detection': 'Разпознаване на струната',
  'Tap a string to hear its pitch.': 'Докосни струна, за да чуеш тона ѝ.',
  'Tap a string to select it and hear its pitch.':
    'Докосни струна, за да я избереш и да чуеш тона ѝ.',
  'Play a reference tone': 'Пусни еталонен тон',
  'Play reference tone': 'Пусни еталонен тон',
  'Lower reference pitch': 'По-нисък еталон',
  'Raise reference pitch': 'По-висок еталон',
  'Tuning gauge, no signal': 'Скала на тюнера, няма сигнал',
  'No microphone found. Connect one and press Start tuning again.':
    'Не намирам микрофон. Свържи го и натисни „Започни настройването“ отново.',
}

// texts with numbers in them
const PATTERNS = [
  [/^Staff (\d+)$/, 'Петолиние $1'],
  [/^Staff (\d+) options$/, 'Настройки на петолиние $1'],
  [/^Name of compás (\d+)$/, 'Име на компас $1'],
  [/^Compás (\d+)$/, 'Компас $1'],
  [
    /^New notes and rests go at the end of staff (\d+)\.$/,
    'Новите ноти и паузи отиват в края на петолиние $1.',
  ],
  [/^Beat (\d+), accented$/, 'Удар $1, с акцент'],
  [/^Beat (\d+), not accented$/, 'Удар $1, без акцент'],
  [
    /^String (\d), ([A-G][♯♭#b]?) ?(\d)\. Play reference tone$/,
    'Струна $1, $2$3. Пусни еталонен тон',
  ],
]

const ATTRS = ['title', 'aria-label', 'placeholder']
const translated = new Set() // text nodes and [element, attr] pairs we changed
const original = new WeakMap() // node → English text; element → { attr: English }
const written = new WeakMap() // node → the Bulgarian text we wrote (to tell it from Vue's updates)
const writtenAttr = new WeakMap() // element → { attr: the Bulgarian value we wrote }

const lookup = (text) => {
  const key = text.trim().replace(/\s+/g, ' ')
  let bg = BG[key]
  if (!bg) for (const [re, to] of PATTERNS) if (re.test(key)) bg = key.replace(re, to)
  return bg && bg !== key ? text.replace(text.trim(), bg) : null
}

function doText(node) {
  if (written.get(node) === node.nodeValue) return // our own change
  const bg = lookup(node.nodeValue)
  if (!bg) return
  original.set(node, node.nodeValue)
  written.set(node, bg)
  node.nodeValue = bg
  translated.add(node)
}

function doAttrs(el) {
  for (const a of ATTRS) {
    const v = el.getAttribute?.(a)
    if (!v || writtenAttr.get(el)?.[a] === v) continue
    const bg = lookup(v)
    if (!bg) continue
    const o = original.get(el) ?? {}
    o[a] = v
    original.set(el, o)
    writtenAttr.set(el, { ...(writtenAttr.get(el) ?? {}), [a]: bg })
    el.setAttribute(a, bg)
    translated.add(el)
  }
}

function walk(root) {
  if (root.nodeType === 3) return doText(root)
  if (root.nodeType !== 1 || root.closest?.('[data-no-translate]')) return
  doAttrs(root)
  const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
  for (let n = it.nextNode(); n; n = it.nextNode()) n.nodeType === 3 ? doText(n) : doAttrs(n)
}

let observer = null

function start() {
  if (observer) return
  walk(document.body)
  observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'characterData') doText(r.target)
      else if (r.type === 'attributes') doAttrs(r.target)
      else r.addedNodes.forEach(walk)
    }
  })
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS,
  })
}

function stop() {
  observer?.disconnect()
  observer = null
  for (const n of translated) {
    const o = original.get(n)
    if (n.nodeType === 3) {
      if (o != null && n.nodeValue === written.get(n)) n.nodeValue = o
      written.delete(n)
    } else if (o) {
      for (const [a, v] of Object.entries(o))
        if (n.getAttribute(a) === writtenAttr.get(n)?.[a]) n.setAttribute(a, v)
      writtenAttr.delete(n)
    }
  }
  translated.clear()
}

/** Turn the translator on for Bulgarian, off for anything else. */
export function setPracticeLanguage(locale) {
  if (typeof document === 'undefined') return
  if (String(locale).startsWith('bg')) start()
  else stop()
}

export const PRACTICE_BG = BG
