export function SkeletonCard() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
    >
      <span className="sr-only">Building your context card…</span>

      <div className="px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="w-full">
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton mt-5 h-12 w-40 sm:h-14 sm:w-52" />
            <div className="skeleton mt-4 h-4 w-56 max-w-full" />
          </div>
          <div className="skeleton h-10 w-10 shrink-0 rounded-xl" />
        </div>
      </div>

      <div className="border-t border-line px-5 py-5 sm:px-8">
        <div className="skeleton h-3 w-24" />
        <div className="mt-4 flex gap-2">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-14 rounded-full" />
        </div>
        <div className="skeleton mt-4 h-4 w-full max-w-lg" />
      </div>

      <div className="border-t border-line px-5 py-5 sm:px-8">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton mt-4 h-[68px] w-full rounded-xl" />
      </div>

      <div className="border-t border-line px-5 py-5 sm:px-8">
        <div className="skeleton h-3 w-32" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[0, 1].map((example) => (
            <div
              key={example}
              className="rounded-xl border border-line bg-stone-50/40 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="skeleton h-4 w-14 rounded-full" />
                <div className="skeleton h-8 w-8 rounded-full" />
              </div>
              <div className="skeleton mt-4 h-6 w-11/12" />
              <div className="skeleton mt-3 h-3.5 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
