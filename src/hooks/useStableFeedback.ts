import { useEffect, useRef, useState } from 'react'
import type { FeedbackState } from '../components/PracticeLayout'

const MIN_DISPLAY_MS = 1800

function feedbackKey(f: FeedbackState): string {
  switch (f.type) {
    case 'wrong':
      return `wrong-${f.expected}-${f.detected}`
    case 'close':
      return `close-${Math.round(f.cents / 10)}`
    case 'register':
      return `register-${f.message}`
    case 'hold':
      return `hold-${f.count}`
    default:
      return f.type
  }
}

/** Keeps feedback visible for a minimum time so the UI doesn't flash. */
export function useStableFeedback(live: FeedbackState): FeedbackState {
  const [stable, setStable] = useState<FeedbackState>(live)
  const sinceRef = useRef(Date.now())
  const liveRef = useRef(live)
  liveRef.current = live

  useEffect(() => {
    const key = feedbackKey(live)
    const stableKey = feedbackKey(stable)

    // Always show correct/hold immediately
    if (live.type === 'correct' || live.type === 'hold') {
      setStable(live)
      sinceRef.current = Date.now()
      return
    }

    if (key === stableKey) return

    const elapsed = Date.now() - sinceRef.current
    if (elapsed >= MIN_DISPLAY_MS || stable.type === 'idle') {
      setStable(live)
      sinceRef.current = Date.now()
      return
    }

    const timer = setTimeout(() => {
      setStable(liveRef.current)
      sinceRef.current = Date.now()
    }, MIN_DISPLAY_MS - elapsed)

    return () => clearTimeout(timer)
  }, [live, stable])

  return stable
}
