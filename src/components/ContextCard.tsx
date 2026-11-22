import { useEffect, useRef, useState } from 'react'
import type {
  CardCategory,
  ContextCardData,
  ExampleSentence,
  ExplanationLanguage,
} from '../types'
import { cn, segmentsToPlainText } from '../lib/utils'
import { Icon } from './Icon'
import { RubyText } from './RubyText'

const CATEGORY_STYLES: Record<
  CardCategory,
  { badge: string; dot: string }
> = {
  Kanji: {
    badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
    dot: 'bg-indigo-500',
  },
  Kotoba: {
    badge: 'bg-vermilion/10 text-vermilion-dark ring-vermilion/20',
    dot: 'bg-vermilion',
  },
  Grammar: {
    badge: 'bg-moss/10 text-moss ring-moss/20',
    dot: 'bg-moss',
  },
}

interface ContextCardProps {
  card: ContextCardData
  starred: boolean
  demo: boolean
  showFurigana: boolean
  language: ExplanationLanguage
  onToggleStar: () => void
  onToggleFurigana: () => void
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rounded-[1px] bg-vermilion/80"
      />
      {children}
    </h3>
  )
}

function speechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function ContextCard({
  card,
  starred,
  demo,
  showFurigana,
  language,
  onToggleStar,
  onToggleFurigana,
}: ContextCardProps) {
  const [speaking, setSpeaking] = useState<number | null>(null)
  const speechToken = useRef(0)
  const categoryStyle = CATEGORY_STYLES[card.category]
  const isBurmese = language === 'my'
  const meaning = isBurmese && card.meaningMy ? card.meaningMy : card.meaning
  const vibe = isBurmese && card.vibeMy ? card.vibeMy : card.vibe
  const patternNote =
    isBurmese && card.patternNoteMy ? card.patternNoteMy : card.patternNote
  const showBurmeseMeaning = isBurmese && Boolean(card.meaningMy)
  const showBurmeseVibe = isBurmese && Boolean(card.vibeMy)
  const showBurmeseNote = isBurmese && Boolean(card.patternNoteMy)

  useEffect(() => {
    return () => {
      speechToken.current += 1
      if (speechAvailable()) window.speechSynthesis.cancel()
    }
  }, [card.term])

  function stopSpeech() {
    speechToken.current += 1
    if (speechAvailable()) window.speechSynthesis.cancel()
    setSpeaking(null)
  }

  function speakExample(example: ExampleSentence, index: number) {
    if (!speechAvailable()) return

    if (speaking === index) {
      stopSpeech()
      return
    }

    window.speechSynthesis.cancel()
    const token = speechToken.current + 1
    speechToken.current = token

    const utterance = new SpeechSynthesisUtterance(
      segmentsToPlainText(example.segments),
    )
    utterance.lang = 'ja-JP'
    utterance.rate = 0.88
    utterance.pitch = 1

    const voices = window.speechSynthesis.getVoices()
    const japaneseVoice =
      voices.find((voice) => voice.lang.toLowerCase() === 'ja-jp') ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith('ja'))
    if (japaneseVoice) utterance.voice = japaneseVoice

    utterance.onend = () => {
      if (speechToken.current === token) setSpeaking(null)
    }
    utterance.onerror = () => {
      if (speechToken.current === token) setSpeaking(null)
    }

    setSpeaking(index)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <article
      id="context-card"
      className="animate-fade-in scroll-mt-24 overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
    >
      <header className="px-5 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset',
                  categoryStyle.badge,
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn('h-1.5 w-1.5 rounded-full', categoryStyle.dot)}
                />
                {card.category}
              </span>
              {demo && (
                <span className="inline-flex items-center rounded-full border border-dashed border-stone-300 bg-stone-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-stone-500">
                  Demo card
                </span>
              )}
            </div>

            <h2 className="mt-4 break-words text-[2.75rem] font-bold leading-[1.05] tracking-[-0.035em] text-ink sm:text-6xl">
              {card.term}
            </h2>

            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-base font-medium tracking-wide text-stone-500 sm:text-lg">
                {card.reading}
              </span>
              <span
                aria-hidden="true"
                className="inline-block h-1 w-1 rounded-full bg-stone-300"
              />
              <span className={cn('text-[15px] font-medium text-stone-600', showBurmeseMeaning && 'lang-my')}>
                {meaning}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleStar}
            aria-pressed={starred}
            aria-label={starred ? 'Remove bookmark' : 'Bookmark this card'}
            title={starred ? 'Remove bookmark' : 'Bookmark this card'}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition active:scale-90',
              starred
                ? 'border-vermilion/25 bg-vermilion/5 text-vermilion'
                : 'border-line bg-white text-stone-500 hover:border-vermilion/25 hover:text-vermilion',
            )}
          >
            <Icon name="star" filled={starred} className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      <section className="border-t border-line px-5 py-5 sm:px-8">
        <SectionLabel>Vibe &amp; context</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {card.registers.map((register) => (
            <span
              key={register}
              className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-600"
            >
              {register}
            </span>
          ))}
        </div>
        <p className={cn('mt-3 max-w-2xl text-sm leading-relaxed text-stone-600', showBurmeseVibe && 'lang-my')}>
          {vibe}
        </p>
      </section>

      <section className="border-t border-line px-5 py-5 sm:px-8">
        <SectionLabel>How to use</SectionLabel>
        <div className="relative mt-3 overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50/60 py-3.5 pl-4 pr-4">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[3px] bg-indigo-400/70"
          />
          <p className="break-words text-[15px] font-semibold tracking-wide text-indigo-950 sm:text-base">
            {card.pattern}
          </p>
          {patternNote && (
            <p className={cn('mt-1 text-xs leading-relaxed text-indigo-700/80', showBurmeseNote && 'lang-my')}>
              {patternNote}
            </p>
          )}
        </div>
      </section>

      <section className="border-t border-line px-5 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>Real-world examples</SectionLabel>
          <button
            type="button"
            onClick={onToggleFurigana}
            className="text-[11px] font-medium text-stone-500 underline-offset-2 transition hover:text-indigo-600 hover:underline"
          >
            {showFurigana ? 'Hide furigana' : 'Show furigana'}
          </button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {card.examples.map((example, index) => {
            const isSpeaking = speaking === index
            const speechLabel = `Play ${example.register.toLowerCase()} example`
            return (
              <div
                key={`${example.register}-${index}`}
                className="rounded-xl border border-line bg-stone-50/60 p-4 transition hover:border-stone-300 hover:bg-stone-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    {example.register}
                  </span>
                  <button
                    type="button"
                    onClick={() => speakExample(example, index)}
                    disabled={!speechAvailable()}
                    aria-label={isSpeaking ? 'Stop audio' : speechLabel}
                    aria-pressed={isSpeaking}
                    title={
                      speechAvailable()
                        ? 'Listen · ja-JP'
                        : 'Speech is unavailable in this browser'
                    }
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40',
                      isSpeaking
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                        : 'border-line bg-white text-stone-500 hover:border-indigo-200 hover:text-indigo-600',
                    )}
                  >
                    <Icon
                      name={isSpeaking ? 'stop' : 'volume'}
                      filled={isSpeaking}
                      className="h-3.5 w-3.5"
                    />
                  </button>
                </div>

                <p className="mt-3 break-words text-xl leading-[2.05] tracking-wide text-stone-800">
                  <RubyText
                    segments={example.segments}
                    showFurigana={showFurigana}
                  />
                </p>
                <p
                  className={cn(
                    'mt-1 text-[13px] leading-relaxed text-stone-500',
                    isBurmese && example.translationMy && 'lang-my',
                  )}
                >
                  {isBurmese && example.translationMy
                    ? example.translationMy
                    : example.translation}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-stone-50/50 px-5 py-3 text-[11px] text-stone-500 sm:px-8">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="book" className="h-3.5 w-3.5" />
          Saved to your cards
        </span>
        <span>{demo ? 'Demo response' : 'Gemini'}</span>
      </footer>
    </article>
  )
}
