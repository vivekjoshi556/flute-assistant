import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { PracticeLayout } from '../components/PracticeLayout'
import { useTargetPractice } from '../hooks/useTargetPractice'
import {
  ALANKAR_CATEGORIES,
  getAlankarById,
  getAlankarsByCategory,
  type Alankar,
  type AlankarCategory,
  type AlankarDifficulty,
} from '../music/alankars'
import { noteTargetLabel } from '../music/register'
import type { Register } from '../music/register'

function getRegisterOptions(baseOctave: number) {
  return [
    { value: 'lower' as Register, label: 'Lower', octave: baseOctave - 1 },
    { value: 'middle' as Register, label: 'Middle', octave: baseOctave },
    { value: 'higher' as Register, label: 'Higher', octave: baseOctave + 1 },
  ]
}

const DIFFICULTY_COLORS: Record<AlankarDifficulty, string> = {
  beginner: 'bg-accent/15 text-accent border-accent/30',
  intermediate: 'bg-warning/15 text-warning border-warning/30',
  advanced: 'bg-danger/15 text-danger border-danger/30',
}

const DIFFICULTY_LABELS: Record<AlankarDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

const MAX_PREVIEW_NOTES = 12

export function AlankarPracticeScreen() {
  const { alankarId } = useParams<{ alankarId?: string }>()
  const { settings, setActiveSession, stats } = useApp()
  const navigate = useNavigate()
  const registerOptions = getRegisterOptions(settings.baseOctave)

  const [baseOctave, setBaseOctave] = useState(settings.baseOctave)
  const [selected, setSelected] = useState<Alankar | null>(null)
  const [started, setStarted] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<AlankarCategory>>(new Set())
  const pendingStart = useRef(false)

  // Generate notes for the selected alankar
  const targets = useMemo(
    () => (selected ? selected.generateNotes(baseOctave) : []),
    [selected, baseOctave],
  )

  const practice = useTargetPractice({
    fluteKey: settings.fluteKey,
    targets,
    enabled: started && !!selected,
  })

  // Handle pending start after state updates
  useEffect(() => {
    if (pendingStart.current && selected) {
      practice.start()
      pendingStart.current = false
    }
  }, [selected, practice])

  // Auto-start if alankarId is in URL
  useEffect(() => {
    if (alankarId && !started) {
      const alankar = getAlankarById(alankarId)
      if (alankar) {
        setSelected(alankar)
        setStarted(true)
        pendingStart.current = true
      }
    }
  }, [alankarId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to top on state changes
  const isComplete = practice.phase === 'done'
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [started, isComplete])

  // Navigate to session summary on completion
  useEffect(() => {
    if (practice.phase === 'done') {
      finishSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice.phase])

  const startAlankar = (alankar: Alankar) => {
    setSelected(alankar)
    setStarted(true)
    pendingStart.current = true
    navigate(`/practice/alankar/${alankar.id}`)
  }

  const goBackToList = () => {
    practice.finishEarly()
    setStarted(false)
    setSelected(null)
    navigate('/practice/alankar')
  }

  const finishSession = () => {
    practice.finishEarly()
    if (!selected) return
    const session = practice.buildSession('sargam', {
      sargamId: selected.id,
      sargamName: selected.name,
      sargamScore:
        practice.noteResults.length > 0
          ? practice.noteResults.reduce((a, r) => a + r.accuracy, 0) /
            practice.noteResults.length
          : 0,
      baseOctave,
    })
    setActiveSession(session)
    navigate('/session-summary')
  }

  const toggleCategory = (cat: AlankarCategory) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  const bestScoreForAlankar = (id: string) => {
    const sessions = stats.sessions.filter((s) => s.sargamId === id && s.sargamScore)
    if (sessions.length === 0) return null
    return Math.max(...sessions.map((s) => s.sargamScore ?? 0))
  }

  // --- Practice view ---
  if (started && selected) {
    return (
      <Layout title={selected.name} onBack={goBackToList}>
        <PracticeLayout
          target={practice.target}
          targetSequence={targets}
          currentIndex={practice.currentIndex}
          reading={practice.reading}
          chartPoints={practice.chartPoints}
          feedback={practice.feedback}
          fluteKey={settings.fluteKey}
          baseOctave={baseOctave}
          showHints={practice.showHints}
          hintsAvailable
          showMetronome
          statusLabel="Play"
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

  // --- Listing view ---
  return (
    <Layout title="Alankar Practice" backTo="/">
      <p className="text-text-muted text-center mb-6">
        Practice structured note patterns — build finger memory and musical agility.
      </p>

      {/* Register selector */}
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

      {/* Category sections */}
      <div className="space-y-4 pb-16">
        {ALANKAR_CATEGORIES.map((cat) => {
          const alankars = getAlankarsByCategory(cat.id)
          const isCollapsed = collapsedCategories.has(cat.id)

          return (
            <div key={cat.id}>
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-surface-raised border border-border hover:border-accent/40 transition-all text-left group"
              >
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                      {cat.name}
                    </h2>
                    <span className="text-xs text-text-muted bg-surface-overlay px-2 py-0.5 rounded-full">
                      {alankars.length}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">{cat.description}</p>
                </div>
                <span
                  className={`text-text-muted text-sm transition-transform duration-200 ${
                    isCollapsed ? '' : 'rotate-180'
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* Alankar cards */}
              {!isCollapsed && (
                <div className="grid gap-2 mt-2 pl-2">
                  {alankars.map((alankar) => {
                    const best = bestScoreForAlankar(alankar.id)
                    const previewNotes = alankar.generateNotes(baseOctave)
                    const truncated = previewNotes.length > MAX_PREVIEW_NOTES

                    return (
                      <button
                        key={alankar.id}
                        type="button"
                        onClick={() => startAlankar(alankar)}
                        className="py-4 px-5 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-text">{alankar.name}</span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${DIFFICULTY_COLORS[alankar.difficulty]}`}
                              >
                                {DIFFICULTY_LABELS[alankar.difficulty]}
                              </span>
                              <span className="text-xs text-text-muted font-mono bg-surface-overlay px-1.5 py-0.5 rounded">
                                {alankar.patternLabel}
                              </span>
                            </div>
                            <p className="text-sm text-text-muted mt-1 line-clamp-2">
                              {alankar.description}
                            </p>
                          </div>
                          {best !== null && (
                            <span className="text-xs text-accent shrink-0">
                              Best {Math.round(best)}%
                            </span>
                          )}
                        </div>

                        {/* Note preview */}
                        <p className="text-xs text-accent/80 mt-2 tracking-wide">
                          {previewNotes
                            .slice(0, MAX_PREVIEW_NOTES)
                            .map((n) => noteTargetLabel(n, baseOctave))
                            .join(' ')}
                          {truncated && ' …'}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
