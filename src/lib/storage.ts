import { REGISTERS, type ExampleSentence, type ExplanationLanguage, type Register, type RubySegment, type SavedCard, type ContextCardData } from '../types'

const KEYS = {
  apiKey: 'kps-sensei:api-key',
  history: 'kps-sensei:history:v1',
  furigana: 'kps-sensei:furigana',
  explanationLanguage: 'kps-sensei:explanation-lang',
} as const

const HISTORY_LIMIT = 50

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Storage can be unavailable (private mode, disabled cookies). Fail quietly.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isSegment(value: unknown): value is RubySegment {
  return (
    isRecord(value) &&
    typeof value.text === 'string' &&
    (value.reading === undefined || typeof value.reading === 'string')
  )
}

function isExample(value: unknown): value is ExampleSentence {
  return (
    isRecord(value) &&
    (value.register === 'Casual' || value.register === 'Polite') &&
    Array.isArray(value.segments) &&
    value.segments.every(isSegment) &&
    typeof value.translation === 'string' &&
    (value.translationMy === undefined ||
      typeof value.translationMy === 'string')
  )
}

function isRegister(value: unknown): value is Register {
  return (
    typeof value === 'string' && (REGISTERS as readonly string[]).includes(value)
  )
}

function isContextCard(value: unknown): value is ContextCardData {
  if (!isRecord(value)) return false
  return (
    typeof value.term === 'string' &&
    typeof value.reading === 'string' &&
    (value.category === 'Kanji' ||
      value.category === 'Kotoba' ||
      value.category === 'Grammar') &&
    typeof value.meaning === 'string' &&
    (value.meaningMy === undefined || typeof value.meaningMy === 'string') &&
    Array.isArray(value.registers) &&
    value.registers.every(isRegister) &&
    typeof value.vibe === 'string' &&
    (value.vibeMy === undefined || typeof value.vibeMy === 'string') &&
    typeof value.pattern === 'string' &&
    (value.patternNote === undefined || typeof value.patternNote === 'string') &&
    (value.patternNoteMy === undefined ||
      typeof value.patternNoteMy === 'string') &&
    Array.isArray(value.examples) &&
    value.examples.every(isExample)
  )
}

function isSavedCard(value: unknown): value is SavedCard {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.query === 'string' &&
    typeof value.createdAt === 'number' &&
    Number.isFinite(value.createdAt) &&
    typeof value.starred === 'boolean' &&
    typeof value.demo === 'boolean' &&
    isContextCard(value.card)
  )
}

export function loadHistory(): SavedCard[] {
  const raw = read(KEYS.history)
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isSavedCard)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, HISTORY_LIMIT)
  } catch {
    return []
  }
}

export function saveHistory(cards: SavedCard[]): boolean {
  return write(KEYS.history, JSON.stringify(cards.slice(0, HISTORY_LIMIT)))
}

export function loadApiKey(): string {
  return (read(KEYS.apiKey) ?? '').trim()
}

export function saveApiKey(key: string): boolean {
  const trimmed = key.trim()
  if (!trimmed) {
    remove(KEYS.apiKey)
    return true
  }
  return write(KEYS.apiKey, trimmed)
}

export function loadFurigana(): boolean {
  return read(KEYS.furigana) !== 'off'
}

export function saveFurigana(enabled: boolean): void {
  write(KEYS.furigana, enabled ? 'on' : 'off')
}

export function loadExplanationLanguage(): ExplanationLanguage {
  return read(KEYS.explanationLanguage) === 'my' ? 'my' : 'en'
}

export function saveExplanationLanguage(language: ExplanationLanguage): void {
  write(KEYS.explanationLanguage, language)
}

export function createCardId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const HISTORY_CAP = HISTORY_LIMIT
