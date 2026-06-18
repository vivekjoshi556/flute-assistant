import type { IndianNote } from '../types'
import type { NoteTarget } from './register'

export const MAJOR_SCALE_ASCENDING: IndianNote[] = [
  'SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI', 'SA',
]

export const MAJOR_SCALE_DESCENDING: IndianNote[] = [
  'SA', 'NI', 'DHA', 'PA', 'MA', 'GA', 'RE', 'SA',
]

export const SINGLE_NOTES: IndianNote[] = [
  'SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI', 'SA',
]

export function getScaleNotes(
  type: 'ascending' | 'descending' | 'single',
): IndianNote[] {
  switch (type) {
    case 'ascending':
      return [...MAJOR_SCALE_ASCENDING]
    case 'descending':
      return [...MAJOR_SCALE_DESCENDING]
    case 'single':
      return [...SINGLE_NOTES]
  }
}

export function getScaleTargets(
  type: 'ascending' | 'descending' | 'single',
  baseOctave = 4,
): NoteTarget[] {
  const upper = baseOctave + 1
  switch (type) {
    case 'ascending':
      return [
        { note: 'SA', octave: baseOctave },
        { note: 'RE', octave: baseOctave },
        { note: 'GA', octave: baseOctave },
        { note: 'MA', octave: baseOctave },
        { note: 'PA', octave: baseOctave },
        { note: 'DHA', octave: baseOctave },
        { note: 'NI', octave: baseOctave },
        { note: 'SA', octave: upper },
      ]
    case 'descending':
      return [
        { note: 'SA', octave: upper },
        { note: 'NI', octave: baseOctave },
        { note: 'DHA', octave: baseOctave },
        { note: 'PA', octave: baseOctave },
        { note: 'MA', octave: baseOctave },
        { note: 'GA', octave: baseOctave },
        { note: 'RE', octave: baseOctave },
        { note: 'SA', octave: baseOctave },
      ]
    case 'single':
      return [
        { note: 'SA', octave: baseOctave },
        { note: 'RE', octave: baseOctave },
        { note: 'GA', octave: baseOctave },
        { note: 'MA', octave: baseOctave },
        { note: 'PA', octave: baseOctave },
        { note: 'DHA', octave: baseOctave },
        { note: 'NI', octave: baseOctave },
        { note: 'SA', octave: upper },
      ]
  }
}

export function randomNoteTarget(baseOctave = 4): NoteTarget {
  return { note: randomNote(), octave: baseOctave }
}

export function randomNoteTargets(count: number, baseOctave = 4): NoteTarget[] {
  return Array.from({ length: count }, () => randomNoteTarget(baseOctave))
}

export function randomNote(exclude?: IndianNote): IndianNote {
  const notes: IndianNote[] = ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI']
  const pool = exclude ? notes.filter((n) => n !== exclude) : notes
  return pool[Math.floor(Math.random() * pool.length)]
}

export const SCALE_INFO = {
  name: 'Major Scale Equivalent',
  description: 'Sa Re Ga Ma Pa Dha Ni Sa — the shuddha (natural) scale, ideal for beginners.',
  notes: MAJOR_SCALE_ASCENDING,
}
