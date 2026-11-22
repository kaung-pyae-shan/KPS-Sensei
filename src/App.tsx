import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ApiKeyModal } from './components/ApiKeyModal'
import { ContextCard } from './components/ContextCard'
import { EmptyState } from './components/EmptyState'
import { HistoryDrawer } from './components/HistoryDrawer'
import { Icon } from './components/Icon'
import { SearchBar } from './components/SearchBar'
import { SkeletonCard } from './components/SkeletonCard'
import { Toast, type ToastMessage } from './components/Toast'
import { getDemoCard } from './data/demo'
import {
  createCardId,
  HISTORY_CAP,
  loadApiKey,
  loadExplanationLanguage,
  loadFurigana,
  loadHistory,
  saveApiKey,
  saveExplanationLanguage,
  saveFurigana,
  saveHistory,
} from './lib/storage'
import { cn, hasBurmese } from './lib/utils'
import {
  GeminiError,
  generateContextCard,
  type GeminiErrorKind,
} from './services/gemini'
import type {
  ContextCardData,
  ExplanationLanguage,
  SavedCard,
} from './types'

interface AppError {
  title: string
  message: string
  tone: 'error' | 'demo'
  action?: 'settings'
}

const GEMINI_ERROR_TITLES: Record<GeminiErrorKind, string> = {
  auth: 'Check your API key',
  model: 'Model unavailable',
  rate: 'Rate limit reached',
  network: 'Connection problem',
  blocked: 'Card unavailable',
  server: 'Gemini is busy',
  parse: 'Unexpected response',
}

function normalizeTerm(term: string): string {
  return term.normalize('NFKC').replace(/[〜~]/g, '').trim().toLowerCase()
}

function upsertCard(
  current: SavedCard[],
  query: string,
  card: ContextCardData,
  demo: boolean,
): { cards: SavedCard[]; id: string } {
  const existing = current.find(
    (saved) =>
      saved.card.category === card.category &&
      normalizeTerm(saved.card.term) === normalizeTerm(card.term),
  )

  const id = existing?.id ?? createCardId()
  const saved: SavedCard = {
    id,
    query,
    card,
    createdAt: Date.now(),
    starred: existing?.starred ?? false,
    demo,
  }

  return {
    id,
    cards: [saved, ...current.filter((item) => item.id !== id)].slice(
      0,
      HISTORY_CAP,
    ),
  }
}

