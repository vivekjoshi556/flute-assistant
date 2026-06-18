import { getNoteHint, FINGERING_LEGEND } from '../music/noteHints'
import type { IndianNote } from '../types'

export function NoteHintsPanel({ note }: { note: IndianNote }) {
  const hint = getNoteHint(note)

  return (
    <aside className="bg-surface-raised border border-border rounded-xl p-4 h-full">
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
        How to play {note}
      </h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-accent text-xs font-medium mb-1">Holes</p>
          <p className="font-mono text-2xl tracking-[0.2em] text-text mb-1">{hint.holes}</p>
          <p className="text-text-muted text-xs">{FINGERING_LEGEND}</p>
        </div>
        <div>
          <p className="text-accent text-xs font-medium mb-1">Fingers</p>
          <p className="text-text-muted leading-relaxed">{hint.fingers}</p>
        </div>
        <div>
          <p className="text-accent text-xs font-medium mb-1">Breath</p>
          <p className="text-text-muted leading-relaxed">{hint.blowing}</p>
        </div>
      </div>
    </aside>
  )
}
