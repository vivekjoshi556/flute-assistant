import type { NoteTarget } from '../music/register'
import { noteTargetLabel } from '../music/register'

interface SequenceContextProps {
  sequence: NoteTarget[]
  currentIndex: number
  baseOctave?: number
}

/** Static window of nearby notes — no sliding animation, no clipped edges. */
export function SequenceContext({
  sequence,
  currentIndex,
  baseOctave = 5,
}: SequenceContextProps) {
  if (sequence.length <= 1) return null

  const before = 2
  const after = 2
  const start = Math.max(0, currentIndex - before)
  const end = Math.min(sequence.length, currentIndex + after + 1)
  const visible = sequence.slice(start, end)

  const nextLabel =
    currentIndex + 1 < sequence.length
      ? noteTargetLabel(sequence[currentIndex + 1], baseOctave)
      : null

  return (
    <div className="space-y-2 text-center">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {start > 0 && (
          <span className="text-xs text-text-muted/50">…</span>
        )}
        {visible.map((note, i) => {
          const idx = start + i
          const isCurrent = idx === currentIndex
          const isDone = idx < currentIndex
          const label = noteTargetLabel(note, baseOctave)

          return (
            <span
              key={`${idx}-${label}`}
              className={`
                rounded-md px-2.5 py-1 font-mono text-xs tracking-wide
                ${isCurrent
                  ? 'bg-accent-soft/20 text-accent-soft font-semibold ring-1 ring-accent-soft/30'
                  : isDone
                    ? 'text-text-muted/40 line-through'
                    : 'text-text-muted/70'
                }
              `}
            >
              {label}
            </span>
          )
        })}
        {end < sequence.length && (
          <span className="text-xs text-text-muted/50">…</span>
        )}
      </div>
      {nextLabel && (
        <p className="text-xs text-text-muted">
          Up next: <span className="text-text-muted/90">{nextLabel}</span>
        </p>
      )}
    </div>
  )
}
