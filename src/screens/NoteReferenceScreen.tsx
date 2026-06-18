import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { useTonePlayer } from '../hooks/useTonePlayer'
import { getNoteFrequency, formatFrequency } from '../music/notes'
import { INDIAN_NOTES, type IndianNote } from '../types'
import type { Register } from '../music/register'

const REGISTER_OPTIONS: { value: Register; label: string; octave: number }[] = [
  { value: 'lower', label: 'Lower', octave: 3 },
  { value: 'middle', label: 'Middle', octave: 4 },
  { value: 'higher', label: 'Higher', octave: 5 },
]

export function NoteReferenceScreen() {
  const { settings } = useApp()
  const [selected, setSelected] = useState<IndianNote>('SA')
  const [baseOctave, setBaseOctave] = useState(4)
  const [selectedOctave, setSelectedOctave] = useState(4)
  const { play } = useTonePlayer(settings.fluteKey)

  const frequency = getNoteFrequency(selected, settings.fluteKey, selectedOctave)

  const selectRegister = (octave: number) => {
    setBaseOctave(octave)
    setSelectedOctave(octave)
  }

  return (
    <Layout title="Note Reference" backTo="/">
      <p className="text-text-muted text-center mb-6">
        Select a note and play the reference tone to compare your sound.
      </p>

      <div className="flex justify-center gap-2 mb-6">
        {REGISTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => selectRegister(opt.octave)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              baseOctave === opt.octave
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'bg-surface-raised border border-border text-text-muted hover:text-text'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-8 max-w-sm mx-auto">
        {INDIAN_NOTES.map((note) => (
          <button
            key={note}
            type="button"
            onClick={() => {
              setSelected(note)
              setSelectedOctave(baseOctave)
            }}
            className={`py-3 rounded-xl font-bold transition-all ${
              selected === note && selectedOctave === baseOctave
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'bg-surface-raised border border-border text-text-muted hover:text-text'
            }`}
          >
            {note}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setSelected('SA')
            setSelectedOctave(baseOctave + 1)
          }}
          className={`py-3 rounded-xl font-bold transition-all ${
            selected === 'SA' && selectedOctave === baseOctave + 1
              ? 'bg-accent/20 text-accent border border-accent/40'
              : 'bg-surface-raised border border-border text-text-muted hover:text-text'
          }`}
        >
          SA↑
        </button>
      </div>

      <div className="text-center space-y-6 bg-surface-raised border border-border rounded-2xl p-8">
        <div>
          <p className="text-sm text-text-muted">Note</p>
          <p className="text-6xl font-bold mt-1">
            {selected}
            {selectedOctave === baseOctave + 1 && selected === 'SA' ? '↑' : ''}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {REGISTER_OPTIONS.find((r) => r.octave === (selectedOctave === baseOctave + 1 ? baseOctave : selectedOctave))?.label ?? 'Middle'} register
            {selectedOctave === baseOctave + 1 ? ' (upper)' : ''}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-muted">Frequency</p>
          <p className="text-xl font-mono mt-1">{formatFrequency(frequency)}</p>
        </div>
        <button
          type="button"
          onClick={() => play(selected, 2, selectedOctave)}
          className="px-8 py-4 rounded-full bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30 text-lg font-medium transition-all"
        >
          ▶ Play Reference
        </button>
      </div>

      <p className="text-xs text-text-muted text-center mt-6">
        Upper SA (SA↑) plays one octave higher — the same note at the top of the scale.
      </p>
    </Layout>
  )
}
