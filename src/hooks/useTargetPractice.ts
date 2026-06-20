import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FluteKey, NoteResult, PracticeSession } from '../types'
import type { NoteTarget } from '../music/register'
import {
  getNoteFrequency,
  matchToTarget,
  noteDistance,
  centsToTuningLabel,
} from '../music/notes'
import { usePitchDetection } from './usePitchDetection'
import { usePitchChart } from './usePitchChart'
import { useStableFeedback } from './useStableFeedback'
import type { FeedbackState } from '../components/PracticeLayout'

const CENTS_TOLERANCE = 35
const CONFIDENCE_THRESHOLD = 0.65

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

  const { reading, error } = usePitchDetection(fluteKey, micOn)
  const target = targets[currentIndex] ?? null
  const expectedFrequency = target
    ? getNoteFrequency(target.note, fluteKey, target.octave)
    : null

  const targetLabel = target
    ? `${target.note}${target.octave > targets[0]?.octave && target.note === 'SA' ? '↑' : ''}`
    : null

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



  const isNoteClose = useCallback(() => {
    if (!isTargetMatch()) return false
    return Math.abs(reading.cents) > CENTS_TOLERANCE
  }, [isTargetMatch, reading.cents])

  const rawFeedback: FeedbackState = useMemo(() => {
    if (phase === 'play' && target && reading.isPlaying && reading.note) {
      if (!isTargetMatch()) {
        return {
          type: 'wrong',
          expected: target.note,
          detected: reading.note,
          distance: noteDistance(target.note, reading.note),
        }
      }
      if (isNoteClose()) {
        return {
          type: 'close',
          cents: reading.cents,
          label: `${centsToTuningLabel(reading.cents)} (${reading.cents > 0 ? '+' : ''}${reading.cents} cents)`,
        }
      }
    }

    return { type: 'idle' }
  }, [phase, target, reading, isTargetMatch, isNoteClose])

  const feedback = useStableFeedback(rawFeedback)

  const showHints =
    phase === 'play' &&
    !!target &&
    (feedback.type === 'wrong' || struggling)

  // Keep a ref to the latest reading so interval callbacks can access it
  // without forcing effect re-runs on every pitch frame.
  const readingRef = useRef(reading)
  readingRef.current = reading

  // Advance immediately when the correct note is detected — no hold timer.
  // This mirrors the scale trainer behaviour: hit the note and move forward.
  useEffect(() => {
    if (phase !== 'play' || !target) return

    const interval = setInterval(() => {
      const r = readingRef.current
      if (!r.isPlaying || r.confidence < CONFIDENCE_THRESHOLD) return

      const { matches } = matchToTarget(r.frequency, r.note, r.octave, target, fluteKey)
      if (matches && Math.abs(r.cents) <= CENTS_TOLERANCE) {
        setStruggling(false)
        const accuracy = Math.max(0, 100 - Math.abs(r.cents) * 2)
        noteResultsRef.current.push({
          note: target.note,
          expectedNote: target.note,
          detectedNote: r.note,
          accuracy,
          durationHeld: 0.5,
        })

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
      } else if (r.isPlaying && r.note && !matches) {
        setStruggling(true)
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
    noteResults: noteResultsRef.current,
  }
}
