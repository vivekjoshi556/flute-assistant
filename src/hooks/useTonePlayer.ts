import { useEffect, useRef } from 'react'
import type { IndianNote } from '../types'
import type { FluteKey } from '../types'
import { getNoteFrequency } from '../music/notes'

export function useTonePlayer(fluteKey: FluteKey) {
  const ctxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const getContext = () => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    return ctxRef.current
  }

  const stop = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop()
      } catch {
        // already stopped
      }
      oscRef.current.disconnect()
      oscRef.current = null
    }
  }

  const play = async (note: IndianNote, duration = 1.5, octave = 4) => {
    stop()
    const ctx = getContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
    const freq = getNoteFrequency(note, fluteKey, octave)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + duration - 0.1)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)

    oscRef.current = osc
    gainRef.current = gain
  }

  useEffect(() => () => {
    stop()
    ctxRef.current?.close()
  }, [])

  return { play, stop }
}
