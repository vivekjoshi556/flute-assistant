/**
 * YIN pitch detection algorithm.
 * Based on "YIN, a fundamental frequency estimator for speech and music"
 * by Cheveigné and Kawahara (2002).
 */

export interface YinResult {
  frequency: number
  confidence: number
}

const YIN_THRESHOLD = 0.15
const MIN_FREQ = 80
const MAX_FREQ = 1200

export function detectPitchYIN(
  buffer: Float32Array,
  sampleRate: number,
): YinResult {
  const bufferSize = buffer.length
  const halfSize = Math.floor(bufferSize / 2)

  if (halfSize < 2) return { frequency: 0, confidence: 0 }

  const yinBuffer = new Float32Array(halfSize)

  let rms = 0
  for (let i = 0; i < bufferSize; i++) {
    rms += buffer[i] * buffer[i]
  }
  rms = Math.sqrt(rms / bufferSize)
  if (rms < 0.02) return { frequency: 0, confidence: 0 }

  for (let tau = 0; tau < halfSize; tau++) {
    yinBuffer[tau] = 0
    for (let i = 0; i < halfSize; i++) {
      const delta = buffer[i] - buffer[i + tau]
      yinBuffer[tau] += delta * delta
    }
  }

  yinBuffer[0] = 1
  let runningSum = 0
  for (let tau = 1; tau < halfSize; tau++) {
    runningSum += yinBuffer[tau]
    yinBuffer[tau] = runningSum !== 0
      ? (yinBuffer[tau] * tau) / runningSum
      : 1
  }

  let tauEstimate = -1
  for (let tau = 2; tau < halfSize; tau++) {
    if (yinBuffer[tau] < YIN_THRESHOLD) {
      while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++
      }
      tauEstimate = tau
      break
    }
  }

  if (tauEstimate === -1) {
    let minVal = Infinity
    for (let tau = 2; tau < halfSize; tau++) {
      if (yinBuffer[tau] < minVal) {
        minVal = yinBuffer[tau]
        tauEstimate = tau
      }
    }
    if (minVal > 0.5) return { frequency: 0, confidence: 0 }
  }

  const x0 = tauEstimate > 0 ? tauEstimate - 1 : tauEstimate
  const x2 = tauEstimate + 1 < halfSize ? tauEstimate + 1 : tauEstimate
  let betterTau = tauEstimate

  if (x0 !== tauEstimate && x2 !== tauEstimate) {
    const s0 = yinBuffer[x0]
    const s1 = yinBuffer[tauEstimate]
    const s2 = yinBuffer[x2]
    betterTau = tauEstimate + (s2 - s0) / (2 * (2 * s1 - s2 - s0))
  }

  const frequency = sampleRate / betterTau
  if (frequency < MIN_FREQ || frequency > MAX_FREQ) {
    return { frequency: 0, confidence: 0 }
  }

  const confidence = Math.max(0, Math.min(1, 1 - yinBuffer[tauEstimate]))
  return { frequency, confidence }
}

export function computeRMS(buffer: Float32Array): number {
  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i]
  }
  return Math.sqrt(sum / buffer.length)
}
