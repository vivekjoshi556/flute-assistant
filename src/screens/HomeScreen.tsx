import { Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { formatDuration } from '../hooks/useLocalStorage'
import { BANSURI_TYPES } from '../types'
import { useVoiceNavigation } from '../hooks/useVoiceNavigation'
import { LESSON_EXERCISES } from '../music/lessonExercises'

interface NavItem {
  to: string
  title: string
  icon: string
  desc: string
  noteHint?: string
}

const PRACTICE_ITEMS: NavItem[] = [
  { to: '/practice/free', title: 'Free Practice', icon: '🎵', desc: 'Play freely, see your pitch live', noteHint: 'SA' },
  { to: '/practice/guided', title: 'Guided Practice', icon: '📖', desc: 'One note at a time with feedback', noteHint: 'RE' },
  { to: '/scale-trainer', title: 'Scale Trainer', icon: '🎼', desc: 'Shuddha scale ascending & descending', noteHint: 'GA' },
  { to: '/practice/sargam', title: 'Sargam Practice', icon: '🪈', desc: 'Named note sequences and patterns', noteHint: 'MA' },
  { to: '/practice/alankar', title: 'Alankar Practice', icon: '🎶', desc: 'Classical ornament exercises' },
  { to: '/practice/difficult-notes', title: 'Difficult Notes', icon: '🎯', desc: 'Target the notes you struggle with', noteHint: 'PA' },
]

const TOOL_ITEMS: NavItem[] = [
  { to: '/reference', title: 'Note Reference', icon: '🔊', desc: 'Listen to any swar', noteHint: 'DHA' },
  { to: '/progress', title: 'Progress', icon: '📊', desc: 'Sessions and accuracy over time', noteHint: 'NI' },
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'Late night riyaz'
  if (hour < 12) return 'Suprabhat 🙏'
  if (hour < 17) return 'Afternoon practice'
  if (hour < 21) return 'Evening riyaz'
  return 'Night practice'
}

export function HomeScreen() {
  const { settings, stats } = useApp()
  const bansuriLabel = BANSURI_TYPES.find((b) => b.type === settings.bansuriType)?.label ?? 'Middle Octave'
  const navigate = useNavigate()
  const greeting = useMemo(() => getGreeting(), [])

  const actionMappings = useMemo(() => ({
    SA: () => navigate('/practice/free'),
    RE: () => navigate('/practice/guided'),
    GA: () => navigate('/scale-trainer'),
    MA: () => navigate('/practice/sargam'),
    PA: () => navigate('/practice/difficult-notes'),
    DHA: () => navigate('/reference'),
    NI: () => navigate('/progress'),
  }), [navigate])

  const voiceNav = useVoiceNavigation({
    mappings: actionMappings,
    enabled: settings.voiceNavigationEnabled ?? false,
  })

  const isActive = (hint?: string) => hint && voiceNav.activeKey === hint

  return (
    <div className="min-h-dvh bg-surface">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-6 py-8">

        {/* Hero Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-text-muted mb-1">{greeting}</p>
              <h1 className="text-3xl font-bold tracking-tight text-text">
                Bansuri Practice
              </h1>
              <p className="mt-1.5 text-sm text-text-muted">
                {settings.fluteKey} · {bansuriLabel}
                {' · '}
                <Link to="/onboarding" className="text-accent hover:underline">Change flute</Link>
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-5">
              <StatBlock label="Streak" value={`${stats.practiceStreak}d`} />
              <StatBlock label="Total" value={formatDuration(stats.totalPracticeTime)} />
              {stats.lastSessionDuration > 0 && (
                <StatBlock label="Last" value={formatDuration(stats.lastSessionDuration)} />
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
        </header>

        {voiceNav.error && settings.voiceNavigationEnabled && (
          <p className="mb-4 text-xs text-danger">🎙️ {voiceNav.error}</p>
        )}

        {/* Main Content */}
        <div className="flex-1 space-y-8">

          {/* Learn — full width, two cards side by side */}
          <section>
            <SectionLabel>Learn</SectionLabel>
            <div className="grid sm:grid-cols-2 gap-3">
              <HubCard
                to="/learn"
                title="Theory Lessons"
                subtitle="Swar, thaats, raag & more"
                icon="📚"
              />
              <HubCard
                to="/learn/exercises"
                title="Lesson Exercises"
                subtitle={`${LESSON_EXERCISES.length} playable exercises`}
                icon="🪈"
                highlight
              />
            </div>
          </section>

          {/* Practice */}
          <section>
            <SectionLabel>Practice</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRACTICE_ITEMS.map((item) => (
                <PracticeCard
                  key={item.to}
                  item={item}
                  isActive={!!isActive(item.noteHint)}
                  progress={voiceNav.holdProgress}
                />
              ))}
            </div>
          </section>

          {/* Tools + Voice Nav hint */}
          <section>
            <SectionLabel>Tools</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {TOOL_ITEMS.map((item) => (
                <PracticeCard
                  key={item.to}
                  item={item}
                  isActive={!!isActive(item.noteHint)}
                  progress={voiceNav.holdProgress}
                />
              ))}
            </div>
            <p className="text-xs leading-relaxed text-text-muted">
              🎙️ Enable Bansuri Navigation (top-right mic button) to jump to any section hands-free while playing.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-text-muted">
      {children}
    </h2>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-lg font-bold text-accent leading-none">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-text-muted mt-0.5">{label}</p>
    </div>
  )
}

function HubCard({
  to,
  title,
  subtitle,
  icon,
  highlight,
}: {
  to: string
  title: string
  subtitle: string
  icon: string
  highlight?: boolean
}) {
  return (
    <Link
      to={to}
      className={`group flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-accent/50 hover:bg-surface-raised ${
        highlight
          ? 'border-accent/25 bg-accent/5'
          : 'border-border bg-surface-raised/70'
      }`}
    >
      <span className="text-3xl shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="font-semibold text-text group-hover:text-accent transition-colors">{title}</p>
        <p className="truncate text-xs text-text-muted mt-0.5">{subtitle}</p>
      </div>
    </Link>
  )
}

function PracticeCard({
  item,
  isActive,
  progress,
}: {
  item: NavItem
  isActive: boolean
  progress: number
}) {
  return (
    <Link
      to={item.to}
      className={`relative flex flex-col rounded-xl border p-4 transition-all overflow-hidden ${
        isActive
          ? 'border-accent/60 bg-accent/8 shadow-[0_0_16px_rgba(196,160,56,0.12)]'
          : 'border-border/70 bg-surface-raised/60 hover:border-accent/40 hover:bg-surface-overlay'
      }`}
    >
      <span className="text-2xl mb-2">{item.icon}</span>
      <p className="text-sm font-semibold leading-snug text-text">{item.title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-text-muted line-clamp-2">{item.desc}</p>
      {item.noteHint && (
        <span className="mt-2 font-mono text-[9px] font-bold uppercase tracking-wider text-accent/70">
          {item.noteHint}
        </span>
      )}
      {isActive && progress > 0 && (
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-accent transition-all"
          style={{ width: `${progress}%` }}
        />
      )}
    </Link>
  )
}
