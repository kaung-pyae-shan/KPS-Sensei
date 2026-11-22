import type { RubySegment } from '../types'

interface RubyTextProps {
  segments: RubySegment[]
  showFurigana: boolean
  className?: string
}

export function RubyText({
  segments,
  showFurigana,
  className,
}: RubyTextProps) {
  return (
    <span className={className}>
      {segments.map((segment, index) =>
        showFurigana && segment.reading ? (
          <ruby key={`${segment.text}-${index}`}>
            {segment.text}
            <rt>{segment.reading}</rt>
          </ruby>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ),
      )}
    </span>
  )
}
