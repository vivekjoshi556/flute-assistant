import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useApp } from '../context/AppContext'

export function Layout({
  children,
  title,
  backTo = '/',
  onBack,
  showMicHint = false,
}: {
  children: ReactNode
  title?: string
  backTo?: string
  onBack?: () => void
  showMicHint?: boolean
}) {
  const { settings, updateSettings } = useApp()
  const isVoiceNavEnabled = settings.voiceNavigationEnabled ?? false

  const toggleVoiceNav = () => {
    updateSettings({ voiceNavigationEnabled: !isVoiceNavEnabled })
  }

  return (
    <div className="min-h-dvh flex flex-col max-w-3xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-text-muted hover:text-text text-sm transition-colors w-16 text-left"
          >
            ← Back
          </button>
        ) : (
          <Link
            to={backTo}
            className="text-text-muted hover:text-text text-sm transition-colors w-16 text-left"
          >
            ← Back
          </Link>
        )}
        
        {title && (
          <h1 className="text-lg font-medium text-text text-center flex-1">{title}</h1>
        )}

        <div className="w-16 flex justify-end">
          <button
            type="button"
            onClick={toggleVoiceNav}
            title={isVoiceNavEnabled ? "Disable Bansuri Navigation" : "Enable Bansuri Navigation"}
            className={`p-2 rounded-full border transition-all flex items-center justify-center relative group ${
              isVoiceNavEnabled
                ? 'bg-accent/15 border-accent/40 text-accent hover:bg-accent/25'
                : 'bg-surface-raised border-border text-text-muted hover:text-text'
            }`}
          >
            <span className="text-sm">🎙️</span>
            {isVoiceNavEnabled && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full border border-surface shadow-[0_0_4px_var(--color-accent)] animate-pulse" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {showMicHint && (
        <footer className="mt-6 text-center text-xs text-text-muted">
          Allow microphone access for real-time pitch detection
        </footer>
      )}
    </div>
  )
}

export function Card({
  to,
  title,
  description,
  icon,
  noteHint,
  isActive = false,
  progress = 0,
}: {
  to: string
  title: string
  description: string
  icon: string
  noteHint?: string
  isActive?: boolean
  progress?: number
}) {
  return (
    <Link
      to={to}
      className={`relative block bg-surface-raised border rounded-2xl p-6 hover:bg-surface-overlay transition-all group overflow-hidden ${
        isActive
          ? 'border-accent shadow-[0_0_12px_rgba(52,211,153,0.15)] scale-[1.01]'
          : 'border-border hover:border-accent/40'
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
      <span className="text-3xl mb-3 block">{icon}</span>
      <h2 className="text-xl font-semibold text-text group-hover:text-accent transition-colors">
        {title}
      </h2>
      <p className="text-sm text-text-muted mt-1">{description}</p>
      {isActive && progress > 0 && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-75 ease-out shadow-[0_0_8px_var(--color-accent)]"
          style={{ width: `${progress}%` }}
        />
      )}
    </Link>
  )
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-raised border border-border rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-accent">{value}</p>
      <p className="text-xs text-text-muted mt-1">{label}</p>
    </div>
  )
}

export function MicButton({
  isListening,
  onClick,
  error,
}: {
  isListening: boolean
  onClick: () => void
  error: string | null
}) {
  return (
    <div className="text-center">
      <button
        type="button"
        onClick={onClick}
        className={`px-6 py-3 rounded-full font-medium transition-all ${
          isListening
            ? 'bg-danger/20 text-danger border border-danger/40'
            : 'bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30'
        }`}
      >
        {isListening ? 'Stop Microphone' : 'Start Microphone'}
      </button>
      {error && <p className="text-danger text-sm mt-2">{error}</p>}
    </div>
  )
}
