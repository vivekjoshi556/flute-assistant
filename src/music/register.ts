import type { FluteKey, IndianNote } from '../types'
import { getNoteFrequency } from './notes'
import type { SwarVariant } from './noteVariants'

export type Register = 'lower' | 'middle' | 'higher'

export function octaveToRegister(octave: number, baseOctave = 5): Register {
  if (octave < baseOctave) return 'lower'
  if (octave > baseOctave) return 'higher'
  return 'middle'
}

export function registerLabel(register: Register): string {
  switch (register) {
    case 'lower':
      return 'Lower register'
    case 'middle':
      return 'Middle register'
    case 'higher':
      return 'Higher register'
  }
}

export function registerShortLabel(register: Register): string {
  switch (register) {
    case 'lower':
      return 'Lower'
    case 'middle':
      return 'Middle'
    case 'higher':
      return 'Higher'
  }
}

/** Compare detected vs expected octave for guided feedback */
export function getRegisterFeedback(
  detectedOctave: number,
  expectedOctave: number,
  baseOctave = 5,
): {
  register: Register
  status: 'correct' | 'too-low' | 'too-high' | 'unknown'
  message: string
  hint: string
} {
  if (detectedOctave <= 0 || expectedOctave <= 0) {
    return {
      register: 'middle',
      status: 'unknown',
      message: 'Play a note to see register',
      hint: 'Blow steadily and cover the correct holes.',
    }
  }

  const detected = octaveToRegister(detectedOctave, baseOctave)
  const diff = detectedOctave - expectedOctave

  if (diff === 0) {
    return {
      register: detected,
      status: 'correct',
      message: `${registerLabel(detected)} — correct`,
      hint: 'Good octave. Focus on holding the note steady.',
    }
  }

  if (diff < 0) {
    return {
      register: detected,
      status: 'too-low',
      message: `Too low — you're in the ${registerShortLabel(detected)} register`,
      hint: 'Try blowing a little harder, angle the flute slightly down, or open more holes if needed.',
    }
  }

  return {
    register: detected,
    status: 'too-high',
    message: `Too high — you're in the ${registerShortLabel(detected)} register`,
    hint: 'Try softer breath, angle the flute slightly up, or cover more holes. Less air often helps.',
  }
}

export interface NoteTarget {
  note: IndianNote
  octave: number
  variant?: SwarVariant
}

export function getTargetFrequency(target: NoteTarget, fluteKey: FluteKey): number {
  const base = getNoteFrequency(target.note, fluteKey, target.octave)
  if (target.variant === 'komal') return base * Math.pow(2, -1 / 12)
  if (target.variant === 'teevra') return base * Math.pow(2, 1 / 12)
  return base
}

export function noteTargetLabel(target: NoteTarget, baseOctave = 5): string {
  if (target.variant === 'komal') {
    return target.note.charAt(0) + target.note.slice(1).toLowerCase()
  }
  if (target.variant === 'teevra') return 'Ma↑'
  if (target.octave > baseOctave && target.note === 'SA') return 'SA↑'
  if (target.octave < baseOctave && target.note === 'SA') return 'SA↓'
  return target.note
}

/** How closely a played frequency matches a target note, octave, and variant. */
export function matchToTarget(
  frequency: number,
  detectedNote: IndianNote | null,
  detectedOctave: number,
  target: NoteTarget,
  fluteKey: FluteKey,
): { matches: boolean; centsOff: number } {
  if (frequency <= 0) {
    return { matches: false, centsOff: 999 }
  }

  const expected = getTargetFrequency(target, fluteKey)
  const cents = Math.abs(1200 * Math.log2(frequency / expected))

  if (target.variant && target.variant !== 'shuddha') {
    return { matches: cents <= 40, centsOff: cents }
  }

  if (detectedNote === target.note) {
    if (detectedOctave > 0 && detectedOctave !== target.octave) {
      return { matches: false, centsOff: cents }
    }
    return { matches: cents <= 40, centsOff: cents }
  }

  const freqMatches = cents <= 40
  const noteMatches =
    detectedNote === target.note &&
    (detectedOctave <= 0 || detectedOctave === target.octave)
  return { matches: noteMatches || freqMatches, centsOff: cents }
}
