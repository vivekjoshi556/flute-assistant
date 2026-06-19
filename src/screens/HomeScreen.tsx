import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Card, StatCard } from '../components/Layout'
import { formatDuration } from '../hooks/useLocalStorage'
import { EducationalPanel } from '../components/EducationalPanel'
import { BANSURI_TYPES } from '../types'

export function HomeScreen() {
  const { settings, stats } = useApp()
  const bansuriLabel = BANSURI_TYPES.find((b) => b.type === settings.bansuriType)?.label ?? 'Middle Octave'

  return (
    <div className="min-h-dvh max-w-3xl mx-auto px-4 py-8">
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
          to="/practice/free"
          title="Free Practice"
          description="Play freely with real-time tuner feedback"
          icon="🎵"
        />
        <Card
          to="/practice/guided"
          title="Guided Practice"
          description="Follow along note by note with feedback"
          icon="📖"
        />
        <Card
          to="/scale-trainer"
          title="Scale Trainer"
          description="Practice ascending and descending scales"
          icon="🎼"
        />
        <Card
          to="/practice/sargam"
          title="Sargam Practice"
          description="Named note sequences — build memory in different orders"
          icon="🪈"
        />
        <Card
          to="/reference"
          title="Note Reference"
          description="Hear and compare each note"
          icon="🔊"
        />
        <Card
          to="/progress"
          title="Progress"
          description="Review your practice history"
          icon="📊"
        />
      </div>

      <EducationalPanel />
    </div>
  )
}
