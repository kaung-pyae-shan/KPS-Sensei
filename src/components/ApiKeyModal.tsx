import { useEffect, useRef, useState, type FormEvent } from 'react'
import { GEMINI_MODEL } from '../services/gemini'
import { cn } from '../lib/utils'
import { Icon } from './Icon'

const AI_STUDIO_URL = 'https://aistudio.google.com/app/apikey'

interface ApiKeyModalProps {
  open: boolean
  apiKey: string
  onClose: () => void
  onSave: (key: string) => void
}

type ApiKeyDialogProps = Omit<ApiKeyModalProps, 'open'>

function ApiKeyDialog({ apiKey, onClose, onSave }: ApiKeyDialogProps) {
  const [value, setValue] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 60)

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSave(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close settings"
        tabIndex={-1}
        onClick={onClose}
        className="animate-fade-in absolute inset-0 h-full w-full cursor-default bg-ink/25 backdrop-blur-[2px]"
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-y-auto p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          aria-describedby="settings-description"
          className="animate-modal-in pointer-events-auto w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
        >
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-vermilion/10 text-vermilion">
                <Icon name="key" className="h-5 w-5" />
              </span>
              <div>
                <h2
                  id="settings-title"
                  className="text-base font-bold tracking-tight text-ink"
                >
                  Connect Gemini
                </h2>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  Optional — Demo mode works without a key.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close settings"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-stone-500 shadow-sm transition hover:border-stone-300 hover:text-ink active:scale-95"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-stone-50/70 px-3.5 py-3">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-2 w-2 rounded-full',
                      apiKey ? 'bg-emerald-500' : 'bg-indigo-400',
                    )}
                  />
                  <div>
                    <p className="text-xs font-semibold text-stone-700">
                      {apiKey ? 'Key saved in this browser' : 'Demo mode is on'}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-stone-500">
                      {apiKey
                        ? `Live lookups with ${GEMINI_MODEL}.`
                        : 'Try 届, 遠慮, or 〜てしまう from the home screen.'}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]',
                    apiKey
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-indigo-50 text-indigo-600',
                  )}
                >
                  {apiKey ? 'Ready' : 'No key'}
                </span>
              </div>

              <div>
                <div className="flex items-end justify-between gap-3">
                  <label
                    htmlFor="gemini-key"
                    className="text-xs font-semibold text-stone-700"
                  >
                    Gemini API key
                  </label>
                  <a
                    href={AI_STUDIO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 underline-offset-2 hover:underline"
                  >
                    Get a free key
                    <Icon name="external" className="h-3 w-3" />
                  </a>
                </div>

                <div className="relative mt-1.5">
                  <input
                    ref={inputRef}
                    id="gemini-key"
                    type={showKey ? 'text' : 'password'}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Paste your AI Studio key…"
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className="h-11 w-full rounded-xl border border-line bg-white px-3.5 pr-11 font-mono text-[13px] text-ink outline-none transition placeholder:font-sans placeholder:text-stone-500 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((current) => !current)}
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-600"
                  >
                    <Icon
                      name={showKey ? 'eye-off' : 'eye'}
                      className="h-4 w-4"
                    />
                  </button>
                </div>

                <p
                  id="settings-description"
                  className="mt-2 text-[10px] leading-relaxed text-stone-500"
                >
                  Requests go directly from your browser to Google AI. The key
                  is stored in localStorage and is never sent anywhere else.
                </p>
              </div>

              <div className="flex gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                <Icon
                  name="sparkles"
                  className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
                />
                <p className="text-[11px] leading-relaxed text-indigo-900/80">
                  <span className="font-semibold text-indigo-950">
                    No key yet?
                  </span>{' '}
                  Demo mode includes three ready-made cards so you can try the
                  full experience immediately.
                </p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <a
                  href={AI_STUDIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-medium text-stone-500 transition hover:text-indigo-600"
                >
                  Open Google AI Studio →
                </a>
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setValue('')
                      onSave('')
                    }}
                    className="text-[11px] font-medium text-stone-500 transition hover:text-red-600"
                  >
                    Remove saved key
                  </button>
                )}
              </div>
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-line bg-stone-50/60 px-5 py-3.5 sm:px-6">
              <span className="hidden text-[10px] text-stone-500 sm:inline">
                {GEMINI_MODEL} · strict JSON schema
              </span>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-stone-500 transition hover:bg-stone-200/60 hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!value.trim()}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none"
                >
                  Save key
                </button>
              </div>
            </footer>
          </form>
        </div>
      </div>
    </div>
  )
}

export function ApiKeyModal({ open, ...dialogProps }: ApiKeyModalProps) {
  if (!open) return null
  return <ApiKeyDialog {...dialogProps} />
}
