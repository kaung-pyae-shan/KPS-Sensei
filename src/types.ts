export const CARD_CATEGORIES = ['Kanji', 'Kotoba', 'Grammar'] as const
export type CardCategory = (typeof CARD_CATEGORIES)[number]

export const REGISTERS = [
  'Casual',
  'Polite',
  'Spoken',
  'Written',
  'Business',
  'Formal',
] as const
export type Register = (typeof REGISTERS)[number]

export const EXAMPLE_REGISTERS = ['Casual', 'Polite'] as const
export type ExampleRegister = (typeof EXAMPLE_REGISTERS)[number]

/** A run of Japanese text. `reading` is kana shown above the text as furigana. */
export interface RubySegment {
  text: string
  reading?: string
}

export interface ExampleSentence {
  register: ExampleRegister
  segments: RubySegment[]
  translation: string
  /** Burmese translation of the sentence. */
  translationMy?: string
}

/** The structured response we request from Gemini — one context card. */
export interface ContextCardData {
  term: string
  reading: string
  category: CardCategory
  meaning: string
  /** Burmese translation of the core meaning. */
  meaningMy?: string
  registers: Register[]
  vibe: string
  /** Burmese translation of the nuance sentence. */
  vibeMy?: string
  pattern: string
  patternNote?: string
  /** Burmese translation of the pattern note. */
  patternNoteMy?: string
  examples: ExampleSentence[]
}

export type ExplanationLanguage = 'en' | 'my'

export interface SavedCard {
  id: string
  query: string
  card: ContextCardData
  createdAt: number
  starred: boolean
  demo: boolean
}
