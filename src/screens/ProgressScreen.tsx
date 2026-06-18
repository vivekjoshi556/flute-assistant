import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { formatDuration } from '../hooks/useLocalStorage'
import type { IndianNote } from '../types'

export function ProgressScreen() {
  const { stats } = useApp()

  const accuracyByNote = computeAccuracyByNote(stats.sessions)
  const sargamScores = computeSargamScores(stats.sessions)

  return (
    <Layout title="Progress" backTo="/">
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-surface-raised border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-accent">{stats.practiceStreak}</p>
          <p className="text-xs text-text-muted">Day Streak</p>
        </div>
        <div className="bg-surface-raised border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-accent">
            {formatDuration(stats.totalPracticeTime)}
          </p>
          <p className="text-xs text-text-muted">Total Time</p>
        </div>
        <div className="bg-surface-raised border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-accent">{stats.sessions.length}</p>
          <p className="text-xs text-text-muted">Sessions</p>
        </div>
      </div>

      {sargamScores.length > 0 && (
        <div className="bg-surface-raised border border-border rounded-xl p-4 mb-8">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
            Sargam Scores
          </h3>
          <div className="space-y-3">
            {sargamScores.map((s) => (
              <div key={s.sargamId} className="flex items-center gap-3">
                <span className="flex-1 text-sm font-medium truncate">{s.name}</span>
                <div className="w-24 h-2 bg-surface-overlay rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${s.bestScore}%` }}
                  />
                </div>
                <span className="text-sm text-text-muted w-14 text-right">
                  {Math.round(s.bestScore)}% best
                </span>
                <span className="text-xs text-text-muted w-8">
                  ×{s.attempts}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(accuracyByNote).length > 0 && (
        <div className="bg-surface-raised border border-border rounded-xl p-4 mb-8">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
            Accuracy By Note
          </h3>
          <div className="space-y-3">
            {Object.entries(accuracyByNote)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([note, accuracy]) => (
                <div key={note} className="flex items-center gap-3">
                  <span className="w-10 font-bold text-sm">{note}</span>
                  <div className="flex-1 h-2 bg-surface-overlay rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                  <span className="text-sm text-text-muted w-12 text-right">
                    {Math.round(accuracy)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
        Recent Sessions
      </h3>
      {stats.sessions.length === 0 ? (
        <p className="text-text-muted text-center py-8">
          No sessions yet. Start practicing!
        </p>
      ) : (
        <div className="space-y-2">
          {stats.sessions.slice(0, 10).map((session) => (
            <div
              key={session.id}
              className="bg-surface-raised border border-border rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium capitalize">
                  {session.sargamName ?? session.mode.replace('-', ' ')}
                </p>
                <p className="text-xs text-text-muted">
                  {new Date(session.startTime).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-accent font-medium">
                  {Math.round(session.averageAccuracy)}% avg
                </p>
                <p className="text-xs text-text-muted">
                  {formatDuration((session.endTime - session.startTime) / 1000)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          to="/practice/free"
          className="text-accent hover:underline text-sm"
        >
          Start practicing →
        </Link>
      </div>
    </Layout>
  )
}

function computeAccuracyByNote(
  sessions: { noteResults: { note: IndianNote; accuracy: number }[] }[],
): Record<string, number> {
  const map: Record<string, number[]> = {}
  for (const session of sessions) {
    for (const result of session.noteResults) {
      if (!map[result.note]) map[result.note] = []
      map[result.note].push(result.accuracy)
    }
  }
  const avg: Record<string, number> = {}
  for (const [note, values] of Object.entries(map)) {
    avg[note] = values.reduce((a, b) => a + b, 0) / values.length
  }
  return avg
}

function computeSargamScores(
  sessions: {
    sargamId?: string
    sargamName?: string
    sargamScore?: number
  }[],
) {
  const map = new Map<
    string,
    { name: string; bestScore: number; attempts: number }
  >()
  for (const s of sessions) {
    if (!s.sargamId || s.sargamScore === undefined) continue
    const existing = map.get(s.sargamId)
    if (existing) {
      existing.bestScore = Math.max(existing.bestScore, s.sargamScore)
      existing.attempts += 1
    } else {
      map.set(s.sargamId, {
        name: s.sargamName ?? s.sargamId,
        bestScore: s.sargamScore,
        attempts: 1,
      })
    }
  }
  return Array.from(map.entries())
    .map(([sargamId, data]) => ({ sargamId, ...data }))
    .sort((a, b) => b.bestScore - a.bestScore)
}
