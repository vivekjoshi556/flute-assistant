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
import { useVoiceNavigation } from '../hooks/useVoiceNavigation'

const DIFFICULTY_ORDER: SargamDifficulty[] = ['beginner', 'intermediate', 'advanced']

export function SargamPracticeScreen() {
  const { settings, setActiveSession, stats } = useApp()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Sargam | null>(null)
  const [started, setStarted] = useState(false)
  const pendingStart = useRef(false)
  const sargams = useMemo(() => getSargamsForOctave(settings.baseOctave), [settings.baseOctave])

  // Get all sargams and infinite options mapped to 2-note transition sequences
  const sargamNavOrder = useMemo(() => [
    { id: 'basic-ascending', name: 'Basic Ascending', trigger: 'SA-RE', action: (s?: Sargam) => s && startSargam(s) },
    { id: 'return-home', name: 'Return Home', trigger: 'RE-SA', action: (s?: Sargam) => s && startSargam(s) },
    { id: 'full-scale-up', name: 'Full Scale Up', trigger: 'RE-GA', action: (s?: Sargam) => s && startSargam(s) },
    { id: 'full-scale-down', name: 'Full Scale Down', trigger: 'GA-RE', action: (s?: Sargam) => s && startSargam(s) },
    { id: 'jump-sa-ga-pa', name: 'Skip Pattern', trigger: 'GA-MA', action: (s?: Sargam) => s && startSargam(s) },
    { id: 'alankar-1', name: 'Alankar 1', trigger: 'MA-GA', action: (s?: Sargam) => s && startSargam(s) },
    { id: 'zigzag', name: 'Zigzag', trigger: 'MA-PA', action: (s?: Sargam) => s && startSargam(s) },
    { id: 'long-paltaa', name: 'Long Paltaa', trigger: 'PA-MA', action: (s?: Sargam) => s && startSargam(s) },
    { id: 'infinite-ascending', name: 'Infinite Ascending', trigger: 'PA-DHA', action: () => startInfinite('ascending') },
    { id: 'infinite-descending', name: 'Infinite Descending', trigger: 'DHA-PA', action: () => startInfinite('descending') },
    { id: 'infinite-alankar', name: 'Infinite Random Alankar', trigger: 'DHA-NI', action: () => startInfinite('alankar') },
  ], [sargams])

  const sargamNoteMap = useMemo(() => {
    const map: Record<string, string> = {}
    sargamNavOrder.forEach((item) => {
      map[item.id] = item.trigger
    })
    return map
  }, [sargamNavOrder])

  const sargamActionMappings = useMemo(() => {
    const res: Record<string, () => void> = {}
    sargamNavOrder.forEach((item) => {
      const s = sargams.find((x) => x.id === item.id)
      res[item.trigger] = () => item.action(s)
    })
    return res
  }, [sargamNavOrder, sargams])

  const voiceNav = useVoiceNavigation({
    mappings: sargamActionMappings,
    enabled: !started && (settings.voiceNavigationEnabled ?? false),
  })

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

        {voiceNav.error && settings.voiceNavigationEnabled && (
          <p className="text-center text-danger text-xs mb-4">
            🎙️ Navigation mic error: {voiceNav.error}
          </p>
        )}

        <div className="space-y-6 pb-16">
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
                    const noteHint = sargamNoteMap[sargam.id]
                    const isActive = voiceNav.activeKey === noteHint
                    return (
                      <button
                        key={sargam.id}
                        type="button"
                        onClick={() => startSargam(sargam)}
                        className={`relative py-4 px-5 rounded-xl bg-surface-raised border transition-all text-left overflow-hidden ${
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
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-medium text-text">{sargam.name}</span>
                          {best !== null && (
                            <span className="text-xs text-accent shrink-0 mr-16">
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
              </div>
            )
          })}
          
          <div>
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
              Infinite Practice
            </h2>
            <div className="grid gap-2">
              {[
                { type: 'ascending', name: 'Infinite Ascending', desc: 'Loops ascending scale continuously.', id: 'infinite-ascending' },
                { type: 'descending', name: 'Infinite Descending', desc: 'Loops descending scale continuously.', id: 'infinite-descending' },
                { type: 'alankar', name: 'Infinite Random Alankar', desc: 'Loops a random alankar pattern continuously.', id: 'infinite-alankar' },
              ].map((opt) => {
                const noteHint = sargamNoteMap[opt.id]
                const isActive = voiceNav.activeKey === noteHint
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => startInfinite(opt.type as any)}
                    className={`relative py-4 px-5 rounded-xl bg-surface-raised border transition-all text-left overflow-hidden ${
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
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium text-text">{opt.name}</span>
                    </div>
                    <p className="text-sm text-text-muted mt-1">{opt.desc}</p>
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
