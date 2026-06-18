import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

type ScaleDirection = 'ascending' | 'descending'

const REGISTER_OPTIONS: { value: Register; label: string; octave: number }[] = [
  { value: 'lower', label: 'Lower', octave: 3 },
  { value: 'middle', label: 'Middle', octave: 4 },
  { value: 'higher', label: 'Higher', octave: 5 },
]

export function ScaleTrainerScreen() {
  const { settings, setActiveSession } = useApp()
  const navigate = useNavigate()
  const [direction, setDirection] = useState<ScaleDirection | null>(null)
  const [baseOctave, setBaseOctave] = useState(4)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [micOn, setMicOn] = useState(false)
  const [targets, setTargets] = useState<NoteTarget[]>([])

  const startTimeRef = useRef(0)
  const noteResultsRef = useRef<NoteResult[]>([])

  const { reading, error } = usePitchDetection(settings.fluteKey, micOn)
  const target = targets[currentIndex] ?? null
  const expectedFrequency = target
    ? getNoteFrequency(target.note, settings.fluteKey, target.octave)
    : null

  const { points: chartPoints } = usePitchChart(
    reading.frequency,
    expectedFrequency,
    micOn && currentIndex < targets.length,
    reading.note,
    target
      ? `${target.note}${target.octave >= 5 && target.note === 'SA' ? '↑' : ''}`
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
      return {
        type: 'register',
        message: `Expected ${target.octave >= 5 ? 'higher' : target.octave <= 3 ? 'lower' : 'middle'} register`,
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
    setMicOn(true)
  }

  // Keep a ref so the interval can access the latest reading without
  // forcing the effect to re-run on every pitch frame.
  const readingRef = useRef(reading)
  readingRef.current = reading

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
        const accuracy = Math.max(0, 100 - Math.abs(r.cents) * 2)
        noteResultsRef.current.push({
          note: target.note,
          expectedNote: target.note,
          detectedNote: r.note,
          accuracy,
          durationHeld: 0.5,
        })
        setCurrentIndex((i) => i + 1)
      }
    }, 400)
    return () => clearInterval(interval)
  }, [target, settings.fluteKey])

  useEffect(() => {
    if (direction && currentIndex >= targets.length && targets.length > 0) {
      setMicOn(false)
    }
  }, [currentIndex, targets.length, direction])

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
    }
    setActiveSession(session)
    navigate('/session-summary')
  }

  if (!direction) {
    return (
      <Layout title="Scale Trainer" backTo="/">
        <div className="text-center mb-8">
          <h2 className="text-xl font-medium">Major Scale Equivalent</h2>
          <p className="text-text-muted text-sm mt-2">
            Sa Re Ga Ma Pa Dha Ni Sa — the shuddha scale for beginners.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {REGISTER_OPTIONS.map((opt) => (
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

        <div className="grid gap-3 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => startScale('ascending')}
            className="py-4 px-6 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all text-left"
          >
            <span className="font-medium">Ascending</span>
            <p className="text-sm text-text-muted">Sa Re Ga Ma Pa Dha Ni Sa</p>
          </button>
          <button
            type="button"
            onClick={() => startScale('descending')}
            className="py-4 px-6 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all text-left"
          >
            <span className="font-medium">Descending</span>
            <p className="text-sm text-text-muted">Sa Ni Dha Pa Ma Ga Re Sa</p>
          </button>
        </div>
      </Layout>
    )
  }

  const isComplete = currentIndex >= targets.length

  if (isComplete) {
    return (
      <Layout title="Scale Trainer" onBack={goBackToList}>
        <div className="text-center space-y-6 py-12">
          <span className="text-5xl">✓</span>
          <h2 className="text-2xl font-bold">Scale Complete</h2>
          <button
            type="button"
            onClick={finishSession}
            className="px-8 py-3 rounded-full bg-accent/20 text-accent border border-accent/40"
          >
            View Summary
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
