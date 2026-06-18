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
}

export interface PracticeSession {
  id: string
  mode: 'free' | 'guided' | 'scale' | 'sargam'
  startTime: number
  endTime: number
  averageAccuracy: number
  bestAccuracy: number
  noteResults: NoteResult[]
  sargamId?: string
  sargamName?: string
  sargamScore?: number
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

export interface AppSettings {
  fluteKey: FluteKey
  onboardingComplete: boolean
}
