import { useMemo } from 'react'
import type { ChartPoint } from '../hooks/usePitchChart'
import { formatFrequency } from '../music/notes'

interface PitchTraceChartProps {
  points: ChartPoint[]
  height?: number
  /** Live values for the end-cap labels */
  liveExpected?: number | null
  liveActual?: number | null
  liveExpectedLabel?: string | null
  liveActualLabel?: string | null
}

export function PitchTraceChart({
  points,
  height = 200,
  liveExpected,
  liveActual,
  liveExpectedLabel,
  liveActualLabel,
}: PitchTraceChartProps) {
  const width = 480
  const padding = { top: 28, right: 72, bottom: 32, left: 48 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const chart = useMemo(() => {
    const freqs = points.flatMap((p) =>
      [p.expected, p.actual].filter((f): f is number => f !== null && f > 0),
    )

    const defaultMin = 220
    const defaultMax = 520

    let minF = defaultMin
    let maxF = defaultMax

    if (freqs.length > 0) {
      const rawMin = Math.min(...freqs)
      const rawMax = Math.max(...freqs)
      const margin = Math.max((rawMax - rawMin) * 0.2, 25)
      minF = Math.floor((rawMin - margin) / 10) * 10
      maxF = Math.ceil((rawMax + margin) / 10) * 10
    }

    const range = maxF - minF || 1
    const toY = (freq: number) =>
      padding.top + chartH - ((freq - minF) / range) * chartH
    const toX = (i: number) =>
      padding.left + (i / Math.max(points.length - 1, 1)) * chartW

    const buildPath = (key: 'expected' | 'actual') => {
      const segments: string[] = []
      let started = false

      points.forEach((p, i) => {
        const freq = p[key]
        if (freq === null || freq <= 0) {
          started = false
          return
        }
        const x = toX(i)
        const y = toY(freq)
        segments.push(`${started ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`)
        started = true
      })
      return segments.join(' ')
    }

    const buildArea = (key: 'expected' | 'actual') => {
      const path = buildPath(key)
      if (!path) return ''
      const lastIdx = points.reduce((acc, p, i) => (p[key] && p[key]! > 0 ? i : acc), -1)
      if (lastIdx < 0) return ''
      const baseY = padding.top + chartH
      const startX = toX(points.findIndex((p) => p[key] && p[key]! > 0))
      const endX = toX(lastIdx)
      return `${path} L${endX},${baseY} L${startX},${baseY} Z`
    }

    const yTicks = Array.from({ length: 4 }, (_, i) =>
      Math.round(minF + (range * i) / 3),
    )

    const lastActual = [...points].reverse().find((p) => p.actual && p.actual > 0)
    const lastExpected = [...points].reverse().find((p) => p.expected && p.expected > 0)

    return {
      minF,
      maxF,
      range,
      toY,
      toX,
      expectedPath: buildPath('expected'),
      actualPath: buildPath('actual'),
      expectedArea: buildArea('expected'),
      actualArea: buildArea('actual'),
      yTicks,
      endActualY: lastActual?.actual ? toY(lastActual.actual) : null,
      endExpectedY: lastExpected?.expected ? toY(lastExpected.expected) : null,
      endX: padding.left + chartW,
    }
  }, [points, chartH, chartW, padding.left, padding.top])

  const displayExpected = liveExpected ?? points.at(-1)?.expected ?? null
  const displayActual = liveActual ?? points.at(-1)?.actual ?? null
  const displayExpectedLabel = liveExpectedLabel ?? points.at(-1)?.expectedLabel ?? 'Expected'
  const displayActualLabel = liveActualLabel ?? points.at(-1)?.actualLabel ?? 'Played'

  return (
    <div className="w-full bg-surface-raised border border-border rounded-xl overflow-hidden">
      {/* Header with live labels */}
      <div className="px-4 pt-3 pb-2 border-b border-border/60 bg-surface-overlay/40">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider pt-1">
            Pitch Trace
          </h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs">
            <div className="flex items-center gap-2 bg-surface-raised/80 rounded-lg px-2.5 py-1.5 border border-border/50">
              <span className="w-3 h-3 rounded-full bg-slate-500/80 shrink-0" />
              <div>
                <span className="text-text-muted">Expected · </span>
                <span className="font-semibold text-slate-300">
                  {displayExpectedLabel}
                </span>
                {displayExpected && (
                  <span className="text-text-muted ml-1 font-mono">
                    {formatFrequency(displayExpected)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-surface-raised/80 rounded-lg px-2.5 py-1.5 border border-accent/20">
              <span className="w-3 h-3 rounded-full bg-accent shrink-0" />
              <div>
                <span className="text-text-muted">Played · </span>
                <span className="font-semibold text-accent">
                  {displayActualLabel ?? '—'}
                </span>
                {displayActual && (
                  <span className="text-text-muted ml-1 font-mono">
                    {formatFrequency(displayActual)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2 py-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full block"
          style={{ height }}
        >
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="expectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis label */}
          <text
            x={10}
            y={padding.top + chartH / 2}
            fill="#64748b"
            fontSize="9"
            transform={`rotate(-90, 10, ${padding.top + chartH / 2})`}
            textAnchor="middle"
          >
            Hz
          </text>

          {/* Grid */}
          {chart.yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={chart.toY(tick)}
                x2={width - padding.right}
                y2={chart.toY(tick)}
                stroke="#2e3a4a"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
              <text
                x={padding.left - 8}
                y={chart.toY(tick) + 3}
                textAnchor="end"
                fill="#64748b"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Areas */}
          {chart.expectedArea && (
            <path d={chart.expectedArea} fill="url(#expectedGrad)" />
          )}
          {chart.actualArea && (
            <path d={chart.actualArea} fill="url(#actualGrad)" />
          )}

          {/* Expected line */}
          {chart.expectedPath && (
            <path
              d={chart.expectedPath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="8 5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Actual line */}
          {chart.actualPath && (
            <path
              d={chart.actualPath}
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* End dots + inline tags */}
          {chart.endExpectedY !== null && (
            <g>
              <circle
                cx={chart.endX}
                cy={chart.endExpectedY}
                r="4"
                fill="#94a3b8"
              />
              <text
                x={chart.endX + 6}
                y={chart.endExpectedY + 3}
                fill="#94a3b8"
                fontSize="9"
                fontWeight="600"
              >
                EXP
              </text>
            </g>
          )}
          {chart.endActualY !== null && (
            <g>
              <circle
                cx={chart.endX}
                cy={chart.endActualY}
                r="4.5"
                fill="#34d399"
              />
              <text
                x={chart.endX + 6}
                y={chart.endActualY + 3}
                fill="#34d399"
                fontSize="9"
                fontWeight="600"
              >
                YOU
              </text>
            </g>
          )}

          {/* Empty state */}
          {points.length < 2 && (
            <text
              x={width / 2}
              y={padding.top + chartH / 2}
              textAnchor="middle"
              fill="#64748b"
              fontSize="11"
            >
              Chart fills as you play…
            </text>
          )}
        </svg>
      </div>

      <p className="text-[10px] text-text-muted text-center pb-2 px-3">
        Scrolls left over time · updates every 0.2s while practicing
      </p>
    </div>
  )
}




