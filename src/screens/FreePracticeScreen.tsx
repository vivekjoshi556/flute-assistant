import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { usePitchDetection } from '../hooks/usePitchDetection'
import { usePitchChart } from '../hooks/usePitchChart'
import { Layout } from '../components/Layout'
import { NoteDisplay, StabilityBar, BreathQualityIndicator } from '../components/TuningDisplay'
import { DetectionPanel } from '../components/DetectionPanel'
import { NoteWheel } from '../components/NoteWheel'
import { PitchTraceChart } from '../components/PitchTraceChart'
import { RegisterIndicator } from '../components/RegisterIndicator'
import { formatCents, formatFrequency } from '../music/notes'
import { getTuningColorClass } from '../components/TuningDisplay'
import type { NoteResult, PracticeSession } from '../types'

export function FreePracticeScreen() {
  const { settings, setActiveSession } = useApp()
  const navigate = useNavigate()
  const [micOn, setMicOn] = useState(true)
  const startTimeRef = useRef(Date.now())
  const noteResultsRef = useRef<NoteResult[]>([])

  const { reading, isListening, error } = usePitchDetection(
    settings.fluteKey,
    micOn,
  )

  const { points: chartPoints } = usePitchChart(
    reading.frequency,
    null,
    micOn,
    reading.note,
    null,
  )

  const trackNote = useCallback(() => {
    if (!reading.isPlaying || !reading.note || reading.confidence < 0.65) return
    const accuracy = Math.max(0, 100 - Math.abs(reading.cents) * 2)
    const existing = noteResultsRef.current.find(
      (r) => r.note === reading.note && r.expectedNote === reading.note,
    )
    if (existing) {
      existing.accuracy = (existing.accuracy + accuracy) / 2
      existing.durationHeld += 0.3
    } else {
      noteResultsRef.current.push({
        note: reading.note,
        expectedNote: reading.note,
        detectedNote: reading.note,
        accuracy,
        durationHeld: 0.3,
      })
    }
  }, [reading])

  useEffect(() => {
    const interval = setInterval(trackNote, 300)
    return () => clearInterval(interval)
  }, [trackNote])

  const endSession = () => {
    const endTime = Date.now()
    const results = noteResultsRef.current
    const accuracies = results.map((r) => r.accuracy)
    const session: PracticeSession = {
      id: crypto.randomUUID(),
      mode: 'free',
      startTime: startTimeRef.current,
      endTime,
      averageAccuracy:
        accuracies.length > 0
          ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length
          : 0,
      bestAccuracy: accuracies.length > 0 ? Math.max(...accuracies) : 0,
      noteResults: results,
    }
    setActiveSession(session)
    setMicOn(false)
    navigate('/session-summary')
  }

  return (
    <Layout title="Free Practice" showMicHint>
      <div className="space-y-4">
        <div className="text-center py-2 min-h-[140px] flex flex-col justify-center">
          <p className="text-sm text-text-muted uppercase tracking-widest">
            {reading.isPlaying ? 'Current Note' : 'Waiting for flute…'}
          </p>
          <NoteDisplay note={reading.note} />
          <div className="flex justify-center gap-8 text-sm mt-3">
            <div>
              <p className="text-text-muted text-xs">Frequency</p>
              <p className="font-mono">{formatFrequency(reading.frequency)}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Pitch Accuracy</p>
              <p className={`font-mono ${getTuningColorClass(reading.cents)}`}>
                {reading.note ? formatCents(reading.cents) : '—'}
              </p>
            </div>
          </div>
        </div>

        <PitchTraceChart
          points={chartPoints}
          liveActual={reading.frequency > 0 ? reading.frequency : null}
          liveActualLabel={reading.note}
        />

        <RegisterIndicator detectedOctave={reading.octave} baseOctave={settings.baseOctave} />

        <div className="text-center space-y-2 min-h-[72px]">
          <p className="text-sm text-text-muted">Pitch Stability</p>
          <p className="text-2xl font-bold text-accent">
            {reading.isPlaying && reading.stability > 0 ? `${reading.stability}%` : '—'}
          </p>
          <StabilityBar stability={reading.isPlaying ? reading.stability : 0} />
        </div>

        <BreathQualityIndicator reading={reading} />
        <NoteWheel detectedNote={reading.note} />
        <DetectionPanel reading={reading} isPlaying={reading.isPlaying} />

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => setMicOn(!micOn)}
            className="px-6 py-3 rounded-full border border-border text-text-muted hover:text-text transition-colors"
          >
            {isListening ? 'Pause Microphone' : 'Resume Microphone'}
          </button>
          <button
            type="button"
            onClick={endSession}
            className="px-6 py-3 rounded-full bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30 transition-colors"
          >
            End Session
          </button>
        </div>

        {error && (
          <p className="text-center text-danger text-sm">{error}</p>
        )}
      </div>
    </Layout>
  )
}
