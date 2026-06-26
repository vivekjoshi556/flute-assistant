import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { usePitchDetection } from '../hooks/usePitchDetection'
import { usePitchChart } from '../hooks/usePitchChart'
import { Layout } from '../components/Layout'
import { PracticeLayout, type FeedbackState } from '../components/PracticeLayout'
import { getScaleTargets } from '../music/scales'
import { getNoteFrequency, matchToTarget, noteDistance } from '../music/notes'
import type { NoteResult, PracticeSession } from '../types'
import type { NoteTarget } from '../music/register'
import type { Register } from '../music/register'
import { useVoiceNavigation } from '../hooks/useVoiceNavigation'

type ScaleDirection = 'ascending' | 'descending'

function getRegisterOptions(baseOctave: number): { value: Register; label: string; octave: number }[] {
  return [
    { value: 'lower', label: 'Lower', octave: baseOctave - 1 },
    { value: 'middle', label: 'Middle', octave: baseOctave },
    { value: 'higher', label: 'Higher', octave: baseOctave + 1 },
  ]
}

export function ScaleTrainerScreen() {
  const { settings, setActiveSession } = useApp()
  const navigate = useNavigate()
  const registerOptions = getRegisterOptions(settings.baseOctave)
  const [direction, setDirection] = useState<ScaleDirection | null>(null)
  const [baseOctave, setBaseOctave] = useState(settings.baseOctave)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [micOn, setMicOn] = useState(false)
  const [targets, setTargets] = useState<NoteTarget[]>([])

  const startTimeRef = useRef(0)
  const noteResultsRef = useRef<NoteResult[]>([])
  const confirmCountRef = useRef(0)
  const pendingCentsRef = useRef<number[]>([])

  const { reading, error } = usePitchDetection(settings.fluteKey, micOn)
  const target = targets[currentIndex] ?? null
  const expectedFrequency = target
    ? getNoteFrequency(target.note, settings.fluteKey, target.octave)
    : null

  // Voice Navigation for scale selection
  const scaleMappings = useMemo(() => ({
    SA: { label: 'Ascending', action: () => startScale('ascending') },
    RE: { label: 'Descending', action: () => startScale('descending') },
  }), [])

  const scaleActionMappings = useMemo(() => {
    const res: any = {}
    for (const [k, v] of Object.entries(scaleMappings)) {
      res[k] = v.action
    }
    return res
  }, [scaleMappings])

  const voiceNav = useVoiceNavigation({
    mappings: scaleActionMappings,
    enabled: !direction && (settings.voiceNavigationEnabled ?? false),
  })

  const { points: chartPoints } = usePitchChart(
    reading.frequency,
    expectedFrequency,
    micOn && currentIndex < targets.length,
    reading.note,
    target
      ? `${target.note}${target.octave > baseOctave && target.note === 'SA' ? '↑' : ''}`
      : null,
  )

  // Moved above conditional returns to satisfy Rules of Hooks
  const feedback: FeedbackState = useMemo(() => {
    if (!target || !reading.isPlaying || reading.confidence < 0.7) return { type: 'idle' }
    if (reading.note && reading.note !== target.note) {
      return {
        type: 'wrong',
        expected: target.note,
        detected: reading.note,
        distance: noteDistance(target.note, reading.note),
      }
    }
    if (
      reading.note === target.note &&
      reading.octave > 0 &&
      reading.octave !== target.octave
    ) {
      const registerLabel = reading.octave > target.octave ? 'lower' : 'higher'
      return {
        type: 'register',
        message: `Right note, but blow ${registerLabel} to match the target register`,
      }
    }
    return { type: 'idle' }
  }, [target, reading])

  const startScale = (dir: ScaleDirection) => {
    const list = getScaleTargets(dir, baseOctave)
    setTargets(list)
    setDirection(dir)
    setCurrentIndex(0)
    startTimeRef.current = Date.now()
    noteResultsRef.current = []
    confirmCountRef.current = 0
    pendingCentsRef.current = []
    setMicOn(true)
  }

  const location = useLocation()

  useEffect(() => {
    if (location.state?.autoStart && location.state?.direction) {
      const dir = location.state.direction
      const oct = location.state.baseOctave ?? settings.baseOctave
      setBaseOctave(oct)
      
      const list = getScaleTargets(dir, oct)
      setTargets(list)
      setDirection(dir)
      setCurrentIndex(0)
      startTimeRef.current = Date.now()
      noteResultsRef.current = []
      confirmCountRef.current = 0
      pendingCentsRef.current = []
      setMicOn(true)
      
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, settings.baseOctave, navigate, location.pathname])

  // Keep a ref so the interval can access the latest reading without
  // forcing the effect to re-run on every pitch frame.
  const readingRef = useRef(reading)
  readingRef.current = reading

  // Reset confirmation state when the target changes.
  useEffect(() => {
    confirmCountRef.current = 0
    pendingCentsRef.current = []
  }, [currentIndex])

  // Require 2 consecutive matching polls before advancing — same logic
  // as useTargetPractice to filter transient/adjacent note detections.
  const CONFIRM_POLLS = 2
  useEffect(() => {
    const interval = setInterval(() => {
      const r = readingRef.current
      if (!target || !r.isPlaying || r.confidence < 0.65) return
      // Pass 0 for octave to skip strict octave matching — scale trainer is a
      // beginner tool; the register indicator already shows octave feedback.
      const { matches } = matchToTarget(
        r.frequency,
        r.note,
        0,
        target,
        settings.fluteKey,
      )
      if (matches && Math.abs(r.cents) <= 35) {
        confirmCountRef.current += 1
        pendingCentsRef.current.push(Math.abs(r.cents))

        if (confirmCountRef.current >= CONFIRM_POLLS) {
          const avgCents =
            pendingCentsRef.current.reduce((a, b) => a + b, 0) /
            pendingCentsRef.current.length
          const accuracy = Math.max(0, 100 - avgCents * 2)
          noteResultsRef.current.push({
            note: target.note,
            expectedNote: target.note,
            detectedNote: r.note,
            accuracy,
            durationHeld: 0.5,
          })
          confirmCountRef.current = 0
          pendingCentsRef.current = []
          setCurrentIndex((i) => i + 1)
        }
      } else {
        confirmCountRef.current = 0
        pendingCentsRef.current = []
      }
    }, 400)
    return () => clearInterval(interval)
  }, [target, settings.fluteKey])

  useEffect(() => {
    if (direction && currentIndex >= targets.length && targets.length > 0) {
      setMicOn(false)
    }
  }, [currentIndex, targets.length, direction])

  const isComplete = targets.length > 0 && currentIndex >= targets.length
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [direction, isComplete])

  const goBackToList = () => {
    setMicOn(false)
    setDirection(null)
    setTargets([])
    setCurrentIndex(0)
  }

  const finishSession = () => {
    const endTime = Date.now()
    const results = noteResultsRef.current
    const accuracies = results.map((r) => r.accuracy)
    const session: PracticeSession = {
      id: crypto.randomUUID(),
      mode: 'scale',
      startTime: startTimeRef.current,
      endTime,
      averageAccuracy:
        accuracies.length > 0
          ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length
          : 0,
      bestAccuracy: accuracies.length > 0 ? Math.max(...accuracies) : 0,
      noteResults: results,
      scaleDirection: direction || undefined,
      baseOctave,
    }
    setActiveSession(session)
    navigate('/session-summary')
  }

  useEffect(() => {
    if (isComplete) {
      finishSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete])

  if (!direction) {
    const isSaActive = voiceNav.activeKey === 'SA'
    const isReActive = voiceNav.activeKey === 'RE'

    return (
      <Layout title="Scale Trainer" backTo="/">
        <div className="text-center mb-8">
          <h2 className="text-xl font-medium">Major Scale Equivalent</h2>
          <p className="text-text-muted text-sm mt-2">
            Sa Re Ga Ma Pa Dha Ni Sa — the shuddha scale for beginners.
          </p>
        </div>

        {voiceNav.error && settings.voiceNavigationEnabled && (
          <p className="text-center text-danger text-xs mb-4">
            🎙️ Navigation mic error: {voiceNav.error}
          </p>
        )}

        <div className="flex justify-center gap-2 mb-6">
          {registerOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setBaseOctave(opt.octave)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                baseOctave === opt.octave
                  ? 'bg-accent/20 text-accent border border-accent/40'
                  : 'bg-surface-raised border border-border text-text-muted hover:text-text'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 max-w-sm mx-auto pb-16">
          <button
            type="button"
            onClick={() => startScale('ascending')}
            className={`relative py-4 px-6 rounded-xl bg-surface-raised border transition-all text-left overflow-hidden ${
              isSaActive
                ? 'border-accent shadow-[0_0_12px_rgba(52,211,153,0.15)] scale-[1.01]'
                : 'border-border hover:border-accent'
            }`}
          >
            <span className={`absolute top-4 right-4 text-[10px] font-extrabold tracking-wider border px-2 py-0.5 rounded-md font-mono uppercase shadow-sm transition-colors ${
              isSaActive
                ? 'bg-accent text-surface border-accent'
                : 'bg-accent/15 text-accent border-accent/30'
            }`}>
              SA
            </span>
            <span className="font-medium">Ascending</span>
            <p className="text-sm text-text-muted">Sa Re Ga Ma Pa Dha Ni Sa</p>
            {isSaActive && voiceNav.holdProgress > 0 && (
              <div
                className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-75 ease-out shadow-[0_0_8px_var(--color-accent)]"
                style={{ width: `${voiceNav.holdProgress}%` }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => startScale('descending')}
            className={`relative py-4 px-6 rounded-xl bg-surface-raised border transition-all text-left overflow-hidden ${
              isReActive
                ? 'border-accent shadow-[0_0_12px_rgba(52,211,153,0.15)] scale-[1.01]'
                : 'border-border hover:border-accent'
            }`}
          >
            <span className={`absolute top-4 right-4 text-[10px] font-extrabold tracking-wider border px-2 py-0.5 rounded-md font-mono uppercase shadow-sm transition-colors ${
              isReActive
                ? 'bg-accent text-surface border-accent'
                : 'bg-accent/15 text-accent border-accent/30'
            }`}>
              RE
            </span>
            <span className="font-medium">Descending</span>
            <p className="text-sm text-text-muted">Sa Ni Dha Pa Ma Ga Re Sa</p>
            {isReActive && voiceNav.holdProgress > 0 && (
              <div
                className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-75 ease-out shadow-[0_0_8px_var(--color-accent)]"
                style={{ width: `${voiceNav.holdProgress}%` }}
              />
            )}
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Scale Trainer" onBack={goBackToList}>
      <PracticeLayout
        target={target}
        targetSequence={targets}
        currentIndex={currentIndex}
        reading={reading}
        chartPoints={chartPoints}
        feedback={feedback}
        fluteKey={settings.fluteKey}
        baseOctave={settings.baseOctave}
        showHints={feedback.type === 'wrong' || feedback.type === 'register'}
        hintsAvailable
        statusLabel={`Play — ${direction}`}
        footer={
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMicOn(false)
                finishSession()
              }}
              className="px-6 py-3 rounded-full border border-border text-text-muted"
            >
              End Session
            </button>
          </div>
        }
      />
      {error && <p className="text-center text-danger text-sm mt-4">{error}</p>}
    </Layout>
  )
}
