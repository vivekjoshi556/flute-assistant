export const FLUTE_KEYS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const

export type FluteKey = (typeof FLUTE_KEYS)[number]

export const INDIAN_NOTES = [
  'SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI',
] as const

export type IndianNote = (typeof INDIAN_NOTES)[number]

export type BreathQuality = 'Excellent' | 'Good' | 'Needs Work'

export interface PitchReading {
  frequency: number
  note: IndianNote | null
  octave: number
  cents: number
  confidence: number
  volume: number
  stability: number
  isPlaying: boolean
}

export interface NoteResult {
  note: IndianNote
  expectedNote: IndianNote
  detectedNote: IndianNote | null
  accuracy: number
  durationHeld: number
  /** MIDI octave of the expected note (e.g. 5 for middle octave, 6 for upper). */
  octave?: number
}

export interface PracticeSession {
  id: string
  mode: 'free' | 'guided' | 'scale' | 'sargam' | 'difficult-notes' | 'alankar'
  startTime: number
  endTime: number
  averageAccuracy: number
  bestAccuracy: number
  noteResults: NoteResult[]
  sargamId?: string
  sargamName?: string
  sargamScore?: number
  alankarId?: string
  alankarName?: string
  alankarScore?: number
  guidedType?: GuidedExerciseType
  scaleDirection?: 'ascending' | 'descending'
  baseOctave?: number
}

export interface UserStats {
  practiceStreak: number
  totalPracticeTime: number
  lastSessionDuration: number
  lastPracticeDate: string | null
  sessions: PracticeSession[]
}

export type GuidedExerciseType =
  | 'single'
  | 'ascending'
  | 'descending'
  | 'random'

export type BansuriType = 'middle' | 'bass' | 'small'

export const BANSURI_TYPES: { type: BansuriType; label: string; description: string; baseOctave: number }[] = [
  { type: 'middle', label: 'Middle Octave (19")', description: 'Most common beginner bansuri — 19–20 inches', baseOctave: 5 },
  { type: 'bass', label: 'Bass Octave (25"+)', description: 'Longer flute — deep, low register', baseOctave: 4 },
  { type: 'small', label: 'Small / High (13–15")', description: 'Short flute — bright, high register', baseOctave: 6 },
]

export interface AppSettings {
  fluteKey: FluteKey
  bansuriType: BansuriType
  baseOctave: number
  onboardingComplete: boolean
  voiceNavigationEnabled?: boolean
}
