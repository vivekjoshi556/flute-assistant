import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FLUTE_KEYS, BANSURI_TYPES, type FluteKey, type BansuriType } from '../types'
import { useApp } from '../context/AppContext'

export function OnboardingScreen() {
  const { updateSettings } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState<'key' | 'type'>('key')
  const [selectedKey, setSelectedKey] = useState<FluteKey | null>(null)

  const selectKey = (key: FluteKey) => {
    setSelectedKey(key)
    setStep('type')
  }

  const selectType = (bansuriType: BansuriType) => {
    if (!selectedKey) return
    const info = BANSURI_TYPES.find((b) => b.type === bansuriType)
    updateSettings({
      fluteKey: selectedKey,
      bansuriType,
      baseOctave: info?.baseOctave ?? 5,
      onboardingComplete: true,
    })
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

      {step === 'key' && (
        <div className="w-full">
          <h2 className="text-lg font-medium text-center mb-4">
            What key is your Bansuri?
          </h2>
          <p className="text-sm text-text-muted text-center mb-6">
            Check the label on your flute — most beginners start with C Natural.
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
      )}

      {step === 'type' && (
        <div className="w-full">
          <h2 className="text-lg font-medium text-center mb-2">
            What size is your Bansuri?
          </h2>
          <p className="text-sm text-text-muted text-center mb-6">
            This sets the correct octave so the app matches your flute&apos;s actual pitch.
          </p>
          <div className="grid gap-3 max-w-sm mx-auto">
            {BANSURI_TYPES.map((b) => (
              <button
                key={b.type}
                type="button"
                onClick={() => selectType(b.type)}
                className={`py-4 px-5 rounded-xl border text-left transition-all ${
                  b.type === 'middle'
                    ? 'bg-accent/10 border-accent/40 hover:bg-accent/20'
                    : 'bg-surface-raised border-border hover:border-accent hover:bg-surface-overlay'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text">{b.label}</span>
                  {b.type === 'middle' && (
                    <span className="text-xs text-accent bg-accent/15 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-muted mt-1">{b.description}</p>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep('key')}
            className="block mx-auto mt-6 text-sm text-text-muted hover:text-text underline"
          >
            ← Back to key selection
          </button>
        </div>
      )}
    </div>
  )
}
