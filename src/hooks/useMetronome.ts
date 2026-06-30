import { useCallback, useEffect, useRef, useState } from 'react'

export interface MetronomeState {
  bpm: number
  isRunning: boolean
  currentBeat: number
  beatsPerMeasure: number
}

export interface UseMetronomeReturn {
  bpm: number
  isRunning: boolean
  currentBeat: number
  beatsPerMeasure: number
  setBpm: (bpm: number) => void
  setBeatsPerMeasure: (beats: number) => void
  start: () => void
  stop: () => void
  toggle: () => void
}

const MIN_BPM = 30
const MAX_BPM = 240

/**
 * Web Audio API metronome with precise timing.
 * Uses AudioContext scheduling for sample-accurate clicks,
 * independent of JS event loop jitter.
 */
export function useMetronome(): UseMetronomeReturn {
  const [bpm, setBpmState] = useState(60)
  const [isRunning, setIsRunning] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const timerIdRef = useRef<number | null>(null)
  const nextNoteTimeRef = useRef(0)
  const currentBeatRef = useRef(0)
  const bpmRef = useRef(bpm)
  const beatsPerMeasureRef = useRef(beatsPerMeasure)
  const isRunningRef = useRef(false)

  // Keep refs in sync
  bpmRef.current = bpm
  beatsPerMeasureRef.current = beatsPerMeasure

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  const scheduleClick = useCallback((time: number, isAccent: boolean) => {
    const ctx = getAudioContext()

    // Create a short click sound using oscillator
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    // Accent beat (beat 1) is higher pitch and louder
    osc.frequency.value = isAccent ? 1000 : 700
    osc.type = 'sine'

    gain.gain.setValueAtTime(isAccent ? 0.3 : 0.15, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)

    osc.start(time)
    osc.stop(time + 0.05)
  }, [getAudioContext])

  const scheduler = useCallback(() => {
    const ctx = getAudioContext()
    const scheduleAhead = 0.1 // Schedule 100ms ahead

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAhead) {
      const isAccent = currentBeatRef.current === 0
      scheduleClick(nextNoteTimeRef.current, isAccent)

      // Update visual beat (debounced to next frame for UI)
      const beatForUpdate = currentBeatRef.current
      // Use setTimeout to sync visual with audio more closely
      const delay = Math.max(0, (nextNoteTimeRef.current - ctx.currentTime) * 1000)
      setTimeout(() => {
        setCurrentBeat(beatForUpdate)
      }, delay)

      // Advance beat
      currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerMeasureRef.current

      // Calculate next note time
      const secondsPerBeat = 60.0 / bpmRef.current
      nextNoteTimeRef.current += secondsPerBeat
    }
  }, [getAudioContext, scheduleClick])

  const start = useCallback(() => {
    if (isRunningRef.current) return

    const ctx = getAudioContext()
    currentBeatRef.current = 0
    nextNoteTimeRef.current = ctx.currentTime + 0.05 // Small delay for first beat
    isRunningRef.current = true
    setIsRunning(true)
    setCurrentBeat(0)

    // Schedule ticks at ~25ms intervals for lookahead
    const tick = () => {
      if (!isRunningRef.current) return
      scheduler()
      timerIdRef.current = window.setTimeout(tick, 25) as unknown as number
    }
    tick()
  }, [getAudioContext, scheduler])

  const stop = useCallback(() => {
    isRunningRef.current = false
    setIsRunning(false)
    setCurrentBeat(0)
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current)
      timerIdRef.current = null
    }
  }, [])

  const toggle = useCallback(() => {
    if (isRunningRef.current) {
      stop()
    } else {
      start()
    }
  }, [start, stop])

  const setBpm = useCallback((newBpm: number) => {
    setBpmState(Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(newBpm))))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false
      if (timerIdRef.current !== null) {
        clearTimeout(timerIdRef.current)
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
        audioCtxRef.current = null
      }
    }
  }, [])

  return {
    bpm,
    isRunning,
    currentBeat,
    beatsPerMeasure,
    setBpm,
    setBeatsPerMeasure,
    start,
    stop,
    toggle,
  }
}

/** Preset BPM values matching Indian classical music tempo terminology */
export const BPM_PRESETS = [
  { label: 'Vilambit', bpm: 50, description: 'Very slow — focus on accuracy' },
  { label: 'Madhya', bpm: 80, description: 'Medium — comfortable practice' },
  { label: 'Drut', bpm: 120, description: 'Fast — build speed' },
  { label: 'Ati Drut', bpm: 160, description: 'Very fast — advanced' },
] as const
