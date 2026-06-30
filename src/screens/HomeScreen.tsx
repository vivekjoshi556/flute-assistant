import { Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Card, StatCard } from '../components/Layout'
import { formatDuration } from '../hooks/useLocalStorage'
import { EducationalPanel } from '../components/EducationalPanel'
import { BANSURI_TYPES } from '../types'
import { useVoiceNavigation } from '../hooks/useVoiceNavigation'

export function HomeScreen() {
  const { settings, stats } = useApp()
  const bansuriLabel = BANSURI_TYPES.find((b) => b.type === settings.bansuriType)?.label ?? 'Middle Octave'
  const navigate = useNavigate()

  const mappings = useMemo(() => ({
    SA: { label: 'Free Practice', action: () => navigate('/practice/free') },
    RE: { label: 'Guided Practice', action: () => navigate('/practice/guided') },
    GA: { label: 'Scale Trainer', action: () => navigate('/scale-trainer') },
    MA: { label: 'Sargam Practice', action: () => navigate('/practice/sargam') },
    PA: { label: 'Difficult Notes', action: () => navigate('/practice/difficult-notes') },
    DHA: { label: 'Note Reference', action: () => navigate('/reference') },
    NI: { label: 'Progress', action: () => navigate('/progress') },
  }), [navigate])

  const actionMappings = useMemo(() => {
    const res: any = {}
    for (const [k, v] of Object.entries(mappings)) {
      res[k] = v.action
    }
    return res
  }, [mappings])

  const voiceNav = useVoiceNavigation({
    mappings: actionMappings,
    enabled: settings.voiceNavigationEnabled ?? false,
  })

  return (
    <div className="min-h-dvh max-w-3xl mx-auto px-4 py-8 pb-16">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text">Bansuri Practice</h1>
        <p className="text-text-muted text-sm mt-1">
          Flute: <span className="text-accent">{settings.fluteKey} · {bansuriLabel}</span>
          {' · '}
          <Link to="/onboarding" className="underline hover:text-text">
            Change
          </Link>
        </p>
      </header>

      {voiceNav.error && settings.voiceNavigationEnabled && (
        <p className="text-center text-danger text-xs mb-4">
          🎙️ Navigation mic error: {voiceNav.error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard label="Streak" value={`${stats.practiceStreak} days`} />
        <StatCard
          label="Total Practice"
          value={formatDuration(stats.totalPracticeTime)}
        />
        <StatCard
          label="Last Session"
          value={
            stats.lastSessionDuration > 0
              ? formatDuration(stats.lastSessionDuration)
              : '—'
          }
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Card
          to="/learn"
          title="Learn"
          description="Structured lessons on swar, saptak, raag & more"
          icon="📚"
        />
        <Card
          to="/practice/free"
          title="Free Practice"
          description="Play freely with real-time tuner feedback"
          icon="🎵"
          noteHint="SA"
          isActive={voiceNav.activeKey === 'SA'}
          progress={voiceNav.holdProgress}
        />
        <Card
          to="/practice/guided"
          title="Guided Practice"
          description="Follow along note by note with feedback"
          icon="📖"
          noteHint="RE"
          isActive={voiceNav.activeKey === 'RE'}
          progress={voiceNav.holdProgress}
        />
        <Card
          to="/scale-trainer"
          title="Scale Trainer"
          description="Practice ascending and descending scales"
          icon="🎼"
          noteHint="GA"
          isActive={voiceNav.activeKey === 'GA'}
          progress={voiceNav.holdProgress}
        />
        <Card
          to="/practice/sargam"
          title="Sargam Practice"
          description="Named note sequences — build memory in different orders"
          icon="🪈"
          noteHint="MA"
          isActive={voiceNav.activeKey === 'MA'}
          progress={voiceNav.holdProgress}
        />
        <Card
          to="/practice/alankar"
          title="Alankar Practice"
          description="30+ patterns — permutations, sliding windows & classics"
          icon="🎶"
        />
        <Card
          to="/practice/difficult-notes"
          title="Difficult Notes"
          description="Focused practice on your 3 weakest notes"
          icon="🎯"
          noteHint="PA"
          isActive={voiceNav.activeKey === 'PA'}
          progress={voiceNav.holdProgress}
        />
        <Card
          to="/reference"
          title="Note Reference"
          description="Hear and compare each note"
          icon="🔊"
          noteHint="DHA"
          isActive={voiceNav.activeKey === 'DHA'}
          progress={voiceNav.holdProgress}
        />
        <Card
          to="/progress"
          title="Progress"
          description="Review your practice history"
          icon="📊"
          noteHint="NI"
          isActive={voiceNav.activeKey === 'NI'}
          progress={voiceNav.holdProgress}
        />
      </div>

      <EducationalPanel />
    </div>
  )
}
