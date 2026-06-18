import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

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
  return (
    <div className="min-h-dvh flex flex-col max-w-3xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-text-muted hover:text-text text-sm transition-colors"
          >
            ← Back
          </button>
        ) : (
          <Link
            to={backTo}
            className="text-text-muted hover:text-text text-sm transition-colors"
          >
            ← Back
          </Link>
        )}
        {title && (
          <h1 className="text-lg font-medium text-text">{title}</h1>
        )}
        <div className="w-12" />
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
}: {
  to: string
  title: string
  description: string
  icon: string
}) {
  return (
    <Link
      to={to}
      className="block bg-surface-raised border border-border rounded-2xl p-6 hover:border-accent/40 hover:bg-surface-overlay transition-all group"
    >
      <span className="text-3xl mb-3 block">{icon}</span>
      <h2 className="text-xl font-semibold text-text group-hover:text-accent transition-colors">
        {title}
      </h2>
      <p className="text-sm text-text-muted mt-1">{description}</p>
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
