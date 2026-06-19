import type { IndianNote } from '../types'

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
}

export function noteTargetLabel(target: NoteTarget, baseOctave = 5): string {
  return target.octave > baseOctave && target.note === 'SA' ? 'SA↑' : target.note
}
