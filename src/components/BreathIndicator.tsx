import type { BreathDetectionState } from '../hooks/useBreathDetection'

function fmt(ms: number): string {
  return (ms / 1000).toFixed(1)
}

interface BreathIndicatorProps {
  breath: BreathDetectionState
}

export function BreathIndicator({ breath }: BreathIndicatorProps) {
  const { status, currentDuration, avgPlay, avgBreath, bestBreath, isNewRecord } = breath

  const isBreathing = status === 'pausing'
  const isPlaying = status === 'playing'
  
  const targetDuration = bestBreath ? Math.max(bestBreath, 3000) : 5000
  const progress = isPlaying ? Math.min(1, currentDuration / targetDuration) : 0
  
  const r = 36
  const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference - progress * circumference

  return (
    <div className="flex flex-col items-center justify-between p-4 h-full bg-surface-overlay/10 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      <h3 className="text-[10px] text-text-muted uppercase tracking-widest mb-2">Long Tone Hold</h3>
      
      <div className="relative flex items-center justify-center w-24 h-24 mb-2">
        {/* Glow effect for new record */}
        {isNewRecord && (
          <div className="absolute inset-0 bg-warning/30 rounded-full blur-xl animate-pulse" />
        )}
        
        {/* Background track */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={r}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-surface-overlay/50"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={r}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isPlaying ? strokeDashoffset : circumference}
            className={`transition-all duration-75 ease-linear ${
              isNewRecord 
                ? 'text-warning drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' 
                : isPlaying
                  ? 'text-accent drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                  : 'text-transparent'
            }`}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-2xl font-mono font-medium tracking-tight ${
            isNewRecord ? 'text-warning font-bold' : isPlaying ? 'text-accent' : 'text-text-muted/50'
          }`}>
            {isPlaying ? fmt(currentDuration) : (isBreathing ? '⏸' : '—')}
          </span>
          {isPlaying && <span className="text-[9px] text-text-muted uppercase tracking-widest mt-0.5">Sec</span>}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex text-center divide-x divide-border/50 mt-auto w-full justify-center">
        <div className="flex flex-col items-center px-3">
          <span className="text-[9px] uppercase tracking-widest text-text-muted/70 mb-1">Best</span>
          <span className={`text-xs font-mono ${isNewRecord ? 'text-warning font-bold animate-pulse' : 'text-text'}`}>
            {bestBreath ? fmt(bestBreath) + 's' : '—'}
          </span>
        </div>
        <div className="flex flex-col items-center px-3">
          <span className="text-[9px] uppercase tracking-widest text-text-muted/70 mb-1">Avg Play</span>
          <span className="text-xs font-mono text-text">
            {avgPlay ? fmt(avgPlay) + 's' : '—'}
          </span>
        </div>
        <div className="flex flex-col items-center px-3">
          <span className="text-[9px] uppercase tracking-widest text-text-muted/70 mb-1">Avg Pause</span>
          <span className="text-xs font-mono text-text">
            {avgBreath ? fmt(avgBreath) + 's' : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
