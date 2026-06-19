import type { IndianNote } from '../types'
import type { NoteTarget } from './register'

export type SargamDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Sargam {
  id: string
  name: string
  description: string
  difficulty: SargamDifficulty
  notes: NoteTarget[]
}

function ascendingScale(baseOctave: number): NoteTarget[] {
  const upper = baseOctave + 1
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

function buildAlankar(baseOctave: number): NoteTarget[] {
  const upper = baseOctave + 1
  const pairs: [IndianNote, IndianNote][] = [
    ['SA', 'RE'],
    ['RE', 'GA'],
    ['GA', 'MA'],
    ['MA', 'PA'],
    ['PA', 'DHA'],
    ['DHA', 'NI'],
    ['NI', 'SA'],
  ]
  const notes: NoteTarget[] = []
  for (const [a, b] of pairs) {
    const bOctave = b === 'SA' && a === 'NI' ? upper : baseOctave
    notes.push({ note: a, octave: baseOctave })
    notes.push({ note: b, octave: bOctave })
    notes.push({ note: a, octave: baseOctave })
  }
  return notes
}

/** Generate all sargam exercises for the given base octave. */
export function getSargamsForOctave(baseOctave: number): Sargam[] {
  const upper = baseOctave + 1
  return [
    {
      id: 'basic-ascending',
      name: 'Basic Ascending',
      description: 'First five notes going up — the foundation of every raga.',
      difficulty: 'beginner',
      notes: [
        { note: 'SA', octave: baseOctave },
        { note: 'RE', octave: baseOctave },
        { note: 'GA', octave: baseOctave },
        { note: 'MA', octave: baseOctave },
        { note: 'PA', octave: baseOctave },
      ],
    },
    {
      id: 'return-home',
      name: 'Return Home',
      description: 'Come back down to Sa — trains note memory in reverse.',
      difficulty: 'beginner',
      notes: [
        { note: 'PA', octave: baseOctave },
        { note: 'MA', octave: baseOctave },
        { note: 'GA', octave: baseOctave },
        { note: 'RE', octave: baseOctave },
        { note: 'SA', octave: baseOctave },
      ],
    },
    {
      id: 'full-scale-up',
      name: 'Full Scale Up',
      description: 'Complete ascending sargam — Sa to upper Sa.',
      difficulty: 'beginner',
      notes: ascendingScale(baseOctave),
    },
    {
      id: 'full-scale-down',
      name: 'Full Scale Down',
      description: 'Complete descending sargam — upper Sa back to Sa.',
      difficulty: 'beginner',
      notes: [
        { note: 'SA', octave: upper },
        { note: 'NI', octave: baseOctave },
        { note: 'DHA', octave: baseOctave },
        { note: 'PA', octave: baseOctave },
        { note: 'MA', octave: baseOctave },
        { note: 'GA', octave: baseOctave },
        { note: 'RE', octave: baseOctave },
        { note: 'SA', octave: baseOctave },
      ],
    },
    {
      id: 'jump-sa-ga-pa',
      name: 'Skip Pattern',
      description: 'Sa–Ga–Pa–Ni–Sa — jumps train interval recognition.',
      difficulty: 'intermediate',
      notes: [
        { note: 'SA', octave: baseOctave },
        { note: 'GA', octave: baseOctave },
        { note: 'PA', octave: baseOctave },
        { note: 'NI', octave: baseOctave },
        { note: 'SA', octave: upper },
      ],
    },
    {
      id: 'alankar-1',
      name: 'Alankar 1',
      description: 'Classic paltaa: Sa Re Sa, Re Ga Re, Ga Ma Ga…',
      difficulty: 'intermediate',
      notes: buildAlankar(baseOctave),
    },
    {
      id: 'zigzag',
      name: 'Zigzag',
      description: 'Up two, down one — builds agility between registers.',
      difficulty: 'intermediate',
      notes: [
        { note: 'SA', octave: baseOctave },
        { note: 'RE', octave: baseOctave },
        { note: 'SA', octave: baseOctave },
        { note: 'RE', octave: baseOctave },
        { note: 'GA', octave: baseOctave },
        { note: 'RE', octave: baseOctave },
        { note: 'GA', octave: baseOctave },
        { note: 'MA', octave: baseOctave },
        { note: 'GA', octave: baseOctave },
        { note: 'MA', octave: baseOctave },
        { note: 'PA', octave: baseOctave },
      ],
    },
    {
      id: 'long-paltaa',
      name: 'Long Paltaa',
      description: 'Extended up-and-down pattern for breath endurance.',
      difficulty: 'advanced',
      notes: [
        ...ascendingScale(baseOctave),
        { note: 'NI', octave: baseOctave },
        { note: 'DHA', octave: baseOctave },
        { note: 'PA', octave: baseOctave },
        { note: 'MA', octave: baseOctave },
        { note: 'GA', octave: baseOctave },
        { note: 'RE', octave: baseOctave },
        { note: 'SA', octave: baseOctave },
        { note: 'RE', octave: baseOctave },
        { note: 'GA', octave: baseOctave },
        { note: 'RE', octave: baseOctave },
        { note: 'SA', octave: baseOctave },
      ],
    },
  ]
}

/** Default sargams at octave 5 (Middle Octave bansuri) for backward compatibility. */
export const SARGAMS: Sargam[] = getSargamsForOctave(5)

export function getSargamById(id: string): Sargam | undefined {
  return SARGAMS.find((s) => s.id === id)
}

export function sargamsByDifficulty(difficulty: SargamDifficulty): Sargam[] {
  return SARGAMS.filter((s) => s.difficulty === difficulty)
}

export const DIFFICULTY_LABELS: Record<SargamDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}
