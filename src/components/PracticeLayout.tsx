import type { ReactNode } from 'react'
import type { IndianNote, PitchReading } from '../types'
import type { NoteTarget } from '../music/register'
import { noteTargetLabel } from '../music/register'
import { getNoteFrequency } from '../music/notes'
import type { FluteKey } from '../types'
import { NoteDisplay } from './TuningDisplay'
import { NoteWheel } from './NoteWheel'
import { DetectionPanel } from './DetectionPanel'
import { PitchTraceChart } from './PitchTraceChart'
import { RegisterIndicator } from './RegisterIndicator'
import { NoteHintsPanel } from './NoteHintsPanel'
import type { ChartPoint } from '../hooks/usePitchChart'

export type FeedbackState =
  | { type: 'idle' }
  | { type: 'correct' }
  | { type: 'hold'; count: number }
  | { type: 'wrong'; expected: IndianNote; detected: IndianNote; distance: number }
  | { type: 'close'; cents: number; label: string }
  | { type: 'register'; message: string }

interface PracticeLayoutProps {
  target: NoteTarget | null
  targetSequence?: NoteTarget[]
  currentIndex?: number
  reading: PitchReading
  chartPoints: ChartPoint[]
  feedback: FeedbackState
  fluteKey: FluteKey
  showHints?: boolean
  hintsAvailable?: boolean
  statusLabel?: string
  children?: ReactNode
  footer?: ReactNode
}

export function PracticeLayout({
  target,
  targetSequence,
  currentIndex = 0,
  reading,
  chartPoints,
  feedback,
  fluteKey,
  showHints = false,
  hintsAvailable = true,
  statusLabel = 'Play',
  children,
  footer,
}: PracticeLayoutProps) {
  const expectedFrequency =
    target ? getNoteFrequency(target.note, fluteKey, target.octave) : null

  const detectedNote = reading.note
  const showHintsPanel = showHints && target

  return (
    <div className="space-y-4">
      <div className="text-center py-2">
        <p className="text-sm text-text-muted uppercase tracking-widest mb-1">
          {statusLabel}
          {targetSequence && targetSequence.length > 0 && (
            <span className="ml-2 normal-case">
              · {currentIndex + 1} / {targetSequence.length}
            </span>
          )}
        </p>
        <NoteDisplay note={target?.note ?? null} size="large" />
        {target && (
          <p className="text-sm text-accent mt-1">{noteTargetLabel(target)}</p>
        )}
      </div>

      {targetSequence && targetSequence.length > 1 && (
        <div className="flex flex-wrap justify-center gap-1.5 px-2 min-h-[28px]">
          {targetSequence.map((n, i) => (
            <span
              key={`${n.note}-${n.octave}-${i}`}
              className={`text-xs px-2 py-1 rounded-md ${
                i === currentIndex
                  ? 'bg-accent/25 text-accent font-bold'
                  : i < currentIndex
                    ? 'bg-surface-overlay text-text-muted line-through opacity-50'
                    : 'bg-surface-overlay text-text-muted'
              }`}
            >
              {noteTargetLabel(n)}
            </span>
          ))}
        </div>
      )}

      <div className="min-h-[120px] flex items-center justify-center">
        <FeedbackBanner feedback={feedback} />
      </div>

      <div
        className={`grid gap-4 ${
          hintsAvailable ? 'lg:grid-cols-[1fr_220px]' : ''
        }`}
      >
        <div className="space-y-4">
          <div className="text-center bg-surface-overlay/50 rounded-xl py-3 min-h-[80px] flex flex-col justify-center">
            <p className="text-xs text-text-muted uppercase mb-1">
              {reading.isPlaying ? 'You are playing' : 'Waiting for flute…'}
            </p>
            <p className="text-3xl font-bold tracking-widest">
              {detectedNote ?? '—'}
            </p>
            {!reading.isPlaying && (
              <p className="text-xs text-text-muted mt-1">
                Blow into the flute to start detection
              </p>
            )}
          </div>

          <PitchTraceChart
            points={chartPoints}
            liveExpected={expectedFrequency}
            liveActual={reading.frequency > 0 ? reading.frequency : null}
            liveExpectedLabel={target ? noteTargetLabel(target) : null}
            liveActualLabel={detectedNote}
          />
          <RegisterIndicator
            detectedOctave={reading.octave}
            expectedOctave={target?.octave}
          />
          <NoteWheel detectedNote={detectedNote} targetNote={target?.note ?? null} />
          <DetectionPanel
            reading={reading}
            expectedFrequency={expectedFrequency}
            targetNote={target?.note ?? null}
            targetOctave={target?.octave}
            isPlaying={reading.isPlaying}
          />
        </div>

        <div className="hidden lg:block">
          {showHintsPanel && target ? (
            <NoteHintsPanel note={target.note} />
          ) : hintsAvailable ? (
            <div className="h-full min-h-[200px] rounded-xl border border-border/50 bg-surface-raised/30 p-4">
              <p className="text-xs text-text-muted">
                Hints appear here when you need help with a note.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {showHintsPanel && target && (
        <div className="lg:hidden">
          <NoteHintsPanel note={target.note} />
        </div>
      )}

      {children}
      {footer}
    </div>
  )
}

function FeedbackBanner({ feedback }: { feedback: FeedbackState }) {
  switch (feedback.type) {
    case 'correct':
      return (
        <div className="text-center text-accent text-xl font-bold px-4 py-4 rounded-xl bg-accent/10 border border-accent/30 w-full max-w-md">
          ✓ Correct — hold steady
        </div>
      )
    case 'hold':
      return (
        <div className="text-center px-4 py-4 rounded-xl bg-accent/10 border border-accent/30 w-full max-w-md">
          <p className="text-text-muted text-sm">Hold for</p>
          <p className="text-5xl font-bold text-accent tabular-nums">{feedback.count}</p>
        </div>
      )
    case 'wrong':
      return (
        <div className="bg-surface-raised border border-danger/30 rounded-xl p-4 w-full max-w-md">
          <p className="text-danger font-medium text-center mb-2">Wrong note</p>
          <div className="grid grid-cols-3 gap-2 text-sm text-center">
            <div>
              <p className="text-text-muted text-xs">Expected</p>
              <p className="font-bold">{feedback.expected}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Detected</p>
              <p className="font-bold">{feedback.detected}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Difference</p>
              <p className="font-bold">{feedback.distance} notes</p>
            </div>
          </div>
        </div>
      )
    case 'close':
      return (
        <div className="bg-surface-raised border border-warning/30 rounded-xl p-4 text-center w-full max-w-md">
          <p className="text-warning font-medium">Almost there</p>
          <p className="text-sm text-text-muted mt-1">{feedback.label}</p>
        </div>
      )
    case 'register':
      return (
        <div className="bg-surface-raised border border-warning/30 rounded-xl p-4 text-center w-full max-w-md">
          <p className="text-warning font-medium">Wrong register</p>
          <p className="text-sm text-text-muted mt-1">{feedback.message}</p>
        </div>
      )
    default:
      return (
        <div className="text-center text-text-muted text-sm px-4 py-4 w-full max-w-md border border-border/40 rounded-xl bg-surface-overlay/30">
          Play the highlighted note — watch the chart compare your pitch to the target
        </div>
      )
  }
}
