import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { PracticeLayout } from '../components/PracticeLayout'
import { useTargetPractice } from '../hooks/useTargetPractice'
import {
  getScaleTargets,
  randomNoteTargets,
} from '../music/scales'
import type { GuidedExerciseType, IndianNote } from '../types'
import type { Register, NoteTarget } from '../music/register'
import { useVoiceNavigation } from '../hooks/useVoiceNavigation'

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
  const [selectedType, setSelectedType] = useState<GuidedExerciseType | null>(null)

  const practice = useTargetPractice({
    fluteKey: settings.fluteKey,
    targets,
    enabled: started && targets.length > 0,
  })

  // Voice navigation mappings
  const mappings = useMemo(() => ({
    SA: { label: 'Single Notes', action: () => startExercise('single') },
    RE: { label: 'Ascending', action: () => startExercise('ascending') },
    GA: { label: 'Descending', action: () => startExercise('descending') },
    MA: { label: 'Random', action: () => startExercise('random') },
  }), [])

  const actionMappings = useMemo(() => {
    const res: any = {}
    for (const [k, v] of Object.entries(mappings)) {
      res[k] = v.action
    }
    return res
  }, [mappings])

  const voiceNav = useVoiceNavigation({
    mappings: actionMappings,
    enabled: !started && (settings.voiceNavigationEnabled ?? false),
  })

  useEffect(() => {
    if (pendingStart.current && targets.length > 0) {
      practice.start()
      pendingStart.current = false
    }
  }, [targets, practice])

  const isComplete = practice.phase === 'done'
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [started, isComplete])

  const startExercise = (type: GuidedExerciseType) => {
    let list = getScaleTargets(type === 'random' ? 'single' : type, baseOctave)
    if (type === 'random') list = randomNoteTargets(8, baseOctave)
    setTargets(list)
    setStarted(true)
    pendingStart.current = true
    setSelectedType(type)
  }

  const location = useLocation()

  useEffect(() => {
    if (location.state?.autoStart && location.state?.guidedType) {
      const type = location.state.guidedType
      const oct = location.state.baseOctave ?? settings.baseOctave
      setBaseOctave(oct)
      
      // start exercise
      let list = getScaleTargets(type === 'random' ? 'single' : type, oct)
      if (type === 'random') list = randomNoteTargets(8, oct)
      setTargets(list)
      setStarted(true)
      pendingStart.current = true
      setSelectedType(type)
      
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, settings.baseOctave, navigate, location.pathname])

  const goBackToList = () => {
    practice.finishEarly()
    setStarted(false)
    setTargets([])
  }

  const finishSession = () => {
    practice.finishEarly()
    const session = practice.buildSession('guided', {
      guidedType: selectedType || undefined,
      baseOctave,
    })
    setActiveSession(session)
    navigate('/session-summary')
  }

  useEffect(() => {
    if (practice.phase === 'done') {
      finishSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice.phase])

  if (!started) {
    return (
      <Layout title="Guided Practice" backTo="/">
        <p className="text-text-muted text-center mb-6">
          Choose an exercise. Hints appear on the side when you struggle with a note.
        </p>

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
          {EXERCISE_OPTIONS.map((opt, idx) => {
            const noteHints: IndianNote[] = ['SA', 'RE', 'GA', 'MA']
            const noteHint = noteHints[idx]
            const isActive = voiceNav.activeKey === noteHint

            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => startExercise(opt.type)}
                className={`relative py-4 px-6 rounded-xl bg-surface-raised border transition-all text-left overflow-hidden ${
                  isActive
                    ? 'border-accent shadow-[0_0_12px_rgba(52,211,153,0.15)] scale-[1.01]'
                    : 'border-border hover:border-accent'
                }`}
              >
                {noteHint && (
                  <span className={`absolute top-4 right-4 text-[10px] font-extrabold tracking-wider border px-2 py-0.5 rounded-md font-mono uppercase shadow-sm transition-colors ${
                    isActive
                      ? 'bg-accent text-surface border-accent'
                      : 'bg-accent/15 text-accent border-accent/30'
                  }`}>
                    {noteHint}
                  </span>
                )}
                <span className="font-medium text-text">{opt.label}</span>
                <p className="text-sm text-text-muted mt-0.5">{opt.desc}</p>
                {isActive && voiceNav.holdProgress > 0 && (
                  <div
                    className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-75 ease-out shadow-[0_0_8px_var(--color-accent)]"
                    style={{ width: `${voiceNav.holdProgress}%` }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </Layout>
    )
  }

  const statusLabel = 'Play'

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
