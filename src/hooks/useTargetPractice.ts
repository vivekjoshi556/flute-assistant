import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FluteKey, NoteResult, PracticeSession } from '../types'
import type { NoteTarget } from '../music/register'
import { matchToTarget, getTargetFrequency, noteTargetLabel } from '../music/register'
import { noteDistance, centsToTuningLabel } from '../music/notes'
import { usePitchDetection } from './usePitchDetection'
import { usePitchChart } from './usePitchChart'
import { usePracticeFeedback } from './usePracticeFeedback'
import type { FeedbackState } from '../components/PracticeLayout'

const DEFAULT_CENTS_TOLERANCE = 35
const CONFIDENCE_THRESHOLD = 0.65
const DEFAULT_CONFIRM_POLLS = 2 // consecutive matching polls required before advancing
const DEFAULT_POLL_INTERVAL = 400 // ms

export type PracticePhase = 'play' | 'done'

interface UseTargetPracticeOptions {
  fluteKey: FluteKey
  targets: NoteTarget[]
  enabled: boolean
  loop?: boolean
  onComplete?: () => void
  /** Minimum duration in seconds to hold each note before advancing (for long-tone practice) */
  minHoldDuration?: number
  /** Pitch tolerance in cents (default 35) */
  toleranceCents?: number
  /** Number of consecutive matching polls required before advancing */
  confirmPolls?: number
  /** Polling interval in milliseconds */
  pollInterval?: number
  /** Evaluation mode for specialized behavior */
  evaluationMode?: 'standard' | 'long-tone' | 'ornament' | 'rhythm' | 'glide' | 'stability'
  /** For stability mode: pitch stability threshold (0-100) */
  stabilityThreshold?: number
  /** For rhythm mode: BPM to calculate expected timing */
  targetBpm?: number
}

