import { useCallback, useEffect, useRef, useState } from 'react'
import type { FluteKey, IndianNote, PitchReading } from '../types'
import { foldToFundamental, frequencyToIndianNote } from '../music/notes'
import { getWorkletUrl } from '../audio/pitchEngine'

const HISTORY_SIZE = 150
const SMOOTHING_ALPHA = 0.15
const CONFIDENCE_THRESHOLD = 0.65
const VOLUME_GATE = 0.015
const PLAYING_ON_FRAMES = 3
const PLAYING_OFF_FRAMES = 12
const STABILITY_WINDOW = 100
const FREQ_HOLD_MS = 400

interface RawPitch {
  frequency: number
  confidence: number
  volume: number
  timestamp: number
}

const EMPTY_READING: PitchReading = {
  frequency: 0,
  note: null,
  octave: 0,
  cents: 0,
  confidence: 0,
  volume: 0,
  stability: 0,
  isPlaying: false,
}

export function usePitchDetection(fluteKey: FluteKey, enabled: boolean) {
  const [reading, setReading] = useState<PitchReading>(EMPTY_READING)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pitchHistory, setPitchHistory] = useState<number[]>([])

  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const smoothedFreqRef = useRef(0)
  const lastFreqRef = useRef(0)
  const lastFreqTimeRef = useRef(0)
  const smoothedNoteRef = useRef<IndianNote | null>(null)
  const smoothedOctaveRef = useRef(0)
  const noteHoldCountRef = useRef(0)
  const historyRef = useRef<RawPitch[]>([])
  const playingOnRef = useRef(0)
  const playingOffRef = useRef(0)
  const isPlayingRef = useRef(false)

  const computeStability = useCallback((history: RawPitch[]): number => {
    const recent = history.filter(
      (h) => h.confidence > CONFIDENCE_THRESHOLD && h.frequency > 0 && h.volume > VOLUME_GATE,
    )
    if (recent.length < 5) return 0

    const freqs = recent.map((h) => h.frequency)
    const mean = freqs.reduce((a, b) => a + b, 0) / freqs.length
    const variance = freqs.reduce((sum, f) => sum + (f - mean) ** 2, 0) / freqs.length
    const stdDev = Math.sqrt(variance)
    const centsStd = 1200 * Math.log2(1 + stdDev / mean)
    return Math.round(Math.max(0, Math.min(100, 100 - centsStd * 3)))
  }, [])

  const updatePlayingState = useCallback(
    (volume: number, confidence: number, frequency: number) => {
      const loudEnough =
        volume >= VOLUME_GATE && confidence >= CONFIDENCE_THRESHOLD && frequency > 0

      if (loudEnough) {
        playingOnRef.current += 1
        playingOffRef.current = 0
        if (!isPlayingRef.current && playingOnRef.current >= PLAYING_ON_FRAMES) {
          isPlayingRef.current = true
        }
      } else {
        playingOffRef.current += 1
        playingOnRef.current = 0
        if (isPlayingRef.current && playingOffRef.current >= PLAYING_OFF_FRAMES) {
          isPlayingRef.current = false
          smoothedNoteRef.current = null
          smoothedOctaveRef.current = 0
          noteHoldCountRef.current = 0
          smoothedFreqRef.current = 0
          lastFreqRef.current = 0
        }
      }

      return isPlayingRef.current
    },
    [],
  )

  const getDisplayFrequency = useCallback(() => {
    const now = performance.now()
    if (lastFreqRef.current > 0 && now - lastFreqTimeRef.current < FREQ_HOLD_MS) {
      return lastFreqRef.current
    }
    return smoothedFreqRef.current > 0 ? smoothedFreqRef.current : 0
  }, [])

  const processRaw = useCallback(
    (raw: { frequency: number; confidence: number; volume: number }) => {
      const folded = raw.frequency > 0 ? foldToFundamental(raw.frequency, fluteKey) : 0
      const isPlaying = updatePlayingState(raw.volume, raw.confidence, folded)

      historyRef.current.push({ ...raw, frequency: folded, timestamp: performance.now() })
      if (historyRef.current.length > HISTORY_SIZE) {
        historyRef.current.shift()
      }

      const stability = computeStability(historyRef.current)
      // const displayFreq = getDisplayFrequency()

      if (!isPlaying) {
        setReading({
          frequency: 0,
          note: null,
          octave: 0,
          cents: 0,
          confidence: raw.confidence,
          volume: raw.volume,
          stability: 0,
          isPlaying: false,
        })
        return
      }

      if (smoothedFreqRef.current === 0) {
        smoothedFreqRef.current = folded
      } else if (folded > 0) {
        smoothedFreqRef.current =
          SMOOTHING_ALPHA * folded + (1 - SMOOTHING_ALPHA) * smoothedFreqRef.current
      }

      lastFreqRef.current = smoothedFreqRef.current
      lastFreqTimeRef.current = performance.now()

      const detected = frequencyToIndianNote(smoothedFreqRef.current, fluteKey)
      if (!detected) {
        setReading({
          frequency: smoothedFreqRef.current,
          note: smoothedNoteRef.current,
          octave: smoothedOctaveRef.current,
          cents: 0,
          confidence: raw.confidence,
          volume: raw.volume,
          stability,
          isPlaying: true,
        })
        return
      }

      const sameNote =
        smoothedNoteRef.current === detected.note &&
        smoothedOctaveRef.current === detected.octave

      if (sameNote) {
        noteHoldCountRef.current = Math.min(20, noteHoldCountRef.current + 2)
      } else if (noteHoldCountRef.current >= 8) {
        noteHoldCountRef.current = Math.max(0, noteHoldCountRef.current - 1)
        if (noteHoldCountRef.current < 8) {
          smoothedNoteRef.current = detected.note
          smoothedOctaveRef.current = detected.octave
          noteHoldCountRef.current = 8
        }
      } else {
        smoothedNoteRef.current = detected.note
        smoothedOctaveRef.current = detected.octave
        noteHoldCountRef.current = 8
      }

      setReading({
        frequency: smoothedFreqRef.current,
        note: smoothedNoteRef.current,
        octave: smoothedOctaveRef.current,
        cents: detected.cents,
        confidence: raw.confidence,
        volume: raw.volume,
        stability,
        isPlaying: true,
      })

      setPitchHistory((prev) => {
        const next = [...prev, detected.cents]
        return next.slice(-STABILITY_WINDOW)
      })
    },
    [fluteKey, computeStability, updatePlayingState, getDisplayFrequency],
  )

  const start = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      streamRef.current = stream

      const ctx = new AudioContext()
      audioContextRef.current = ctx

      await ctx.audioWorklet.addModule(getWorkletUrl())

      const source = ctx.createMediaStreamSource(stream)
      const worklet = new AudioWorkletNode(ctx, 'pitch-processor')
      worklet.port.onmessage = (e) => processRaw(e.data)

      source.connect(worklet)

      const silent = ctx.createGain()
      silent.gain.value = 0
      worklet.connect(silent)
      silent.connect(ctx.destination)

      setIsListening(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Microphone access denied. Please allow microphone permission.',
      )
    }
  }, [processRaw])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioContextRef.current?.close()
    streamRef.current = null
    audioContextRef.current = null
    smoothedFreqRef.current = 0
    lastFreqRef.current = 0
    smoothedNoteRef.current = null
    smoothedOctaveRef.current = 0
    noteHoldCountRef.current = 0
    playingOnRef.current = 0
    playingOffRef.current = 0
    isPlayingRef.current = false
    historyRef.current = []
    setIsListening(false)
    setReading(EMPTY_READING)
    setPitchHistory([])
  }, [])

  useEffect(() => {
    if (enabled) {
      start()
    } else {
      stop()
    }
    return () => stop()
  }, [enabled, start, stop])

  return { reading, isListening, error, pitchHistory, start, stop }
}
