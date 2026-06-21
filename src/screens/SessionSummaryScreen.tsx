import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { formatDuration } from '../hooks/useLocalStorage'
import type { IndianNote } from '../types'

export function SessionSummaryScreen() {
  const { activeSession, saveSession, setActiveSession } = useApp()
  const navigate = useNavigate()

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

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleRepeat}
            className="w-full py-3 rounded-full bg-accent text-surface font-semibold hover:bg-accent/90 transition-colors"
          >
            Repeat Exercise
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="w-full py-3 rounded-full bg-surface-raised border border-border text-text font-medium hover:bg-surface-overlay transition-colors"
          >
            Done
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
