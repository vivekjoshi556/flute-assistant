import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { PracticeLayout } from '../components/PracticeLayout'
import { useTargetPractice } from '../hooks/useTargetPractice'
import type { IndianNote, PracticeSession } from '../types'
import type { NoteTarget } from '../music/register'
import { useVoiceNavigation } from '../hooks/useVoiceNavigation'

function getDifficultNotes(sessions: PracticeSession[]): { note: IndianNote; accuracy: number; isDefault: boolean }[] {
  // Filter for sessions that have note results
  const validSessions = sessions
    .filter((s) => s.noteResults && s.noteResults.length > 0)
    .slice(0, 10)

  if (validSessions.length === 0) {
    return [
      { note: 'SA', accuracy: 0, isDefault: true },
      { note: 'RE', accuracy: 0, isDefault: true },
      { note: 'GA', accuracy: 0, isDefault: true },
    ]
  }

  const noteStats = {} as Partial<Record<IndianNote, { totalAcc: number; count: number }>>

  for (const session of validSessions) {
    for (const res of session.noteResults) {
      const note = res.note
      if (!note) continue
      let stat = noteStats[note]
      if (!stat) {
        stat = { totalAcc: 0, count: 0 }
        noteStats[note] = stat
      }
      stat.totalAcc += res.accuracy
      stat.count += 1
    }
  }

  const entries = Object.keys(noteStats) as IndianNote[]
  const resultList = entries.map((note) => {
    const stat = noteStats[note]!
    return {
      note,
      accuracy: stat.totalAcc / stat.count,
      isDefault: false,
    }
  })

  // Sort lowest accuracy first
  resultList.sort((a, b) => a.accuracy - b.accuracy)

  const difficult = resultList.slice(0, 3)

  if (difficult.length < 3) {
    const defaultPool: IndianNote[] = ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI']
    for (const note of defaultPool) {
      if (difficult.length >= 3) break
      if (!difficult.some((d) => d.note === note)) {
        difficult.push({ note, accuracy: 0, isDefault: true })
      }
    }
  }

  return difficult
}

function getScalePosition(note: IndianNote, octave: number, baseOctave: number): number {
  const notesOrder: IndianNote[] = ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI']
  const index = notesOrder.indexOf(note)
  if (index === -1) return 0
  const octaveDiff = octave - baseOctave
  return index + octaveDiff * 7
}

function posToNoteTarget(pos: number, baseOctave: number): NoteTarget {
  const notesOrder: IndianNote[] = ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI']
  let octaveOffset = Math.floor(pos / 7)
  let noteIndex = pos % 7
  if (noteIndex < 0) {
    noteIndex += 7
  }
  return {
    note: notesOrder[noteIndex],
    octave: baseOctave + octaveOffset,
  }
}

function generateSequence(difficultNotes: IndianNote[], baseOctave: number): NoteTarget[] {
  const notes = difficultNotes.slice(0, 3)
  while (notes.length < 3) {
    notes.push('SA')
  }

  // A pattern of 18 notes that tests all transitions and has no consecutive duplicates
  const pattern = [0, 1, 2, 0, 2, 1, 0, 1, 2, 1, 2, 0, 1, 0, 2, 0, 1, 2]
  const rawNotes = pattern.map((idx) => notes[idx])

  // Convert rawNotes to NoteTargets with appropriate octaves
  let saCount = 0
  const targets: NoteTarget[] = rawNotes.map((note) => {
    let octave = baseOctave
    if (note === 'SA') {
      if (saCount % 2 === 1) {
        octave = baseOctave + 1
      }
      saCount++
    }
    return { note, octave }
  })

  // Smooth the sequence by inserting bridge notes where leaps are > 2
  const smoothed: NoteTarget[] = []

  for (let i = 0; i < targets.length; i++) {
    const current = targets[i]
    if (smoothed.length === 0) {
      smoothed.push(current)
      continue
    }

    const prev = smoothed[smoothed.length - 1]
    const prevPos = getScalePosition(prev.note, prev.octave, baseOctave)
    const currPos = getScalePosition(current.note, current.octave, baseOctave)

    const diff = currPos - prevPos
    const absDiff = Math.abs(diff)

    if (absDiff > 2) {
      let tempPos = prevPos
      while (Math.abs(currPos - tempPos) > 2) {
        tempPos += currPos > tempPos ? 2 : -2
        smoothed.push(posToNoteTarget(tempPos, baseOctave))
      }
    }

    smoothed.push(current)
  }

  return smoothed
}

