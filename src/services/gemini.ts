import {
  CARD_CATEGORIES,
  EXAMPLE_REGISTERS,
  REGISTERS,
  type CardCategory,
  type ContextCardData,
  type ExampleRegister,
  type ExampleSentence,
  type Register,
  type RubySegment,
} from '../types'

/**
 * Models are tried in order. Google limits older models such as gemini-2.5-flash
 * to keys that have used them before, so a 404 here is normal for new keys and
 * should fall through to the next model instead of failing the search.
 */
export const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
] as const

export const GEMINI_MODEL = GEMINI_MODELS[0]
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const REQUEST_TIMEOUT_MS = 30_000

export type GeminiErrorKind =
  | 'auth'
  | 'model'
  | 'rate'
  | 'network'
  | 'blocked'
  | 'server'
  | 'parse'

export class GeminiError extends Error {
  readonly kind: GeminiErrorKind

  constructor(message: string, kind: GeminiErrorKind) {
    super(message)
    this.name = 'GeminiError'
    this.kind = kind
  }
}

/**
 * Gemini's structured-output schema. Keeping it strict means the UI never has
 * to guess at the shape of a response.
 */
export const CARD_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    term: {
      type: 'STRING',
      description:
        'The canonical Japanese term, exactly as a learner would study it. No romaji.',
    },
    reading: {
      type: 'STRING',
      description:
        'The full hiragana/katakana reading of the term. Kana only, no romaji.',
    },
    category: {
      type: 'STRING',
      enum: [...CARD_CATEGORIES],
      description: 'Kanji for a single character, Grammar for patterns, Kotoba otherwise.',
    },
    meaning: {
      type: 'STRING',
      description:
        'The core English meaning in five words or fewer. No period, no full sentence.',
    },
    meaningMy: {
      type: 'STRING',
      description:
        'The core meaning translated into natural Burmese (မြန်မာဘာသာ), five words or fewer, Burmese script only.',
    },
    registers: {
      type: 'ARRAY',
      description: 'One to three registers that best describe typical use.',
      items: { type: 'STRING', enum: [...REGISTERS] },
      minItems: 1,
      maxItems: 3,
    },
    vibe: {
      type: 'STRING',
      description:
        'Exactly one short sentence on where and with what nuance to use the term.',
    },
    vibeMy: {
      type: 'STRING',
      description:
        'The same nuance sentence translated into natural, idiomatic Burmese using Burmese script.',
    },
    pattern: {
      type: 'STRING',
      description:
        'A compact grammar formula or collocation, e.g. "Noun + を + 遠慮する".',
    },
    patternNote: {
      type: 'STRING',
      description:
        'Optional fragment under eight words, e.g. a casual contraction or set phrase.',
    },
    patternNoteMy: {
      type: 'STRING',
      description:
        'Burmese translation of patternNote, in Burmese script. Omit when patternNote is omitted.',
    },
    examples: {
      type: 'ARRAY',
      description:
        'Exactly two short sentences: the first Casual, the second Polite.',
      minItems: 2,
      maxItems: 2,
      items: {
        type: 'OBJECT',
        properties: {
          register: {
            type: 'STRING',
            enum: [...EXAMPLE_REGISTERS],
          },
          segments: {
            type: 'ARRAY',
            description:
              'The sentence split into natural runs. Kanji runs carry a kana reading; kana-only runs omit reading.',
            items: {
              type: 'OBJECT',
              properties: {
                text: { type: 'STRING' },
                reading: {
                  type: 'STRING',
                  description:
                    'Kana reading for this run only. Omit for kana, punctuation, or katakana-only runs.',
                },
              },
              required: ['text'],
              propertyOrdering: ['text', 'reading'],
            },
          },
          translation: {
            type: 'STRING',
            description: 'A natural, concise English translation.',
          },
          translationMy: {
            type: 'STRING',
            description:
              'The same sentence translated into natural Burmese using Burmese script.',
          },
        },
        required: ['register', 'segments', 'translation', 'translationMy'],
        propertyOrdering: [
          'register',
          'segments',
          'translation',
          'translationMy',
        ],
      },
    },
  },
  required: [
    'term',
    'reading',
    'category',
    'meaning',
    'meaningMy',
    'registers',
    'vibe',
    'vibeMy',
    'pattern',
    'examples',
  ],
  propertyOrdering: [
    'term',
    'reading',
    'category',
    'meaning',
    'meaningMy',
    'registers',
    'vibe',
    'vibeMy',
    'pattern',
    'patternNote',
    'patternNoteMy',
    'examples',
  ],
} as const

