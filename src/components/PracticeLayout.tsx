import { useState, useRef, useEffect } from 'react'
import type { PitchReading } from '../types'
import type { NoteTarget } from '../music/register'
import { noteTargetLabel, getTargetFrequency } from '../music/register'
import type { FluteKey } from '../types'
import { TuningMeter } from './TuningDisplay'
import { NoteWheel } from './NoteWheel'
import { PitchTraceChart } from './PitchTraceChart'
import { RegisterIndicator } from './RegisterIndicator'
import { NoteHintsPanel } from './NoteHintsPanel'
import { MetronomeControls } from './MetronomeControls'
import { SequenceContext } from './SequenceContext'
import type { ChartPoint } from '../hooks/usePitchChart'

export type FeedbackState =
  | { type: 'idle' }
  | { type: 'correct' }
  | { type: 'hold'; count: number }
  | { type: 'wrong'; expectedLabel: string; detectedLabel: string; distance: number }
  | { type: 'close'; cents: number; label: string }
  | { type: 'register'; message: string }

interface PracticeLayoutProps {
  target: NoteTarget | null
  targetSequence?: NoteTarget[]
  currentIndex?: number
  reading: PitchReading
  chartPoints: ChartPoint[]
  feedback: FeedbackState
  targetCents?: number
  fluteKey: FluteKey
  baseOctave?: number
  showHints?: boolean
  hintsAvailable?: boolean
  showMetronome?: boolean
  statusLabel?: string
  children?: ReactNode
  footer?: ReactNode
}

// How long (ms) a feedback state must be stable before it's shown
const FEEDBACK_DEBOUNCE_MS = 380

export function PracticeLayout({
  target,
  targetSequence,
  currentIndex = 0,
  reading,
  chartPoints,
  feedback,
  targetCents = 0,
  fluteKey,
  baseOctave = 5,
  showHints = false,
  hintsAvailable = true,
  showMetronome = false,
  statusLabel = 'Play',
  children,
  footer,
}: PracticeLayoutProps) {
  const [showDetails, setShowDetails] = useState(false)
  const detectedNote = reading.note
  const showHintsPanel = showHints && target
  const targetLabel = target ? noteTargetLabel(target, baseOctave) : null
  const expectedFrequency = target ? getTargetFrequency(target, fluteKey) : null

  const isWayOff = Math.abs(targetCents) > 120
  const meterCents = isWayOff ? 0 : Math.max(-50, Math.min(50, targetCents))
  const isActive = reading.isPlaying && reading.frequency > 0

  // --- Debounced feedback to prevent UI jumping ---
  const [displayedFeedback, setDisplayedFeedback] = useState<FeedbackState>(feedback)
  const pendingFeedbackRef = useRef<FeedbackState>(feedback)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const incoming = feedback
    const current = displayedFeedback

    // If the feedback type is the same, update immediately (e.g. cents value update)
    if (incoming.type === current.type) {
      pendingFeedbackRef.current = incoming
      setDisplayedFeedback(incoming)
      return
    }

    // New different type — debounce it
    pendingFeedbackRef.current = incoming

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

    // Positive transitions (correct/hold) apply immediately — no need to wait
    if (incoming.type === 'correct' || incoming.type === 'hold') {
      setDisplayedFeedback(incoming)
      return
    }

    // For wrong/close/register/idle — debounce so we don't flash
    debounceTimerRef.current = setTimeout(() => {
      setDisplayedFeedback(pendingFeedbackRef.current)
    }, FEEDBACK_DEBOUNCE_MS)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback])

  return (
    <div className="flex flex-col gap-5">
      {/* Target + inline tuning — no separate panel */}
      <div className="text-center">
        <p className="mb-1 text-xs uppercase tracking-widest text-text-muted">
          {statusLabel}
          {targetSequence && targetSequence.length > 1 && (
            <span className="ml-2 normal-case">
              · {currentIndex + 1} / {targetSequence.length}
            </span>
          )}
        </p>
        <p className="text-6xl font-semibold tracking-[0.15em] text-text sm:text-7xl">
          {targetLabel ?? '—'}
        </p>
        {target?.variant === 'komal' && (
          <p className="mt-1 text-xs text-text-muted">Komal — half-hole</p>
        )}
        {target?.variant === 'teevra' && (
          <p className="mt-1 text-xs text-text-muted">Teevra Ma</p>
        )}
        {/* Compact tuning meter — no box, no label noise */}
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <TuningMeter cents={meterCents} dimmed={!isActive} />
          <p className="text-[11px] text-text-muted">
            {!isActive
              ? `Blow steadily to play ${targetLabel ?? 'the note'}`
              : isWayOff
                ? `Find ${targetLabel} — you're on a different swar`
                : Math.abs(targetCents) <= 12
                  ? 'On pitch — hold steady'
                  : targetCents > 0
                    ? 'Slightly sharp — lower a touch'
                    : 'Slightly flat — raise a touch'}
          </p>
        </div>
      </div>

      {targetSequence && targetSequence.length > 1 && (
        <SequenceContext
          sequence={targetSequence}
          currentIndex={currentIndex}
          baseOctave={baseOctave}
        />
      )}

      {showMetronome && (
        <div className="mx-auto w-full max-w-lg">
          <MetronomeControls />
        </div>
      )}

      <div className={`grid gap-4 ${hintsAvailable ? 'lg:grid-cols-[1fr_200px]' : ''}`}>
        <div className="space-y-3">
          <PitchTraceChart
            points={chartPoints}
            liveExpected={expectedFrequency}
            liveActual={reading.frequency > 0 ? reading.frequency : null}
            liveExpectedLabel={targetLabel}
            liveActualLabel={detectedNote}
          />
          <div className="flex flex-wrap items-center justify-center gap-6">
            <RegisterIndicator
              detectedOctave={reading.octave}
              expectedOctave={target?.octave}
              baseOctave={baseOctave}
            />
            <NoteWheel detectedNote={detectedNote} targetNote={target?.note ?? null} />
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="w-full rounded-lg border border-border/40 py-2 text-xs text-text-muted transition-colors hover:text-text"
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>

          {showDetails && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/40 bg-surface-overlay/40 p-3 text-xs sm:grid-cols-4">
              <DetailCell label="Target" value={targetLabel ?? '—'} />
              <DetailCell
                label="Expected"
                value={expectedFrequency ? `${expectedFrequency.toFixed(1)} Hz` : '—'}
              />
              <DetailCell label="Detected" value={detectedNote ?? '—'} />
              <DetailCell
                label="Your pitch"
                value={reading.frequency > 0 ? `${reading.frequency.toFixed(1)} Hz` : '—'}
              />
            </div>
          )}
        </div>

        {hintsAvailable && (
          <div className="hidden lg:block">
            {showHintsPanel && target ? (
              <NoteHintsPanel note={target.note} />
            ) : (
              <div className="min-h-[140px] rounded-xl border border-border/30 bg-surface-raised/30 p-4">
                <p className="text-xs text-text-muted">
                  Hints appear when you need help.
                </p>
              </div>
            )}
          </div>
        )}
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

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-text-muted">{label}</p>
      <p className="font-medium text-text">{value}</p>
    </div>
  )
}
