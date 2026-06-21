import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { PracticeLayout } from '../components/PracticeLayout'
import { useTargetPractice } from '../hooks/useTargetPractice'
import {
  getSargamsForOctave,
  getAscendingLoop,
  getDescendingLoop,
  getRandomAlankar,
  DIFFICULTY_LABELS,
  type Sargam,
  type SargamDifficulty,
} from '../music/sargams'

const DIFFICULTY_ORDER: SargamDifficulty[] = ['beginner', 'intermediate', 'advanced']

export function SargamPracticeScreen() {
  const { settings, setActiveSession, stats } = useApp()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Sargam | null>(null)
  const [started, setStarted] = useState(false)
  const pendingStart = useRef(false)
  const sargams = useMemo(() => getSargamsForOctave(settings.baseOctave), [settings.baseOctave])

  const isInfinite = selected?.id.startsWith('infinite-') ?? false

  const practice = useTargetPractice({
    fluteKey: settings.fluteKey,
    targets: selected?.notes ?? [],
    enabled: started && !!selected,
    loop: isInfinite,
  })

  useEffect(() => {
    if (pendingStart.current && selected) {
      practice.start()
      pendingStart.current = false
    }
  }, [selected, practice])

  const isComplete = practice.phase === 'done'
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [started, isComplete])

  const startSargam = (sargam: Sargam) => {
    setSelected(sargam)
    setStarted(true)
    pendingStart.current = true
  }

  const startInfinite = (type: 'ascending' | 'descending' | 'alankar') => {
    let notes = []
    let name = ''
    let description = ''
    if (type === 'ascending') {
      notes = getAscendingLoop(settings.baseOctave)
      name = 'Infinite Ascending'
      description = 'Loops ascending scale continuously.'
    } else if (type === 'descending') {
      notes = getDescendingLoop(settings.baseOctave)
      name = 'Infinite Descending'
      description = 'Loops descending scale continuously.'
    } else {
      notes = getRandomAlankar(settings.baseOctave)
      name = 'Infinite Random Alankar'
      description = 'Loops a random alankar pattern continuously.'
    }
    
    startSargam({
      id: `infinite-${type}`,
      name,
      description,
      difficulty: 'advanced',
      notes,
    })
  }

  const location = useLocation()

  useEffect(() => {
    if (location.state?.autoStartId) {
      const id = location.state.autoStartId
      if (id.startsWith('infinite-')) {
        const type = id.replace('infinite-', '') as 'ascending' | 'descending' | 'alankar'
        startInfinite(type)
      } else {
        const found = sargams.find((s) => s.id === id)
        if (found) {
          startSargam(found)
        }
      }
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, sargams, navigate, location.pathname])

  const goBackToList = () => {
    practice.finishEarly()
    setStarted(false)
    setSelected(null)
  }

  const finishSession = () => {
    practice.finishEarly()
    if (!selected) return
    const session = practice.buildSession('sargam', {
      sargamId: selected.id,
      sargamName: selected.name,
      sargamScore: practice.noteResults.length > 0
        ? practice.noteResults.reduce((a, r) => a + r.accuracy, 0) /
          practice.noteResults.length
        : 0,
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

  const bestScoreForSargam = (id: string) => {
    const sessions = stats.sessions.filter((s) => s.sargamId === id && s.sargamScore)
    if (sessions.length === 0) return null
    return Math.max(...sessions.map((s) => s.sargamScore ?? 0))
  }

  if (!started) {
    return (
      <Layout title="Sargam Practice" backTo="/">
        <p className="text-text-muted text-center mb-6">
          Practice named note sequences — great for remembering notes in different orders.
        </p>
        <div className="space-y-6">
          {DIFFICULTY_ORDER.map((difficulty) => {
            const items = sargams.filter((s) => s.difficulty === difficulty)
            if (items.length === 0) return null
            return (
              <div key={difficulty}>
                <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
                  {DIFFICULTY_LABELS[difficulty]}
                </h2>
                <div className="grid gap-2">
                  {items.map((sargam) => {
                    const best = bestScoreForSargam(sargam.id)
                    return (
                      <button
                        key={sargam.id}
                        type="button"
                        onClick={() => startSargam(sargam)}
                        className="py-4 px-5 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all text-left"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-medium text-text">{sargam.name}</span>
                          {best !== null && (
                            <span className="text-xs text-accent shrink-0">
                              Best {Math.round(best)}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-muted mt-1">{sargam.description}</p>
                        <p className="text-xs text-accent/80 mt-2 tracking-wide">
                          {sargam.notes.map((n) =>
                            n.octave > settings.baseOctave && n.note === 'SA' ? 'SA↑' : n.note,
                          ).join(' ')}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
          
          <div>
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
              Infinite Practice
            </h2>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => startInfinite('ascending')}
                className="py-4 px-5 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all text-left"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium text-text">Infinite Ascending</span>
                </div>
                <p className="text-sm text-text-muted mt-1">Loops ascending scale continuously.</p>
              </button>
              <button
                type="button"
                onClick={() => startInfinite('descending')}
                className="py-4 px-5 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all text-left"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium text-text">Infinite Descending</span>
                </div>
                <p className="text-sm text-text-muted mt-1">Loops descending scale continuously.</p>
              </button>
              <button
                type="button"
                onClick={() => startInfinite('alankar')}
                className="py-4 px-5 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all text-left"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium text-text">Infinite Random Alankar</span>
                </div>
                <p className="text-sm text-text-muted mt-1">Loops a random alankar pattern continuously.</p>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={selected?.name ?? 'Sargam'} onBack={goBackToList}>
      <PracticeLayout
        target={practice.target}
        targetSequence={selected?.notes}
        currentIndex={practice.currentIndex}
        reading={practice.reading}
        chartPoints={practice.chartPoints}
        feedback={practice.feedback}
        fluteKey={settings.fluteKey}
        baseOctave={settings.baseOctave}
        showHints={practice.showHints}
        hintsAvailable
        statusLabel={isInfinite ? `Loop ${practice.loopCount + 1}` : 'Play'}
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