const SYSTEM_INSTRUCTION = `You are KPS-Sensei, a concise Japanese lexicographer writing for English-speaking learners.

Return exactly one context card as JSON that matches the schema. Follow these rules:
- Be scannable. No walls of text, no markdown, no romaji, no filler.
- term: the canonical target. For grammar, keep the leading 〜 (e.g. 〜てしまう).
- reading: kana only. For grammar, the reading of the pattern without 〜.
- category: Kanji for one kanji character, Grammar for a grammar pattern/particle usage, Kotoba for a word or expression.
- meaning: five English words or fewer. No period.
- meaningMy: the same meaning in natural Burmese (မြန်မာဘာသာ), Burmese script only.
- registers: 1-3 values chosen from the enum.
- vibe: exactly one sentence, 25 words max, explaining where and how it is used.
- vibeMy: the same nuance in natural, idiomatic Burmese, Burmese script only.
- pattern: a compact formula or common collocation, no explanation.
- patternNote: optional, under 8 words. Omit if not useful.
- patternNoteMy: Burmese translation of patternNote. Omit if patternNote is omitted.
- examples: exactly 2, natural and short. The first MUST be Casual (plain form), the second MUST be Polite (です/ます). Keep each to 14 Japanese words or fewer.
- segments: split each example into natural runs. Every run containing kanji needs its kana reading in reading. Kana-only, katakana-only, and punctuation runs must omit reading.
- translation: concise natural English.
- translationMy: the same example in natural Burmese, Burmese script only.
- Never romanize Burmese. Do not translate the Japanese term or example sentences.`

interface GeminiPart {
  text?: string
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[] }
  finishReason?: string
}

interface GeminiPayload {
  candidates?: GeminiCandidate[]
  promptFeedback?: { blockReason?: string }
  error?: { message?: string; status?: string }
}

