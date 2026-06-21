import { useEffect, useRef, useState } from 'react'
import { usePitchDetection } from './usePitchDetection'
import type { IndianNote } from '../types'
import { useApp } from '../context/AppContext'

interface VoiceNavigationProps {
  mappings: Record<string, () => void> // keys can be e.g. "SA" or "SA-RE"
  enabled: boolean
}

export function useVoiceNavigation({ mappings, enabled }: VoiceNavigationProps) {
  const { settings } = useApp()
  const { reading, isListening, error } = usePitchDetection(settings.fluteKey, enabled)

  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [holdProgress, setHoldProgress] = useState(0) // 0 to 100
  const [firstNote, setFirstNote] = useState<IndianNote | null>(null)

  const firstNoteLockTimeRef = useRef<number | null>(null)
  const currentNoteRef = useRef<IndianNote | null>(null)
  const noteStartTimeRef = useRef<number | null>(null)
  const triggeredRef = useRef(false)
  const mappingsRef = useRef(mappings)

  useEffect(() => {
    mappingsRef.current = mappings
  }, [mappings])

  // Configurable thresholds
  const SINGLE_HOLD_MS = 1000
  const SEQUENCE_HOLD_MS = 450
  const SEQUENCE_EXPIRY_MS = 2500

  useEffect(() => {
    if (!enabled) {
      setActiveKey(null)
      setHoldProgress(0)
      setFirstNote(null)
      firstNoteLockTimeRef.current = null
      currentNoteRef.current = null
      noteStartTimeRef.current = null
      triggeredRef.current = false
      return
    }

    const currentNote = reading.note
    const isPlaying = reading.isPlaying && reading.confidence >= 0.65 && currentNote
    const now = performance.now()

    // 1. Reset firstNote if it has expired
    if (firstNote && firstNoteLockTimeRef.current && now - firstNoteLockTimeRef.current > SEQUENCE_EXPIRY_MS) {
      setFirstNote(null)
      firstNoteLockTimeRef.current = null
    }

    if (!isPlaying) {
      currentNoteRef.current = null
      noteStartTimeRef.current = null
      
      if (!firstNote) {
        setActiveKey(null)
        setHoldProgress(0)
      } else {
        // We have a first note locked, keep activeKey null (no pre-highlight)
        setActiveKey(null)
        setHoldProgress(0)
      }
      return
    }

    const note = currentNote!

    // 2. Handle note change or start
    if (note !== currentNoteRef.current) {
      currentNoteRef.current = note
      noteStartTimeRef.current = now
      triggeredRef.current = false
    }

    const elapsed = now - (noteStartTimeRef.current ?? now)

    // 3. Process note hold
    const activeSequenceKey = firstNote ? `${firstNote}-${note}` : null
    const hasSequenceMapping = activeSequenceKey && mappingsRef.current[activeSequenceKey]
    const hasSingleMapping = !firstNote && mappingsRef.current[note]

    if (firstNote) {
      // We are waiting for the second note of a sequence
      if (hasSequenceMapping) {
        // Disambiguation: highlight the sequence key ONLY when playing the second note
        setActiveKey(activeSequenceKey)
        if (triggeredRef.current) return

        // Fills from 50% to 100%
        const progress = 50 + Math.min(50, Math.round((elapsed / SEQUENCE_HOLD_MS) * 50))
        setHoldProgress(progress)

        if (elapsed >= SEQUENCE_HOLD_MS) {
          triggeredRef.current = true
          const action = mappingsRef.current[activeSequenceKey!]
          if (action) {
            action()
          }
          // Reset after triggering
          setFirstNote(null)
          firstNoteLockTimeRef.current = null
          setActiveKey(null)
          setHoldProgress(0)
        }
      } else {
        // Playing a note that is NOT the correct second note
        // Let's see if this note can start a new sequence
        const hasOtherSequence = Object.keys(mappingsRef.current).some(k => k.startsWith(`${note}-`))
        if (hasOtherSequence && elapsed >= SEQUENCE_HOLD_MS) {
          setFirstNote(note)
          firstNoteLockTimeRef.current = now
          setActiveKey(null)
          setHoldProgress(0)
          noteStartTimeRef.current = now
        } else if (!hasOtherSequence) {
          setFirstNote(null)
          firstNoteLockTimeRef.current = null
          setActiveKey(null)
          setHoldProgress(0)
        }
      }
    } else {
      // No first note locked yet
      const hasOtherSequence = Object.keys(mappingsRef.current).some(k => k.startsWith(`${note}-`))

      if (hasOtherSequence) {
        // This note can start a sequence. Let's see if they hold it for SEQUENCE_HOLD_MS
        if (elapsed >= SEQUENCE_HOLD_MS) {
          setFirstNote(note)
          firstNoteLockTimeRef.current = now
          // Locked the first note silently (activeKey stays null, progress stays 0)
          setActiveKey(null)
          setHoldProgress(0)
          noteStartTimeRef.current = now
        } else {
          // Silent progress for locking first note
          setActiveKey(null)
          setHoldProgress(0)
        }
      } else if (hasSingleMapping) {
        // Single note mapping (e.g. SA on Home screen)
        setActiveKey(note)
        if (triggeredRef.current) return

        const progress = Math.min(100, Math.round((elapsed / SINGLE_HOLD_MS) * 100))
        setHoldProgress(progress)

        if (elapsed >= SINGLE_HOLD_MS) {
          triggeredRef.current = true
          const action = mappingsRef.current[note]
          if (action) {
            action()
          }
        }
      } else {
        // Not a mapped note or sequence start
        setActiveKey(null)
        setHoldProgress(0)
      }
    }

  }, [reading.isPlaying, reading.confidence, reading.note, enabled, firstNote])

  return {
    reading,
    isListening,
    error,
    activeKey,
    holdProgress,
    firstNote,
  }
}