export function useTargetPractice({
  fluteKey,
  targets,
  enabled,
  loop = false,
  onComplete,
  minHoldDuration,
  toleranceCents = DEFAULT_CENTS_TOLERANCE,
  confirmPolls = DEFAULT_CONFIRM_POLLS,
  pollInterval = DEFAULT_POLL_INTERVAL,
  evaluationMode = 'standard',
  stabilityThreshold,
  targetBpm,
}: UseTargetPracticeOptions) {
  const [phase, setPhase] = useState<PracticePhase>('play')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loopCount, setLoopCount] = useState(0)
  const [micOn, setMicOn] = useState(enabled)

  const startTimeRef = useRef(0)
  const noteResultsRef = useRef<NoteResult[]>([])
  const [struggling, setStruggling] = useState(false)

  // Consecutive-match confirmation state: require confirmPolls consecutive
  // matching readings before advancing to filter out transient/adjacent notes.
  const confirmCountRef = useRef(0)
  const pendingCentsRef = useRef<number[]>([])
  const firstMatchTimeRef = useRef(0)

  // Glide tracking: track pitch transitions for meend exercises
  const glideTransitionHistoryRef = useRef<{ frequency: number; timestamp: number }[]>([])
  const lastMatchedFrequencyRef = useRef(0)
  const previousTargetFrequencyRef = useRef(0)

  // Rhythm tracking: track note onset times for rhythm exercises
  const noteOnsetTimeRef = useRef(0)
  const expectedBeatTimeRef = useRef(0)

  const { reading, error } = usePitchDetection(fluteKey, micOn)
  const target = targets[currentIndex] ?? null
  const expectedFrequency = target
    ? getTargetFrequency(target, fluteKey)
    : null

  const targetLabel = target ? noteTargetLabel(target, targets[0]?.octave ?? 5) : null

  const { points: chartPoints, clear: clearChart } = usePitchChart(
    reading.frequency,
    expectedFrequency,
    micOn && phase !== 'done',
    reading.note,
    targetLabel,
  )

  const start = useCallback(() => {
    startTimeRef.current = Date.now()
    noteResultsRef.current = []
    confirmCountRef.current = 0
    pendingCentsRef.current = []
    firstMatchTimeRef.current = 0
    setCurrentIndex(0)
    setLoopCount(0)
    setPhase('play')
    setStruggling(false)
    clearChart()
    setMicOn(true)
  }, [clearChart])

  const isTargetMatch = useCallback(() => {
    if (!target || !reading.isPlaying) return false
    if (reading.confidence < CONFIDENCE_THRESHOLD) return false
    const { matches } = matchToTarget(reading.frequency, reading.note, reading.octave, target, fluteKey)
    return matches
  }, [target, reading, fluteKey])



  const targetCents = useMemo(() => {
    if (!target || !reading.isPlaying || reading.frequency <= 0) return 0
    const expected = getTargetFrequency(target, fluteKey)
    return Math.round(1200 * Math.log2(reading.frequency / expected))
  }, [target, reading.frequency, reading.isPlaying, fluteKey])

  const isNoteClose = useCallback(() => {
    if (!isTargetMatch()) return false
    return Math.abs(targetCents) > toleranceCents
  }, [isTargetMatch, targetCents, toleranceCents])

  const rawFeedback: FeedbackState = useMemo(() => {
    if (
      phase === 'play' &&
      target &&
      reading.isPlaying &&
      reading.note &&
      reading.confidence >= CONFIDENCE_THRESHOLD
    ) {
      if (!isTargetMatch()) {
        return {
          type: 'wrong',
          expectedLabel: noteTargetLabel(target, targets[0]?.octave ?? 5),
          detectedLabel: reading.note,
          distance: noteDistance(target.note, reading.note),
        }
      }
      if (isNoteClose()) {
        return {
          type: 'close',
          cents: targetCents,
          label: `${centsToTuningLabel(targetCents)} (${targetCents > 0 ? '+' : ''}${targetCents} cents)`,
        }
      }
    }

    return { type: 'idle' }
  }, [phase, target, targets, reading, isTargetMatch, isNoteClose, targetCents])

  const feedback = usePracticeFeedback(rawFeedback)

  const showHints =
    phase === 'play' &&
    !!target &&
    (feedback.type === 'wrong' || struggling)

  // Keep a ref to the latest reading so interval callbacks can access it
  // without forcing effect re-runs on every pitch frame.
  const readingRef = useRef(reading)
  readingRef.current = reading

  // Reset confirmation state whenever the target note changes.
  useEffect(() => {
    confirmCountRef.current = 0
    pendingCentsRef.current = []
    firstMatchTimeRef.current = 0
    // Store the previous target's frequency for glide analysis
    previousTargetFrequencyRef.current = target ? getTargetFrequency(target, fluteKey) : 0
    glideTransitionHistoryRef.current = []
    lastMatchedFrequencyRef.current = 0
    // For rhythm mode: calculate expected beat time for this note
    if (evaluationMode === 'rhythm' && targetBpm) {
      const secondsPerBeat = 60.0 / targetBpm
      expectedBeatTimeRef.current = Date.now() / 1000 + secondsPerBeat
    }
    noteOnsetTimeRef.current = 0
  }, [currentIndex, target, fluteKey, evaluationMode, targetBpm])

  // Advance only after confirmPolls consecutive matching readings.
  // If minHoldDuration is specified, also require that duration to be met.
  // This small delay filters transient/adjacent note detections
  // and allows accuracy to be averaged over the confirmation window.
  useEffect(() => {
    if (phase !== 'play' || !target) return

    const interval = setInterval(() => {
      const r = readingRef.current
      if (!r.isPlaying || r.confidence < CONFIDENCE_THRESHOLD) return

      const { matches } = matchToTarget(r.frequency, r.note, r.octave, target, fluteKey)
      const expected = getTargetFrequency(target, fluteKey)
      const centsOff = r.frequency > 0
        ? Math.abs(1200 * Math.log2(r.frequency / expected))
        : 999

      // For glide mode: track pitch transitions during the entire hold phase
      // This includes the transition from previous note to current target
      if (evaluationMode === 'glide' && r.frequency > 0) {
        glideTransitionHistoryRef.current.push({
          frequency: r.frequency,
          timestamp: Date.now(),
        })
        // Keep only last 3 seconds of history to cover transition + hold
        const cutoff = Date.now() - 3000
        glideTransitionHistoryRef.current = glideTransitionHistoryRef.current.filter(
          (h) => h.timestamp > cutoff
        )
      }

      if (matches && centsOff <= toleranceCents) {
        // Matching reading — accumulate confirmation
        if (confirmCountRef.current === 0) {
          firstMatchTimeRef.current = Date.now()
          lastMatchedFrequencyRef.current = r.frequency
          // For rhythm mode: record note onset time
          if (evaluationMode === 'rhythm') {
            noteOnsetTimeRef.current = Date.now() / 1000
          }
        }
        confirmCountRef.current += 1
        pendingCentsRef.current.push(centsOff)

        const holdDuration = (Date.now() - firstMatchTimeRef.current) / 1000
        const meetsMinHold = !minHoldDuration || holdDuration >= minHoldDuration

        if (confirmCountRef.current >= confirmPolls && meetsMinHold) {
          // Confirmed — compute accuracy from averaged cents over the window
          setStruggling(false)
          const avgCents =
            pendingCentsRef.current.reduce((a, b) => a + b, 0) /
            pendingCentsRef.current.length
          let accuracy = Math.max(0, 100 - avgCents * 2)

          // Apply stability penalty for stability mode
          if (evaluationMode === 'stability' && r.stability > 0 && accuracy > 0) {
            const threshold = stabilityThreshold ?? 70
            if (r.stability < threshold) {
              const stabilityPenalty = ((threshold - r.stability) / threshold) * 30
              accuracy = Math.max(0, accuracy - stabilityPenalty)
            }
          }

          // Apply glide smoothness penalty for glide mode
          if (evaluationMode === 'glide' && glideTransitionHistoryRef.current.length > 2) {
            const transitions = glideTransitionHistoryRef.current
            let maxJump = 0
            let totalJump = 0
            let jumpCount = 0

            // Analyze frequency changes to detect discontinuous jumps vs smooth glides
            for (let i = 1; i < transitions.length; i++) {
              const jump = Math.abs(transitions[i].frequency - transitions[i - 1].frequency)
              maxJump = Math.max(maxJump, jump)
              totalJump += jump
              jumpCount++
            }

            const avgJump = jumpCount > 0 ? totalJump / jumpCount : 0

            // Penalize large frequency jumps (> 80 cents between consecutive readings)
            // This detects tonguing/jumping vs smooth gliding
            const jumpCents = 1200 * Math.log2(1 + maxJump / expected)
            if (jumpCents > 80) {
              const glidePenalty = Math.min(25, (jumpCents - 80) / 2)
              accuracy = Math.max(0, accuracy - glidePenalty)
            }

            // Additional penalty if average jump is high (indicates rough playing)
            const avgJumpCents = 1200 * Math.log2(1 + avgJump / expected)
            if (avgJumpCents > 30) {
              const roughnessPenalty = Math.min(15, (avgJumpCents - 30) / 3)
              accuracy = Math.max(0, accuracy - roughnessPenalty)
            }
          }

          // Apply rhythm timing penalty for rhythm mode
          if (evaluationMode === 'rhythm' && targetBpm && noteOnsetTimeRef.current > 0) {
            const secondsPerBeat = 60.0 / targetBpm
            const timingError = Math.abs(noteOnsetTimeRef.current - expectedBeatTimeRef.current)
            // Convert timing error to percentage of beat duration
            const timingErrorPercent = (timingError / secondsPerBeat) * 100
            // Penalize if note is more than 20% off from expected beat
            if (timingErrorPercent > 20) {
              const rhythmPenalty = Math.min(30, (timingErrorPercent - 20) * 1.5)
              accuracy = Math.max(0, accuracy - rhythmPenalty)
            }
          }

          noteResultsRef.current.push({
            note: target.note,
            expectedNote: target.note,
            detectedNote: r.note,
            accuracy,
            durationHeld: Math.max(minHoldDuration || 0.4, holdDuration),
            octave: target.octave,
            variant: target.variant || 'shuddha',
          })

          // Reset confirmation state for the next note
          confirmCountRef.current = 0
          pendingCentsRef.current = []
          firstMatchTimeRef.current = 0
          glideTransitionHistoryRef.current = []
          lastMatchedFrequencyRef.current = 0
          noteOnsetTimeRef.current = 0

          const next = currentIndex + 1
          if (next >= targets.length) {
            if (loop) {
              setCurrentIndex(0)
              setLoopCount((c) => c + 1)
            } else {
              setPhase('done')
              setMicOn(false)
              onComplete?.()
            }
          } else {
            setCurrentIndex(next)
          }
        }
      } else {
        // Non-match — reset confirmation counter
        confirmCountRef.current = 0
        pendingCentsRef.current = []
        firstMatchTimeRef.current = 0
        if (r.isPlaying && r.note && !matches) {
          setStruggling(true)
        }
      }
    }, pollInterval)
    return () => clearInterval(interval)
  }, [phase, target, currentIndex, targets.length, fluteKey, loop, onComplete, toleranceCents, confirmPolls, pollInterval, minHoldDuration, evaluationMode, stabilityThreshold, targetBpm])

  const buildSession = (
    mode: PracticeSession['mode'],
    extra?: Partial<PracticeSession>,
  ): PracticeSession => {
    const endTime = Date.now()
    const results = noteResultsRef.current
    const accuracies = results.map((r) => r.accuracy)
    return {
      id: crypto.randomUUID(),
      mode,
      startTime: startTimeRef.current,
      endTime,
      averageAccuracy:
        accuracies.length > 0
          ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length
          : 0,
      bestAccuracy: accuracies.length > 0 ? Math.max(...accuracies) : 0,
      noteResults: results,
      ...extra,
    }
  }

  const finishEarly = () => setMicOn(false)

  return {
    phase,
    currentIndex,
    loopCount,
    target,
    targets,
    reading,
    chartPoints,
    feedback,
    showHints,
    error,
    micOn,
    start,
    finishEarly,
    buildSession,
    targetCents,
    noteResults: noteResultsRef.current,
  }
}
