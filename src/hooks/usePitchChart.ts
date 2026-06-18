import { useEffect, useRef, useState } from 'react'

export interface ChartPoint {
  expected: number | null
  actual: number | null
  expectedLabel: string | null
  actualLabel: string | null
  timestamp: number
}

const MAX_POINTS = 120
const SAMPLE_INTERVAL_MS = 200

/**
 * Samples pitch on a fixed timer. Uses refs so the interval is NOT reset
 * every time frequency changes (that was preventing the chart from drawing).
 */
export function usePitchChart(
  actualFrequency: number,
  expectedFrequency: number | null,
  enabled: boolean,
  actualLabel: string | null = null,
  expectedLabel: string | null = null,
) {
  const [points, setPoints] = useState<ChartPoint[]>([])

  const actualFreqRef = useRef(actualFrequency)
  const expectedFreqRef = useRef(expectedFrequency)
  const labelsRef = useRef({ actualLabel, expectedLabel })

  actualFreqRef.current = actualFrequency
  expectedFreqRef.current = expectedFrequency
  labelsRef.current = { actualLabel, expectedLabel }

  useEffect(() => {
    if (!enabled) {
      setPoints([])
      return
    }

    const interval = setInterval(() => {
      const freq = actualFreqRef.current
      const expected = expectedFreqRef.current
      const { actualLabel: aLabel, expectedLabel: eLabel } = labelsRef.current

      setPoints((prev) => {
        const next: ChartPoint = {
          expected: expected,
          actual: freq > 0 ? freq : null,
          expectedLabel: eLabel,
          actualLabel: freq > 0 ? aLabel : null,
          timestamp: Date.now(),
        }
        return [...prev, next].slice(-MAX_POINTS)
      })
    }, SAMPLE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [enabled])

  const clear = () => setPoints([])

  return { points, clear }
}
