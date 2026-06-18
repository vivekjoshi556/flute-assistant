import { useMemo } from 'react'
import type { PitchReading } from '../types'
import type { IndianNote } from '../types'

export function TuningMeter({ cents }: { cents: number }) {
  const clampedCents = Math.max(-50, Math.min(50, cents))
  const position = ((clampedCents + 50) / 100) * 100

  const color = useMemo(() => {
    const abs = Math.abs(cents)
    if (abs <= 10) return 'bg-accent'
    if (abs <= 25) return 'bg-warning'
    return 'bg-danger'
  }, [cents])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-xs text-text-muted mb-2 px-1">
        <span>Too Low</span>
        <span>Perfect</span>
        <span>Too High</span>
      </div>
      <div className="relative h-3 bg-surface-overlay rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-1/2 w-px bg-accent/40 -translate-x-1/2" />
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full needle-transition ${color} shadow-lg`}
          style={{ left: `calc(${position}% - 6px)` }}
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
        stroke="#34d399"
        strokeOpacity="0.2"
        strokeWidth="1"
      />
      {path && (
        <path d={path} fill="none" stroke="#34d399" strokeWidth="2" opacity="0.8" />
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
