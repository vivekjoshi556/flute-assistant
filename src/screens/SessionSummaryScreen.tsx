import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { formatDuration } from '../hooks/useLocalStorage'
import type { IndianNote } from '../types'
import { useVoiceNavigation } from '../hooks/useVoiceNavigation'

export function SessionSummaryScreen() {
  const { activeSession, saveSession, setActiveSession, settings, stats } = useApp()
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
  const [sortByAccuracy, setSortByAccuracy] = useState(false)

  // Look up the historical best average accuracy for the same exercise.
  // Exclude the current session (it was just saved above) by comparing IDs.
  const historicalBest = (() => {
    const past = stats.sessions.filter((s) => {
      if (s.id === activeSession.id) return false
      if (s.mode !== activeSession.mode) return false
      if (activeSession.mode === 'sargam') return s.sargamId === activeSession.sargamId
      if (activeSession.mode === 'alankar')
        return s.alankarId === activeSession.alankarId || s.sargamId === activeSession.alankarId
      if (activeSession.mode === 'guided')
        return s.guidedType === activeSession.guidedType && s.baseOctave === activeSession.baseOctave
      if (activeSession.mode === 'scale')
        return s.scaleDirection === activeSession.scaleDirection && s.baseOctave === activeSession.baseOctave
      return true // difficult-notes / free — match by mode alone
    })
    if (past.length === 0) return null
    return Math.max(...past.map((s) => s.averageAccuracy))
  })()
  const isNewBest = historicalBest !== null && activeSession.averageAccuracy > historicalBest

  const handleDone = () => {
    if (!activeSession) return
    const mode = activeSession.mode
    setActiveSession(null)
    if (mode === 'sargam') {
      navigate('/practice/sargam')
    } else if (mode === 'alankar') {
      navigate('/practice/alankar')
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
    const { mode, sargamId, alankarId, guidedType, scaleDirection, baseOctave } = activeSession
    setActiveSession(null)
    if (mode === 'sargam' && sargamId) {
      navigate('/practice/sargam', { state: { autoStartId: sargamId, baseOctave } })
    } else if (mode === 'alankar' && alankarId) {
      navigate(`/practice/alankar/${alankarId}`)
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

  // Score ring: visual percentage arc for average accuracy
  const avg = Math.round(activeSession.averageAccuracy)
  const RADIUS = 52
  const CIRC = 2 * Math.PI * RADIUS
  const filled = (avg / 100) * CIRC

  return (
    <Layout title="Session Summary" backTo="/">
      <div className="space-y-5 animate-fade-in">

        {/* ── Hero: score ring + time ─────────────────────────── */}
        <div className="relative flex flex-col items-center pt-4 pb-2">
          {/* Glow halo behind ring */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}
          />
          <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-lg">
            {/* Track */}
            <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="var(--color-surface-overlay)" strokeWidth="10" />
            {/* Progress arc */}
            <circle
              cx="70" cy="70" r={RADIUS}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${CIRC}`}
              transform="rotate(-90 70 70)"
              style={{ filter: 'drop-shadow(0 0 6px rgba(196,160,56,0.5))' }}
            />
            {/* Centre label */}
            <text x="70" y="65" textAnchor="middle" fill="var(--color-text)" fontSize="22" fontWeight="700" fontFamily="Inter, sans-serif">
              {avg}%
            </text>
            <text x="70" y="82" textAnchor="middle" fill="var(--color-text-muted)" fontSize="10" fontFamily="Inter, sans-serif">
              accuracy
            </text>
          </svg>

          {/* Time + optional new-best badge */}
          <div className="mt-2 flex items-center gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent leading-none">{formatDuration(duration)}</p>
              <p className="text-xs text-text-muted mt-0.5">practice time</p>
            </div>
            {isNewBest && (
              <div className="flex items-center gap-1 bg-accent/15 border border-accent/30 rounded-full px-3 py-1">
                <span className="text-sm">🏆</span>
                <span className="text-xs font-semibold text-accent">New Best!</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Exercise name (sargam / alankar) ───────────────── */}
        {(activeSession.sargamName || activeSession.alankarName) && (
          <div className="bg-surface-raised border border-accent/20 rounded-2xl px-5 py-3 text-center">
            <p className="text-[11px] font-medium tracking-widest text-text-muted uppercase mb-0.5">
              {activeSession.mode === 'alankar' ? 'Alankar' : 'Sargam'}
            </p>
            <p className="text-base font-bold text-accent">
              {activeSession.alankarName || activeSession.sargamName}
            </p>
            {(activeSession.alankarScore !== undefined || activeSession.sargamScore !== undefined) && (
              <p className="text-xl font-bold mt-0.5 text-text">
                {Math.round((activeSession.alankarScore ?? activeSession.sargamScore ?? 0))}% overall
              </p>
            )}
          </div>
        )}

        {/* ── Historical best (non-new-best case) ────────────── */}
        {historicalBest !== null && !isNewBest && (
          <div className="flex items-center justify-between bg-surface-raised border border-border rounded-2xl px-5 py-3">
            <p className="text-sm text-text-muted">Your best (this exercise)</p>
            <p className="text-base font-bold">{Math.round(historicalBest)}%</p>
          </div>
        )}

        {/* ── Difficult / Stable notes in one row ────────────── */}
        {(difficult.length > 0 || stable.length > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {difficult.length > 0 && (
              <div className="bg-surface-raised border border-border rounded-2xl p-4">
                <p className="text-[10px] font-semibold tracking-widest text-text-muted uppercase mb-2">Needs work</p>
                <div className="flex flex-wrap gap-1.5">
                  {difficult.map((n) => (
                    <span key={n} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {stable.length > 0 && (
              <div className="bg-surface-raised border border-border rounded-2xl p-4">
                <p className="text-[10px] font-semibold tracking-widest text-text-muted uppercase mb-2">Strongest</p>
                <div className="flex flex-wrap gap-1.5">
                  {stable.map((n) => (
                    <span key={n} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Accuracy by note ───────────────────────────────── */}
        {Object.keys(accuracyByNote).length > 0 && (
          <div className="bg-surface-raised border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">Note Accuracy</p>
              <button
                type="button"
                onClick={() => setSortByAccuracy((s) => !s)}
                className="text-[11px] px-2.5 py-1 rounded-lg border transition-all"
                style={{
                  borderColor: sortByAccuracy ? 'var(--color-accent)' : 'var(--color-border)',
                  color: sortByAccuracy ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  background: sortByAccuracy ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
                }}
              >
                {sortByAccuracy ? '↓ Accuracy' : '♩ Sequence'}
              </button>
            </div>
            <div className="space-y-3">
              {sortNoteEntries(Object.entries(accuracyByNote), sortByAccuracy)
                .map(([key, acc]) => {
                  const pct = Math.round(acc)
                  const isGood = pct >= 80
                  const isMid = pct >= 55 && pct < 80
                  const color = isGood
                    ? 'var(--color-accent)'
                    : isMid
                    ? 'var(--color-text)'
                    : 'var(--color-danger)'
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="font-semibold text-sm w-10 shrink-0 tabular-nums">{key}</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-overlay overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: color,
                            boxShadow: isGood ? '0 0 6px rgba(196,160,56,0.35)' : undefined,
                            transition: 'width 0.4s ease-out',
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-medium w-9 text-right shrink-0 tabular-nums"
                        style={{ color }}
                      >
                        {pct}%
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {voiceNav.error && settings.voiceNavigationEnabled && (
          <p className="text-center text-danger text-xs">
            🎙️ Navigation mic error: {voiceNav.error}
          </p>
        )}

        {/* ── Action buttons ─────────────────────────────────── */}
        <div className="space-y-3 pt-1 pb-4">
          <button
            type="button"
            onClick={handleRepeat}
            className={`relative w-full py-3 rounded-full font-semibold transition-all overflow-hidden ${
              isReActive
                ? 'bg-accent/90 text-surface border-2 border-accent shadow-[0_0_16px_rgba(196,160,56,0.35)] scale-[1.01]'
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
                ? 'bg-surface-overlay text-text border-2 border-accent shadow-[0_0_12px_rgba(196,160,56,0.15)] scale-[1.01]'
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

/** Indian note sequence order used for sorting. */
const NOTE_SEQUENCE: IndianNote[] = ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI']

/**
 * Build a display key for a note result.
 * Notes with an octave strictly above the first result's octave get a ↑ suffix.
 */
function noteKey(note: IndianNote, octave?: number, baseOctave?: number): string {
  if (octave !== undefined && baseOctave !== undefined && octave > baseOctave) {
    return `${note}↑`
  }
  return note
}

/**
 * Group note results by note+octave key and return average accuracy per key.
 * Upper-octave notes (octave > base) get a ↑ suffix so they appear separately.
 */
function groupAccuracy(
  results: { note: IndianNote; accuracy: number; octave?: number }[],
): Record<string, number> {
  // Determine the base octave from the lowest octave seen in results (if any have octave info).
  const octaves = results.map((r) => r.octave).filter((o): o is number => o !== undefined)
  const baseOctave = octaves.length > 0 ? Math.min(...octaves) : undefined

  const map: Record<string, number[]> = {}
  for (const r of results) {
    const key = noteKey(r.note, r.octave, baseOctave)
    if (!map[key]) map[key] = []
    map[key].push(r.accuracy)
  }
  const avg: Record<string, number> = {}
  for (const [key, vals] of Object.entries(map)) {
    avg[key] = vals.reduce((a, b) => a + b, 0) / vals.length
  }
  return avg
}

/**
 * Return entries sorted either by sargam sequence order or by accuracy (descending).
 * Sequence order: SA RE GA MA PA DHA NI SA↑ RE↑ …
 */
function sortNoteEntries(
  entries: [string, number][],
  byAccuracy: boolean,
): [string, number][] {
  if (byAccuracy) {
    return [...entries].sort(([, a], [, b]) => b - a)
  }
  return [...entries].sort(([a], [b]) => {
    const aUpper = a.endsWith('↑')
    const bUpper = b.endsWith('↑')
    const aNorm = (aUpper ? a.slice(0, -1) : a) as IndianNote
    const bNorm = (bUpper ? b.slice(0, -1) : b) as IndianNote
    const aIdx = NOTE_SEQUENCE.indexOf(aNorm)
    const bIdx = NOTE_SEQUENCE.indexOf(bNorm)
    if (aIdx !== bIdx) return aIdx - bIdx
    // Same note name: lower octave first
    return Number(aUpper) - Number(bUpper)
  })
}

function analyzeNotes(
  results: { note: IndianNote; accuracy: number; octave?: number }[],
): { difficult: string[]; stable: string[] } {
  const grouped = groupAccuracy(results)
  const entries = Object.entries(grouped)
  if (entries.length === 0) return { difficult: [], stable: [] }

  entries.sort((a, b) => a[1] - b[1])
  const difficult = entries.slice(0, 2).map(([n]) => n)
  const stable = entries
    .slice(-2)
    .reverse()
    .map(([n]) => n)
  return { difficult, stable }
}
