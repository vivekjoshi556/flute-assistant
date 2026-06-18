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

function ascendingScale(): NoteTarget[] {
  return [
    { note: 'SA', octave: 4 },
    { note: 'RE', octave: 4 },
    { note: 'GA', octave: 4 },
    { note: 'MA', octave: 4 },
    { note: 'PA', octave: 4 },
    { note: 'DHA', octave: 4 },
    { note: 'NI', octave: 4 },
    { note: 'SA', octave: 5 },
  ]
}

export const SARGAMS: Sargam[] = [
  {
    id: 'basic-ascending',
    name: 'Basic Ascending',
    description: 'First five notes going up — the foundation of every raga.',
    difficulty: 'beginner',
    notes: [
      { note: 'SA', octave: 4 },
      { note: 'RE', octave: 4 },
      { note: 'GA', octave: 4 },
      { note: 'MA', octave: 4 },
      { note: 'PA', octave: 4 },
    ],
  },
  {
    id: 'return-home',
    name: 'Return Home',
    description: 'Come back down to Sa — trains note memory in reverse.',
    difficulty: 'beginner',
    notes: [
      { note: 'PA', octave: 4 },
      { note: 'MA', octave: 4 },
      { note: 'GA', octave: 4 },
      { note: 'RE', octave: 4 },
      { note: 'SA', octave: 4 },
    ],
  },
  {
    id: 'full-scale-up',
    name: 'Full Scale Up',
    description: 'Complete ascending sargam — Sa to upper Sa.',
    difficulty: 'beginner',
    notes: ascendingScale(),
  },
  {
    id: 'full-scale-down',
    name: 'Full Scale Down',
    description: 'Complete descending sargam — upper Sa back to Sa.',
    difficulty: 'beginner',
    notes: [
      { note: 'SA', octave: 5 },
      { note: 'NI', octave: 4 },
      { note: 'DHA', octave: 4 },
      { note: 'PA', octave: 4 },
      { note: 'MA', octave: 4 },
      { note: 'GA', octave: 4 },
      { note: 'RE', octave: 4 },
      { note: 'SA', octave: 4 },
    ],
  },
  {
    id: 'jump-sa-ga-pa',
    name: 'Skip Pattern',
    description: 'Sa–Ga–Pa–Ni–Sa — jumps train interval recognition.',
    difficulty: 'intermediate',
    notes: [
      { note: 'SA', octave: 4 },
      { note: 'GA', octave: 4 },
      { note: 'PA', octave: 4 },
      { note: 'NI', octave: 4 },
      { note: 'SA', octave: 5 },
    ],
  },
  {
    id: 'alankar-1',
    name: 'Alankar 1',
    description: 'Classic paltaa: Sa Re Sa, Re Ga Re, Ga Ma Ga…',
    difficulty: 'intermediate',
    notes: buildAlankar(),
  },
  {
    id: 'zigzag',
    name: 'Zigzag',
    description: 'Up two, down one — builds agility between registers.',
    difficulty: 'intermediate',
    notes: [
      { note: 'SA', octave: 4 },
      { note: 'RE', octave: 4 },
      { note: 'SA', octave: 4 },
      { note: 'RE', octave: 4 },
      { note: 'GA', octave: 4 },
      { note: 'RE', octave: 4 },
      { note: 'GA', octave: 4 },
      { note: 'MA', octave: 4 },
      { note: 'GA', octave: 4 },
      { note: 'MA', octave: 4 },
      { note: 'PA', octave: 4 },
    ],
  },
  {
    id: 'long-paltaa',
    name: 'Long Paltaa',
    description: 'Extended up-and-down pattern for breath endurance.',
    difficulty: 'advanced',
    notes: [
      ...ascendingScale(),
      { note: 'NI', octave: 4 },
      { note: 'DHA', octave: 4 },
      { note: 'PA', octave: 4 },
      { note: 'MA', octave: 4 },
      { note: 'GA', octave: 4 },
      { note: 'RE', octave: 4 },
      { note: 'SA', octave: 4 },
      { note: 'RE', octave: 4 },
      { note: 'GA', octave: 4 },
      { note: 'RE', octave: 4 },
      { note: 'SA', octave: 4 },
    ],
  },
]

function buildAlankar(): NoteTarget[] {
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
    const octave = b === 'SA' && a === 'NI' ? 5 : 4
    const aOctave = a === 'SA' && notes.length > 0 ? 4 : 4
    notes.push({ note: a, octave: aOctave })
    notes.push({ note: b, octave })
    notes.push({ note: a, octave: aOctave })
  }
  return notes
}

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
