import { useState } from 'react'
import { useMetronome, BPM_PRESETS } from '../hooks/useMetronome'

export function MetronomeControls() {
  const metronome = useMetronome()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-surface-raised border border-border rounded-xl overflow-hidden">
      {/* Compact toggle bar */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={metronome.toggle}
          className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
            metronome.isRunning
              ? 'border-accent bg-accent/15 text-accent shadow-[0_0_12px_rgba(52,211,153,0.2)]'
              : 'border-border bg-surface-overlay text-text-muted hover:border-accent/50 hover:text-text'
          }`}
          title={metronome.isRunning ? 'Stop metronome' : 'Start metronome'}
        >
          {metronome.isRunning ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="1" y="1" width="4" height="12" rx="1" />
              <rect x="9" y="1" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <polygon points="2,0 14,7 2,14" />
            </svg>
          )}
          {/* Pulse ring when running */}
          {metronome.isRunning && (
            <span className="absolute inset-0 rounded-full border-2 border-accent animate-ping opacity-20" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text">Metronome</span>
            <span className="text-xs text-accent font-mono">{metronome.bpm} BPM</span>
          </div>

          {/* Beat indicators */}
          {metronome.isRunning && (
            <div className="flex gap-1 mt-1.5">
              {Array.from({ length: metronome.beatsPerMeasure }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-100 ${
                    i === metronome.currentBeat
                      ? i === 0
                        ? 'bg-accent w-4 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                        : 'bg-accent/70 w-3'
                      : 'bg-border w-2'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-text-muted hover:text-text text-lg transition-colors px-1"
          title={expanded ? 'Hide settings' : 'Show settings'}
        >
          {expanded ? '−' : '⚙'}
        </button>
      </div>

      {/* Expanded settings */}
      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {/* BPM slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-text-muted uppercase tracking-wider">Tempo</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => metronome.setBpm(metronome.bpm - 5)}
                  className="w-6 h-6 rounded bg-surface-overlay border border-border text-text-muted hover:text-text flex items-center justify-center text-xs"
                >
                  −
                </button>
                <span className="text-sm font-mono text-accent w-12 text-center">
                  {metronome.bpm}
                </span>
                <button
                  type="button"
                  onClick={() => metronome.setBpm(metronome.bpm + 5)}
                  className="w-6 h-6 rounded bg-surface-overlay border border-border text-text-muted hover:text-text flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min={30}
              max={240}
              step={1}
              value={metronome.bpm}
              onChange={(e) => metronome.setBpm(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-border cursor-pointer accent-accent"
              style={{
                background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${
                  ((metronome.bpm - 30) / 210) * 100
                }%, var(--color-border) ${((metronome.bpm - 30) / 210) * 100}%, var(--color-border) 100%)`,
              }}
            />
          </div>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-1.5">
            {BPM_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => metronome.setBpm(preset.bpm)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  metronome.bpm === preset.bpm
                    ? 'bg-accent/20 text-accent border border-accent/40'
                    : 'bg-surface-overlay border border-border text-text-muted hover:text-text hover:border-accent/30'
                }`}
                title={preset.description}
              >
                {preset.label} ({preset.bpm})
              </button>
            ))}
          </div>

          {/* Beats per measure */}
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
              Beats per measure
            </label>
            <div className="flex gap-1.5">
              {[3, 4, 6, 7, 8].map((beats) => (
                <button
                  key={beats}
                  type="button"
                  onClick={() => metronome.setBeatsPerMeasure(beats)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    metronome.beatsPerMeasure === beats
                      ? 'bg-accent/20 text-accent border border-accent/40'
                      : 'bg-surface-overlay border border-border text-text-muted hover:text-text'
                  }`}
                >
                  {beats}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
