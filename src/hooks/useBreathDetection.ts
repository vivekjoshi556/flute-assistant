import { useCallback, useEffect, useRef, useState } from 'react'

export interface Interval {
  type: 'play' | 'breath'
  duration: number
  startedAt: number
}

export interface BreathDetectionState {
  status: 'idle' | 'playing' | 'pausing'
  currentDuration: number
  history: Interval[]
  avgPlay: number | null
  avgBreath: number | null
  bestBreath: number | null
  isNewRecord: boolean
  playCount: number
  breathCount: number
  reset: () => void
}

interface UseBreathDetectionOptions {
  minPauseDuration?: number
  minPlayDuration?: number
  maxHistory?: number
}

export function useBreathDetection(
  isPlaying: boolean,
  options: UseBreathDetectionOptions = {},
): BreathDetectionState {
  const { minPauseDuration = 300, minPlayDuration = 500, maxHistory = 30 } = options

  const [status, setStatus] = useState<'idle' | 'playing' | 'pausing'>('idle')
  const [currentDuration, setCurrentDuration] = useState(0)
  const [history, setHistory] = useState<Interval[]>([])
  const [bestBreath, setBestBreath] = useState<number | null>(null)
  const [isNewRecord, setIsNewRecord] = useState(false)

  const intervalStartRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wasPlayingRef = useRef(false)
  const hasEverPlayedRef = useRef(false)
  const newRecordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPlayingLiveRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    timerRef.current = setInterval(() => {
      if (intervalStartRef.current !== null) {
        const cur = Date.now() - intervalStartRef.current
        setCurrentDuration(cur)

        // Live record tracking when PLAYING (long tone / breath hold)
        if (isPlayingLiveRef.current) {
          setBestBreath((prev) => {
            // If we cross the previous best
            if (prev !== null && cur > prev) {
              setIsNewRecord(true)
              if (newRecordTimerRef.current) clearTimeout(newRecordTimerRef.current)
              // Keep the glow for 3 seconds after they finish breaking it
              newRecordTimerRef.current = setTimeout(() => setIsNewRecord(false), 3000)
              return cur
            }
            // If it's the very first play, just track it as best
            if (prev === null) {
              return cur
            }
            return prev
          })
        }
      }
    }, 50)
  }, [clearTimer])

  const pushInterval = useCallback(
    (type: 'play' | 'breath', duration: number, startedAt: number) => {
      const minDur = type === 'breath' ? minPauseDuration : minPlayDuration
      if (duration < minDur) return

      const interval: Interval = { type, duration, startedAt }
      setHistory((prev) => [...prev, interval].slice(-maxHistory))
    },
    [minPauseDuration, minPlayDuration, maxHistory],
  )

  useEffect(() => {
    const wasPlaying = wasPlayingRef.current
    wasPlayingRef.current = isPlaying
    isPlayingLiveRef.current = isPlaying

    if (isPlaying) {
      hasEverPlayedRef.current = true

      if (!wasPlaying && intervalStartRef.current !== null) {
        const duration = Date.now() - intervalStartRef.current
        pushInterval('breath', duration, intervalStartRef.current)
      }

      setStatus('playing')
      intervalStartRef.current = Date.now()
      setCurrentDuration(0)
      startTimer()
    } else if (wasPlaying && hasEverPlayedRef.current) {
      if (intervalStartRef.current !== null) {
        const duration = Date.now() - intervalStartRef.current
        pushInterval('play', duration, intervalStartRef.current)
      }

      setStatus('pausing')
      intervalStartRef.current = Date.now()
      setCurrentDuration(0)
      startTimer()
    }
  }, [isPlaying, pushInterval, startTimer])

  useEffect(() => {
    return () => {
      clearTimer()
      if (newRecordTimerRef.current) clearTimeout(newRecordTimerRef.current)
    }
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    if (newRecordTimerRef.current) clearTimeout(newRecordTimerRef.current)
    intervalStartRef.current = null
    wasPlayingRef.current = false
    hasEverPlayedRef.current = false
    isPlayingLiveRef.current = false
    setStatus('idle')
    setCurrentDuration(0)
    setHistory([])
    setBestBreath(null)
    setIsNewRecord(false)
  }, [clearTimer])

  const playIntervals = history.filter((h) => h.type === 'play')
  const breathIntervals = history.filter((h) => h.type === 'breath')

  const avgPlay =
    playIntervals.length > 0
      ? playIntervals.reduce((s, h) => s + h.duration, 0) / playIntervals.length
      : null
  const avgBreath =
    breathIntervals.length > 0
      ? breathIntervals.reduce((s, h) => s + h.duration, 0) / breathIntervals.length
      : null

  return {
    status,
    currentDuration,
    history,
    avgPlay,
    avgBreath,
    bestBreath,
    isNewRecord,
    playCount: playIntervals.length,
    breathCount: breathIntervals.length,
    reset,
  }
}
