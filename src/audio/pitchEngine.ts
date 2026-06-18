import { detectPitchYIN, computeRMS } from './yin'

const WORKLET_CODE = `
class PitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this._bufferSize = 2048
    this._buffer = new Float32Array(this._bufferSize)
    this._bufferIndex = 0
  }

  yin(buffer, sampleRate) {
    const YIN_THRESHOLD = 0.15
    const MIN_FREQ = 80
    const MAX_FREQ = 1200
    const bufferSize = buffer.length
    const halfSize = Math.floor(bufferSize / 2)
    if (halfSize < 2) return { frequency: 0, confidence: 0, volume: 0 }

    let rms = 0
    for (let i = 0; i < bufferSize; i++) rms += buffer[i] * buffer[i]
    rms = Math.sqrt(rms / bufferSize)
    if (rms < 0.02) return { frequency: 0, confidence: 0, volume: rms }

    const yinBuffer = new Float32Array(halfSize)
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
      yinBuffer[tau] = runningSum !== 0 ? (yinBuffer[tau] * tau) / runningSum : 1
    }

    let tauEstimate = -1
    for (let tau = 2; tau < halfSize; tau++) {
      if (yinBuffer[tau] < YIN_THRESHOLD) {
        while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) tau++
        tauEstimate = tau
        break
      }
    }

    if (tauEstimate === -1) {
      let minVal = Infinity
      for (let tau = 2; tau < halfSize; tau++) {
        if (yinBuffer[tau] < minVal) { minVal = yinBuffer[tau]; tauEstimate = tau }
      }
      if (minVal > 0.5) return { frequency: 0, confidence: 0, volume: rms }
    }

    const x0 = tauEstimate > 0 ? tauEstimate - 1 : tauEstimate
    const x2 = tauEstimate + 1 < halfSize ? tauEstimate + 1 : tauEstimate
    let betterTau = tauEstimate
    if (x0 !== tauEstimate && x2 !== tauEstimate) {
      const s0 = yinBuffer[x0], s1 = yinBuffer[tauEstimate], s2 = yinBuffer[x2]
      betterTau = tauEstimate + (s2 - s0) / (2 * (2 * s1 - s2 - s0))
    }

    const frequency = sampleRate / betterTau
    if (frequency < MIN_FREQ || frequency > MAX_FREQ) return { frequency: 0, confidence: 0, volume: rms }
    const confidence = Math.max(0, Math.min(1, 1 - yinBuffer[tauEstimate]))
    return { frequency, confidence, volume: rms }
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || !input[0]) return true
    const channel = input[0]

    for (let i = 0; i < channel.length; i++) {
      this._buffer[this._bufferIndex++] = channel[i]
      if (this._bufferIndex >= this._bufferSize) {
        const result = this.yin(this._buffer, sampleRate)
        this.port.postMessage(result)
        this._bufferIndex = 0
      }
    }
    return true
  }
}
registerProcessor('pitch-processor', PitchProcessor)
`

let workletUrl: string | null = null

export function getWorkletUrl(): string {
  if (!workletUrl) {
    const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' })
    workletUrl = URL.createObjectURL(blob)
  }
  return workletUrl
}

export { detectPitchYIN, computeRMS }
