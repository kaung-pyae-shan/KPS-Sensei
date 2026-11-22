import type { RefObject } from 'react'
import { useState, type FormEvent } from 'react'
import { Icon } from './Icon'

const SAMPLES = [
  { query: '届', label: 'Kanji' },
  { query: '遠慮', label: 'Kotoba' },
  { query: '〜てしまう', label: 'Grammar' },
] as const

interface SearchBarProps {
  loading: boolean
  onSearch: (query: string) => void
  inputRef?: RefObject<HTMLInputElement | null>
}

export function SearchBar({ loading, onSearch, inputRef }: SearchBarProps) {
  const [query, setQuery] = useState('')

  function submit(value: string) {
    const trimmed = value.trim()
    if (!trimmed || loading) return
    onSearch(trimmed)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submit(query)
  }

  function handleSample(sample: string) {
    setQuery(sample)
    submit(sample)
  }

  return (
    <div>
      <div className="rounded-2xl border border-line bg-white p-2 shadow-card transition focus-within:border-indigo-300 focus-within:shadow-lift focus-within:ring-4 focus-within:ring-indigo-500/10">
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          <Icon
            name="search"
            className="ml-2.5 h-5 w-5 shrink-0 text-stone-500"
          />
          <label htmlFor="kps-search" className="sr-only">
            Search for a Japanese kanji, word, or grammar point
          </label>
          <input
            id="kps-search"
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="search"
            placeholder="Search kanji, kotoba, grammar…"
            className="h-12 min-w-0 flex-1 bg-transparent px-2 text-[15px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-stone-500 [&::-webkit-search-cancel-button]:hidden sm:text-base"
          />
          <kbd
            aria-hidden="true"
            className="mr-1 hidden h-6 items-center rounded-md border border-line bg-stone-50 px-1.5 font-sans text-[11px] font-medium text-stone-500 md:flex"
          >
            /
          </kbd>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none sm:px-5"
          >
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
                <span aria-hidden="true" className="hidden sm:inline">
                  Looking up
                </span>
                <span className="sr-only">Looking up</span>
              </>
            ) : (
              <>
                <span aria-hidden="true" className="hidden sm:inline">
                  Look up
                </span>
                <span className="sr-only">Look up</span>
                <Icon name="arrow-right" className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="mr-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          Try
        </span>
        {SAMPLES.map((sample) => (
          <button
            key={sample.query}
            type="button"
            onClick={() => handleSample(sample.query)}
            disabled={loading}
            className="group inline-flex items-center gap-2 rounded-full border border-line bg-white/80 py-1.5 pl-3 pr-2.5 text-sm text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:border-vermilion/30 hover:text-vermilion disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <span className="font-semibold tracking-wide">{sample.query}</span>
            <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-stone-500 transition group-hover:text-vermilion/60">
              {sample.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
