import type { IndianNote } from '../types'

export interface NoteHint {
  fingers: string
  holes: string
  blowing: string
}

/**
 * 6-hole bansuri — holes numbered from the blow end: 1 = nearest lips, 6 = farthest.
 * ● covered  ○ open
 */
export const NOTE_HINTS: Record<IndianNote, NoteHint> = {
  SA: {
    holes: '●●●○○○',
    fingers: 'Cover holes 1, 2, and 3 (the three nearest your lips). Holes 4, 5, 6 stay open.',
    blowing: 'Gentle, steady breath.',
  },
  RE: {
    holes: '●●○○○○',
    fingers: 'From Sa, lift your finger off hole 3.',
    blowing: 'Slightly more air than Sa — keep it smooth.',
  },
  GA: {
    holes: '●○○○○○',
    fingers: 'From Sa, lift fingers off holes 3 and 2. Only hole 1 stays covered.',
    blowing: 'Steady mid-strength breath.',
  },
  MA: {
    holes: '○○○○○○',
    fingers: 'From Sa, lift fingers off holes 3, 2, and 1. All finger holes open; thumb hole covered.',
    blowing: 'Moderate, even breath.',
  },
  PA: {
    holes: '●●●●●●',
    fingers: 'Cover all 6 finger holes. Thumb hole covered.',
    blowing: 'Confident, steady stream of air.',
  },
  DHA: {
    holes: '●●●●●○',
    fingers: 'From Pa (all holes closed), lift your finger off hole 6 (far end).',
    blowing: 'More air than Pa — stay relaxed.',
  },
  NI: {
    holes: '●●●●○○',
    fingers: 'From Pa, lift fingers off holes 6 and 5.',
    blowing: 'Strongest breath in this register — stay controlled.',
  },
}

export const FINGERING_LEGEND =
  'Hole 1 = nearest your lips · Hole 6 = far end · ● covered · ○ open'

export function getNoteHint(note: IndianNote): NoteHint {
  return NOTE_HINTS[note]
}
