# Bansuri Practice Assistant

A web application that helps complete beginners learn Bansuri without a teacher. It listens to your microphone in real time, detects the note you're playing, and provides immediate visual feedback.

## Features

- **Real-time pitch detection** using the YIN algorithm via AudioWorklet for low latency
- **Free Practice** — tuner-style feedback with stability graph and breath control indicator
- **Guided Practice** — follow-along exercises with note-by-note feedback
- **Note Trainer** — random note identification practice
- **Scale Trainer** — ascending and descending major scale practice
- **Note Reference** — hear reference tones for each note
- **Progress tracking** — streaks, session history, accuracy by note
- **Onboarding** — select your bansuri key (C through B) for correct note mapping
- **Educational panel** — short explanations of Sa, Re, Ga, tuning, and scales

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS 4
- Web Audio API + AudioWorklet
- YIN pitch detection algorithm
- React Router
- localStorage for persistence

## Getting Started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`). Allow microphone access when prompted.

### Build for production

```bash
npm run build
npm run preview
```

## Usage Tips

1. **Select your flute key** on first launch — this sets Sa to match your bansuri.
2. **Use headphones** if possible to avoid the mic picking up reference tones.
3. **Play in a quiet room** for best detection accuracy.
4. **Hold notes steadily** — the stability meter teaches breath control.

## How Pitch Detection Works

The app uses the [YIN algorithm](https://pmc.ncbi.nlm.nih.gov/articles/PMC2255011/) for fundamental frequency estimation. Audio is processed in an AudioWorklet on a dedicated thread to keep latency under 100ms. Detected frequencies are mapped to Indian classical notes (Sa, Re, Ga, Ma, Pa, Dha, Ni) relative to your flute's key, with temporal smoothing to prevent note flickering.

## Project Structure

```
src/
├── audio/          # YIN algorithm and AudioWorklet processor
├── music/          # Note frequencies, scales, flute key mapping
├── components/     # UI components (tuner, note wheel, detection panel)
├── screens/        # App screens and routes
├── hooks/          # Microphone, pitch detection, tone player
├── context/        # App state and localStorage
└── types/          # TypeScript types
```

## Future Ideas

These features are planned but not implemented:

1. **AI Song Learning** — User enters a song name, system searches online sources, extracts note sequences, user reviews and confirms, song becomes a guided practice exercise.

2. **AI Practice Coach** — Analyze practice recordings, provide personalized feedback, identify weak notes, suggest exercises.

3. **Raga Library** — Guided raga practice.

4. **Audio Recording** — Record and review sessions.

5. **Mobile PWA Support** — Offline practice mode.

## License

MIT
