import { useMemo } from 'react'
import type { PitchReading } from '../types'
import type { IndianNote } from '../types'

export function TuningMeter({ cents, dimmed = false }: { cents: number; dimmed?: boolean }) {
  const clampedCents = Math.max(-50, Math.min(50, cents))
  const position = ((clampedCents + 50) / 100) * 100

  const color = useMemo(() => {
    if (dimmed) return 'bg-text-muted/20'
    const abs = Math.abs(cents)
    if (abs <= 10) return 'bg-accent'
    if (abs <= 25) return 'bg-warning'
    return 'bg-danger'
  }, [cents, dimmed])

  return (
    <div className={`w-full max-w-md mx-auto transition-opacity ${dimmed ? 'opacity-40' : 'opacity-100'}`}>
      <div className="relative h-2.5 rounded-full bg-surface-overlay/80">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-text-muted/25" />
        <div
          className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full needle-transition ${color}`}
          style={{ left: `calc(${position}% - 5px)` }}
        />
      </div>
    </div>
  )
}

export function getTuningColorClass(cents: number): string {
  const abs = Math.abs(cents)
  if (abs <= 10) return 'text-accent'
  if (abs <= 25) return 'text-warning'
  return 'text-danger'
}

export function NoteDisplay({
  note,
  size = 'large',
}: {
  note: IndianNote | null
  size?: 'large' | 'medium'
}) {
  const sizeClass = size === 'large' ? 'text-7xl md:text-8xl' : 'text-5xl'
  return (
    <div className={`font-bold tracking-widest ${sizeClass} text-text`}>
      {note ?? '—'}
    </div>
  )
}

export function StabilityBar({ stability }: { stability: number }) {
  const color =
    stability >= 80 ? 'bg-accent' : stability >= 60 ? 'bg-warning' : 'bg-danger'

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="h-2 bg-surface-overlay rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${stability}%` }}
        />
      </div>
    </div>
  )
}

export function PitchGraph({ history }: { history: number[] }) {
  const width = 300
  const height = 60
  const points = history.slice(-100)

  const path = useMemo(() => {
    if (points.length < 2) return ''
    const step = width / (points.length - 1)
    return points
      .map((cents, i) => {
        const x = i * step
        const y = height / 2 - (cents / 50) * (height / 2 - 4)
        return `${i === 0 ? 'M' : 'L'}${x},${y}`
      })
      .join(' ')
  }, [points, width, height])

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-md h-16 mx-auto"
      preserveAspectRatio="none"
    >
      <line
        x1="0"
        y1={height / 2}
        x2={width}
        y2={height / 2}
        stroke="#c4a038"
        strokeOpacity="0.15"
        strokeWidth="1"
      />
      {path && (
        <path d={path} fill="none" stroke="#c4a038" strokeWidth="2" opacity="0.7" />
      )}
    </svg>
  )
}

export function BreathQualityIndicator({ reading }: { reading: PitchReading }) {
  const quality = useMemo(() => {
    const pitchScore = reading.stability
    const volumeScore = reading.volume > 0.01 && reading.volume < 0.5 ? 80 : 50
    const combined = pitchScore * 0.7 + volumeScore * 0.3
    if (combined >= 80) return { label: 'Excellent', color: 'text-accent' }
    if (combined >= 55) return { label: 'Good', color: 'text-warning' }
    return { label: 'Needs Work', color: 'text-danger' }
  }, [reading.stability, reading.volume])

  return (
    <div className="text-center">
      <p className="text-sm text-text-muted mb-1">Breath Control</p>
      <p className={`text-xl font-semibold ${quality.color}`}>{quality.label}</p>
    </div>
  )
}