export function DifficultNotesPracticeScreen() {
  const { settings, stats, setActiveSession } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const [started, setStarted] = useState(false)
  const pendingStart = useRef(false)

  // Voice Navigation for landing screen
  const diffMappings = useMemo(() => ({
    SA: { label: 'Start Practice', action: () => handleStart() },
  }), [])

  const diffActionMappings = useMemo(() => {
    const res: any = {}
    for (const [k, v] of Object.entries(diffMappings)) {
      res[k] = v.action
    }
    return res
  }, [diffMappings])

  const voiceNav = useVoiceNavigation({
    mappings: diffActionMappings,
    enabled: !started && (settings.voiceNavigationEnabled ?? false),
  })

  // 1. Analyze stats for weak spots
  const difficultList = useMemo(() => getDifficultNotes(stats.sessions), [stats.sessions])

  // 2. Generate target sequence
  const targets = useMemo(() => {
    const noteNames = difficultList.map((d) => d.note)
    return generateSequence(noteNames, settings.baseOctave)
  }, [difficultList, settings.baseOctave])

  // 3. Setup practice hook
  const practice = useTargetPractice({
    fluteKey: settings.fluteKey,
    targets,
    enabled: started && targets.length > 0,
  })

  // 4. Auto-start and Start effects
  useEffect(() => {
    if (pendingStart.current && targets.length > 0) {
      practice.start()
      pendingStart.current = false
    }
  }, [targets, practice])

  useEffect(() => {
    if (location.state?.autoStart) {
      const timer = setTimeout(() => {
        setStarted(true)
        pendingStart.current = true
      }, 0)
      navigate(location.pathname, { replace: true, state: {} })
      return () => clearTimeout(timer)
    }
  }, [location.state, navigate, location.pathname])

  const handleStart = () => {
    setStarted(true)
    pendingStart.current = true
  }

  const goBackToList = () => {
    practice.finishEarly()
    setStarted(false)
  }

  const finishSession = () => {
    practice.finishEarly()
    const session = practice.buildSession('difficult-notes', {
      baseOctave: settings.baseOctave,
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
    const hasDefaults = difficultList.some((d) => d.isDefault)
    const isActive = voiceNav.activeKey === 'SA'

    return (
      <Layout title="Difficult Notes" backTo="/">
        <div className="max-w-lg mx-auto space-y-6 pb-16">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-text">Weak Spots Training</h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Improve your stability and transitions on the notes you struggle with most. We've analyzed your last 10 practice sessions to curate a custom 2-3 minute training sequence.
            </p>
          </div>

          {voiceNav.error && settings.voiceNavigationEnabled && (
            <p className="text-center text-danger text-xs mb-4">
              🎙️ Navigation mic error: {voiceNav.error}
            </p>
          )}

          <div className="bg-surface-overlay/30 border border-border/40 rounded-2xl p-6">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider text-center mb-4">
              Your 3 Target Notes
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {difficultList.map(({ note, accuracy, isDefault }) => (
                <div
                  key={note}
                  className="bg-surface-raised border border-border rounded-xl p-4 text-center flex flex-col items-center justify-between shadow-sm group hover:border-accent/40 transition-all"
                >
                  <div className="text-2xl font-bold text-accent w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 mb-2">
                    {note}
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider">Avg Accuracy</p>
                    <p className="text-base font-bold mt-0.5">
                      {isDefault ? '—' : `${Math.round(accuracy)}%`}
                    </p>
                  </div>
                  {isDefault ? (
                    <span className="text-[9px] px-2 py-0.5 bg-surface-overlay text-text-muted rounded-full mt-3 border border-border/50 font-medium">
                      Default
                    </span>
                  ) : (
                    <span className="text-[9px] px-2 py-0.5 bg-danger/10 text-danger rounded-full mt-3 border border-danger/20 font-semibold uppercase tracking-wider">
                      Weak Spot
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {hasDefaults && (
            <div className="bg-surface-raised/50 border border-border/40 rounded-xl p-4 text-center text-xs text-text-muted leading-relaxed">
              ℹ️ Not enough history data yet. We padded the missing spots with standard beginner notes (SA, RE, GA). Complete guided, scale, or sargam exercises to unlock personalized analytics!
            </div>
          )}

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={handleStart}
              className={`relative w-full max-w-xs py-4 px-6 rounded-full font-semibold transition-all text-center shadow-lg cursor-pointer text-base hover:scale-[1.02] active:scale-[0.98] overflow-hidden ${
                isActive
                  ? 'bg-accent/90 text-surface border-2 border-accent shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                  : 'bg-accent text-surface hover:bg-accent/90 hover:shadow-accent/20'
              }`}
            >
              Start Practice (30 Notes)
              <span className={`absolute top-1/2 -translate-y-1/2 right-4 text-[10px] font-extrabold tracking-wider border px-2 py-0.5 rounded-md font-mono uppercase shadow-sm transition-colors ${
                isActive
                  ? 'bg-surface text-accent border-surface'
                  : 'bg-surface/20 text-surface border-surface/30'
              }`}>
                SA
              </span>
              {isActive && voiceNav.holdProgress > 0 && (
                <div
                  className="absolute bottom-0 left-0 h-1 bg-surface transition-all duration-75 ease-out shadow-[0_0_8px_white]"
                  style={{ width: `${voiceNav.holdProgress}%` }}
                />
              )}
            </button>
          </div>
        </div>
      </Layout>
    )
  }



  return (
    <Layout title="Difficult Notes Practice" onBack={goBackToList}>
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
        statusLabel="Weak Spots Practice"
        footer={
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={finishSession}
              className="px-6 py-3 rounded-full border border-border text-text-muted hover:text-text hover:bg-surface-overlay transition-colors"
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
