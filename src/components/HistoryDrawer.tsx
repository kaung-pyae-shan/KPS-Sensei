import { useEffect, useMemo, useRef, useState } from 'react'
import type { ExplanationLanguage, SavedCard } from '../types'
import { cn, relativeTime } from '../lib/utils'
import { Icon } from './Icon'

const CATEGORY_DOTS = {
  Kanji: 'bg-indigo-500',
  Kotoba: 'bg-vermilion',
  Grammar: 'bg-moss',
} as const

interface HistoryDrawerProps {
  open: boolean
  cards: SavedCard[]
  activeId: string | null
  language: ExplanationLanguage
  onClose: () => void
  onSelect: (id: string) => void
  onToggleStar: (id: string) => void
  onClear: () => void
}

export function HistoryDrawer({
  open,
  cards,
  activeId,
  language,
  onClose,
  onSelect,
  onToggleStar,
  onClear,
}: HistoryDrawerProps) {
  const [filter, setFilter] = useState<'all' | 'starred'>('all')
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const starredCount = useMemo(
    () => cards.filter((card) => card.starred).length,
    [cards],
  )
  const visibleCards =
    filter === 'starred' ? cards.filter((card) => card.starred) : cards

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close history"
        tabIndex={-1}
        onClick={onClose}
        className="animate-fade-in absolute inset-0 h-full w-full cursor-default bg-ink/25 backdrop-blur-[2px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
        className="animate-slide-in absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-paper shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2
              id="history-title"
              className="text-base font-bold tracking-tight text-ink"
            >
              Your cards
            </h2>
            <p className="mt-0.5 text-[11px] text-stone-500">
              {cards.length} saved · stored only in this browser
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close history"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-stone-500 shadow-sm transition hover:border-stone-300 hover:text-ink active:scale-95"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </header>

        <div className="border-b border-line px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex rounded-lg bg-stone-200/60 p-1">
              <button
                type="button"
                onClick={() => setFilter('all')}
                aria-pressed={filter === 'all'}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[11px] font-semibold transition',
                  filter === 'all'
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-stone-500 hover:text-ink',
                )}
              >
                All {cards.length > 0 && <span>{cards.length}</span>}
              </button>
              <button
                type="button"
                onClick={() => setFilter('starred')}
                aria-pressed={filter === 'starred'}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[11px] font-semibold transition',
                  filter === 'starred'
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-stone-500 hover:text-ink',
                )}
              >
                Starred {starredCount > 0 && <span>{starredCount}</span>}
              </button>
            </div>
            <span className="text-[10px] uppercase tracking-[0.12em] text-stone-500">
              Recent 50
            </span>
          </div>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-2.5 py-3">
          {visibleCards.length === 0 ? (
            <div className="flex h-full min-h-52 flex-col items-center justify-center px-6 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-stone-300">
                <Icon
                  name={filter === 'starred' ? 'star' : 'book'}
                  className="h-5 w-5"
                />
              </span>
              <p className="mt-3 text-sm font-semibold text-stone-600">
                {filter === 'starred'
                  ? 'No bookmarks yet'
                  : 'Your collection is empty'}
              </p>
              <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-stone-500">
                {filter === 'starred'
                  ? 'Tap the star on any card to keep it here.'
                  : 'Look up a kanji, word, or grammar point to save your first card.'}
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {visibleCards.map((saved) => {
                const isActive = saved.id === activeId
                return (
                  <li key={saved.id}>
                    <div
                      className={cn(
                        'flex items-stretch rounded-xl border transition',
                        isActive
                          ? 'border-indigo-200 bg-indigo-50/50'
                          : 'border-transparent hover:border-line hover:bg-white',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(saved.id)}
                        className="min-w-0 flex-1 rounded-l-xl px-3 py-3 text-left"
                      >
                        <div className="flex items-baseline gap-2">
                          <span
                            aria-hidden="true"
                            className={cn(
                              'h-2 w-2 shrink-0 self-center rounded-full',
                              CATEGORY_DOTS[saved.card.category],
                            )}
                          />
                          <span className="truncate text-[15px] font-bold tracking-tight text-ink">
                            {saved.card.term}
                          </span>
                          <span className="truncate text-[11px] text-stone-500">
                            {saved.card.reading}
                          </span>
                        </div>
                        <p
                          className={cn(
                            'mt-0.5 truncate pl-4 text-xs text-stone-500',
                            language === 'my' &&
                              saved.card.meaningMy &&
                              'lang-my',
                          )}
                        >
                          {language === 'my' && saved.card.meaningMy
                            ? saved.card.meaningMy
                            : saved.card.meaning}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5 pl-4 text-[9px] font-medium uppercase tracking-[0.1em] text-stone-500">
                          <span>{saved.card.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{relativeTime(saved.createdAt)}</span>
                          {saved.demo && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-vermilion/70">Demo</span>
                            </>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center pr-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleStar(saved.id)}
                          aria-pressed={saved.starred}
                          aria-label={
                            saved.starred
                              ? `Remove bookmark for ${saved.card.term}`
                              : `Bookmark ${saved.card.term}`
                          }
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg transition active:scale-90',
                            saved.starred
                              ? 'text-vermilion hover:bg-vermilion/5'
                              : 'text-stone-300 hover:bg-stone-100 hover:text-vermilion',
                          )}
                        >
                          <Icon
                            name="star"
                            filled={saved.starred}
                            className="h-4 w-4"
                          />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <span className="text-[10px] text-stone-500">
            Private to this browser
          </span>
          <button
            type="button"
            onClick={onClear}
            disabled={cards.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-stone-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-stone-500"
          >
            <Icon name="trash" className="h-3.5 w-3.5" />
            Clear all
          </button>
        </footer>
      </aside>
    </div>
  )
}
