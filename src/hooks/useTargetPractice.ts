import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FluteKey, NoteResult, PracticeSession } from '../types'
import type { NoteTarget } from '../music/register'
import { matchToTarget, getTargetFrequency, noteTargetLabel } from '../music/register'
import { noteDistance, centsToTuningLabel } from '../music/notes'
import { usePitchDetection } from './usePitchDetection'
import { usePitchChart } from './usePitchChart'
import { usePracticeFeedback } from './usePracticeFeedback'
import type { FeedbackState } from '../components/PracticeLayout'

const CENTS_TOLERANCE = 35
const CONFIDENCE_THRESHOLD = 0.65
const CONFIRM_POLLS = 2 // consecutive matching polls required before advancing

export type PracticePhase = 'play' | 'done'

interface UseTargetPracticeOptions {
  fluteKey: FluteKey
  targets: NoteTarget[]
  enabled: boolean
  loop?: boolean
  onComplete?: () => void
}

export function useTargetPractice({
  fluteKey,
  targets,
  enabled,
  loop = false,
  onComplete,
}: UseTargetPracticeOptions) {
  const [phase, setPhase] = useState<PracticePhase>('play')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loopCount, setLoopCount] = useState(0)
  const [micOn, setMicOn] = useState(enabled)

  const startTimeRef = useRef(0)
  const noteResultsRef = useRef<NoteResult[]>([])
  const [struggling, setStruggling] = useState(false)

  // Consecutive-match confirmation state: require CONFIRM_POLLS consecutive
  // matching readings before advancing to filter out transient/adjacent notes.
  const confirmCountRef = useRef(0)
  const pendingCentsRef = useRef<number[]>([])
  const firstMatchTimeRef = useRef(0)

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
    return Math.abs(targetCents) > CENTS_TOLERANCE
  }, [isTargetMatch, targetCents])

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
  }, [currentIndex])

  // Advance only after CONFIRM_POLLS consecutive matching readings.
  // This small delay (~400ms) filters transient/adjacent note detections
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
      if (matches && centsOff <= CENTS_TOLERANCE) {
        // Matching reading — accumulate confirmation
        if (confirmCountRef.current === 0) {
          firstMatchTimeRef.current = Date.now()
        }
        confirmCountRef.current += 1
        pendingCentsRef.current.push(centsOff)

        if (confirmCountRef.current >= CONFIRM_POLLS) {
          // Confirmed — compute accuracy from averaged cents over the window
          setStruggling(false)
          const avgCents =
            pendingCentsRef.current.reduce((a, b) => a + b, 0) /
            pendingCentsRef.current.length
          const accuracy = Math.max(0, 100 - avgCents * 2)
          const holdDuration = (Date.now() - firstMatchTimeRef.current) / 1000

          noteResultsRef.current.push({
            note: target.note,
            expectedNote: target.note,
            detectedNote: r.note,
            accuracy,
            durationHeld: Math.max(0.4, holdDuration),
          })

          // Reset confirmation state for the next note
          confirmCountRef.current = 0
          pendingCentsRef.current = []
          firstMatchTimeRef.current = 0

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
    }, 400)
    return () => clearInterval(interval)
  }, [phase, target, currentIndex, targets.length, fluteKey, loop, onComplete])

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
