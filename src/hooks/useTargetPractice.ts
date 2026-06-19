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

const HOLD_SECONDS = 3
const CENTS_TOLERANCE = 30
const CONFIDENCE_THRESHOLD = 0.65
const CORRECT_SUSTAIN_MS = 600
const CORRECT_DISPLAY_MS = 1200

export type PracticePhase = 'play' | 'correct' | 'hold' | 'done'

interface UseTargetPracticeOptions {
  fluteKey: FluteKey
  targets: NoteTarget[]
  enabled: boolean
  onComplete?: () => void
}

export function useTargetPractice({
  fluteKey,
  targets,
  enabled,
  onComplete,
}: UseTargetPracticeOptions) {
  const [phase, setPhase] = useState<PracticePhase>('play')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [holdCount, setHoldCount] = useState(HOLD_SECONDS)
  const [micOn, setMicOn] = useState(enabled)

  const startTimeRef = useRef(0)
  const noteResultsRef = useRef<NoteResult[]>([])
  const holdStartRef = useRef(0)
  const correctSinceRef = useRef(0)
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
    startTimeRef.current = Date.now()
    noteResultsRef.current = []
    setCurrentIndex(0)
    setPhase('play')
    correctSinceRef.current = 0
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

  const isFullyCorrect = useCallback(() => {
    if (!isTargetMatch()) return false
    return Math.abs(reading.cents) <= CENTS_TOLERANCE
  }, [isTargetMatch, reading.cents])

  const isNoteClose = useCallback(() => {
    if (!isTargetMatch()) return false
    return Math.abs(reading.cents) > CENTS_TOLERANCE
  }, [isTargetMatch, reading.cents])

  const rawFeedback: FeedbackState = useMemo(() => {
    if (phase === 'correct') return { type: 'correct' }
    if (phase === 'hold') return { type: 'hold', count: holdCount }

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
  }, [phase, holdCount, target, reading, isTargetMatch, isNoteClose])

  const feedback = useStableFeedback(rawFeedback)

  const showHints =
    phase === 'play' &&
    !!target &&
    (feedback.type === 'wrong' || struggling)

  useEffect(() => {
    if (phase !== 'play' || !target) return

    if (isFullyCorrect()) {
      setStruggling(false)
      if (correctSinceRef.current === 0) {
        correctSinceRef.current = Date.now()
      } else if (Date.now() - correctSinceRef.current > CORRECT_SUSTAIN_MS) {
        const accuracy = Math.max(0, 100 - Math.abs(reading.cents) * 2)
        noteResultsRef.current.push({
          note: target.note,
          expectedNote: target.note,
          detectedNote: reading.note,
          accuracy,
          durationHeld: (Date.now() - correctSinceRef.current) / 1000,
        })
        setPhase('correct')
        if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
        advanceTimeoutRef.current = setTimeout(() => {
          setPhase('hold')
          setHoldCount(HOLD_SECONDS)
          holdStartRef.current = Date.now()
        }, CORRECT_DISPLAY_MS)
      }
    } else {
      correctSinceRef.current = 0
      if (target && reading.isPlaying && reading.note && !isTargetMatch()) {
        setStruggling(true)
      }
    }
  }, [phase, target, isFullyCorrect, isTargetMatch, reading])

  // Keep a ref to the latest reading so interval callbacks can access it
  // without forcing effect re-runs on every pitch frame.
  const readingRef = useRef(reading)
  readingRef.current = reading

  const isTargetMatchRef = useCallback(() => {
    const r = readingRef.current
    if (!target || !r.isPlaying) return false
    if (r.confidence < CONFIDENCE_THRESHOLD) return false
    const { matches } = matchToTarget(r.frequency, r.note, r.octave, target, fluteKey)
    return matches
  }, [target, fluteKey])

  // If the user stops playing during the 'correct' display, cancel the
  // pending transition to 'hold' and go back to 'play'.
  useEffect(() => {
    if (phase !== 'correct') return
    const check = setInterval(() => {
      if (!readingRef.current.isPlaying || !isTargetMatchRef()) {
        if (advanceTimeoutRef.current) {
          clearTimeout(advanceTimeoutRef.current)
          advanceTimeoutRef.current = null
        }
        setPhase('play')
        correctSinceRef.current = 0
      }
    }, 200)
    return () => clearInterval(check)
  }, [phase, isTargetMatchRef])

  useEffect(() => {
    if (phase !== 'hold') return
    const interval = setInterval(() => {
      // Check that the user is still playing the correct note during hold
      if (!readingRef.current.isPlaying || !isTargetMatchRef()) {
        // User stopped playing or switched to wrong note — reset
        setPhase('play')
        correctSinceRef.current = 0
        setHoldCount(HOLD_SECONDS)
        return
      }

      const elapsed = Math.floor((Date.now() - holdStartRef.current) / 1000)
      const remaining = HOLD_SECONDS - elapsed
      setHoldCount(Math.max(0, remaining))
      if (remaining <= 0) {
        const next = currentIndex + 1
        if (next >= targets.length) {
          setPhase('done')
          setMicOn(false)
          onComplete?.()
        } else {
          setCurrentIndex(next)
          setPhase('play')
          correctSinceRef.current = 0
          setStruggling(false)
        }
      }
    }, 200)
    return () => clearInterval(interval)
  }, [phase, currentIndex, targets.length, onComplete, isTargetMatchRef])

  useEffect(
    () => () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
    },
    [],
  )

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
