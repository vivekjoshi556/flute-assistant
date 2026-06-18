import type { FluteKey, IndianNote } from '../types'
import { INDIAN_NOTES } from '../types'
import type { NoteTarget } from './register'

const NOTE_SEMITONES: Record<string, number> = {
  C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5,
  'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11,
}

/** Shuddha (major scale equivalent) semitone offsets from Sa */
export const NOTE_OFFSETS: Record<IndianNote, number> = {
  SA: 0,
  RE: 2,
  GA: 4,
  MA: 5,
  PA: 7,
  DHA: 9,
  NI: 11,
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440)
}

export function getSaMidiNote(fluteKey: FluteKey, octave = 4): number {
  const baseMidi = 60 + (octave - 4) * 12
  return baseMidi + NOTE_SEMITONES[fluteKey]
}

export function getSaFrequency(fluteKey: FluteKey, octave = 4): number {
  return midiToFrequency(getSaMidiNote(fluteKey, octave))
}

export function getNoteFrequency(
  note: IndianNote,
  fluteKey: FluteKey,
  octave = 4,
): number {
  const saMidi = getSaMidiNote(fluteKey, octave)
  const noteMidi = saMidi + NOTE_OFFSETS[note]
  return midiToFrequency(noteMidi)
}

export interface DetectedNoteInfo {
  note: IndianNote
  octave: number
  cents: number
  targetFrequency: number
}

/**
 * Flute pitch detectors often lock onto harmonics (2× the true pitch).
 * Fold the frequency into the beginner bansuri range before note mapping.
 */
export function foldToFundamental(frequency: number, fluteKey: FluteKey): number {
  if (frequency <= 0) return 0

  const lowSa = getSaFrequency(fluteKey, 3)
  const highNi = getNoteFrequency('NI', fluteKey, 5)
  let f = frequency

  while (f > highNi * 1.15 && f / 2 >= lowSa * 0.85) {
    f /= 2
  }
  while (f < lowSa * 0.85 && f * 2 <= highNi * 1.15) {
    f *= 2
  }

  return f
}

/**
 * Map frequency → Indian note by searching octaves 3–5 and picking
 * the closest match in cents (avoids wrapping bugs in the old algorithm).
 */
export function frequencyToIndianNote(
  frequency: number,
  fluteKey: FluteKey,
): DetectedNoteInfo | null {
  const folded = foldToFundamental(frequency, fluteKey)
  if (folded < 80 || folded > 2000) return null

  const midi = frequencyToMidi(folded)
  let best: DetectedNoteInfo | null = null
  let bestAbsCents = Infinity

  for (let octave = 3; octave <= 5; octave++) {
    const saMidi = getSaMidiNote(fluteKey, octave)
    for (const [note, offset] of Object.entries(NOTE_OFFSETS) as [IndianNote, number][]) {
      const targetMidi = saMidi + offset
      const cents = (midi - targetMidi) * 100
      const absCents = Math.abs(cents)
      if (absCents < bestAbsCents) {
        bestAbsCents = absCents
        best = {
          note,
          octave,
          cents: Math.round(cents),
          targetFrequency: midiToFrequency(targetMidi),
        }
      }
    }
  }

  // Reject if too far from any note (> 55 cents)
  if (!best || bestAbsCents > 55) return null

  return best
}

export function noteDistance(a: IndianNote, b: IndianNote): number {
  const order = INDIAN_NOTES as readonly IndianNote[]
  const ia = order.indexOf(a)
  const ib = order.indexOf(b)
  const direct = Math.abs(ia - ib)
  return Math.min(direct, 7 - direct)
}

export function centsToTuningLabel(cents: number): string {
  if (Math.abs(cents) <= 10) return 'Perfect'
  if (cents > 0) return 'Raise pitch slightly'
  return 'Lower pitch slightly'
}

export function formatFrequency(freq: number): string {
  return freq > 0 ? `${freq.toFixed(1)} Hz` : '—'
}

export function formatCents(cents: number): string {
  const sign = cents >= 0 ? '+' : ''
  return `${sign}${cents} cents`
}

/** How closely a played frequency matches a target note and octave. */
export function matchToTarget(
  frequency: number,
  detectedNote: IndianNote | null,
  detectedOctave: number,
  target: NoteTarget,
  fluteKey: FluteKey,
): { matches: boolean; centsOff: number } {
  if (detectedNote === target.note && frequency > 0) {
    // Note name matches — also verify octave when known
    if (detectedOctave > 0 && detectedOctave !== target.octave) {
      return { matches: false, centsOff: 0 }
    }
    return { matches: true, centsOff: 0 }
  }

  if (frequency <= 0) {
    return { matches: false, centsOff: 999 }
  }

  // Frequency fallback: compare against target's specific octave only
  const expected = getNoteFrequency(target.note, fluteKey, target.octave)
  const cents = Math.abs(1200 * Math.log2(frequency / expected))

  const freqMatches = cents <= 40
  const noteMatches =
    detectedNote === target.note &&
    (detectedOctave <= 0 || detectedOctave === target.octave)
  return { matches: noteMatches || freqMatches, centsOff: cents }
}
