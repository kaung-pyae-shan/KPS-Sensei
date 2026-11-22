import type { ContextCardData } from '../types'

interface DemoEntry {
  card: ContextCardData
  aliases: string[]
}

const DEMO_ENTRIES: DemoEntry[] = [
  {
    card: {
      term: '届',
      reading: 'とどく',
      category: 'Kanji',
      meaning: 'to reach; be delivered',
      meaningMy: 'ရောက်ရှိခြင်း၊ ပို့ဆောင်ခြင်း',
      registers: ['Spoken', 'Written'],
      vibe: 'Marks something reaching its destination, or a long-held wish finally coming true.',
      vibeMy:
        'တစ်စုံတစ်ခု မိမိ၏ ဦးတည်ရာသို့ ရောက်ရှိခြင်း သို့မဟုတ် ကြာမြင့်စွာ တောင့်တခဲ့သော ဆန္ဒ ပြည့်ဝသွားခြင်းကို ဖော်ပြသည်။',
      pattern: 'Noun + が + 届く',
      patternNote: 'Intransitive: the thing arrives on its own.',
      patternNoteMy:
        'ကံမလိုက်သော ကြိယာ — ပစ္စည်းက သူ့အလိုလို ရောက်လာသည်။',
      examples: [
        {
          register: 'Casual',
          segments: [
            { text: '注文', reading: 'ちゅうもん' },
            { text: 'した' },
            { text: '本', reading: 'ほん' },
            { text: 'が' },
            { text: '届', reading: 'とど' },
            { text: 'いた' },
            { text: '。' },
          ],
          translation: 'The book I ordered arrived.',
          translationMy: 'မှာယူထားတဲ့ စာအုပ် ရောက်လာတယ်။',
        },
        {
          register: 'Polite',
          segments: [
            { text: '荷物', reading: 'にもつ' },
            { text: 'は' },
            { text: '明日', reading: 'あした' },
            { text: '届', reading: 'とど' },
            { text: 'きますか' },
            { text: '。' },
          ],
          translation: 'Will the package arrive tomorrow?',
          translationMy: 'ပစ္စည်းက မနက်ဖြန် ရောက်ပါမလား။',
        },
      ],
    },
    aliases: ['届く', 'とどく', 'todoku'],
  },
  {
    card: {
      term: '遠慮',
      reading: 'えんりょ',
      category: 'Kotoba',
      meaning: 'reserve; restraint; consideration',
      meaningMy: 'ထိန်းသိမ်းရှောင်ကြဉ်ခြင်း၊ ယဉ်ကျေးစွာ ငြင်းဆိုခြင်း',
      registers: ['Polite', 'Business', 'Written'],
      vibe: 'Adds polite restraint before a refusal, request, or offer, showing consideration for the other person.',
      vibeMy:
        'ငြင်းဆိုခြင်း၊ တောင်းဆိုခြင်း သို့မဟုတ် ကမ်းလှမ်းခြင်းမပြုမီ ယဉ်ကျေးစွာ ထိန်းသိမ်းမှုကို ထည့်သွင်းပြီး အခြားသူကို လေးစားကြောင်း ပြသည်။',
      pattern: 'Noun + を + 遠慮する',
      patternNote: 'Set phrase: ご遠慮ください = please refrain.',
      patternNoteMy:
        'အသုံးများသော စကားစု — ご遠慮ください = ရှောင်ကြဉ်ပေးပါ။',
      examples: [
        {
          register: 'Casual',
          segments: [
            { text: '遠慮', reading: 'えんりょ' },
            { text: 'しないで' },
            { text: '食べ', reading: 'たべ' },
            { text: 'てね' },
            { text: '。' },
          ],
          translation: 'Don’t hold back — eat up.',
          translationMy: 'မရှောင်နဲ့ — စားလိုက်စမ်း။',
        },
        {
          register: 'Polite',
          segments: [
            { text: 'どうぞ' },
            { text: 'ご' },
            { text: '遠慮', reading: 'えんりょ' },
            { text: 'なく' },
            { text: 'お' },
            { text: '使', reading: 'つか' },
            { text: 'いください' },
            { text: '。' },
          ],
          translation: 'Please feel free to use it.',
          translationMy: 'ကျေးဇူးပြု၍ လွတ်လပ်စွာ အသုံးပြုပါ။',
        },
      ],
    },
    aliases: ['えんりょ', 'enryo', '遠慮する'],
  },
  {
    card: {
      term: '〜てしまう',
      reading: 'てしまう',
      category: 'Grammar',
      meaning: 'end up doing; unintentionally',
      meaningMy: 'မရည်ရွယ်ဘဲ လုပ်ဖြစ်သွားခြင်း',
      registers: ['Casual', 'Spoken', 'Written'],
      vibe: 'Shows an action finishing completely or happening despite your intentions, often with a hint of regret.',
      vibeMy:
        'လုပ်ဆောင်ချက်တစ်ခု အပြီးသတ်သွားခြင်း သို့မဟုတ် မရည်ရွယ်ဘဲ ဖြစ်သွားခြင်းကို ပြပြီး မကြာခဏ နောင်တရသည့် သဘောပါဝင်သည်။',
      pattern: 'Verb[て-form] + しまう',
      patternNote: 'Casual contractions: 〜ちゃう / 〜じゃう.',
      patternNoteMy: 'ပြောစကားတွင် အတိုကောက် — 〜ちゃう / 〜じゃう။',
      examples: [
        {
          register: 'Casual',
          segments: [
            { text: 'ケーキ' },
            { text: 'を' },
            { text: '全部', reading: 'ぜんぶ' },
            { text: '食べ', reading: 'たべ' },
            { text: 'てしまった' },
            { text: '。' },
          ],
          translation: 'I ended up eating the whole cake.',
          translationMy: 'ကိတ်မုန့်တစ်ခုလုံး စားဖြစ်သွားတယ်။',
        },
        {
          register: 'Polite',
          segments: [
            { text: '宿題', reading: 'しゅくだい' },
            { text: 'を' },
            { text: '忘れ', reading: 'わすれ' },
            { text: 'てしまいました' },
            { text: '。' },
          ],
          translation: 'I ended up forgetting my homework.',
          translationMy: 'အိမ်စာလုပ်ဖို့ မေ့သွားပါတယ်။',
        },
      ],
    },
    aliases: ['てしまう', '~てしまう', 'ちゃう', 'てしまった'],
  },
]

function normalize(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[〜~ー\s]/g, '')
    .toLowerCase()
}

/** Returns a pre-loaded card when the query matches one of the three demo samples. */
export function getDemoCard(query: string): ContextCardData | null {
  const needle = normalize(query)
  if (!needle) return null

  const entry = DEMO_ENTRIES.find(({ card, aliases }) => {
    const candidates = [card.term, card.reading, ...aliases]
    return candidates.some((candidate) => normalize(candidate) === needle)
  })

  return entry ? entry.card : null
}

export const DEMO_QUERIES = DEMO_ENTRIES.map((entry) => entry.card.term)
