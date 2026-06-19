import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { PracticeLayout } from '../components/PracticeLayout'
import { useTargetPractice } from '../hooks/useTargetPractice'
import {
  getScaleTargets,
  randomNoteTargets,
} from '../music/scales'
import type { GuidedExerciseType } from '../types'
import type { Register, NoteTarget } from '../music/register'

const EXERCISE_OPTIONS: { type: GuidedExerciseType; label: string; desc: string }[] = [
  { type: 'single', label: 'Single Notes', desc: 'Sa Re Ga Ma Pa Dha Ni Sa — one at a time' },
  { type: 'ascending', label: 'Ascending Scale', desc: 'Sa Re Ga Ma Pa Dha Ni Sa' },
  { type: 'descending', label: 'Descending Scale', desc: 'Sa Ni Dha Pa Ma Ga Re Sa' },
  { type: 'random', label: 'Random Notes', desc: 'Random sequence — builds recall' },
]

function getRegisterOptions(baseOctave: number): { value: Register; label: string; octave: number }[] {
  return [
    { value: 'lower', label: 'Lower', octave: baseOctave - 1 },
    { value: 'middle', label: 'Middle', octave: baseOctave },
    { value: 'higher', label: 'Higher', octave: baseOctave + 1 },
  ]
}

export function GuidedPracticeScreen() {
  const { settings, setActiveSession } = useApp()
  const navigate = useNavigate()
  const registerOptions = getRegisterOptions(settings.baseOctave)
  const [baseOctave, setBaseOctave] = useState(settings.baseOctave)
  const [targets, setTargets] = useState<NoteTarget[]>([])
  const [started, setStarted] = useState(false)
  const pendingStart = useRef(false)

  const practice = useTargetPractice({
    fluteKey: settings.fluteKey,
    targets,
    enabled: started && targets.length > 0,
  })

  useEffect(() => {
    if (pendingStart.current && targets.length > 0) {
      practice.start()
      pendingStart.current = false
    }
  }, [targets, practice])

  const startExercise = (type: GuidedExerciseType) => {
    let list = getScaleTargets(type === 'random' ? 'single' : type, baseOctave)
    if (type === 'random') list = randomNoteTargets(8, baseOctave)
    setTargets(list)
    setStarted(true)
    pendingStart.current = true
  }

  const goBackToList = () => {
    practice.finishEarly()
    setStarted(false)
    setTargets([])
  }

  const finishSession = () => {
    practice.finishEarly()
    const session = practice.buildSession('guided')
    setActiveSession(session)
    navigate('/session-summary')
  }

  if (!started) {
    return (
      <Layout title="Guided Practice" backTo="/">
        <p className="text-text-muted text-center mb-6">
          Choose an exercise. Hints appear on the side when you struggle with a note.
        </p>

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

        <div className="grid gap-3 max-w-sm mx-auto">
          {EXERCISE_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => startExercise(opt.type)}
              className="py-4 px-6 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all text-left"
            >
              <span className="font-medium text-text">{opt.label}</span>
              <p className="text-sm text-text-muted mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </Layout>
    )
  }

  if (practice.phase === 'done') {
    return (
      <Layout title="Exercise Complete" onBack={goBackToList}>
        <div className="text-center space-y-6 py-12">
          <span className="text-6xl">🎉</span>
          <h2 className="text-2xl font-bold">Well done!</h2>
          <p className="text-text-muted">
            You completed {targets.length} notes.
          </p>
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

  const statusLabel =
    practice.phase === 'hold'
      ? 'Hold steady'
      : practice.phase === 'correct'
        ? 'Correct'
        : 'Play'

  return (
    <Layout title="Guided Practice" onBack={goBackToList}>
      <PracticeLayout
        target={practice.target}
        targetSequence={targets}
        currentIndex={practice.currentIndex}
        reading={practice.reading}
        chartPoints={practice.chartPoints}
        feedback={practice.feedback}
        fluteKey={settings.fluteKey}
        baseOctave={settings.baseOctave}
        showHints={practice.showHints}
        hintsAvailable
        statusLabel={statusLabel}
        footer={
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={finishSession}
              className="px-6 py-3 rounded-full border border-border text-text-muted hover:text-text"
            >
              End Early
            </button>
          </div>
        }
      />
      {practice.error && (
        <p className="text-center text-danger text-sm mt-4">{practice.error}</p>
      )}
    </Layout>
  )
}
