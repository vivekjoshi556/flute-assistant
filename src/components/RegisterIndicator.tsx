import { getRegisterFeedback, registerShortLabel, octaveToRegister } from '../music/register'

interface RegisterIndicatorProps {
  detectedOctave: number
  expectedOctave?: number
  detectedFrequency?: number
  expectedFrequency?: number
}

export function RegisterIndicator({
  detectedOctave,
  expectedOctave,
}: RegisterIndicatorProps) {
  const feedback =
    expectedOctave && expectedOctave > 0
      ? getRegisterFeedback(detectedOctave, expectedOctave)
      : detectedOctave > 0
        ? {
            register: octaveToRegister(detectedOctave),
            status: 'unknown' as const,
            message: `Playing in ${registerShortLabel(octaveToRegister(detectedOctave))} register`,
            hint: 'Middle register (octave 4) is where most beginner practice happens.',
          }
        : {
            register: 'middle' as const,
            status: 'unknown' as const,
            message: 'Register will appear when you play',
            hint: 'Lower = deeper sound. Higher = brighter, upper octave.',
          }

  const statusColor =
    feedback.status === 'correct'
      ? 'text-accent border-accent/30 bg-accent/10'
      : feedback.status === 'too-low'
        ? 'text-warning border-warning/30 bg-warning/10'
        : feedback.status === 'too-high'
          ? 'text-danger border-danger/30 bg-danger/10'
          : 'text-text-muted border-border bg-surface-overlay'

  const registers = ['lower', 'middle', 'higher'] as const
  const activeRegister =
    detectedOctave > 0 ? octaveToRegister(detectedOctave) : null
  const targetRegister =
    expectedOctave && expectedOctave > 0
      ? octaveToRegister(expectedOctave)
      : 'middle'

  return (
    <div className="bg-surface-raised border border-border rounded-xl p-4">
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
        Pitch Register
      </h3>

      <div className="flex justify-center gap-2 mb-3">
        {registers.map((reg) => {
          const isActive = activeRegister === reg
          const isTarget = expectedOctave && targetRegister === reg
          return (
            <div
              key={reg}
              className={`flex-1 text-center py-2 rounded-lg border text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-accent/20 border-accent/50 text-accent'
                  : isTarget
                    ? 'border-accent/30 text-accent/70 border-dashed'
                    : 'border-border text-text-muted bg-surface-overlay'
              }`}
            >
              {registerShortLabel(reg)}
              {isTarget && !isActive && (
                <span className="block text-[10px] opacity-70">target</span>
              )}
            </div>
          )
        })}
      </div>

      <div className={`rounded-lg border p-3 ${statusColor}`}>
        <p className="font-medium text-sm">{feedback.message}</p>
        <p className="text-xs mt-1 opacity-80">{feedback.hint}</p>
      </div>
    </div>
  )
}
