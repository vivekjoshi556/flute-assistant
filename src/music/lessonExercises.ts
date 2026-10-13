// ─── Lesson Exercises — playable practice tied to each lesson ────────────────

export type EvaluationMode = 'standard' | 'long-tone' | 'ornament' | 'rhythm' | 'glide' | 'stability'

export interface PracticeExercise {
  id: string
  lessonId: string
  title: string
  description: string
  notes: string[]
  successMessage: string
  estimatedMinutes: number
  /** Minimum duration in seconds to hold each note before advancing (for long-tone practice) */
  minHoldDuration?: number
  /** Pitch tolerance in cents (default 35 for most exercises, tighter for komal swars) */
  toleranceCents?: number
  /** Evaluation mode affects how the practice engine evaluates the exercise */
  evaluationMode?: EvaluationMode
  /** For rhythm mode: BPM to use for metronome sync */
  targetBpm?: number
  /** For stability mode: pitch stability threshold (0-100) */
  stabilityThreshold?: number
  /** Polling interval in milliseconds (default 400, faster for ornaments) */
  pollInterval?: number
  /** Number of consecutive matching polls required (default 2, fewer for ornaments) */
  confirmPolls?: number
}

export const LESSON_EXERCISES: PracticeExercise[] = [
  // ── swar-intro ──
  {
    id: 'swar-seven-notes',
    lessonId: 'swar-intro',
    title: 'The Seven Swaras',
    description:
      'Play each shuddha swar in order on your bansuri. Cover the holes for Sa, then open one at a time through Ni. Listen first, then play each note cleanly.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI'],
    successMessage: 'Beautiful! You played all seven shuddha swaras — the foundation of every raag.',
    estimatedMinutes: 5,
  },
  {
    id: 'swar-recognition',
    lessonId: 'swar-intro',
    title: 'Swar Recognition',
    description:
      'Jump between swaras out of order — just like identifying notes by ear. Focus on clear finger transitions on your bansuri.',
    notes: ['SA', 'PA', 'GA', 'RE', 'NI', 'DHA', 'MA', 'SA'],
    successMessage: 'Excellent ear and finger coordination!',
    estimatedMinutes: 4,
  },

  // ── saptak ──
  {
    id: 'saptak-madhya',
    lessonId: 'saptak',
    title: 'Madhya Saptak Scale',
    description:
      'Play the complete middle octave (madhya saptak) — your home register on the bansuri. All notes without dots.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI'],
    successMessage: 'You navigated the madhya saptak with confidence!',
    estimatedMinutes: 5,
  },
  {
    id: 'saptak-taar-sa',
    lessonId: 'saptak',
    title: 'Reach Taar Sa',
    description:
      'Ascend through madhya saptak and reach the upper Sa (taar saptak) using stronger breath — overblowing, not forcing.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI', 'SA↑'],
    successMessage: 'You reached taar saptak! That overblow takes real breath control.',
    estimatedMinutes: 6,
  },

  // ── shuddha-swar ──
  {
    id: 'shuddha-aaroh',
    lessonId: 'shuddha-swar',
    title: 'Shuddha Aaroh',
    description:
      'Ascend the shuddha saptak (Bilawal thaat). Pay extra attention at Ga→Ma and Ni→Sa↑ — those are the narrowest gaps on the bansuri.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI', 'SA↑'],
    successMessage: 'Clean ascending scale! The half-step transitions are the hardest — keep refining them.',
    estimatedMinutes: 6,
  },
  {
    id: 'shuddha-avaroh',
    lessonId: 'shuddha-swar',
    title: 'Shuddha Avaroh',
    description:
      'Descend from taar Sa back to madhya Sa. Descending on bansuri requires controlled breath release — don\'t let notes drop in pitch.',
    notes: ['SA↑', 'NI', 'DHA', 'PA', 'MA', 'GA', 'RE', 'SA'],
    successMessage: 'Smooth descent! Avaroh control is essential for alankars and raag phrases.',
    estimatedMinutes: 6,
  },
  {
    id: 'shuddha-half-steps',
    lessonId: 'shuddha-swar',
    title: 'Half-Step Focus',
    description:
      'Drill the two semitone intervals in the shuddha saptak: Ga→Ma and Ni→Sa. These need precise half-hole and breath control.',
    notes: ['GA', 'MA', 'MA', 'GA', 'NI', 'SA↑', 'SA↑', 'NI'],
    successMessage: 'Those tight intervals are coming together!',
    estimatedMinutes: 5,
  },

  // ── komal-swar ──
  {
    id: 'komal-re-drill',
    lessonId: 'komal-swar',
    title: 'Komal Re — Half-Hole',
    description:
      'Alternate between Sa, komal Re (half-hole), and shuddha Re. Find the sweet spot where komal Re speaks clearly without wobbling.',
    notes: ['SA', 're', 'RE', 're', 'SA'],
    successMessage: 'Komal Re is taking shape! That half-hole technique gets easier with daily practice.',
    estimatedMinutes: 6,
    toleranceCents: 25,
    evaluationMode: 'stability',
    stabilityThreshold: 70,
  },
  {
    id: 'komal-ga-drill',
    lessonId: 'komal-swar',
    title: 'Komal Ga — Half-Hole',
    description:
      'Practice the komal Ga using partial finger coverage. Compare it to shuddha Ga — feel the softer, darker color of the komal form.',
    notes: ['RE', 'ga', 'GA', 'ga', 'RE'],
    successMessage: 'Komal Ga has a distinct mood — you can hear the difference now.',
    estimatedMinutes: 6,
    toleranceCents: 25,
    evaluationMode: 'stability',
    stabilityThreshold: 70,
  },
  {
    id: 'komal-dha-drill',
    lessonId: 'komal-swar',
    title: 'Komal Dha — Half-Hole',
    description:
      'Practice komal Dha using partial finger coverage. This note appears in Bhairavi, Asavari, and Darbari — precise half-hole control is essential.',
    notes: ['PA', 'dha', 'DHA', 'dha', 'PA'],
    successMessage: 'Komal Dha is one of the most challenging komal notes — you\'re building real control.',
    estimatedMinutes: 6,
    toleranceCents: 25,
    evaluationMode: 'stability',
    stabilityThreshold: 70,
  },
  {
    id: 'komal-ni-drill',
    lessonId: 'komal-swar',
    title: 'Komal Ni — Half-Hole',
    description:
      'Practice komal Ni using partial finger coverage. This delicate note appears in Khamaj, Kafi, and Asavari — steady embouchure is key.',
    notes: ['DHA', 'ni', 'NI', 'ni', 'DHA'],
    successMessage: 'Komal Ni requires subtle finger pressure — you\'re developing the sensitivity needed.',
    estimatedMinutes: 6,
    toleranceCents: 25,
    evaluationMode: 'stability',
    stabilityThreshold: 70,
  },
  {
    id: 'komal-bhairavi-snippet',
    lessonId: 'komal-swar',
    title: 'Bhairavi Thaat Snippet',
    description:
      'Play a short Bhairavi thaat phrase with all four komal swaras. Use half-hole technique for re, ga, dha, and ni.',
    notes: ['SA', 're', 'ga', 'MA', 'PA', 'dha', 'ni', 'SA↑'],
    successMessage: 'That Bhairavi color is unmistakable — deep and devotional.',
    estimatedMinutes: 8,
    toleranceCents: 30,
  },
  {
    id: 'komal-isolated-re',
    lessonId: 'komal-swar',
    title: 'Komal Re — Long Tone Calibration',
    description:
      'Hold komal Re for 8+ seconds to calibrate your half-hole technique. Focus on unwavering pitch and steady breath.',
    notes: ['re'],
    successMessage: 'Your komal Re half-hole is stabilizing — this foundation is crucial.',
    estimatedMinutes: 5,
    minHoldDuration: 8,
    toleranceCents: 25,
    evaluationMode: 'long-tone',
  },
  {
    id: 'komal-isolated-ga',
    lessonId: 'komal-swar',
    title: 'Komal Ga — Long Tone Calibration',
    description:
      'Hold komal Ga for 8+ seconds to calibrate your half-hole technique. The finger must be placed precisely and consistently.',
    notes: ['ga'],
    successMessage: 'Komal Ga stability is improving — keep working on that subtle finger placement.',
    estimatedMinutes: 5,
    minHoldDuration: 8,
    toleranceCents: 25,
    evaluationMode: 'long-tone',
  },
  {
    id: 'komal-isolated-dha',
    lessonId: 'komal-swar',
    title: 'Komal Dha — Long Tone Calibration',
    description:
      'Hold komal Dha for 8+ seconds. This is often the most difficult komal note due to finger positioning.',
    notes: ['dha'],
    successMessage: 'Komal Dha long tones are challenging — you\'re building serious technique.',
    estimatedMinutes: 5,
    minHoldDuration: 8,
    toleranceCents: 25,
    evaluationMode: 'long-tone',
  },
  {
    id: 'komal-isolated-ni',
    lessonId: 'komal-swar',
    title: 'Komal Ni — Long Tone Calibration',
    description:
      'Hold komal Ni for 8+ seconds. The upper-register komal requires both finger control and breath support.',
    notes: ['ni'],
    successMessage: 'Komal Ni long tones demand finesse — your control is developing.',
    estimatedMinutes: 5,
    minHoldDuration: 8,
    toleranceCents: 25,
    evaluationMode: 'long-tone',
  },
  {
    id: 'komal-comparison-re',
    lessonId: 'komal-swar',
    title: 'Komal vs Shuddha Re Comparison',
    description:
      'Alternate between komal Re and shuddha Re to hear and feel the microtonal difference. Develop muscle memory for both positions.',
    notes: ['re', 'RE', 're', 'RE', 're', 'RE', 'SA'],
    successMessage: 'You can now distinguish between komal and shuddha Re — a critical skill.',
    estimatedMinutes: 6,
    toleranceCents: 25,
  },
  {
    id: 'komal-comparison-ga',
    lessonId: 'komal-swar',
    title: 'Komal vs Shuddha Ga Comparison',
    description:
      'Alternate between komal Ga and shuddha Ga. The semitone difference creates entirely different moods in raags.',
    notes: ['ga', 'GA', 'ga', 'GA', 'ga', 'GA', 'RE'],
    successMessage: 'The komal/shuddha Ga distinction is becoming instinctive.',
    estimatedMinutes: 6,
    toleranceCents: 25,
  },
  {
    id: 'komal-interval-sa',
    lessonId: 'komal-swar',
    title: 'Sa to Komal Swars Intervals',
    description:
      'Jump from Sa to each komal note directly. This tests your ability to land precisely on half-hole positions from distance.',
    notes: ['SA', 're', 'SA', 'ga', 'SA', 'dha', 'SA', 'ni', 'SA'],
    successMessage: 'Direct jumps to komal notes require quick, precise finger adjustments.',
    estimatedMinutes: 7,
    toleranceCents: 30,
  },
  {
    id: 'komal-interval-pa',
    lessonId: 'komal-swar',
    title: 'Pa to Komal Swars Intervals',
    description:
      'Jump from Pa to each komal note. These intervals appear constantly in raag phrases — master them for fluid playing.',
    notes: ['PA', 're', 'PA', 'ga', 'PA', 'dha', 'PA', 'ni', 'PA'],
    successMessage: 'Pa-to-komal intervals are foundational — excellent work.',
    estimatedMinutes: 7,
    toleranceCents: 30,
  },

  // ── teevra-swar ──
  {
    id: 'teevra-ma-drill',
    lessonId: 'teevra-swar',
    title: 'Shuddha Ma ↔ Teevra Ma',
    description:
      'Alternate between shuddha Ma and teevra Ma using cross-fingering. This is the heart of Raag Yaman.',
    notes: ['MA', 'Ma↑', 'PA', 'Ma↑', 'MA', 'GA'],
    successMessage: 'Teevra Ma shines! That bright, yearning quality defines Kalyan thaat.',
    estimatedMinutes: 7,
  },
  {
    id: 'teevra-yaman-phrase',
    lessonId: 'teevra-swar',
    title: 'Yaman Opening Phrase',
    description:
      'Practice the classic Yaman ascent: Ni Re Ga Ma↑ Pa. Teevra Ma is the note that lifts the whole phrase.',
    notes: ['NI', 'RE', 'GA', 'Ma↑', 'PA', 'DHA', 'NI', 'SA↑'],
    successMessage: 'That Yaman glow — you captured the essence of Kalyan thaat!',
    estimatedMinutes: 8,
  },

  // ── thaat-system ──
  {
    id: 'thaat-bilawal',
    lessonId: 'thaat-system',
    title: 'Bilawal Thaat',
    description: 'All shuddha swaras — the reference thaat. Play the full ascending and descending Bilawal scale on your bansuri.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI', 'SA↑', 'NI', 'DHA', 'PA', 'MA', 'GA', 'RE', 'SA'],
    successMessage: 'Bilawal thaat mastered — every note pure and shuddha.',
    estimatedMinutes: 7,
  },
  {
    id: 'thaat-kalyan',
    lessonId: 'thaat-system',
    title: 'Kalyan Thaat',
    description: 'Kalyan thaat uses teevra Ma with all other swaras shuddha. This is the scale of Raag Yaman.',
    notes: ['SA', 'RE', 'GA', 'Ma↑', 'PA', 'DHA', 'NI', 'SA↑'],
    successMessage: 'Kalyan thaat — luminous and romantic!',
    estimatedMinutes: 7,
  },
  {
    id: 'thaat-bhairavi',
    lessonId: 'thaat-system',
    title: 'Bhairavi Thaat',
    description: 'All four komal swaras (re, ga, dha, ni) with shuddha Sa, Ma, and Pa. The most emotionally rich thaat.',
    notes: ['SA', 're', 'ga', 'MA', 'PA', 'dha', 'ni', 'SA↑'],
    successMessage: 'Bhairavi thaat — deep devotion in every note.',
    estimatedMinutes: 8,
  },
  {
    id: 'thaat-khamaj',
    lessonId: 'thaat-system',
    title: 'Khamaj Thaat',
    description: 'Khamaj thaat uses only komal Ni, all other swaras are shuddha. Light and playful in character — home of Raag Khamaj and Raag Des.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'ni', 'SA↑', 'ni', 'DHA', 'PA', 'MA', 'GA', 'RE', 'SA'],
    successMessage: 'Khamaj thaat — notice how that single komal Ni lends the scale its romantic lightness.',
    estimatedMinutes: 7,
  },
  {
    id: 'thaat-bhairav',
    lessonId: 'thaat-system',
    title: 'Bhairav Thaat',
    description: 'Bhairav thaat uses komal Re and komal Dha with all other swaras shuddha. Its solemn, majestic color is associated with early morning.',
    notes: ['SA', 're', 'GA', 'MA', 'PA', 'dha', 'NI', 'SA↑', 'NI', 'dha', 'PA', 'MA', 'GA', 're', 'SA'],
    successMessage: 'Bhairav thaat — grave and majestic, like the breaking of dawn.',
    estimatedMinutes: 8,
  },
  {
    id: 'thaat-poorvi',
    lessonId: 'thaat-system',
    title: 'Poorvi Thaat',
    description: 'Poorvi thaat combines komal Re, teevra Ma, and komal Dha. This unusual blend gives it a serious, introspective evening quality.',
    notes: ['SA', 're', 'GA', 'Ma↑', 'PA', 'dha', 'NI', 'SA↑'],
    successMessage: 'Poorvi thaat — the teevra Ma and twin komal notes create a deeply contemplative sound.',
    estimatedMinutes: 8,
  },
  {
    id: 'thaat-marwa',
    lessonId: 'thaat-system',
    title: 'Marwa Thaat',
    description: 'Marwa thaat uses komal Re and teevra Ma with all other swaras shuddha. Its restless, urgent mood is heightened by the avoidance of Pa in its primary raag.',
    notes: ['SA', 're', 'GA', 'Ma↑', 'PA', 'DHA', 'NI', 'SA↑'],
    successMessage: 'Marwa thaat — intense and yearning, especially at sunset.',
    estimatedMinutes: 7,
  },
  {
    id: 'thaat-kafi',
    lessonId: 'thaat-system',
    title: 'Kafi Thaat',
    description: 'Kafi thaat uses komal Ga and komal Ni with all other swaras shuddha. It has a romantic, devotional quality heard in folk and semi-classical music.',
    notes: ['SA', 'RE', 'ga', 'MA', 'PA', 'DHA', 'ni', 'SA↑', 'ni', 'DHA', 'PA', 'MA', 'ga', 'RE', 'SA'],
    successMessage: 'Kafi thaat — the komal Ga and Ni pair gives it that wistful, folk-like sweetness.',
    estimatedMinutes: 7,
  },
  {
    id: 'thaat-asavari',
    lessonId: 'thaat-system',
    title: 'Asavari Thaat',
    description: 'Asavari thaat uses komal Ga, komal Dha, and komal Ni. Its three komal swaras create a mood of pathos and deep contemplation — home of the grand Raag Darbari.',
    notes: ['SA', 'RE', 'ga', 'MA', 'PA', 'dha', 'ni', 'SA↑', 'ni', 'dha', 'PA', 'MA', 'ga', 'RE', 'SA'],
    successMessage: 'Asavari thaat — three komal swaras weaving a carpet of dignified sorrow.',
    estimatedMinutes: 8,
  },
  {
    id: 'thaat-todi',
    lessonId: 'thaat-system',
    title: 'Todi Thaat',
    description: 'Todi thaat is one of the most complex: komal Re, komal Ga, teevra Ma, and komal Dha together. Its intense longing and intricacy make it the pinnacle of advanced study.',
    notes: ['SA', 're', 'ga', 'Ma↑', 'PA', 'dha', 'NI', 'SA↑'],
    successMessage: 'Todi thaat — four altered swaras, one extraordinary sound. This is advanced territory!',
    estimatedMinutes: 9,
  },

  // ── aaroh-avaroh ──
  {
    id: 'aaroh-sampurna',
    lessonId: 'aaroh-avaroh',
    title: 'Sampurna Aaroh-Avaroh',
    description: 'Complete seven-note ascending and descending — the simplest aaroh-avaroh pattern used in Raag Bilawal.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI', 'SA↑', 'NI', 'DHA', 'PA', 'MA', 'GA', 'RE', 'SA'],
    successMessage: 'Sampurna movement flows naturally now.',
    estimatedMinutes: 6,
  },
  {
    id: 'aaroh-bhupali',
    lessonId: 'aaroh-avaroh',
    title: 'Raag Bhupali (Pentatonic)',
    description: 'Bhupali skips Ma and Ni entirely — an audav (five-note) raag. Feel how the missing notes create an open, serene space.',
    notes: ['SA', 'RE', 'GA', 'PA', 'DHA', 'SA↑', 'DHA', 'PA', 'GA', 'RE', 'SA'],
    successMessage: 'Bhupali\'s pentatonic serenity — beautiful!',
    estimatedMinutes: 7,
  },
  {
    id: 'aaroh-yaman',
    lessonId: 'aaroh-avaroh',
    title: 'Raag Yaman Aaroh',
    description: 'Yaman\'s distinctive ascending pattern with teevra Ma. Notice how it avoids landing on Sa at the start.',
    notes: ['NI', 'RE', 'GA', 'Ma↑', 'PA', 'DHA', 'NI', 'SA↑'],
    successMessage: 'Yaman\'s ascending arc — instantly recognizable!',
    estimatedMinutes: 7,
  },

  // ── vadi-samvadi ──
  {
    id: 'vadi-yaman-ga',
    lessonId: 'vadi-samvadi',
    title: 'Yaman — Emphasize Ga (Vadi)',
    description: 'In Raag Yaman, Ga is the vadi (king note). Play phrases that return to and sustain Ga.',
    notes: ['NI', 'RE', 'GA', 'PA', 'GA', 'RE', 'GA', 'Ma↑', 'GA'],
    successMessage: 'Ga feels like home in this phrase — that\'s the vadi at work.',
    estimatedMinutes: 6,
  },
  {
    id: 'vadi-bhupali',
    lessonId: 'vadi-samvadi',
    title: 'Bhupali — Ga & Dha Pair',
    description: 'Bhupali\'s vadi is Ga and samvadi is Dha (a fourth apart). Practice the signature descent Ga Re Sa and ascent to Dha.',
    notes: ['GA', 'RE', 'SA', 'RE', 'GA', 'PA', 'DHA', 'PA', 'GA'],
    successMessage: 'The Ga-Dha conversation defines Bhupali\'s peaceful character.',
    estimatedMinutes: 6,
  },

  // ── taal-intro ──
  {
    id: 'taal-sam-pulse',
    lessonId: 'taal-intro',
    title: 'Sam Pulse — Teentaal',
    description:
      'Hold Sa on beats 1, 5, and 13 of Teentaal (16 beats). Internalize the sam — the arrival point of the cycle. Tap your foot on each Sa.',
    notes: ['SA', 'SA', 'SA', 'SA'],
    successMessage: 'You felt the sam! Rhythm starts with internalizing this pulse.',
    estimatedMinutes: 5,
    evaluationMode: 'rhythm',
    targetBpm: 60,
  },
  {
    id: 'taal-sargam-cycle',
    lessonId: 'taal-intro',
    title: 'Sargam in Teentaal',
    description:
      'Play one swar per beat through a full Teentaal cycle (16 notes). This connects your sargam to rhythmic time.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI', 'SA↑', 'NI', 'DHA', 'PA', 'MA', 'GA', 'RE', 'SA', 'SA'],
    successMessage: 'Sargam locked to rhythm — a crucial skill for performance.',
    estimatedMinutes: 7,
    evaluationMode: 'rhythm',
    targetBpm: 60,
  },

  // ── laya-tempo ──
  {
    id: 'laya-long-tones',
    lessonId: 'laya-tempo',
    title: 'Vilambit Long Tones',
    description:
      'Hold each note for several seconds at vilambit (slow) laya. Focus on steady breath and unwavering pitch — not speed.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI'],
    successMessage: 'Steady long tones build the breath foundation for everything else.',
    estimatedMinutes: 6,
    minHoldDuration: 8,
    evaluationMode: 'long-tone',
  },
  {
    id: 'laya-speed-ladder',
    lessonId: 'laya-tempo',
    title: 'Speed Ladder',
    description:
      'Play Sa Re Ga Ma Pa at a comfortable madhya laya. Repeat faster each round — but only as fast as you can stay clean.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'MA', 'GA', 'RE', 'SA'],
    successMessage: 'Speed with clarity — that\'s the goal of laya practice.',
    estimatedMinutes: 5,
  },

  // ── alankar-theory ──
  {
    id: 'alankar-ascending-3',
    lessonId: 'alankar-theory',
    title: '3-Note Ascending Alankar',
    description: 'Classic ascending alankar: Sa Re Ga, Re Ga Ma, Ga Ma Pa… Each group shifts up one swar.',
    notes: ['SA', 'RE', 'GA', 'RE', 'GA', 'MA', 'GA', 'MA', 'PA', 'MA', 'PA', 'DHA', 'PA', 'DHA', 'NI'],
    successMessage: 'Ascending alankars build finger fluency for upward phrases.',
    estimatedMinutes: 7,
  },
  {
    id: 'alankar-zigzag',
    lessonId: 'alankar-theory',
    title: 'Zigzag Alankar',
    description: 'Mixed alankar with direction changes: Sa Re Ga Re, Re Ga Ma Ga. These appear constantly in raag performance.',
    notes: ['SA', 'RE', 'GA', 'RE', 'RE', 'GA', 'MA', 'GA', 'GA', 'MA', 'PA', 'MA'],
    successMessage: 'Smooth direction changes — the mark of a musical alankar.',
    estimatedMinutes: 7,
  },

  // ── raag-basics ──
  {
    id: 'raag-yaman-pakad',
    lessonId: 'raag-basics',
    title: 'Yaman Pakad',
    description: 'The signature catch phrase (pakad) of Raag Yaman: Ni Re Ga, Re Ga Ma↑ Pa. This instantly identifies the raag.',
    notes: ['NI', 'RE', 'GA', 'RE', 'GA', 'Ma↑', 'PA'],
    successMessage: 'That\'s Yaman! The pakad is the raag\'s fingerprint.',
    estimatedMinutes: 7,
  },
  {
    id: 'raag-bhupali-aaroh',
    lessonId: 'raag-basics',
    title: 'Bhupali Aaroh-Avaroh',
    description: 'Full pentatonic movement of beginner-friendly Raag Bhupali — serene and devotional.',
    notes: ['SA', 'RE', 'GA', 'PA', 'DHA', 'SA↑', 'DHA', 'PA', 'GA', 'RE', 'SA'],
    successMessage: 'Bhupali\'s peaceful arc — a perfect beginner raag.',
    estimatedMinutes: 7,
  },

  // ── meend-gamak ──
  {
    id: 'meend-adjacent',
    lessonId: 'meend-gamak',
    title: 'Meend — Adjacent Notes',
    description:
      'Practice slow glides between adjacent swaras on your bansuri. In play mode, hit each note cleanly; use Listen to hear the ideal meend shape, then imitate with finger slides.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI'],
    successMessage: 'Adjacent meends are the building blocks of bansuri expression.',
    estimatedMinutes: 7,
    evaluationMode: 'glide',
  },
  {
    id: 'meend-kan-swar',
    lessonId: 'meend-gamak',
    title: 'Kan Swar — Grace Notes',
    description:
      'Quick touch of Re before Ga (Re-Ga), and Ga before Ma (Ga-Ma). Kan should feel like a flicker, not a separate note.',
    notes: ['RE', 'GA', 'GA', 'MA', 'RE', 'GA', 'GA', 'MA', 'MA', 'PA'],
    successMessage: 'Grace notes add sparkle — keep them light and fleeting.',
    estimatedMinutes: 6,
    evaluationMode: 'ornament',
    minHoldDuration: 0.15,
    pollInterval: 100,
    confirmPolls: 1,
  },
  {
    id: 'khatka-basic',
    lessonId: 'meend-gamak',
    title: 'Khatka — Rapid Turn',
    description:
      'Practice a basic khatka around Sa: Re-Sa-Ni-Sa. The turn should be crisp, rhythmic, and energetic.',
    notes: ['RE', 'SA', 'NI', 'SA'],
    successMessage: 'Khatka requires crisp finger work — your turns are getting sharper.',
    estimatedMinutes: 5,
    evaluationMode: 'ornament',
    minHoldDuration: 0.12,
    pollInterval: 100,
    confirmPolls: 1,
  },
  {
    id: 'khatka-pa',
    lessonId: 'meend-gamak',
    title: 'Khatka around Pa',
    description:
      'Khatka centered on Pa: Dha-Pa-Ma-Pa. Practice this rapid turn which appears in many raag phrases.',
    notes: ['DHA', 'PA', 'MA', 'PA'],
    successMessage: 'Pa-centered khatkas add rhythmic excitement to phrases.',
    estimatedMinutes: 5,
    evaluationMode: 'ornament',
    minHoldDuration: 0.12,
    pollInterval: 100,
    confirmPolls: 1,
  },
  {
    id: 'murki-basic',
    lessonId: 'meend-gamak',
    title: 'Murki — Delicate Swirl',
    description:
      'Practice a delicate murki: Ga-Ma-Ga-RE-Ga. Murki should feel light and decorative, not forceful.',
    notes: ['GA', 'MA', 'GA', 'RE', 'GA'],
    successMessage: 'Murki adds a delicate sparkle — keep it light and flowing.',
    estimatedMinutes: 5,
    evaluationMode: 'ornament',
    minHoldDuration: 0.1,
    pollInterval: 80,
    confirmPolls: 1,
  },
  {
    id: 'gamak-basic',
    lessonId: 'meend-gamak',
    title: 'Gamak — Heavy Oscillation',
    description:
      'Practice heavy oscillation between Sa and RE. Gamak requires strong diaphragmic pulse and rhythmic finger movement.',
    notes: ['SA', 'RE', 'SA', 'RE', 'SA', 'RE', 'SA'],
    successMessage: 'Gamak develops breath power and rhythmic control.',
    estimatedMinutes: 6,
    evaluationMode: 'glide',
  },
  {
    id: 'andolan-ga',
    lessonId: 'meend-gamak',
    title: 'Andolan on Komal Ga',
    description:
      'Practice slow, sweeping microtonal oscillation around komal Ga — the signature movement of Raag Darbari and Todi.',
    notes: ['ga'],
    successMessage: 'Andolan requires subtle control — you\'re developing the delicate touch needed.',
    estimatedMinutes: 7,
    evaluationMode: 'stability',
    minHoldDuration: 6,
    toleranceCents: 20,
    stabilityThreshold: 60,
  },
  {
    id: 'andolan-dha',
    lessonId: 'meend-gamak',
    title: 'Andolan on Komal Dha',
    description:
      'Practice slow oscillation around komal Dha, another key andolan note in Darbari. Move within a narrow pitch band.',
    notes: ['dha'],
    successMessage: 'Komal Dha andolan is challenging — your control is impressive.',
    estimatedMinutes: 7,
    evaluationMode: 'stability',
    minHoldDuration: 6,
    toleranceCents: 20,
    stabilityThreshold: 60,
  },

  // ── breath-tone ──
  {
    id: 'breath-long-tones',
    lessonId: 'breath-tone',
    title: 'Long Tone Scale',
    description:
      'The single best tone exercise: hold each swar as long as possible with steady, even sound. Aim for 8+ seconds per note.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI', 'SA↑'],
    successMessage: 'Your breath and embouchure are strengthening with every long tone.',
    estimatedMinutes: 8,
    minHoldDuration: 8,
    evaluationMode: 'long-tone',
  },
  {
    id: 'breath-octave-jump',
    lessonId: 'breath-tone',
    title: 'Register Transition',
    description:
      'Jump between madhya Sa and taar Sa. The shift is about breath speed, not force — like cooling soup vs. blowing out a candle.',
    notes: ['SA', 'SA↑', 'SA', 'SA↑', 'RE', 'RE↑', 'GA', 'GA↑'],
    successMessage: 'Clean octave jumps — your overblowing technique is developing!',
    estimatedMinutes: 6,
  },

  // ── daily-routine ──
  {
    id: 'routine-warmup',
    lessonId: 'daily-routine',
    title: 'Daily Warm-Up',
    description: 'Start every riyaz session with this warm-up: shuddha saptak ascending slowly, focusing on tone not speed.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI', 'SA↑'],
    successMessage: 'Warm-up complete — you\'re ready for deeper practice.',
    estimatedMinutes: 5,
  },
  {
    id: 'routine-full-cycle',
    lessonId: 'daily-routine',
    title: 'Full Practice Cycle',
    description: 'A condensed daily routine: warm-up scale, alankar snippet, and cool-down descent.',
    notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI', 'SA↑', 'GA', 'MA', 'PA', 'NI', 'DHA', 'PA', 'MA', 'GA', 'RE', 'SA'],
    successMessage: 'Full cycle done — consistent riyaz compounds over weeks.',
    estimatedMinutes: 8,
  },
]

export function getExerciseById(id: string): PracticeExercise | undefined {
  return LESSON_EXERCISES.find((e) => e.id === id)
}

export function getExercisesByLesson(lessonId: string): PracticeExercise[] {
  return LESSON_EXERCISES.filter((e) => e.lessonId === lessonId)
}

export function getExercisesGroupedByLesson(): {
  lessonId: string
  exercises: PracticeExercise[]
}[] {
  const seen = new Set<string>()
  const groups: { lessonId: string; exercises: PracticeExercise[] }[] = []
  for (const ex of LESSON_EXERCISES) {
    if (!seen.has(ex.lessonId)) {
      seen.add(ex.lessonId)
      groups.push({
        lessonId: ex.lessonId,
        exercises: getExercisesByLesson(ex.lessonId),
      })
    }
  }
  return groups
}
