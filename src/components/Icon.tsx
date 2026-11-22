import type { ReactNode } from 'react'

export type IconName =
  | 'search'
  | 'arrow-right'
  | 'settings'
  | 'history'
  | 'star'
  | 'volume'
  | 'stop'
  | 'close'
  | 'eye'
  | 'eye-off'
  | 'key'
  | 'sparkles'
  | 'external'
  | 'check'
  | 'alert'
  | 'trash'
  | 'book'
  | 'chevron-right'

interface IconProps {
  name: IconName
  className?: string
  filled?: boolean
  strokeWidth?: number
}

function paths(name: IconName): ReactNode {
  switch (name) {
    case 'search':
      return (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.4-3.4" />
        </>
      )
    case 'arrow-right':
      return (
        <>
          <path d="M4 12h15" />
          <path d="m13 6 6 6-6 6" />
        </>
      )
    case 'settings':
      return (
        <>
          <path d="M4 6h9" />
          <path d="M18 6h2" />
          <circle cx="15.5" cy="6" r="2" />
          <path d="M4 12h2" />
          <path d="M10 12h10" />
          <circle cx="8.5" cy="12" r="2" />
          <path d="M4 18h9" />
          <path d="M18 18h2" />
          <circle cx="15.5" cy="18" r="2" />
        </>
      )
    case 'history':
      return (
        <>
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l3 2" />
        </>
      )
    case 'star':
      return (
        <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      )
    case 'volume':
      return (
        <>
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.4 5.6a9 9 0 0 1 0 12.8" />
        </>
      )
    case 'stop':
      return <rect x="6" y="6" width="12" height="12" rx="1.5" />
    case 'close':
      return (
        <>
          <path d="m6 6 12 12" />
          <path d="M18 6 6 18" />
        </>
      )
    case 'eye':
      return (
        <>
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )
    case 'eye-off':
      return (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.6 5.7A10.9 10.9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.1 3.8" />
          <path d="M6.2 6.2A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1.2 0 2.3-.2 3.3-.6" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </>
      )
    case 'key':
      return (
        <>
          <circle cx="7.5" cy="15.5" r="4.5" />
          <path d="m11 12 9.5-9.5" />
          <path d="m15.5 7.5 3 3L22 7l-3-3" />
        </>
      )
    case 'sparkles':
      return (
        <>
          <path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" />
          <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" />
        </>
      )
    case 'external':
      return (
        <>
          <path d="M14 3h7v7" />
          <path d="M10 14 21 3" />
          <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
        </>
      )
    case 'check':
      return <path d="m5 12 5 5L20 7" />
    case 'alert':
      return (
        <>
          <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </>
      )
    case 'trash':
      return (
        <>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="m19 6-1 15H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </>
      )
    case 'book':
      return (
        <>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </>
      )
    case 'chevron-right':
      return <path d="m9 18 6-6-6-6" />
  }
}

export function Icon({
  name,
  className = 'h-5 w-5',
  filled = false,
  strokeWidth = 1.8,
}: IconProps) {
  const canFill = name === 'star' || name === 'stop'
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={className}
      fill={canFill && filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths(name)}
    </svg>
  )
}
