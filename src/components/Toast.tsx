export interface ToastMessage {
  id: number
  message: string
  tone: 'success' | 'error'
}

interface ToastProps {
  toast: ToastMessage | null
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-toast-in fixed bottom-5 left-1/2 z-[70] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-white/10 bg-ink px-4 py-2.5 text-[13px] font-medium text-white shadow-xl"
    >
      <span
        aria-hidden="true"
        className={
          toast.tone === 'error' ? 'text-red-300' : 'text-emerald-300'
        }
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {toast.tone === 'error' ? (
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </>
          ) : (
            <path d="m5 12 5 5L20 7" />
          )}
        </svg>
      </span>
      <span className="truncate">{toast.message}</span>
    </div>
  )
}
