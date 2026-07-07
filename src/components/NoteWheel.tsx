import type { IndianNote } from '../types'
import { INDIAN_NOTES } from '../types'

// Compute positions on a circle: center (50,50), radius 36
// SA at top (-90°), distribute 7 notes evenly
const RADIUS = 36
const CX = 50
const CY = 50
const START_ANGLE_DEG = -90

function noteAngle(index: number): number {
  return START_ANGLE_DEG + (index * 360) / INDIAN_NOTES.length
}

function notePosition(index: number): { x: number; y: number } {
  const rad = (noteAngle(index) * Math.PI) / 180
  return {
    x: CX + RADIUS * Math.cos(rad),
    y: CY + RADIUS * Math.sin(rad),
  }
}

const WHEEL_POSITIONS = INDIAN_NOTES.reduce(
  (acc, note, i) => {
    acc[note] = notePosition(i)
    return acc
  },
  {} as Record<IndianNote, { x: number; y: number }>,
)

interface NoteWheelProps {
  detectedNote: IndianNote | null
  targetNote?: IndianNote | null
}

export function NoteWheel({ detectedNote, targetNote }: NoteWheelProps) {
  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Outer ring */}
        <circle
          cx={CX}
          cy={CY}
          r={RADIUS + 5}
          fill="none"
          stroke="#38342a"
          strokeWidth="0.5"
        />
        {/* Inner subtle ring */}
        <circle
          cx={CX}
          cy={CY}
          r="8"
          fill="none"
          stroke="#38342a"
          strokeWidth="0.5"
        />

        {INDIAN_NOTES.map((note) => {
          const pos = WHEEL_POSITIONS[note]
          const isDetected = detectedNote === note
          const isTarget = targetNote === note
          const isBoth = isDetected && isTarget

          return (
            <g key={note}>
              {/* Detected glow ring */}
              {isDetected && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="7"
                  fill="rgba(196,160,56,0.18)"
                  stroke="none"
                />
              )}

              {/* Target dashed ring */}
              {isTarget && !isBoth && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="6.5"
                  fill="none"
                  stroke="rgba(196,160,56,0.7)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  className="glow-pulse"
                />
              )}

              {/* Both detected + target: solid ring */}
              {isBoth && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="6.5"
                  fill="rgba(196,160,56,0.25)"
                  stroke="rgba(196,160,56,0.9)"
                  strokeWidth="1.2"
                />
              )}

              {/* Note dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isDetected || isTarget ? 3.5 : 2}
                fill={
                  isDetected || isTarget
                    ? '#c4a038'
                    : '#3a3428'
                }
              />

              {/* Note label */}
              <text
                x={pos.x}
                y={pos.y + 10}
                textAnchor="middle"
                fontSize="5.5"
                fontWeight={isDetected || isTarget ? '700' : '400'}
                fill={
                  isDetected || isTarget
                    ? '#c4a038'
                    : '#717885'
                }
                style={{ fontFamily: 'Inter, system-ui' }}
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
