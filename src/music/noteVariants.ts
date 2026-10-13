import type { FluteKey, IndianNote } from '../types'
import { getNoteFrequency } from './notes'

export type SwarVariant = 'shuddha' | 'komal' | 'teevra'

export interface ParsedNote {
  note: IndianNote
  variant: SwarVariant
  octaveOffset: number
  label: string
  /** Whether this is a rest (silence) */
  isRest: boolean
  /** Whether this is a grace note (ornament) */
  isGrace: boolean
}

const INDIAN_SET = new Set<string>(['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI'])
const KOMAL_NOTES = new Set<string>(['RE', 'GA', 'DHA', 'NI'])

/** Parse exercise notation: SA, re (komal), Ma↑ (teevra), MA↑ (upper octave), - (rest), (SA) (grace). */
export function parseExerciseNote(raw: string): ParsedNote {
  const trimmed = raw.trim()

  // Rest (silence)
  if (trimmed === '-' || trimmed === '_' || trimmed === '—') {
    return { note: 'SA', variant: 'shuddha', octaveOffset: 0, label: '-', isRest: true, isGrace: false }
  }

  // Grace note (parenthesized)
  const isGrace = trimmed.startsWith('(') && trimmed.endsWith(')')
  let body = isGrace ? trimmed.slice(1, -1) : trimmed

  // Teevra Ma — mixed-case Ma with ↑
  if (/^Ma↑$/.test(body)) {
    return { note: 'MA', variant: 'teevra', octaveOffset: 0, label: isGrace ? '(Ma↑)' : 'Ma↑', isRest: false, isGrace }
  }

  let octaveOffset = 0
  if (body.endsWith('↑')) {
    octaveOffset += 1
    body = body.slice(0, -1)
  }
  if (body.endsWith('↓')) {
    octaveOffset -= 1
    body = body.slice(0, -1)
  }

  const upper = body.toUpperCase()
  const note = upper as IndianNote
  if (!INDIAN_SET.has(note)) {
    throw new Error(`Unknown note: ${raw}`)
  }

  const isKomal = body !== upper && KOMAL_NOTES.has(note)
  const variant: SwarVariant = isKomal ? 'komal' : 'shuddha'

  const display =
    variant === 'komal'
      ? note.charAt(0) + note.slice(1).toLowerCase()
      : `${note}${octaveOffset > 0 ? '↑' : octaveOffset < 0 ? '↓' : ''}`

  const label = isGrace ? `(${display})` : display

  return { note, variant, octaveOffset, label, isRest: false, isGrace }
}

export function getVariantFrequency(
  parsed: ParsedNote,
  fluteKey: FluteKey,
  baseOctave: number,
): number {
  const octave = baseOctave + parsed.octaveOffset
  const base = getNoteFrequency(parsed.note, fluteKey, octave)
  if (parsed.variant === 'komal') {
    return base * Math.pow(2, -1 / 12)
  }
  if (parsed.variant === 'teevra') {
    return base * Math.pow(2, 1 / 12)
  }
  return base
}

export function centsBetween(frequency: number, target: number): number {
  if (frequency <= 0 || target <= 0) return Infinity
  return 1200 * Math.log2(frequency / target)
}

export function isPitchMatch(
  frequency: number,
  parsed: ParsedNote,
  fluteKey: FluteKey,
  baseOctave: number,
  toleranceCents = 35,
): boolean {
  const target = getVariantFrequency(parsed, fluteKey, baseOctave)
  return Math.abs(centsBetween(frequency, target)) <= toleranceCents
}

export function exerciseNotesToTargets(
  notes: string[],
  baseOctave: number,
): import('./register').NoteTarget[] {
  const result: import('./register').NoteTarget[] = []
  for (const raw of notes) {
    const parsed = parseExerciseNote(raw)
    // Skip rests in target sequence - they're for notation/reference only
    if (parsed.isRest) continue
    result.push({
      note: parsed.note,
      octave: baseOctave + parsed.octaveOffset,
      variant: parsed.variant,
    })
  }
  return result
}