const KANA_ONLY = /^[\u3041-\u3096\u30a1-\u30fa\u30fc・〜～\s]+$/u
const KANJI = /[\u3400-\u4dbf\u4e00-\u9fff]/u

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanInline(value: unknown): string {
  return asString(value)
    .replace(/\*\*|__|`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function limitWords(value: string, maxWords: number): string {
  const words = value.split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return value
  return words
    .slice(0, maxWords)
    .join(' ')
    .replace(/[;,]+$/, '')
}

function detectCategory(term: string, raw: unknown): CardCategory {
  if (
    typeof raw === 'string' &&
    (CARD_CATEGORIES as readonly string[]).includes(raw)
  ) {
    return raw as CardCategory
  }
  if (/[〜~]/.test(term)) return 'Grammar'
  if (term.length === 1 && KANJI.test(term)) return 'Kanji'
  return 'Kotoba'
}

function normalizeRegisters(raw: unknown): Register[] {
  if (!Array.isArray(raw)) return ['Polite']
  const seen = new Set<Register>()
  for (const value of raw) {
    if (
      typeof value === 'string' &&
      (REGISTERS as readonly string[]).includes(value)
    ) {
      seen.add(value as Register)
    }
  }
  return seen.size > 0 ? [...seen].slice(0, 3) : ['Polite']
}

function normalizeSegment(raw: unknown): RubySegment | null {
  const record = asRecord(raw)
  if (!record) return null

  const text = asString(record.text)
  if (!text) return null

  const candidate = asString(record.reading)
  let reading: string | undefined

  if (
    candidate &&
    candidate !== text &&
    KANA_ONLY.test(candidate) &&
    !KANJI.test(candidate)
  ) {
    reading = candidate
  }

  return reading ? { text, reading } : { text }
}

function normalizeExample(
  raw: unknown,
  index: number,
): ExampleSentence | null {
  const record = asRecord(raw)
  if (!record) return null

  const segmentsRaw = Array.isArray(record.segments) ? record.segments : []
  const segments = segmentsRaw
    .map(normalizeSegment)
    .filter((segment): segment is RubySegment => segment !== null)

  const translation = cleanInline(record.translation)
  if (segments.length === 0 || !translation) return null

  const rawRegister = asString(record.register)
  const register: ExampleRegister =
    rawRegister === 'Polite'
      ? 'Polite'
      : rawRegister === 'Casual'
        ? 'Casual'
        : index === 0
          ? 'Casual'
          : 'Polite'

  return {
    register,
    segments,
    translation,
    translationMy: cleanInline(record.translationMy) || undefined,
  }
}

function normalizeExamples(raw: unknown): ExampleSentence[] {
  if (!Array.isArray(raw)) {
    throw new GeminiError(
      'Gemini returned an incomplete card. Please try that search again.',
      'parse',
    )
  }

  const examples = raw
    .map((example, index) => normalizeExample(example, index))
    .filter((example): example is ExampleSentence => example !== null)
    .slice(0, 2)

  if (examples.length !== 2) {
    throw new GeminiError(
      'Gemini returned an incomplete card. Please try that search again.',
      'parse',
    )
  }

  // Guarantee one casual and one polite example, as the card promises.
  if (examples[0].register === examples[1].register) {
    examples[0] = {
      ...examples[0],
      register: examples[0].register === 'Polite' ? 'Casual' : 'Polite',
    }
  }

  if (examples[0].register === 'Polite' && examples[1].register === 'Casual') {
    const [first, second] = examples
    examples[0] = second
    examples[1] = first
  }

  return examples
}

export function normalizeCard(raw: unknown): ContextCardData {
  const record = asRecord(raw)
  if (!record) {
    throw new GeminiError(
      'Gemini’s response was not valid JSON. Please try again.',
      'parse',
    )
  }

  const term = cleanInline(record.term)
  const reading = cleanInline(record.reading)
  const meaning = limitWords(cleanInline(record.meaning), 5)
  const vibe = cleanInline(record.vibe)
  const pattern = cleanInline(record.pattern)

  if (!term || !reading || !meaning || !vibe || !pattern) {
    throw new GeminiError(
      'Gemini returned an incomplete card. Please try that search again.',
      'parse',
    )
  }

  return {
    term,
    reading,
    category: detectCategory(term, record.category),
    meaning,
    meaningMy: cleanInline(record.meaningMy) || undefined,
    registers: normalizeRegisters(record.registers),
    vibe,
    vibeMy: cleanInline(record.vibeMy) || undefined,
    pattern,
    patternNote: cleanInline(record.patternNote) || undefined,
    patternNoteMy: cleanInline(record.patternNoteMy) || undefined,
    examples: normalizeExamples(record.examples),
  }
}

function buildUserPrompt(query: string): string {
  return `Create one context card for this Japanese query: "${query}"

Choose the most common, useful usage. If it is a single kanji, focus on its most frequent reading. If it is a grammar pattern, keep the pattern notation.`
}

function parsePayloadText(payload: GeminiPayload): string {
  const candidate = payload.candidates?.[0]
  const text = (candidate?.content?.parts ?? [])
    .map((part) => part.text ?? '')
    .join('')
    .trim()

  if (!text) {
    const boundary = [
      payload.promptFeedback?.blockReason,
      candidate?.finishReason,
    ].find(
      (reason) =>
        reason &&
        reason !== 'STOP' &&
        reason !== 'FINISH_REASON_UNSPECIFIED',
    )

    if (boundary) {
      throw new GeminiError(
        'Gemini couldn’t complete this card. Try a different word or phrasing.',
        'blocked',
      )
    }

    throw new GeminiError(
      'Gemini returned an empty response. Please try again.',
      'parse',
    )
  }

  return text
}

function messageForStatus(
  status: number,
  payload: GeminiPayload,
  model: string,
): string {
  if (status === 400 || status === 401 || status === 403) {
    return 'Gemini rejected the API key. Check it in Settings and try again.'
  }
  if (status === 404) {
    return `The model ${model} is not available for this API key.`
  }
  if (status === 429) {
    return 'Gemini’s free-tier rate limit was reached. Wait a moment, then try again.'
  }
  if (status >= 500) {
    return 'Gemini is having trouble right now. Please try again in a moment.'
  }
  return payload.error?.message?.trim() || 'The Gemini request failed. Please try again.'
}

async function requestModel(
  query: string,
  apiKey: string,
  model: string,
): Promise<ContextCardData> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: buildUserPrompt(query) }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
          responseSchema: CARD_RESPONSE_SCHEMA,
        },
      }),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new GeminiError(
        'The request timed out. Check your connection and try again.',
        'network',
      )
    }
    throw new GeminiError(
      'Couldn’t reach Gemini. Check your internet connection and try again.',
      'network',
    )
  } finally {
    window.clearTimeout(timeout)
  }

  let payload: GeminiPayload = {}
  try {
    payload = (await response.json()) as GeminiPayload
  } catch {
    if (!response.ok) {
      throw new GeminiError(
        messageForStatus(response.status, payload, model),
        response.status === 404 ? 'model' : 'server',
      )
    }
    throw new GeminiError(
      'Gemini returned a response that couldn’t be read. Please try again.',
      'parse',
    )
  }

  if (!response.ok) {
    const kind: GeminiErrorKind =
      response.status === 400 ||
      response.status === 401 ||
      response.status === 403
        ? 'auth'
        : response.status === 404
          ? 'model'
          : response.status === 429
            ? 'rate'
            : 'server'
    throw new GeminiError(messageForStatus(response.status, payload, model), kind)
  }

  const text = parsePayloadText(payload)
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new GeminiError(
      'Gemini’s response was not valid JSON. Please try again.',
      'parse',
    )
  }

  return normalizeCard(parsed)
}

let preferredModel: (typeof GEMINI_MODELS)[number] | null = null

/**
 * Calls Gemini directly from the browser with a strict JSON schema.
 * The API key is supplied by the caller from localStorage.
 */
export async function generateContextCard(
  query: string,
  apiKey: string,
): Promise<ContextCardData> {
  const models = preferredModel
    ? [
        preferredModel,
        ...GEMINI_MODELS.filter((model) => model !== preferredModel),
      ]
    : [...GEMINI_MODELS]

  for (const model of models) {
    try {
      const card = await requestModel(query, apiKey, model)
      preferredModel = model
      return card
    } catch (error) {
      if (error instanceof GeminiError && error.kind === 'model') {
        console.warn(`[KPS-Sensei] ${model} is unavailable for this key; trying the next model.`)
        continue
      }
      throw error
    }
  }

  throw new GeminiError(
    'None of the Gemini models this app supports are enabled for this key. Create a fresh key in Google AI Studio, then try again.',
    'model',
  )
}