function App() {
  const [apiKey, setApiKey] = useState<string>(() => loadApiKey())
  const [history, setHistory] = useState<SavedCard[]>(() => loadHistory())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const [showFurigana, setShowFurigana] = useState<boolean>(() =>
    loadFurigana(),
  )
  const [explanationLanguage, setExplanationLanguage] =
    useState<ExplanationLanguage>(() => loadExplanationLanguage())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef(history)
  const loadingRef = useRef(false)
  const toastTimer = useRef<number | null>(null)

  const activeCard = useMemo(() => {
    if (!activeId) return null
    return history.find((saved) => saved.id === activeId) ?? null
  }, [activeId, history])

  useEffect(() => {
    historyRef.current = history
    saveHistory(history)
  }, [history])

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) {
        window.clearTimeout(toastTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (
        event.key !== '/' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        drawerOpen ||
        settingsOpen
      ) {
        return
      }

      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      event.preventDefault()
      searchInputRef.current?.focus()
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [drawerOpen, settingsOpen])

  const showToast = useCallback(
    (message: string, tone: 'success' | 'error' = 'success') => {
      if (toastTimer.current !== null) {
        window.clearTimeout(toastTimer.current)
      }
      setToast({ id: Date.now(), message, tone })
      toastTimer.current = window.setTimeout(() => setToast(null), 3000)
    },
    [],
  )

  const closeSettings = useCallback(() => setSettingsOpen(false), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  function applyCard(query: string, card: ContextCardData, demo: boolean) {
    const result = upsertCard(historyRef.current, query, card, demo)
    historyRef.current = result.cards
    setHistory(result.cards)
    setActiveId(result.id)
  }

  async function handleSearch(rawQuery: string) {
    const query = rawQuery.trim()
    if (!query || loadingRef.current) return

    loadingRef.current = true
    setLoading(true)
    setError(null)
    setActiveId(null)

    try {
      if (!apiKey) {
        const demoCard = getDemoCard(query)
        if (!demoCard) {
          setError({
            title: 'Demo mode is on',
            message:
              'This demo includes 届, 遠慮, and 〜てしまう. Add a free Gemini key to look up anything else.',
            tone: 'demo',
            action: 'settings',
          })
          return
        }
        applyCard(query, demoCard, true)
        return
      }

      const card = await generateContextCard(query, apiKey)
      applyCard(query, card, false)
    } catch (caught) {
      if (caught instanceof GeminiError) {
        setError({
          title: GEMINI_ERROR_TITLES[caught.kind],
          message: caught.message,
          tone: 'error',
          action:
            caught.kind === 'auth' || caught.kind === 'model'
              ? 'settings'
              : undefined,
        })
      } else {
        setError({
          title: 'Something went wrong',
          message: 'An unexpected error occurred. Please try that search again.',
          tone: 'error',
        })
      }
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  function handleToggleStar(id: string) {
    setHistory((current) =>
      current.map((saved) =>
        saved.id === id ? { ...saved, starred: !saved.starred } : saved,
      ),
    )
  }

  function handleToggleFurigana() {
    const next = !showFurigana
    setShowFurigana(next)
    saveFurigana(next)
  }

  function handleExplanationLanguage(language: ExplanationLanguage) {
    setExplanationLanguage(language)
    saveExplanationLanguage(language)
  }

  function openSettings() {
    setDrawerOpen(false)
    setSettingsOpen(true)
  }

  function openHistory() {
    setSettingsOpen(false)
    setDrawerOpen(true)
  }

  const handleSaveKey = useCallback(
    (key: string) => {
      const ok = saveApiKey(key)
      if (!ok) {
        showToast('Could not save the key — browser storage is unavailable.', 'error')
        return
      }

      const trimmed = key.trim()
      setApiKey(trimmed)
      setSettingsOpen(false)
      setError(null)
      showToast(trimmed ? 'Gemini key saved' : 'Key removed · Demo mode is on')
    },
    [showToast],
  )

  function handleSelectCard(id: string) {
    setActiveId(id)
    setError(null)
    setDrawerOpen(false)

    window.setTimeout(() => {
      const behavior: ScrollBehavior = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
        ? 'auto'
        : 'smooth'
      document
        .getElementById('context-card')
        ?.scrollIntoView({ behavior, block: 'start' })
    }, 100)
  }

  function handleClearHistory() {
    const confirmed = window.confirm(
      'Delete all saved cards? This only affects this browser.',
    )
    if (!confirmed) return

    setHistory([])
    setActiveId(null)
    setDrawerOpen(false)
    showToast('History cleared')
  }

  return (
    <div className="relative min-h-dvh">
      <div className="app-texture" aria-hidden="true" />

      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
        <div
          aria-hidden="true"
          className="h-[2px] bg-gradient-to-r from-vermilion via-vermilion/50 to-indigo-500/80"
        />
        <div className="mx-auto flex h-[58px] max-w-3xl items-center justify-between gap-2 px-4 sm:px-6">
          <div className="flex min-w-0 select-none items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-vermilion shadow-sm">
              <span className="text-[17px] font-bold leading-none text-white">
                師
              </span>
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-bold tracking-tight text-ink sm:text-sm">
                KPS-Sensei
              </p>
              <p className="hidden text-[9px] font-medium uppercase tracking-[0.17em] text-stone-500 sm:block">
                Japanese in context
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              role="switch"
              aria-checked={showFurigana}
              aria-label="Toggle furigana"
              title={`${showFurigana ? 'Hide' : 'Show'} furigana`}
              onClick={handleToggleFurigana}
              className={cn(
                'flex h-9 items-center gap-1.5 rounded-full border px-2.5 shadow-sm transition active:scale-95',
                showFurigana
                  ? 'border-indigo-200 bg-indigo-50/70 text-indigo-700'
                  : 'border-line bg-white text-stone-500 hover:text-stone-600',
              )}
            >
              <span aria-hidden="true" className="text-[12px] font-bold">
                あ
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'relative h-3.5 w-6 rounded-full transition-colors',
                  showFurigana ? 'bg-indigo-500' : 'bg-stone-300',
                )}
              >
                <span
                  className={cn(
                    'absolute left-0 top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow-sm transition-transform',
                    showFurigana ? 'translate-x-2.5' : 'translate-x-0.5',
                  )}
                />
              </span>
              <span className="hidden text-[10px] font-semibold md:inline">
                Furigana
              </span>
            </button>

            <button
              type="button"
              onClick={openHistory}
              aria-label={`Saved cards (${history.length})`}
              title="Saved cards"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-stone-500 shadow-sm transition hover:border-stone-300 hover:text-ink active:scale-95"
            >
              <Icon name="history" className="h-[17px] w-[17px]" />
              {history.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-vermilion px-1 text-[8px] font-bold leading-none text-white ring-2 ring-paper">
                  {history.length > 9 ? '9+' : history.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={openSettings}
              aria-label={
                apiKey ? 'API settings' : 'API settings (demo mode is on)'
              }
              title="API settings"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-stone-500 shadow-sm transition hover:border-stone-300 hover:text-ink active:scale-95"
            >
              <Icon name="settings" className="h-[17px] w-[17px]" />
              {!apiKey && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-vermilion ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-10 sm:px-6">
        {!activeCard && !loading && (
          <section className="pt-9 text-center sm:pt-14">
            <div className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-stone-500">
              <span aria-hidden="true" className="h-px w-5 bg-stone-300" />
              Japanese context cards
              <span aria-hidden="true" className="h-px w-5 bg-stone-300" />
            </div>
            <h1 className="mx-auto mt-3 max-w-xl text-[27px] font-extrabold leading-[1.18] tracking-[-0.035em] text-ink sm:text-[38px]">
              <span className="block">Learn the word.</span>
              <span className="block text-vermilion">Feel the context.</span>
            </h1>
            <p className="mx-auto mt-2.5 max-w-md text-[13px] leading-relaxed text-stone-500 sm:text-sm">
              Kanji, vocabulary, and grammar distilled into one scannable card.
            </p>
          </section>
        )}

        <div
          className={cn(
            activeCard || loading ? 'mt-5 sm:mt-7' : 'mt-6 sm:mt-7',
          )}
        >
          <SearchBar
            loading={loading}
            onSearch={handleSearch}
            inputRef={searchInputRef}
          />
        </div>

        {!apiKey &&
          !activeCard &&
          !loading &&
          !error && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3.5 py-2.5">
              <p className="flex items-center gap-2 text-[11px] leading-relaxed text-indigo-900/75">
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-indigo-600 shadow-sm">
                  <Icon name="sparkles" className="h-2.5 w-2.5" />
                  Demo mode
                </span>
                Three sample cards are ready to try.
              </p>
              <button
                type="button"
                onClick={openSettings}
                className="ml-auto text-[11px] font-semibold text-indigo-600 transition hover:underline"
              >
                Connect Gemini →
              </button>
            </div>
          )}

        {error && (
          <div
            role="alert"
            className={cn(
              'mt-5 flex items-start gap-3 rounded-xl border px-4 py-3.5',
              error.tone === 'demo'
                ? 'border-indigo-200 bg-indigo-50/70'
                : 'border-red-200 bg-red-50/80',
            )}
          >
            <Icon
              name="alert"
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0',
                error.tone === 'demo' ? 'text-indigo-500' : 'text-red-500',
              )}
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-[13px] font-semibold',
                  error.tone === 'demo' ? 'text-indigo-950' : 'text-red-900',
                )}
              >
                {error.title}
              </p>
              <p
                className={cn(
                  'mt-0.5 text-xs leading-relaxed',
                  error.tone === 'demo'
                    ? 'text-indigo-900/70'
                    : 'text-red-800/80',
                )}
              >
                {error.message}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {error.action === 'settings' && (
                <button
                  type="button"
                  onClick={openSettings}
                  className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11px] font-semibold text-stone-600 shadow-sm transition hover:border-stone-300 hover:text-ink"
                >
                  Add key
                </button>
              )}
              <button
                type="button"
                onClick={() => setError(null)}
                aria-label="Dismiss notice"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-500 transition hover:bg-white/70 hover:text-stone-600"
              >
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-7 sm:mt-9">
          {!loading && activeCard && hasBurmese(activeCard.card) && (
            <div className="mb-2 flex items-center justify-end gap-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
                Explanation
              </span>
              <div
                role="group"
                aria-label="Explanation language"
                className="flex items-center rounded-full border border-line bg-white p-0.5 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => handleExplanationLanguage('en')}
                  aria-pressed={explanationLanguage === 'en'}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-semibold transition',
                    explanationLanguage === 'en'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-stone-500 hover:text-ink',
                  )}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleExplanationLanguage('my')}
                  aria-pressed={explanationLanguage === 'my'}
                  className={cn(
                    'lang-my rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none transition',
                    explanationLanguage === 'my'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-stone-500 hover:text-ink',
                  )}
                >
                  မြန်မာ
                </button>
              </div>
            </div>
          )}
          {loading ? (
            <SkeletonCard />
          ) : activeCard ? (
            <ContextCard
              key={`${activeCard.id}-${activeCard.createdAt}`}
              card={activeCard.card}
              starred={activeCard.starred}
              demo={activeCard.demo}
              showFurigana={showFurigana}
              language={explanationLanguage}
              onToggleStar={() => handleToggleStar(activeCard.id)}
              onToggleFurigana={handleToggleFurigana}
            />
          ) : (
            <EmptyState demoMode={!apiKey} />
          )}
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-8 pt-2 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-1.5 border-t border-line pt-5 text-[10px] text-stone-500 sm:flex-row">
          <p className="font-medium tracking-wide">
            KPS-Sensei
            <span aria-hidden="true" className="mx-1.5 text-stone-300">
              ·
            </span>
            Japanese in context
          </p>
          <p>Cards &amp; keys stay in localStorage</p>
        </div>
      </footer>

      {drawerOpen && (
        <HistoryDrawer
          open={drawerOpen}
          cards={history}
          activeId={activeId}
          onClose={closeDrawer}
          onSelect={handleSelectCard}
          onToggleStar={handleToggleStar}
          language={explanationLanguage}
          onClear={handleClearHistory}
        />
      )}

      <ApiKeyModal
        open={settingsOpen}
        apiKey={apiKey}
        onClose={closeSettings}
        onSave={handleSaveKey}
      />

      <Toast toast={toast} />
    </div>
  )
}

export default App
