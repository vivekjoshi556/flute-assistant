import type { PitchReading } from '../types'
import type { IndianNote } from '../types'
import { formatCents, formatFrequency } from '../music/notes'
import { registerShortLabel, octaveToRegister } from '../music/register'

interface DetectionPanelProps {
  reading: PitchReading
  expectedFrequency?: number | null
  targetNote?: IndianNote | null
  targetOctave?: number
  isPlaying?: boolean
}

export function DetectionPanel({
  reading,
  expectedFrequency = null,
  targetNote = null,
  targetOctave,
  isPlaying = false,
}: DetectionPanelProps) {
  const rows = [
    {
      label: 'Status',
      value: isPlaying ? 'Playing' : 'Listening',
      highlight: isPlaying ? 'text-accent' : 'text-text-muted',
    },
    { label: 'Target Note', value: targetNote ?? '—' },
    {
      label: 'Expected Freq',
      value: expectedFrequency ? formatFrequency(expectedFrequency) : '—',
    },
    { label: 'Detected Note', value: reading.note ?? '—' },
    { label: 'Your Frequency', value: formatFrequency(reading.frequency) },
    {
      label: 'Target Register',
      value:
        targetOctave && targetOctave > 0
          ? registerShortLabel(octaveToRegister(targetOctave))
          : '—',
    },
    {
      label: 'Your Register',
      value:
        reading.octave > 0
          ? registerShortLabel(octaveToRegister(reading.octave))
          : '—',
    },
    { label: 'Cents Offset', value: reading.note ? formatCents(reading.cents) : '—' },
    {
      label: 'Confidence',
      value: reading.confidence > 0 ? `${Math.round(reading.confidence * 100)}%` : '—',
    },
    {
      label: 'Stability',
      value: reading.stability > 0 ? `${reading.stability}%` : '—',
    },
    {
      label: 'Volume',
      value: reading.volume > 0 ? `${Math.round(reading.volume * 100)}%` : '—',
    },
  ]

  return (
    <div className="bg-surface-raised border border-border rounded-xl p-4">
      <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">
        Detection Panel
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-xs text-text-muted">{row.label}</p>
            <p
              className={`text-sm font-medium ${
                'highlight' in row && row.highlight
                  ? row.highlight
                  : row.label === 'Expected Freq' && expectedFrequency
                    ? 'text-slate-400'
                    : row.label === 'Your Frequency' && reading.frequency > 0
                      ? 'text-accent'
                      : 'text-text'
              }`}
            >
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
