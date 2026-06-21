import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { formatDuration } from '../hooks/useLocalStorage'
import type { IndianNote } from '../types'
import { useVoiceNavigation } from '../hooks/useVoiceNavigation'

export function SessionSummaryScreen() {
  const { activeSession, saveSession, setActiveSession, settings } = useApp()
  const navigate = useNavigate()

  // Voice Navigation for summary actions
  const summaryMappings = useMemo(() => ({
    RE: { label: 'Repeat', action: () => handleRepeat() },
    SA: { label: 'Done', action: () => handleDone() },
  }), [activeSession])

  const summaryActionMappings = useMemo(() => {
    const res: any = {}
    for (const [k, v] of Object.entries(summaryMappings)) {
      res[k] = v.action
    }
    return res
  }, [summaryMappings])

  const voiceNav = useVoiceNavigation({
    mappings: summaryActionMappings,
    enabled: !!activeSession && (settings.voiceNavigationEnabled ?? false),
  })

  const isReActive = voiceNav.activeKey === 'RE'
  const isSaActive = voiceNav.activeKey === 'SA'

  const savedRef = useRef(false)

  useEffect(() => {
    if (activeSession && !savedRef.current) {
      saveSession(activeSession)
      savedRef.current = true
    }
  }, [activeSession, saveSession])

  if (!activeSession) {
    return (
      <Layout title="Session Summary" backTo="/">
        <p className="text-center text-text-muted py-12">No session data.</p>
      </Layout>
    )
  }

  const duration = (activeSession.endTime - activeSession.startTime) / 1000
  const { difficult, stable } = analyzeNotes(activeSession.noteResults)
  const accuracyByNote = groupAccuracy(activeSession.noteResults)

  const handleDone = () => {
    if (!activeSession) return
    const mode = activeSession.mode
    setActiveSession(null)
    if (mode === 'sargam') {
      navigate('/practice/sargam')
    } else if (mode === 'guided') {
      navigate('/practice/guided')
    } else if (mode === 'scale') {
      navigate('/scale-trainer')
    } else if (mode === 'free') {
      navigate('/practice/free')
    } else if (mode === 'difficult-notes') {
      navigate('/practice/difficult-notes')
    } else {
      navigate('/')
    }
  }

  const handleRepeat = () => {
    if (!activeSession) return
    const { mode, sargamId, guidedType, scaleDirection, baseOctave } = activeSession
    setActiveSession(null)
    if (mode === 'sargam' && sargamId) {
      navigate('/practice/sargam', { state: { autoStartId: sargamId } })
    } else if (mode === 'guided' && guidedType) {
      navigate('/practice/guided', { state: { autoStart: true, guidedType, baseOctave } })
    } else if (mode === 'scale' && scaleDirection) {
      navigate('/scale-trainer', { state: { autoStart: true, direction: scaleDirection, baseOctave } })
    } else if (mode === 'free') {
      navigate('/practice/free')
    } else if (mode === 'difficult-notes') {
      navigate('/practice/difficult-notes', { state: { autoStart: true } })
    } else {
      navigate('/')
    }
  }

  return (
    <Layout title="Session Summary" backTo="/">
      <div className="space-y-6">
        <div className="text-center py-4">
          <p className="text-sm text-text-muted">Practice Time</p>
          <p className="text-4xl font-bold text-accent">{formatDuration(duration)}</p>
        </div>

        {activeSession.sargamName && (
          <div className="bg-surface-raised border border-accent/30 rounded-xl p-4 text-center">
            <p className="text-sm text-text-muted">Sargam</p>
            <p className="text-lg font-bold text-accent">{activeSession.sargamName}</p>
            {activeSession.sargamScore !== undefined && (
              <p className="text-2xl font-bold mt-1">
                {Math.round(activeSession.sargamScore)}% overall
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-raised border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">
              {Math.round(activeSession.averageAccuracy)}%
            </p>
            <p className="text-xs text-text-muted">Average Accuracy</p>
          </div>
          <div className="bg-surface-raised border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">
              {Math.round(activeSession.bestAccuracy)}%
            </p>
            <p className="text-xs text-text-muted">Best Accuracy</p>
          </div>
        </div>

        {difficult.length > 0 && (
          <div className="bg-surface-raised border border-border rounded-xl p-4">
            <p className="text-sm text-text-muted mb-2">Most Difficult Notes</p>
            <p className="text-danger font-medium">{difficult.join(', ')}</p>
          </div>
        )}

        {stable.length > 0 && (
          <div className="bg-surface-raised border border-border rounded-xl p-4">
            <p className="text-sm text-text-muted mb-2">Most Stable Notes</p>
            <p className="text-accent font-medium">{stable.join(', ')}</p>
          </div>
        )}

        {Object.keys(accuracyByNote).length > 0 && (
          <div className="bg-surface-raised border border-border rounded-xl p-4">
            <p className="text-sm text-text-muted mb-3">Accuracy By Note</p>
            <div className="space-y-2">
              {Object.entries(accuracyByNote)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([note, acc]) => (
                  <div key={note} className="flex justify-between text-sm">
                    <span className="font-medium">{note}</span>
                    <span className="text-text-muted">{Math.round(acc)}%</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {voiceNav.error && settings.voiceNavigationEnabled && (
          <p className="text-center text-danger text-xs mb-4">
            🎙️ Navigation mic error: {voiceNav.error}
          </p>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleRepeat}
            className={`relative w-full py-3 rounded-full font-semibold transition-all overflow-hidden ${
              isReActive
                ? 'bg-accent/90 text-surface border-2 border-accent shadow-[0_0_12px_rgba(52,211,153,0.3)] scale-[1.01]'
                : 'bg-accent text-surface hover:bg-accent/90'
            }`}
          >
            Repeat Exercise
            <span className={`absolute top-1/2 -translate-y-1/2 right-4 text-[10px] font-extrabold tracking-wider border px-2 py-0.5 rounded-md font-mono uppercase shadow-sm transition-colors ${
              isReActive
                ? 'bg-surface text-accent border-surface'
                : 'bg-surface/20 text-surface border-surface/30'
            }`}>
              RE
            </span>
            {isReActive && voiceNav.holdProgress > 0 && (
              <div
                className="absolute bottom-0 left-0 h-1 bg-surface transition-all duration-75 ease-out shadow-[0_0_8px_white]"
                style={{ width: `${voiceNav.holdProgress}%` }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={handleDone}
            className={`relative w-full py-3 rounded-full font-medium transition-all overflow-hidden ${
              isSaActive
                ? 'bg-surface-overlay text-text border-2 border-accent shadow-[0_0_12px_rgba(52,211,153,0.15)] scale-[1.01]'
                : 'bg-surface-raised border border-border text-text hover:bg-surface-overlay'
            }`}
          >
            Done
            <span className={`absolute top-1/2 -translate-y-1/2 right-4 text-[10px] font-extrabold tracking-wider border px-2 py-0.5 rounded-md font-mono uppercase shadow-sm transition-colors ${
              isSaActive
                ? 'bg-accent text-surface border-accent'
                : 'bg-accent/15 text-accent border-accent/30'
            }`}>
              SA
            </span>
            {isSaActive && voiceNav.holdProgress > 0 && (
              <div
                className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-75 ease-out shadow-[0_0_8px_var(--color-accent)]"
                style={{ width: `${voiceNav.holdProgress}%` }}
              />
            )}
          </button>
        </div>
      </div>
    </Layout>
  )
}

function groupAccuracy(
  results: { note: IndianNote; accuracy: number }[],
): Record<string, number> {
  const map: Record<string, number[]> = {}
  for (const r of results) {
    if (!map[r.note]) map[r.note] = []
    map[r.note].push(r.accuracy)
  }
  const avg: Record<string, number> = {}
  for (const [note, vals] of Object.entries(map)) {
    avg[note] = vals.reduce((a, b) => a + b, 0) / vals.length
  }
  return avg
}

function analyzeNotes(
  results: { note: IndianNote; accuracy: number }[],
): { difficult: IndianNote[]; stable: IndianNote[] } {
  const grouped = groupAccuracy(results)
  const entries = Object.entries(grouped) as [IndianNote, number][]
  if (entries.length === 0) return { difficult: [], stable: [] }

  entries.sort((a, b) => a[1] - b[1])
  const difficult = entries.slice(0, 2).map(([n]) => n)
  const stable = entries
    .slice(-2)
    .reverse()
    .map(([n]) => n)
  return { difficult, stable }
}
