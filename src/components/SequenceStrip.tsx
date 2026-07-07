import { useEffect, useRef, useState } from 'react'
import type { NoteTarget } from '../music/register'
import { noteTargetLabel } from '../music/register'

interface SequenceStripProps {
  sequence: NoteTarget[]
  currentIndex: number
  baseOctave?: number
}

const ITEM_GAP = 8

export function SequenceStrip({
  sequence,
  currentIndex,
  baseOctave = 5,
}: SequenceStripProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    const items = track.children
    const current = items[currentIndex] as HTMLElement | undefined
    if (!current) return

    const containerCenter = container.clientWidth / 2
    const itemCenter = current.offsetLeft + current.offsetWidth / 2
    setOffset(containerCenter - itemCenter)
  }, [currentIndex, sequence.length])

  if (sequence.length <= 1) return null

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden py-2"
      aria-label="Note sequence"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent" />

      <div
        ref={trackRef}
        className="flex items-center transition-transform duration-300 ease-out"
        style={{
          gap: ITEM_GAP,
          transform: `translateX(${offset}px)`,
        }}
      >
        {sequence.map((note, i) => {
          const isCurrent = i === currentIndex
          const isDone = i < currentIndex
          const label = noteTargetLabel(note, baseOctave)

          return (
            <span
              key={`${label}-${i}`}
              className={`
                shrink-0 rounded-lg px-3 py-1.5 font-mono text-sm font-bold tracking-wider
                transition-all duration-300
                ${isCurrent
                  ? 'scale-110 bg-accent text-surface-raised shadow-[0_0_20px_rgba(61,214,168,0.35)]'
                  : isDone
                    ? 'bg-accent/15 text-accent/60 line-through opacity-50'
                    : 'bg-surface-overlay text-text-muted border border-border/50'
                }
              `}
            >
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
