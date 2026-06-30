import type { IndianNote } from '../types'
import type { NoteTarget } from './register'

export type AlankarCategory = 'sliding-3' | 'sliding-4' | 'permutation-4' | 'classic' | 'skip'
export type AlankarDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Alankar {
  id: string
  name: string
  category: AlankarCategory
  difficulty: AlankarDifficulty
  description: string
  patternLabel: string
  generateNotes: (baseOctave: number) => NoteTarget[]
}

// --- Helper constants and functions ---

const SCALE: IndianNote[] = ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI', 'SA']

function noteAt(idx: number, baseOctave: number): NoteTarget {
  return { note: SCALE[idx], octave: idx >= 7 ? baseOctave + 1 : baseOctave }
}

/** Build a sliding-window alankar from a permutation pattern (1-indexed). */
function buildPermutationAlankar(perm: number[], baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let start = 0; start <= SCALE.length - 4; start++) {
    for (const offset of perm) {
      const idx = start + offset - 1 // perm is 1-indexed
      notes.push(noteAt(idx, baseOctave))
    }
  }
  return notes
}

/** Format first window of a permutation as example text. */
function permutationDescription(perm: number[]): string {
  const noteNames = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni', 'Sa↑']
  const window1 = perm.map((p) => noteNames[p - 1]).join(' ')
  const window2 = perm.map((p) => noteNames[p]).join(' ')
  return `${window1}, ${window2}, …`
}

// --- Category A: Sliding Window Groups of 3 ---

function buildSlidingAsc3(baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let i = 0; i <= SCALE.length - 3; i++) {
    for (let j = 0; j < 3; j++) {
      notes.push(noteAt(i + j, baseOctave))
    }
  }
  return notes
}

function buildSlidingDesc3(baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let i = SCALE.length - 1; i >= 2; i--) {
    for (let j = 0; j < 3; j++) {
      notes.push(noteAt(i - j, baseOctave))
    }
  }
  return notes
}

const SLIDING_3_ALANKARS: Alankar[] = [
  {
    id: 's3-ascending',
    name: 'Ascending Triplets',
    category: 'sliding-3',
    difficulty: 'beginner',
    description: 'Sa Re Ga, Re Ga Ma, Ga Ma Pa, Ma Pa Dha, Pa Dha Ni, Dha Ni Sa↑',
    patternLabel: 'Groups of 3 ↑',
    generateNotes: buildSlidingAsc3,
  },
  {
    id: 's3-descending',
    name: 'Descending Triplets',
    category: 'sliding-3',
    difficulty: 'beginner',
    description: 'Sa↑ Ni Dha, Ni Dha Pa, Dha Pa Ma, Pa Ma Ga, Ma Ga Re, Ga Re Sa',
    patternLabel: 'Groups of 3 ↓',
    generateNotes: buildSlidingDesc3,
  },
  {
    id: 's3-forward-backward',
    name: 'Forward-Backward Triplets',
    category: 'sliding-3',
    difficulty: 'intermediate',
    description: 'Ascending triplets then descending triplets combined',
    patternLabel: 'Groups of 3 ↑↓',
    generateNotes: (baseOctave) => [
      ...buildSlidingAsc3(baseOctave),
      ...buildSlidingDesc3(baseOctave),
    ],
  },
]

// --- Category B: Sliding Window Groups of 4 ---

function buildSlidingAsc4(baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let i = 0; i <= SCALE.length - 4; i++) {
    for (let j = 0; j < 4; j++) {
      notes.push(noteAt(i + j, baseOctave))
    }
  }
  return notes
}

function buildSlidingDesc4(baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let i = SCALE.length - 1; i >= 3; i--) {
    for (let j = 0; j < 4; j++) {
      notes.push(noteAt(i - j, baseOctave))
    }
  }
  return notes
}

const SLIDING_4_ALANKARS: Alankar[] = [
  {
    id: 's4-ascending',
    name: 'Ascending Quads',
    category: 'sliding-4',
    difficulty: 'beginner',
    description: 'Sa Re Ga Ma, Re Ga Ma Pa, Ga Ma Pa Dha, Ma Pa Dha Ni, Pa Dha Ni Sa↑',
    patternLabel: 'Groups of 4 ↑',
    generateNotes: buildSlidingAsc4,
  },
  {
    id: 's4-descending',
    name: 'Descending Quads',
    category: 'sliding-4',
    difficulty: 'beginner',
    description: 'Sa↑ Ni Dha Pa, Ni Dha Pa Ma, Dha Pa Ma Ga, Pa Ma Ga Re, Ma Ga Re Sa',
    patternLabel: 'Groups of 4 ↓',
    generateNotes: buildSlidingDesc4,
  },
  {
    id: 's4-forward-backward',
    name: 'Forward-Backward Quads',
    category: 'sliding-4',
    difficulty: 'intermediate',
    description: 'Ascending quads then descending quads combined',
    patternLabel: 'Groups of 4 ↑↓',
    generateNotes: (baseOctave) => [
      ...buildSlidingAsc4(baseOctave),
      ...buildSlidingDesc4(baseOctave),
    ],
  },
]

