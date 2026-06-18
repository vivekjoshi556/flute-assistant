import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { PracticeLayout } from '../components/PracticeLayout'
import { useTargetPractice } from '../hooks/useTargetPractice'
import {
  SARGAMS,
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

  const practice = useTargetPractice({
    fluteKey: settings.fluteKey,
    targets: selected?.notes ?? [],
    enabled: started && !!selected,
  })

  useEffect(() => {
    if (pendingStart.current && selected) {
      practice.start()
      pendingStart.current = false
    }
  }, [selected, practice])

  const startSargam = (sargam: Sargam) => {
    setSelected(sargam)
    setStarted(true)
    pendingStart.current = true
  }

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
            const items = SARGAMS.filter((s) => s.difficulty === difficulty)
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
                            n.octave >= 5 && n.note === 'SA' ? 'SA↑' : n.note,
                          ).join(' ')}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Layout>
    )
  }

  if (practice.phase === 'done') {
    return (
      <Layout title="Sargam Complete" onBack={goBackToList}>
        <div className="text-center space-y-6 py-12">
          <span className="text-6xl">🎉</span>
          <h2 className="text-2xl font-bold">{selected?.name}</h2>
          <p className="text-text-muted">Sequence complete!</p>
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
    <Layout title={selected?.name ?? 'Sargam'} onBack={goBackToList}>
      <PracticeLayout
        target={practice.target}
        targetSequence={selected?.notes}
        currentIndex={practice.currentIndex}
        reading={practice.reading}
        chartPoints={practice.chartPoints}
        feedback={practice.feedback}
        fluteKey={settings.fluteKey}
        showHints={practice.showHints}
        hintsAvailable
        statusLabel={practice.phase === 'hold' ? 'Hold steady' : 'Play'}
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
