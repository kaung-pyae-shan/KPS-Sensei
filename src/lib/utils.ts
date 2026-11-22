import type { ContextCardData, RubySegment } from '../types'

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

export function segmentsToPlainText(segments: RubySegment[]): string {
  return segments.map((segment) => segment.text).join('')
}

/** True when a card has at least one Burmese explanation to show. */
export function hasBurmese(card: ContextCardData): boolean {
  return Boolean(
    card.meaningMy ||
      card.vibeMy ||
      card.patternNoteMy ||
      card.examples.some((example) => example.translationMy),
  )
}

export function relativeTime(timestamp: number, now = Date.now()): string {
  const diff = Math.max(0, now - timestamp)
  const minutes = Math.floor(diff / 60_000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(timestamp)
}
