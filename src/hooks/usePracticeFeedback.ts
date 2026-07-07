import { useEffect, useRef, useState } from 'react'
import type { FeedbackState } from '../components/PracticeLayout'

const WRONG_CONFIRM_MS = 600
const STATE_HOLD_MS = 2000

function feedbackKey(f: FeedbackState): string {
  switch (f.type) {
    case 'wrong':
      return `wrong-${f.expectedLabel}-${f.detectedLabel}`
    case 'close':
      return `close-${Math.round(f.cents / 8)}`
    case 'register':
      return f.message
    default:
      return f.type
  }
}

/** Stable feedback with hysteresis — prevents layout-jumping flicker. */
export function usePracticeFeedback(live: FeedbackState): FeedbackState {
  const [stable, setStable] = useState<FeedbackState>(live)
  const stableRef = useRef(stable)
  stableRef.current = stable

  const wrongPendingSince = useRef<number | null>(null)
  const stateSince = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    const cur = stableRef.current

    if (live.type === 'wrong') {
      if (wrongPendingSince.current === null) wrongPendingSince.current = now
      if (now - wrongPendingSince.current >= WRONG_CONFIRM_MS) {
        if (feedbackKey(cur) !== feedbackKey(live)) {
          setStable(live)
          stateSince.current = now
        }
      }
      return
    }
    wrongPendingSince.current = null

    if (live.type === 'idle' && (cur.type === 'wrong' || cur.type === 'close')) {
      if (now - stateSince.current < STATE_HOLD_MS) return
    }

    if (feedbackKey(live) !== feedbackKey(cur)) {
      setStable(live)
      stateSince.current = now
    }
  }, [live])

  return stable
}
