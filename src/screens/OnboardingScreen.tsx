import { useNavigate } from 'react-router-dom'
import { FLUTE_KEYS, type FluteKey } from '../types'
import { useApp } from '../context/AppContext'

export function OnboardingScreen() {
  const { updateSettings } = useApp()
  const navigate = useNavigate()

  const selectKey = (key: FluteKey) => {
    updateSettings({ fluteKey: key, onboardingComplete: true })
    navigate('/')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 max-w-lg mx-auto">
      <div className="text-center mb-10">
        <span className="text-5xl mb-4 block">🪈</span>
        <h1 className="text-3xl font-bold text-text mb-2">
          Bansuri Practice Assistant
        </h1>
        <p className="text-text-muted">
          Real-time feedback to help you learn bansuri on your own.
        </p>
      </div>

      <div className="w-full">
        <h2 className="text-lg font-medium text-center mb-4">
          Which Bansuri do you own?
        </h2>
        <p className="text-sm text-text-muted text-center mb-6">
          All note mappings will adapt to your flute&apos;s key.
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {FLUTE_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => selectKey(key)}
              className="py-3 rounded-xl bg-surface-raised border border-border hover:border-accent hover:bg-surface-overlay text-text font-medium transition-all"
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