// --- Category C: Permutation Patterns ---

const PERMUTATIONS: number[][] = [
  [1, 2, 4, 3], [1, 3, 2, 4], [1, 3, 4, 2], [1, 4, 2, 3], [1, 4, 3, 2],
  [2, 1, 3, 4], [2, 1, 4, 3], [2, 3, 1, 4], [2, 3, 4, 1], [2, 4, 1, 3], [2, 4, 3, 1],
  [3, 1, 2, 4], [3, 1, 4, 2], [3, 2, 1, 4], [3, 2, 4, 1], [3, 4, 1, 2], [3, 4, 2, 1],
  [4, 1, 2, 3], [4, 1, 3, 2], [4, 2, 1, 3], [4, 2, 3, 1], [4, 3, 1, 2],
]

const PERMUTATION_ALANKARS: Alankar[] = PERMUTATIONS.map((perm) => {
  const label = `(${perm.join(',')})`
  const idSuffix = perm.join('-')
  return {
    id: `perm-${idSuffix}`,
    name: `Pattern ${perm.join('-')}`,
    category: 'permutation-4' as AlankarCategory,
    difficulty: 'intermediate' as AlankarDifficulty,
    description: permutationDescription(perm),
    patternLabel: label,
    generateNotes: (baseOctave: number) => buildPermutationAlankar(perm, baseOctave),
  }
})

// --- Category D: Classic Alankars ---

function buildClassicPaltaa(baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let i = 0; i <= SCALE.length - 2; i++) {
    notes.push(noteAt(i, baseOctave))
    notes.push(noteAt(i + 1, baseOctave))
    notes.push(noteAt(i, baseOctave))
  }
  return notes
}

function buildUpDownPairs(baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let i = 0; i <= SCALE.length - 3; i++) {
    notes.push(noteAt(i, baseOctave))
    notes.push(noteAt(i + 1, baseOctave))
    notes.push(noteAt(i + 2, baseOctave))
    notes.push(noteAt(i + 1, baseOctave))
  }
  return notes
}

function buildDoubleNotes(baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let i = 0; i < SCALE.length; i++) {
    notes.push(noteAt(i, baseOctave))
    notes.push(noteAt(i, baseOctave))
  }
  return notes
}

function buildReverseDouble(baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let i = SCALE.length - 1; i >= 0; i--) {
    notes.push(noteAt(i, baseOctave))
    notes.push(noteAt(i, baseOctave))
  }
  return notes
}

function buildThreeNoteClimb(baseOctave: number): NoteTarget[] {
  // Sa Re Ga, Ga Ma Pa, Pa Dha Ni — groups of 3 starting at every other note
  const notes: NoteTarget[] = []
  for (let i = 0; i <= SCALE.length - 3; i += 2) {
    notes.push(noteAt(i, baseOctave))
    notes.push(noteAt(i + 1, baseOctave))
    notes.push(noteAt(i + 2, baseOctave))
  }
  return notes
}

const CLASSIC_ALANKARS: Alankar[] = [
  {
    id: 'classic-paltaa',
    name: 'Classic Paltaa',
    category: 'classic',
    difficulty: 'intermediate',
    description: 'Sa Re Sa, Re Ga Re, Ga Ma Ga, … — the traditional up-and-back pattern',
    patternLabel: 'Up-Back-Up',
    generateNotes: buildClassicPaltaa,
  },
  {
    id: 'classic-updown-pairs',
    name: 'Up-Down Pairs',
    category: 'classic',
    difficulty: 'intermediate',
    description: 'Sa Re Ga Re, Re Ga Ma Ga, Ga Ma Pa Ma, … — three up then one back',
    patternLabel: 'Up 3, Back 1',
    generateNotes: buildUpDownPairs,
  },
  {
    id: 'classic-double-note',
    name: 'Double Notes',
    category: 'classic',
    difficulty: 'beginner',
    description: 'Sa Sa Re Re Ga Ga Ma Ma Pa Pa Dha Dha Ni Ni Sa↑ Sa↑',
    patternLabel: 'Each note twice ↑',
    generateNotes: buildDoubleNotes,
  },
  {
    id: 'classic-reverse-double',
    name: 'Reverse Double',
    category: 'classic',
    difficulty: 'beginner',
    description: 'Sa↑ Sa↑ Ni Ni Dha Dha Pa Pa Ma Ma Ga Ga Re Re Sa Sa',
    patternLabel: 'Each note twice ↓',
    generateNotes: buildReverseDouble,
  },
  {
    id: 'classic-3-note-climb',
    name: 'Three-Note Climb',
    category: 'classic',
    difficulty: 'intermediate',
    description: 'Sa Re Ga, Ga Ma Pa, Pa Dha Ni — climbing in threes with overlap',
    patternLabel: 'Climb in 3s',
    generateNotes: buildThreeNoteClimb,
  },
]

