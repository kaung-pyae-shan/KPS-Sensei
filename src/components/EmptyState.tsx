import type { IconName } from './Icon'
import { Icon } from './Icon'

const STEPS: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: 'search',
    title: 'Look it up',
    body: 'Any kanji, kotoba, or grammar pattern.',
  },
  {
    icon: 'sparkles',
    title: 'Read the vibe',
    body: 'Register, pattern, and two real examples.',
  },
  {
    icon: 'star',
    title: 'Keep what sticks',
    body: 'Star cards and switch English ↔ မြန်မာ explanations.',
  },
]

interface EmptyStateProps {
  demoMode: boolean
}

export function EmptyState({ demoMode }: EmptyStateProps) {
  return (
    <section className="animate-fade-in overflow-hidden rounded-2xl border border-dashed border-stone-300 bg-white/70 shadow-sm">
      <div className="grid gap-px bg-line/70 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <div key={step.title} className="bg-white/85 px-5 py-5">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-stone-50 text-stone-500">
                <Icon name={step.icon} className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-medium tabular-nums tracking-[0.16em] text-stone-500">
                0{index + 1}
              </span>
            </div>
            <h2 className="mt-3 text-sm font-semibold text-ink">{step.title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">
              {step.body}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 border-t border-line bg-stone-50/60 px-5 py-3 text-[10px] text-stone-500 sm:flex-row sm:items-center sm:justify-between">
        <span>One card, not a wall of text.</span>
        <span>
          {demoMode
            ? 'Demo samples above · add a key to search anything'
            : 'Powered by Gemini · saved locally'}
        </span>
      </div>
    </section>
  )
}
