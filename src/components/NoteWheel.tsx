import type { IndianNote } from '../types'
import { INDIAN_NOTES } from '../types'

const WHEEL_POSITIONS: Record<IndianNote, { x: number; y: number }> = {
  SA: { x: 50, y: 8 },
  RE: { x: 82, y: 28 },
  GA: { x: 90, y: 58 },
  MA: { x: 72, y: 82 },
  PA: { x: 50, y: 92 },
  DHA: { x: 28, y: 82 },
  NI: { x: 10, y: 58 },
}

interface NoteWheelProps {
  detectedNote: IndianNote | null
  targetNote?: IndianNote | null
}

export function NoteWheel({ detectedNote, targetNote }: NoteWheelProps) {
  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#2e3a4a"
          strokeWidth="1"
        />
        {INDIAN_NOTES.map((note) => {
          const pos = WHEEL_POSITIONS[note]
          const isDetected = detectedNote === note
          const isTarget = targetNote === note

          return (
            <g key={note}>
              {isDetected && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="10"
                  fill="#34d399"
                  opacity="0.25"
                />
              )}
              {isTarget && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="12"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1.5"
                  className="glow-pulse"
                />
              )}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-[7px] font-bold ${
                  isDetected
                    ? 'fill-accent'
                    : isTarget
                      ? 'fill-accent'
                      : 'fill-slate-400'
                }`}
                style={{ fontFamily: 'system-ui' }}
              >
                {note}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