// --- Category E: Skip Patterns ---

function buildSkipOneAsc(baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let i = 0; i <= SCALE.length - 3; i++) {
    notes.push(noteAt(i, baseOctave))
    notes.push(noteAt(i + 2, baseOctave))
  }
  return notes
}

function buildSkipOneDesc(baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let i = SCALE.length - 1; i >= 2; i--) {
    notes.push(noteAt(i, baseOctave))
    notes.push(noteAt(i - 2, baseOctave))
  }
  return notes
}

function buildSkipTwoAsc(baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let i = 0; i <= SCALE.length - 4; i++) {
    notes.push(noteAt(i, baseOctave))
    notes.push(noteAt(i + 3, baseOctave))
  }
  return notes
}

function buildSkipTwoDesc(baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let i = SCALE.length - 1; i >= 3; i--) {
    notes.push(noteAt(i, baseOctave))
    notes.push(noteAt(i - 3, baseOctave))
  }
  return notes
}

function buildAlternatingSkip(baseOctave: number): NoteTarget[] {
  const notes: NoteTarget[] = []
  for (let i = 0; i <= SCALE.length - 5; i++) {
    notes.push(noteAt(i, baseOctave))
    notes.push(noteAt(i + 2, baseOctave))
    notes.push(noteAt(i + 4, baseOctave))
  }
  return notes
}

const SKIP_ALANKARS: Alankar[] = [
  {
    id: 'skip-one-asc',
    name: 'Skip-One Ascending',
    category: 'skip',
    difficulty: 'intermediate',
    description: 'Sa Ga, Re Ma, Ga Pa, Ma Dha, Pa Ni, Dha Sa↑',
    patternLabel: 'Skip 1 ↑',
    generateNotes: buildSkipOneAsc,
  },
  {
    id: 'skip-one-desc',
    name: 'Skip-One Descending',
    category: 'skip',
    difficulty: 'intermediate',
    description: 'Sa↑ Dha, Ni Pa, Dha Ma, Pa Ga, Ma Re, Ga Sa',
    patternLabel: 'Skip 1 ↓',
    generateNotes: buildSkipOneDesc,
  },
  {
    id: 'skip-two-asc',
    name: 'Skip-Two Ascending',
    category: 'skip',
    difficulty: 'advanced',
    description: 'Sa Ma, Re Pa, Ga Dha, Ma Ni, Pa Sa↑',
    patternLabel: 'Skip 2 ↑',
    generateNotes: buildSkipTwoAsc,
  },
  {
    id: 'skip-two-desc',
    name: 'Skip-Two Descending',
    category: 'skip',
    difficulty: 'advanced',
    description: 'Sa↑ Pa, Ni Ma, Dha Ga, Pa Re, Ma Sa',
    patternLabel: 'Skip 2 ↓',
    generateNotes: buildSkipTwoDesc,
  },
  {
    id: 'skip-alternating',
    name: 'Alternating Skip',
    category: 'skip',
    difficulty: 'advanced',
    description: 'Sa Ga Pa, Re Ma Dha, Ga Pa Ni, Ma Dha Sa↑',
    patternLabel: 'Alternate skip',
    generateNotes: buildAlternatingSkip,
  },
]

// --- Combined exports ---

export const ALANKARS: Alankar[] = [
  ...SLIDING_3_ALANKARS,
  ...SLIDING_4_ALANKARS,
  ...PERMUTATION_ALANKARS,
  ...CLASSIC_ALANKARS,
  ...SKIP_ALANKARS,
]

export const ALANKAR_CATEGORIES: {
  id: AlankarCategory
  name: string
  description: string
  icon: string
}[] = [
  {
    id: 'sliding-3',
    name: 'Sliding Triplets',
    description: 'Sliding window groups of 3 notes across the scale',
    icon: '🔺',
  },
  {
    id: 'sliding-4',
    name: 'Sliding Quads',
    description: 'Sliding window groups of 4 notes across the scale',
    icon: '🔷',
  },
  {
    id: 'permutation-4',
    name: 'Permutation Patterns',
    description: 'All 22 non-trivial permutations of 4-note windows',
    icon: '🔀',
  },
  {
    id: 'classic',
    name: 'Classic Alankars',
    description: 'Traditional practice patterns used in Indian classical music',
    icon: '🎵',
  },
  {
    id: 'skip',
    name: 'Skip Patterns',
    description: 'Interval jumps that train finger agility and ear',
    icon: '⚡',
  },
]

export function getAlankarById(id: string): Alankar | undefined {
  return ALANKARS.find((a) => a.id === id)
}

export function getAlankarsByCategory(category: AlankarCategory): Alankar[] {
  return ALANKARS.filter((a) => a.category === category)
}
