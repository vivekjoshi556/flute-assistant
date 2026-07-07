// ─── Lesson Data — Indian Classical Music Theory for Bansuri ────────────────

export interface LessonSection {
  type: 'text' | 'note-diagram' | 'comparison' | 'tip'
  title?: string
  content: string
  notes?: string[]
  items?: { label: string; description: string }[]
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Lesson {
  id: string
  title: string
  module: string
  moduleOrder: number
  order: number
  estimatedMinutes: number
  icon: string
  sections: LessonSection[]
  keyTerms: { term: string; definition: string }[]
  quiz: QuizQuestion[]
  practiceLink?: string
}

export const MODULES: {
  id: string
  name: string
  icon: string
  description: string
  order: number
}[] = [
  {
    id: 'foundations',
    name: 'Foundations',
    icon: '🏛️',
    description:
      'Master the building blocks — swaras, saptaks, and the shuddha/komal/teevra system.',
    order: 1,
  },
  {
    id: 'scales',
    name: 'Scales & Structure',
    icon: '🎼',
    description:
      'Understand thaats, aaroh-avaroh patterns, and how raags are structured.',
    order: 2,
  },
  {
    id: 'rhythm',
    name: 'Rhythm & Practice',
    icon: '🥁',
    description:
      'Learn taals, laya concepts, and alankar patterns for disciplined practice.',
    order: 3,
  },
  {
    id: 'applied',
    name: 'Applied Theory',
    icon: '🎵',
    description:
      'Put it all together — raag exploration, ornamentation, breath control, and daily routine.',
    order: 4,
  },
]

export const LESSONS: Lesson[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 1 — FOUNDATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'swar-intro',
    title: 'Introduction to Swar (Notes)',
    module: 'foundations',
    moduleOrder: 1,
    order: 1,
    estimatedMinutes: 8,
    icon: '🎶',
    sections: [
      {
        type: 'text',
        title: 'What is a Swar?',
        content:
          'In Indian classical music, a **swar** (स्वर) is a single musical note — the most fundamental unit of melody. The word comes from Sanskrit and literally means "that which shines by itself." Indian music names its seven notes **Sa, Re, Ga, Ma, Pa, Dha, Ni** — and on the bansuri, each one corresponds to a specific fingering and breath pressure.\n\nThe concept of swar goes beyond mere pitch. Each swar carries an emotional character, a specific aesthetic quality called **rasa**. Ancient texts describe Sa as evoking steadfastness, Re as excitement, Ga as joy, and so on. When you play a note on your bansuri, you are not just producing a frequency — you are invoking a mood.',
      },
      {
        type: 'note-diagram',
        title: 'The Seven Shuddha Swaras',
        content:
          'These are the seven natural (shuddha) notes with their full Sanskrit names. Together they form the **Shuddha Saptak** — the natural octave.',
        notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI'],
      },
      {
        type: 'comparison',
        title: 'Full Sanskrit Names on the Bansuri',
        content:
          'Each swar has a full Sanskrit name derived from ancient Vedic chanting traditions. On the bansuri, Sa is your home note — all holes covered — and every other swar is measured as an interval from Sa:',
        items: [
          { label: 'SA — Shadja (षड्ज)', description: 'The "birth of six" — your bansuri\'s tonic with all holes covered. The foundation from which every other swar is measured.' },
          { label: 'RE — Rishabh (ऋषभ)', description: 'Named after the bull — strong and assertive. One whole tone above Sa on the bansuri.' },
          { label: 'GA — Gandhar (गान्धार)', description: 'Named after the Gandhara region — sweet and melodic. Two whole tones above Sa.' },
          { label: 'MA — Madhyam (मध्यम)', description: 'The "middle" note — pivotal in every raag. Two and a half tones above Sa; a narrower gap from Ga.' },
          { label: 'PA — Pancham (पंचम)', description: 'The "fifth" — pure and resonant. Always a perfect fifth above Sa; never altered (achala).' },
          { label: 'DHA — Dhaivat (धैवत)', description: 'Associated with devotion and gravity. Three and a half tones above Sa.' },
          { label: 'NI — Nishad (निषाद)', description: 'The "calling" note — creates tension before resolution to Sa. Four and a half tones above Sa.' },
        ],
      },
      {
        type: 'tip',
        title: 'Movable Sa on Your Bansuri',
        content:
          '**Sa is movable** — it is set to whatever pitch your bansuri is tuned to. If you have a longer bass bansuri, your Sa sits lower; a shorter flute gives a higher Sa. Every other swar is then defined as an interval *relative* to Sa, not by an absolute pitch name.\n\nThis is why two bansuri players on different-sized flutes can play together in the same raag — they agree on the intervals (Sa Re Ga Ma…), not on matching absolute frequencies. When you pick your bansuri key during onboarding, you are choosing which pitch becomes your Sa.',
      },
    ],
    keyTerms: [
      { term: 'Swar (स्वर)', definition: 'A musical note; the fundamental unit of melody in Indian classical music.' },
      { term: 'Shadja (षड्ज)', definition: 'The first and most important swar (Sa), meaning "birth of six" — all other notes are derived from it.' },
      { term: 'Shuddha', definition: 'Natural or pure — refers to the unaltered form of a swar.' },
      { term: 'Movable Sa', definition: 'The Indian system where Sa is not fixed to a specific pitch but set to whatever the instrument is tuned to.' },
    ],
    quiz: [
      {
        question: 'How many shuddha (natural) swaras are there in Indian classical music?',
        options: ['5', '7', '12', '8'],
        correctIndex: 1,
        explanation: 'There are 7 shuddha swaras: Sa, Re, Ga, Ma, Pa, Dha, and Ni. These form the complete natural scale (shuddha saptak).',
      },
      {
        question: 'What does "Movable Sa" mean?',
        options: [
          'Sa changes pitch during a performance',
          'Sa is always the note C',
          'Sa is set to the tonic pitch of the instrument, not a fixed frequency',
          'Sa can be any of the 12 chromatic notes during a raag',
        ],
        correctIndex: 2,
        explanation: 'Movable Sa means the tonic (Sa) is defined by the instrument\'s tuning. On a G-key bansuri, Sa=G. All other swaras are defined by their interval from Sa.',
      },
      {
        question: 'What is the full name of "Pa"?',
        options: ['Pancham', 'Prathama', 'Panchavati', 'Padma'],
        correctIndex: 0,
        explanation: 'Pa is short for Pancham (पंचम), meaning "the fifth." It is always a perfect fifth above Sa and, like Sa, is never altered (no komal or teevra form).',
      },
    ],
    practiceLink: '/practice/guided',
  },

  {
    id: 'saptak',
    title: 'Saptak (Octaves)',
    module: 'foundations',
    moduleOrder: 1,
    order: 2,
    estimatedMinutes: 7,
    icon: '📊',
    sections: [
      {
        type: 'text',
        title: 'What is a Saptak?',
        content:
          'A **saptak** (सप्तक) literally means "a group of seven" — it is the full span from one Sa to the next Sa on your bansuri. Each saptak contains the complete set of seven swaras from Sa to Ni.\n\nWhen you play Sa on your bansuri and then play higher notes until you reach the next Sa, you have traversed one saptak. The higher Sa vibrates at exactly twice the frequency of the lower Sa — this 2:1 ratio is the acoustic basis of the octave.',
      },
      {
        type: 'comparison',
        title: 'The Three Saptaks',
        content:
          'Indian classical music typically uses three saptaks for performance. On the bansuri, these correspond to different fingering ranges:',
        items: [
          { label: 'Mandra Saptak (मंद्र) — Lower Octave', description: 'The lowest register. Notes are written with a dot below (e.g., Ṡa). On bansuri, these are the deepest tones produced with all or most holes covered and gentle breath. The mandra saptak has a meditative, grounding quality.' },
          { label: 'Madhya Saptak (मध्य) — Middle Octave', description: 'The home register and most commonly used range. Notes are written without any dots. This is where most of your practice will begin. On a typical bansuri, the madhya saptak is the most naturally resonant range.' },
          { label: 'Taar Saptak (तार) — Upper Octave', description: 'The highest register. Notes are written with a dot above (e.g., Ṡa). Produced by overblowing — using stronger, faster breath to excite higher harmonics. Requires good embouchure control.' },
        ],
      },
      {
        type: 'note-diagram',
        title: 'Bansuri Range Across Saptaks',
        content:
          'A standard 6-hole bansuri can comfortably play from the lower Pa of the mandra saptak to the upper Sa/Re of the taar saptak — roughly 1.5 to 2 octaves. Here are the madhya saptak notes:',
        notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI'],
      },
      {
        type: 'tip',
        title: 'Notation Convention',
        content:
          'In written Indian music notation:\n• **Mandra saptak** notes have a **dot below**: Ṣa, Ṛe, Ġa, etc.\n• **Madhya saptak** notes are written **plain**: Sa, Re, Ga, etc.\n• **Taar saptak** notes have a **dot above**: Ṡa, Ṙe, Ġa, etc.\n\nIn this app, we use the octave number (e.g., SA in octave 4 vs octave 5) and the ↑ symbol for taar saptak Sa.',
      },
    ],
    keyTerms: [
      { term: 'Saptak (सप्तक)', definition: 'An octave — a complete group of seven swaras from Sa to Ni.' },
      { term: 'Mandra', definition: 'Lower octave register, producing deep, meditative tones.' },
      { term: 'Madhya', definition: 'Middle octave register — the primary range for most practice and performance.' },
      { term: 'Taar', definition: 'Upper octave register, reached by overblowing on the bansuri.' },
    ],
    quiz: [
      {
        question: 'What does "saptak" literally mean?',
        options: ['Seven strings', 'A group of seven', 'Musical scale', 'Twelve tones'],
        correctIndex: 1,
        explanation: '"Saptak" comes from the Sanskrit word for seven (sapta). It refers to the group of seven swaras that make up an octave.',
      },
      {
        question: 'How are Taar Saptak notes indicated in traditional notation?',
        options: [
          'With a dot below the note',
          'In bold text',
          'With a dot above the note',
          'With an underline',
        ],
        correctIndex: 2,
        explanation: 'Taar saptak (upper octave) notes are written with a dot above them. Mandra saptak (lower octave) notes have a dot below.',
      },
      {
        question: 'Which saptak is the "home register" for most bansuri practice?',
        options: ['Mandra', 'Madhya', 'Taar', 'Ati-Taar'],
        correctIndex: 1,
        explanation: 'The Madhya (middle) saptak is the primary range for bansuri practice. Notes in this register are written without dots.',
      },
    ],
    practiceLink: '/scale-trainer',
  },

  {
    id: 'shuddha-swar',
    title: 'Shuddha Swar (Natural Notes)',
    module: 'foundations',
    moduleOrder: 1,
    order: 3,
    estimatedMinutes: 10,
    icon: '✨',
    sections: [
      {
        type: 'text',
        title: 'The Pure Notes',
        content:
          'The **shuddha swaras** (शुद्ध स्वर) are the seven "pure" or "natural" notes in their unaltered form. Together they form the shuddha saptak — the default scale on your bansuri with standard fingerings and no half-holes. When someone says "Sa Re Ga Ma Pa Dha Ni" without any qualifier, they mean the shuddha forms.\n\nThe shuddha swaras define the **Bilawal thaat** — one of the 10 parent scales in Hindustani music. This scale is the reference point against which all alterations (komal and teevra) are measured. Think of shuddha swaras as the "default" setting — every other variation is a departure from this baseline.',
      },
      {
        type: 'comparison',
        title: 'Intervals Between Shuddha Swaras on Bansuri',
        content:
          'The gaps between consecutive shuddha swaras follow a specific pattern. On the bansuri, whole-tone gaps feel like a full finger change; half-tone gaps (Ga→Ma and Ni→Sa) require tighter finger control:',
        items: [
          { label: 'Sa → Re: Whole tone', description: 'A full tone gap — open one more hole from Sa. The most natural first step on the bansuri.' },
          { label: 'Re → Ga: Whole tone', description: 'Another full tone — continue opening holes sequentially.' },
          { label: 'Ga → Ma: Half tone', description: 'A narrow gap — the scale "tightens" here. This transition needs precise fingering on the bansuri.' },
          { label: 'Ma → Pa: Whole tone', description: 'Full tone — a comfortable leap after the tight Ga→Ma interval.' },
          { label: 'Pa → Dha: Whole tone', description: 'Full tone — Pa is achala (immovable) and very stable on the bansuri.' },
          { label: 'Dha → Ni: Whole tone', description: 'Full tone — approaching the top of the madhya saptak.' },
          { label: 'Ni → Sa (upper): Half tone', description: 'The scale narrows again before resolving to the upper Sa — another half-step to master.' },
        ],
      },
      {
        type: 'text',
        title: 'Frequency Ratios — The Acoustic Foundation',
        content:
          'Ancient Indian theorists (like Bharata in the Natyashastra) described swaras through frequency ratios relative to Sa:\n\n• **Sa** = 1:1 (fundamental — all holes covered)\n• **Re** = 9:8\n• **Ga** = 5:4\n• **Ma** = 4:3\n• **Pa** = 3:2\n• **Dha** = 5:3\n• **Ni** = 15:8\n• **Upper Sa** = 2:1\n\nThe ratio 3:2 for Pa (Pancham) makes it the most consonant swar after Sa itself — which is why Pa feels so stable and resonant on the bansuri.',
      },
      {
        type: 'tip',
        title: 'Practice Tip',
        content:
          'When practicing shuddha swaras on your bansuri, focus on producing each note cleanly before moving to the next. Spend extra time on the Ga→Ma and Ni→Sa transitions — these half-step intervals are harder to tune accurately because the pitch change is smaller. Use the Guided Practice mode to check your intonation.',
      },
    ],
    keyTerms: [
      { term: 'Shuddha (शुद्ध)', definition: 'Pure or natural — the default, unaltered form of a swar.' },
      { term: 'Bilawal Thaat', definition: 'The parent scale that uses all shuddha swaras — the default scale on your bansuri.' },
      { term: 'Semitone', definition: 'The smallest interval in standard tuning — a half step. There are 12 semitones in an octave.' },
    ],
    quiz: [
      {
        question: 'What is the interval pattern of the shuddha swaras?',
        options: [
          'W W W H W W H',
          'W W H W W W H',
          'H W W W H W W',
          'W H W W W H W',
        ],
        correctIndex: 1,
        explanation: 'The shuddha saptak follows the pattern Whole-Whole-Half-Whole-Whole-Whole-Half — the natural interval layout on the bansuri from Sa to upper Sa.',
      },
      {
        question: 'Which two intervals in the shuddha saptak are half steps?',
        options: [
          'Sa→Re and Pa→Dha',
          'Re→Ga and Dha→Ni',
          'Ga→Ma and Ni→Sa',
          'Ma→Pa and Sa→Re',
        ],
        correctIndex: 2,
        explanation: 'The half-step (semitone) intervals occur between Ga→Ma and Ni→Sa. All other consecutive intervals are whole steps.',
      },
      {
        question: 'What frequency ratio does Pancham (Pa) have with Sa?',
        options: ['2:1', '4:3', '3:2', '5:4'],
        correctIndex: 2,
        explanation: 'Pa has a 3:2 ratio with Sa — the pancham interval. It is the most consonant swar after Sa and feels naturally stable on the bansuri.',
      },
    ],
    practiceLink: '/practice/guided',
  },

  {
    id: 'komal-swar',
    title: 'Komal Swar (Flat Notes)',
    module: 'foundations',
    moduleOrder: 1,
    order: 4,
    estimatedMinutes: 9,
    icon: '🔽',
    sections: [
      {
        type: 'text',
        title: 'What are Komal Swaras?',
        content:
          'A **komal swar** (कोमल स्वर) is a note that has been lowered by one semitone from its shuddha (natural) position. The word "komal" means "soft" or "tender" in Hindi/Sanskrit, and komal swaras indeed lend a softer, often more melancholic or introspective character to music.\n\nOnly **four** of the seven swaras can be made komal: **Re, Ga, Dha, and Ni**. Sa and Pa are **achala** (immovable) — they are never altered. Ma cannot be made komal either; instead, it has a **teevra** (sharp) form, which we will study in the next lesson.\n\nKomal notes are critical for creating the distinctive moods of different raags. For example, the plaintive quality of Raag Bhairavi comes from using all four komal swaras.',
      },
      {
        type: 'note-diagram',
        title: 'Shuddha vs. Komal Notes',
        content:
          'The four notes that can be lowered to their komal form. Komal Re is one semitone below Shuddha Re, Komal Ga is one semitone below Shuddha Ga, and so on.',
        notes: ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI'],
      },
      {
        type: 'comparison',
        title: 'The Four Komal Swaras',
        content:
          'Each komal swar creates a distinct emotional shift compared to its shuddha counterpart:',
        items: [
          { label: 'Komal Re (रे॒)', description: 'One semitone above Sa — between Sa and shuddha Re. Use half-hole technique on the bansuri. Creates a tense, searching quality. Central to Raag Bhairav and Raag Marwa.' },
          { label: 'Komal Ga (ग॒)', description: 'One semitone below shuddha Ga — a minor third above Sa. Gives a darker, more serious mood. Central to Raag Malkauns and Raag Bageshri.' },
          { label: 'Komal Dha (ध॒)', description: 'One semitone below shuddha Dha — adds pathos and gravity. Featured in Raag Bhairavi and Raag Todi.' },
          { label: 'Komal Ni (नि॒)', description: 'One semitone below shuddha Ni — creates restless tension before resolution to Sa. Used in Raag Kafi and Raag Khamaj.' },
        ],
      },
      {
        type: 'tip',
        title: 'Half-Hole Technique on Bansuri',
        content:
          'On the bansuri, komal notes are produced using the **half-hole technique** — partially covering a finger hole to lower the pitch by a semitone. This requires precise finger placement and control. The key is to find the exact spot where the note "speaks" clearly without wobbling.\n\n**Tips for clean half-holes:**\n• Slide your finger to partially uncover the hole rather than lifting it\n• Each komal note has a slightly different sweet spot\n• Practice transitioning between shuddha and komal forms of the same note\n• Listen carefully — a komal note should sound definite, not vague',
      },
      {
        type: 'text',
        title: 'Notation Convention',
        content:
          'In traditional notation, komal swaras are indicated with an **underline** beneath the note letter: r̲e, g̲a, d̲ha, n̲i. In some systems, a small horizontal line below the letter is used. In modern digital notation, you may see lowercase letters (re vs. RE) or a "k" prefix (kRe, kGa). In this app, we use the shuddha forms for standard practice and will note komal variants explicitly when relevant.',
      },
    ],
    keyTerms: [
      { term: 'Komal (कोमल)', definition: 'Soft/flat — a swar lowered by one semitone from its shuddha position.' },
      { term: 'Achala (अचल)', definition: 'Immovable — refers to Sa and Pa, which are never altered to komal or teevra.' },
      { term: 'Half-hole', definition: 'Bansuri technique of partially covering a finger hole to produce komal notes.' },
    ],
    quiz: [
      {
        question: 'Which swaras can be made komal?',
        options: [
          'Sa, Re, Ga, Ma',
          'Re, Ga, Dha, Ni',
          'Re, Ma, Pa, Ni',
          'All seven swaras',
        ],
        correctIndex: 1,
        explanation: 'Only Re, Ga, Dha, and Ni can be made komal. Sa and Pa are achala (immovable), and Ma has a teevra (sharp) form instead.',
      },
      {
        question: 'What does "komal" mean?',
        options: ['Sharp', 'Strong', 'Soft/Tender', 'Middle'],
        correctIndex: 2,
        explanation: 'Komal means soft or tender. Komal swaras are lowered by a semitone and give a softer, more introspective character.',
      },
      {
        question: 'How are komal notes typically produced on the bansuri?',
        options: [
          'By blowing harder',
          'By using the half-hole technique',
          'By using cross-fingering only',
          'By tilting the flute',
        ],
        correctIndex: 1,
        explanation: 'Komal notes on the bansuri are produced using the half-hole technique — partially covering a finger hole to lower the pitch by one semitone.',
      },
    ],
    practiceLink: '/practice/free',
  },

  {
    id: 'teevra-swar',
    title: 'Teevra Swar (Sharp Notes)',
    module: 'foundations',
    moduleOrder: 1,
    order: 5,
    estimatedMinutes: 7,
    icon: '🔼',
    sections: [
      {
        type: 'text',
        title: 'The One Teevra Swar',
        content:
          'In Indian classical music, **teevra** (तीव्र) means "sharp" or "intense." While komal lowers a note, teevra raises it. However, unlike the komal system which has four notes, only **one** swar can be made teevra: **Ma (Madhyam)**.\n\n**Teevra Ma** is raised by one semitone above its shuddha position on the bansuri — produced with a specific cross-fingering. This single alteration has a profound impact — Teevra Ma creates a bright, uplifting, yearning quality that defines some of the most beloved raags in Indian music.\n\nWhy only Ma? The system of 12 swar positions in an octave means that lowering Re, Ga, Dha, Ni by a semitone and raising Ma by a semitone covers all 12 positions: Sa, komal Re, shuddha Re, komal Ga, shuddha Ga, shuddha Ma, teevra Ma, Pa, komal Dha, shuddha Dha, komal Ni, shuddha Ni.',
      },
      {
        type: 'comparison',
        title: 'All 12 Swar Positions',
        content:
          'Here is how all 12 swar positions in an octave map on the bansuri — from Sa through to upper Sa:',
        items: [
          { label: 'Sa', description: 'The tonic — all holes covered. Always shuddha.' },
          { label: 'Komal Re', description: 'Re lowered by one semitone — half-hole technique.' },
          { label: 'Shuddha Re', description: 'Natural Re — standard fingering.' },
          { label: 'Komal Ga', description: 'Ga lowered by one semitone — half-hole technique.' },
          { label: 'Shuddha Ga', description: 'Natural Ga — standard fingering.' },
          { label: 'Shuddha Ma', description: 'Natural Ma — the perfect fourth above Sa.' },
          { label: 'Teevra Ma', description: 'Ma raised by one semitone — cross-fingering on the bansuri.' },
          { label: 'Pa', description: 'Always shuddha (achala) — the pancham, a perfect fifth above Sa.' },
          { label: 'Komal Dha', description: 'Dha lowered by one semitone — half-hole technique.' },
          { label: 'Shuddha Dha', description: 'Natural Dha — standard fingering.' },
          { label: 'Komal Ni', description: 'Ni lowered by one semitone — half-hole technique.' },
          { label: 'Shuddha Ni', description: 'Natural Ni — standard fingering.' },
        ],
      },
      {
        type: 'text',
        title: 'Teevra Ma in Music',
        content:
          'Teevra Ma is the defining note of the **Kalyan thaat** — one of the 10 parent scales. Raag Yaman (often the first raag taught to students) uses Teevra Ma, and its bright, romantic, evening quality comes largely from this one altered note.\n\nTeevra Ma sits six semitones above Sa — an augmented fourth interval. On the bansuri, this note has a distinctive bright tension that pulls beautifully upward toward Pa. Indian musicians embrace this intensity; it is one of the most expressive notes in the entire system.',
      },
      {
        type: 'tip',
        title: 'Playing Teevra Ma on Bansuri',
        content:
          'Teevra Ma on the bansuri requires a specific cross-fingering technique. The exact fingering depends on your bansuri key, but typically involves opening one hole while keeping others closed in an unconventional pattern. Practice the transition Ma→Teevra Ma→Pa slowly — this three-note phrase is the heart of Raag Yaman.',
      },
    ],
    keyTerms: [
      { term: 'Teevra (तीव्र)', definition: 'Sharp/intense — a swar raised by one semitone. Only Ma can be teevra.' },
      { term: 'Tritone', definition: 'The interval of 6 semitones (augmented 4th) — the distance from Sa to Teevra Ma.' },
      { term: 'Kalyan Thaat', definition: 'The parent scale defined by Teevra Ma; all other swaras remain shuddha. Raag Yaman belongs to this thaat.' },
    ],
    quiz: [
      {
        question: 'Which is the only swar that can be made teevra?',
        options: ['Re', 'Ga', 'Ma', 'Pa'],
        correctIndex: 2,
        explanation: 'Only Ma (Madhyam) can be raised to its teevra form. No other swar has a teevra variant in the standard Indian system.',
      },
      {
        question: 'What interval does Teevra Ma create with Sa?',
        options: ['Perfect 4th', 'Perfect 5th', 'Tritone (augmented 4th)', 'Major 3rd'],
        correctIndex: 2,
        explanation: 'Teevra Ma is 6 semitones above Sa — a tritone or augmented 4th. Shuddha Ma is 5 semitones above Sa (a perfect 4th).',
      },
    ],
    practiceLink: '/practice/free',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 2 — SCALES & STRUCTURE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'thaat-system',
    title: 'Thaat System',
    module: 'scales',
    moduleOrder: 2,
    order: 1,
    estimatedMinutes: 12,
    icon: '🏗️',
    sections: [
      {
        type: 'text',
        title: 'What is a Thaat?',
        content:
          'A **thaat** (ठाट) is a parent scale — a framework of seven notes from which raags are derived. The thaat system was formalized by **Vishnu Narayan Bhatkhande** in the early 20th century as a way to classify the hundreds of raags in Hindustani classical music.\n\nEach thaat uses all seven swar positions (Sa, Re, Ga, Ma, Pa, Dha, Ni), but each swar can be in its shuddha, komal, or teevra form. Since Sa and Pa are never altered, and only Re, Ga, Dha, Ni can be komal, and only Ma can be teevra, there are a limited number of combinations. Bhatkhande selected **10 thaats** that cover the most important raag families.',
      },
      {
        type: 'comparison',
        title: 'The 10 Thaats',
        content:
          'Each thaat specifies exactly which form of each swar to use. Here they are with their signature alterations and mood:',
        items: [
          { label: 'Bilawal', description: 'All shuddha swaras (Sa Re Ga Ma Pa Dha Ni). Bright, happy — the default bansuri scale. Example: Raag Alhaiya Bilawal.' },
          { label: 'Kalyan', description: 'Teevra Ma, rest shuddha (Sa Re Ga Ma↑ Pa Dha Ni). Romantic, luminous evening mood. Example: Raag Yaman.' },
          { label: 'Khamaj', description: 'Komal Ni, rest shuddha (Sa Re Ga Ma Pa Dha ni). Light, romantic, playful. Example: Raag Khamaj, Raag Des.' },
          { label: 'Bhairav', description: 'Komal Re, Komal Dha, rest shuddha (Sa re Ga Ma Pa dha Ni). Solemn, majestic morning raag. Example: Raag Bhairav.' },
          { label: 'Poorvi', description: 'Komal Re, Teevra Ma, Komal Dha (Sa re Ga Ma↑ Pa dha Ni). Serious, introspective, evening. Example: Raag Poorvi.' },
          { label: 'Marwa', description: 'Komal Re, Teevra Ma (Sa re Ga Ma↑ Pa Dha Ni). Intense, restless, sunset. Example: Raag Marwa.' },
          { label: 'Kafi', description: 'Komal Ga, Komal Ni (Sa Re ga Ma Pa Dha ni). Romantic, devotional. Example: Raag Kafi, Raag Pilu.' },
          { label: 'Asavari', description: 'Komal Ga, Komal Dha, Komal Ni (Sa Re ga Ma Pa dha ni). Pathos, serious, contemplative. Example: Raag Asavari, Raag Darbari.' },
          { label: 'Bhairavi', description: 'All four komal swaras (Sa re ga Ma Pa dha ni). Deep devotion, morning closure. Example: Raag Bhairavi.' },
          { label: 'Todi', description: 'Komal Re, Komal Ga, Teevra Ma, Komal Dha (Sa re ga Ma↑ Pa dha Ni). Complex, intense longing. Example: Raag Todi.' },
        ],
      },
      {
        type: 'tip',
        title: 'Thaat ≠ Raag',
        content:
          'A common beginner mistake is to confuse a thaat with a raag. A thaat is simply a scale — a set of seven notes. A **raag** is much more: it includes rules about ascending/descending movement, emphasis notes, phrases, time of day, and mood. Multiple raags can share the same thaat. For example, both Raag Yaman and Raag Shuddha Kalyan belong to Kalyan thaat, but they sound very different due to different movement rules and characteristic phrases.',
      },
    ],
    keyTerms: [
      { term: 'Thaat (ठाट)', definition: 'A parent scale of seven notes from which raags are derived. There are 10 standard thaats in Hindustani music.' },
      { term: 'Bhatkhande', definition: 'Vishnu Narayan Bhatkhande — the musicologist who formalized the 10-thaat classification system in the early 20th century.' },
      { term: 'Bilawal Thaat', definition: 'The thaat with all shuddha swaras — the default reference scale on the bansuri.' },
    ],
    quiz: [
      {
        question: 'How many thaats are there in the Bhatkhande system?',
        options: ['7', '10', '12', '22'],
        correctIndex: 1,
        explanation: 'Bhatkhande classified Hindustani raags into 10 parent scales (thaats). Each thaat defines specific shuddha, komal, or teevra forms for all seven swaras.',
      },
      {
        question: 'Which thaat uses Teevra Ma with all other swaras shuddha?',
        options: ['Bilawal', 'Kalyan', 'Marwa', 'Poorvi'],
        correctIndex: 1,
        explanation: 'Kalyan thaat is defined by Teevra Ma with all other swaras in their shuddha form. Raag Yaman is its most famous raag.',
      },
      {
        question: 'Which thaat uses all four komal swaras?',
        options: ['Asavari', 'Bhairavi', 'Todi', 'Kafi'],
        correctIndex: 1,
        explanation: 'Bhairavi thaat uses all four komal swaras (komal Re, Ga, Dha, Ni). It is associated with deep devotion and is traditionally performed as the closing raag of a concert.',
      },
    ],
    practiceLink: '/scale-trainer',
  },

  {
    id: 'aaroh-avaroh',
    title: 'Aaroh & Avaroh',
    module: 'scales',
    moduleOrder: 2,
    order: 2,
    estimatedMinutes: 8,
    icon: '📈',
    sections: [
      {
        type: 'text',
        title: 'Ascending and Descending Patterns',
        content:
          'Every raag defines two essential movement patterns:\n\n• **Aaroh** (आरोह) — the ascending pattern, moving from lower Sa up to upper Sa\n• **Avaroh** (अवरोह) — the descending pattern, moving from upper Sa down to lower Sa\n\nUnlike a simple scale that uses all seven notes going up and down, raags frequently **skip notes** or **use zigzag movements** in their aaroh and avaroh. This selective use of notes is one of the key factors that gives each raag its unique personality.\n\nFor example, Raag Yaman\'s aaroh avoids Sa and starts from Ni of the lower octave: Ṇi Re Ga Ma↑ Pa Dha Ni Ṡa. This creates a distinctive upward trajectory that is immediately recognizable.',
      },
      {
        type: 'comparison',
        title: 'Types of Note Movement',
        content:
          'Raags use different types of note progressions in their aaroh and avaroh:',
        items: [
          { label: 'Sampurna (Complete)', description: 'Uses all 7 notes in order. Both aaroh and avaroh include Sa Re Ga Ma Pa Dha Ni. Example: Raag Bilawal.' },
          { label: 'Shadav (Six-note)', description: 'Uses 6 out of 7 notes, skipping one. Example: Raag Bhupali skips Ma and Ni entirely.' },
          { label: 'Audav (Five-note / Pentatonic)', description: 'Uses only 5 notes. Creates open, spacious feeling. Example: Raag Bhupali (Sa Re Ga Pa Dha).' },
          { label: 'Vakra (Crooked/Zigzag)', description: 'Notes do not follow strict ascending or descending order. Some notes are approached from unexpected directions. Example: Raag Bageshri has a vakra aaroh: Sa Ga Ma Dha Ni Dha Ṡa.' },
        ],
      },
      {
        type: 'text',
        title: 'Why Notes Are Skipped',
        content:
          'Skipping notes is not arbitrary — it serves the raag\'s musical identity. When Raag Bhupali omits Ma and Ni, it creates a pentatonic scale with wide intervals that feels open and serene. When Raag Bageshri approaches Dha through "Ni Dha" in its aaroh (going down briefly while ascending), it creates the characteristic "twist" that defines the raag.\n\nAs you advance, you will learn to identify raags partly by their aaroh-avaroh pattern. This is like recognizing a person by their gait — the pattern of movement is as distinctive as the notes themselves.',
      },
      {
        type: 'tip',
        title: 'Practice Tip',
        content:
          'Start by practicing simple sampurna (complete) aaroh-avaroh: Sa Re Ga Ma Pa Dha Ni Sa↑ (ascending) then Sa↑ Ni Dha Pa Ma Ga Re Sa (descending). Once comfortable, try Raag Bhupali\'s pentatonic aaroh-avaroh: Sa Re Ga Pa Dha Sa↑ / Sa↑ Dha Pa Ga Re Sa — notice how the missing notes change the feel.',
      },
    ],
    keyTerms: [
      { term: 'Aaroh (आरोह)', definition: 'The ascending note pattern of a raag — the prescribed way to move from lower notes to higher notes.' },
      { term: 'Avaroh (अवरोह)', definition: 'The descending note pattern of a raag — the prescribed way to move from higher notes to lower notes.' },
      { term: 'Vakra (वक्र)', definition: 'Crooked or zigzag movement — when a raag\'s aaroh or avaroh includes out-of-order note movements.' },
      { term: 'Sampurna', definition: 'Complete — an aaroh or avaroh that uses all seven notes.' },
    ],
    quiz: [
      {
        question: 'What is "Aaroh" in Indian classical music?',
        options: [
          'The descending pattern of a raag',
          'The ascending pattern of a raag',
          'The rhythmic cycle',
          'The ornamental technique',
        ],
        correctIndex: 1,
        explanation: 'Aaroh is the ascending (upward) movement pattern of a raag, defining how notes progress from lower to higher pitch.',
      },
      {
        question: 'What does "Vakra" mean in the context of aaroh-avaroh?',
        options: [
          'Complete scale usage',
          'Pentatonic pattern',
          'Zigzag/crooked note movement',
          'Fast tempo playing',
        ],
        correctIndex: 2,
        explanation: 'Vakra means crooked or zigzag — it describes raags where the aaroh or avaroh includes unexpected direction changes instead of straight ascending or descending movement.',
      },
    ],
    practiceLink: '/practice/sargam',
  },

  {
    id: 'vadi-samvadi',
    title: 'Vadi & Samvadi',
    module: 'scales',
    moduleOrder: 2,
    order: 3,
    estimatedMinutes: 7,
    icon: '👑',
    sections: [
      {
        type: 'text',
        title: 'The King and Queen of a Raag',
        content:
          'Every raag has two special notes that define its character more than any others:\n\n• **Vadi** (वादी) — the most important note, often called the "king" (raja) of the raag. It receives the most emphasis in performance, is sustained longer, and phrases frequently revolve around it.\n\n• **Samvadi** (संवादी) — the second most important note, called the "queen" (rani). It supports the vadi and creates a harmonic relationship with it.\n\nThe vadi and samvadi are typically a **fourth (Ma-distance)** or a **fifth (Pa-distance)** apart. This intervallic relationship creates a natural consonance that anchors the raag\'s melodic identity.',
      },
      {
        type: 'comparison',
        title: 'Examples of Vadi-Samvadi Pairs',
        content:
          'Here are some well-known raags and their vadi-samvadi relationships:',
        items: [
          { label: 'Raag Yaman', description: 'Vadi: Ga, Samvadi: Ni. These are a 5th apart. Ga receives maximum emphasis, with phrases like "Ni Re Ga" being central to the raag.' },
          { label: 'Raag Bhupali', description: 'Vadi: Ga, Samvadi: Dha. A 4th apart. The phrase "Ga Re Sa" is a signature descent.' },
          { label: 'Raag Bhairav', description: 'Vadi: Dha, Samvadi: Re. A 5th apart. Both are komal, creating the raag\'s distinctive grave mood.' },
          { label: 'Raag Malkauns', description: 'Vadi: Ma, Samvadi: Sa. A 4th apart. Ma dominates every phrase in this powerful midnight raag.' },
        ],
      },
      {
        type: 'text',
        title: 'Time Theory and Vadi-Samvadi',
        content:
          'The vadi-samvadi relationship also connects to the **time of performance** in traditional theory:\n\n• If the vadi falls in the **poorvang** (lower half: Sa to Ma), the raag is typically performed in the **first half of the day or night**.\n• If the vadi falls in the **uttarang** (upper half: Pa to Ni), the raag is typically performed in the **second half**.\n\nFor example, Raag Yaman (vadi: Ga, in poorvang) is an early evening raag, while some uttarang-dominant raags are performed late at night. This connection between musical structure and time is a unique aspect of Indian classical music.',
      },
      {
        type: 'tip',
        title: 'Listening Practice',
        content:
          'When listening to a raag performance, try to identify which note the artist keeps returning to and emphasizing — that is likely the vadi. The samvadi will be the next most prominent note, usually a 4th or 5th away. Developing this ear is key to understanding raag identity.',
      },
    ],
    keyTerms: [
      { term: 'Vadi (वादी)', definition: 'The most important note (king) of a raag — it receives the most emphasis and is the melodic anchor.' },
      { term: 'Samvadi (संवादी)', definition: 'The second most important note (queen) — it supports the vadi and is typically a 4th or 5th apart.' },
      { term: 'Poorvang', definition: 'The lower half of the saptak (Sa to Ma) — raags with vadi here are typically performed in the first half of the time period.' },
      { term: 'Uttarang', definition: 'The upper half of the saptak (Pa to Ni) — raags with vadi here are typically performed in the second half of the time period.' },
    ],
    quiz: [
      {
        question: 'What is the typical interval between vadi and samvadi?',
        options: [
          'A 2nd or 3rd apart',
          'A 4th or 5th apart',
          'An octave apart',
          'They can be any interval',
        ],
        correctIndex: 1,
        explanation: 'The vadi and samvadi are traditionally a 4th (Ma-distance) or 5th (Pa-distance) apart, creating natural consonance.',
      },
      {
        question: 'In Raag Yaman, what are the vadi and samvadi?',
        options: [
          'Sa and Pa',
          'Ga and Ni',
          'Re and Dha',
          'Ma and Sa',
        ],
        correctIndex: 1,
        explanation: 'Raag Yaman has Ga as its vadi (king note) and Ni as its samvadi (queen note). These are a fifth apart.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 3 — RHYTHM & PRACTICE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'taal-intro',
    title: 'Introduction to Taal',
    module: 'rhythm',
    moduleOrder: 3,
    order: 1,
    estimatedMinutes: 10,
    icon: '🥁',
    sections: [
      {
        type: 'text',
        title: 'What is Taal?',
        content:
          'In Indian classical music, **taal** (ताल) is the rhythmic framework — a repeating cycle of beats that organizes music in time. Taal is **cyclical**: when you reach the end of the cycle, you return to the beginning and start again. This cyclic nature is fundamental to Indian music and reflects a philosophical view of time as circular.\n\nA taal consists of a fixed number of beats (**matras**) grouped into sections (**vibhags**). The first beat of the cycle is called **sam** (सम) — it is the most important beat, where melodic phrases often resolve. Recognizing sam is essential for both solo and accompaniment playing.',
      },
      {
        type: 'comparison',
        title: 'Common Taals',
        content:
          'Here are the most frequently encountered taals in Hindustani classical music:',
        items: [
          { label: 'Teentaal — 16 beats (4+4+4+4)', description: 'The most common taal. Divided into 4 vibhags of 4 beats each. Sam on beat 1, khali on beat 9. Pattern: Dha Dhin Dhin Dha | Dha Dhin Dhin Dha | Dha Tin Tin Ta | Ta Dhin Dhin Dha. Used in a huge variety of compositions.' },
          { label: 'Ektaal — 12 beats (2+2+2+2+2+2)', description: 'A 12-beat cycle divided into 6 vibhags of 2 beats each. Often used in vilambit (slow) compositions. Has a spacious feel that allows for extensive melodic development.' },
          { label: 'Jhaptaal — 10 beats (2+3+2+3)', description: 'A 10-beat cycle with asymmetric grouping. Creates an interesting rhythmic tension due to alternating groups of 2 and 3. Used in medium-tempo compositions.' },
          { label: 'Rupak — 7 beats (3+2+2)', description: 'A 7-beat cycle starting with khali (the first beat is NOT sam in the usual sense). Creates a lilting, unusual feel. Popular in semi-classical and light classical music.' },
        ],
      },
      {
        type: 'text',
        title: 'Sam and Khali',
        content:
          '**Sam** (सम) is beat 1 — the "arrival point" of the cycle. In performance, the tabla player and the melodist coordinate to land together on sam. This creates moments of musical resolution that give structure to improvisation. Sam is marked with an "X" or "×" in notation.\n\n**Khali** (खाली) means "empty" — it is a beat where the resonant bass stroke of the tabla (the left drum) is omitted, creating a lighter, contrasting sound. Khali typically falls in the middle or latter part of the cycle and helps the listener track where they are in the taal. Khali is marked with "0" in notation.',
      },
      {
        type: 'tip',
        title: 'Practicing with Taal',
        content:
          'Even as a bansuri player, internalizing taal is crucial. Start by clapping along to Teentaal: clap on beats 1, 5, 13 (sam and tali beats) and wave your hand on beat 9 (khali). Practice playing your sargam exercises while keeping this cycle. It may feel hard at first but becomes natural with repetition.',
      },
    ],
    keyTerms: [
      { term: 'Taal (ताल)', definition: 'A rhythmic cycle — a repeating pattern of beats that provides the time framework for Indian classical music.' },
      { term: 'Matra (मात्रा)', definition: 'A single beat within a taal cycle.' },
      { term: 'Sam (सम)', definition: 'The first beat of the taal cycle — the most important rhythmic point where phrases resolve.' },
      { term: 'Khali (खाली)', definition: 'The "empty" beat where the tabla bass is omitted, creating rhythmic contrast.' },
    ],
    quiz: [
      {
        question: 'How many matras (beats) does Teentaal have?',
        options: ['10', '12', '16', '7'],
        correctIndex: 2,
        explanation: 'Teentaal is a 16-beat cycle divided into four vibhags of 4 beats each. It is the most commonly used taal in Hindustani classical music.',
      },
      {
        question: 'What is "sam" in a taal cycle?',
        options: [
          'The last beat of the cycle',
          'The first beat — the point of resolution',
          'The empty beat where tabla bass is omitted',
          'The fastest tempo marking',
        ],
        correctIndex: 1,
        explanation: 'Sam is the first beat of the taal cycle. It is the most important rhythmic point where melodic phrases resolve and musicians coordinate.',
      },
      {
        question: 'Which taal has 7 beats?',
        options: ['Teentaal', 'Ektaal', 'Jhaptaal', 'Rupak'],
        correctIndex: 3,
        explanation: 'Rupak taal has 7 beats in a 3+2+2 grouping. It has the unusual characteristic of starting with khali.',
      },
    ],
  },

  {
    id: 'laya-tempo',
    title: 'Laya (Tempo)',
    module: 'rhythm',
    moduleOrder: 3,
    order: 2,
    estimatedMinutes: 7,
    icon: '⏱️',
    sections: [
      {
        type: 'text',
        title: 'Understanding Laya',
        content:
          '**Laya** (लय) is the tempo or speed at which music is performed. In Indian classical music, laya is not just a metronome speed — it is an artistic choice that profoundly affects the mood, complexity, and character of the music. A slow laya allows for deep exploration and ornamentation, while a fast laya demands technical precision and creates excitement.\n\nIndian classical performances often begin in a slow tempo and gradually accelerate — this journey from slow to fast is itself a dramatic arc.',
      },
      {
        type: 'comparison',
        title: 'The Three Primary Layas',
        content:
          'Laya is traditionally classified into three main speeds:',
        items: [
          { label: 'Vilambit (विलम्बित) — Slow: ~30–60 BPM', description: 'The slowest tempo. Each beat is long, allowing extensive ornamentation (meend, gamak, etc.) and emotional depth. Vilambit compositions are considered the highest art form — they demand breath control and patience. On bansuri, long sustained notes with subtle embellishments are the hallmark.' },
          { label: 'Madhya (मध्य) — Medium: ~60–120 BPM', description: 'The middle tempo. Comfortable and natural — where most practice and many compositions sit. Madhya laya balances melodic complexity with rhythmic energy. Ideal for sargam practice and alankar exercises.' },
          { label: 'Drut (द्रुत) — Fast: ~120+ BPM', description: 'The fastest tempo. Demands exceptional technique, finger speed, and breath efficiency. Drut compositions often feature rapid taan (fast melodic runs) and rhythmic interplay. On bansuri, clean articulation at drut laya requires dedicated speed-building practice.' },
        ],
      },
      {
        type: 'text',
        title: 'Building Speed Gradually',
        content:
          'Speed (laya) should be built systematically, never forced:\n\n1. **Master the pattern in vilambit** first — accuracy before speed\n2. **Move to madhya** once you can play cleanly without hesitation\n3. **Gradually increase** toward drut, using a metronome in small increments (5–10 BPM at a time)\n4. **If accuracy drops, slow down** — speed without clarity is just noise\n\nThis patient approach is how master musicians build seemingly effortless speed. There are no shortcuts — but the compound effect of daily incremental improvement is powerful.',
      },
      {
        type: 'tip',
        title: 'Using a Metronome',
        content:
          'A metronome (or tanpura app with rhythm) is your best practice companion. Start each exercise at a comfortable speed where you can play perfectly, then increase by 5 BPM per practice session. Keep a log of your comfortable speed for each exercise — watching this number climb over weeks is incredibly motivating.',
      },
    ],
    keyTerms: [
      { term: 'Laya (लय)', definition: 'Tempo — the speed at which music is performed, ranging from very slow (vilambit) to very fast (drut).' },
      { term: 'Vilambit (विलम्बित)', definition: 'Slow tempo (~30–60 BPM) — allows deep ornamentation and emotional expression.' },
      { term: 'Madhya (मध्य)', definition: 'Medium tempo (~60–120 BPM) — the comfortable, natural speed for most practice.' },
      { term: 'Drut (द्रुत)', definition: 'Fast tempo (~120+ BPM) — demands technical precision and rapid articulation.' },
    ],
    quiz: [
      {
        question: 'What is the approximate BPM range for Vilambit laya?',
        options: ['120+ BPM', '60–120 BPM', '30–60 BPM', '10–30 BPM'],
        correctIndex: 2,
        explanation: 'Vilambit (slow) laya is approximately 30–60 BPM. This slow tempo allows for extensive ornamentation and deep melodic exploration.',
      },
      {
        question: 'What is the recommended approach to building speed?',
        options: [
          'Jump to fast tempo immediately to challenge yourself',
          'Master in slow tempo first, then gradually increase',
          'Only practice at medium tempo',
          'Speed doesn\'t matter in Indian classical music',
        ],
        correctIndex: 1,
        explanation: 'The recommended approach is to master a pattern at slow tempo first (accuracy before speed), then gradually increase the tempo in small increments (5–10 BPM at a time).',
      },
    ],
  },

  {
    id: 'alankar-theory',
    title: 'Alankar Theory',
    module: 'rhythm',
    moduleOrder: 3,
    order: 3,
    estimatedMinutes: 9,
    icon: '💎',
    sections: [
      {
        type: 'text',
        title: 'What are Alankars?',
        content:
          '**Alankar** (अलंकार) literally means "ornament" or "decoration." In music, alankars are systematic note patterns used as practice exercises on the bansuri. They build technique, finger dexterity, tonal accuracy, and musical vocabulary.\n\nBut alankars are more than just exercises. The patterns they contain appear everywhere in actual raag performance. By practicing alankars, you are unconsciously programming your fingers and breath with melodic shapes that will emerge naturally when you improvise. Great bansuri players practice alankars daily throughout their entire career.',
      },
      {
        type: 'comparison',
        title: 'Types of Alankars',
        content:
          'Alankars are categorized by their movement pattern:',
        items: [
          { label: 'Ascending (Aaroh) Alankars', description: 'Patterns that move upward: Sa Re Ga, Re Ga Ma, Ga Ma Pa, etc. Build finger coordination for upward movement and help develop breath support for ascending phrases.' },
          { label: 'Descending (Avaroh) Alankars', description: 'Patterns that move downward: Ni Dha Pa, Dha Pa Ma, Pa Ma Ga, etc. Practice descending control — often harder than ascending on bansuri because of breath dynamics.' },
          { label: 'Mixed/Combined Alankars', description: 'Patterns that zigzag: Sa Re Ga Re, Re Ga Ma Ga, etc. These are the most musical and appear frequently in actual performance. They develop the ability to change direction smoothly.' },
          { label: 'Skip-note (Vakra) Alankars', description: 'Patterns with jumps: Sa Ga Pa, Re Ma Dha, etc. Build confidence with larger intervals and develop ear training for non-stepwise movement.' },
        ],
      },
      {
        type: 'text',
        title: 'Traditional Practice Approach',
        content:
          'The traditional guru-shishya (teacher-student) approach to alankars follows a progression:\n\n1. **Simple 3-note ascending**: Sa Re Ga → Re Ga Ma → Ga Ma Pa → Ma Pa Dha → Pa Dha Ni → Dha Ni Sa↑\n2. **Simple 3-note descending**: Sa↑ Ni Dha → Ni Dha Pa → Dha Pa Ma → Pa Ma Ga → Ma Ga Re → Ga Re Sa\n3. **4-note patterns**: Sa Re Ga Ma → Re Ga Ma Pa → ...\n4. **Mixed patterns**: Sa Re Ga Re → Re Ga Ma Ga → ...\n5. **Longer and more complex combinations**\n\nEach pattern is first practiced very slowly, then gradually sped up over days and weeks. The goal is not just to play the notes but to produce a clean, even, musical sound at any speed.',
      },
      {
        type: 'tip',
        title: 'Daily Alankar Practice',
        content:
          'Dedicate 10–15 minutes of your daily practice to alankars. Pick 2–3 patterns and work through them across all three layas (slow, medium, fast). Even advanced players return to basic alankars as a warm-up. In this app, use the Sargam Practice screen to work through structured alankar patterns.',
      },
    ],
    keyTerms: [
      { term: 'Alankar (अलंकार)', definition: 'Ornamental practice patterns — systematic note sequences used to build technique and musical vocabulary.' },
      { term: 'Paltaa (पलटा)', definition: 'A variation or permutation of an alankar — the same pattern applied starting from different notes.' },
      { term: 'Taan (तान)', definition: 'A fast melodic run in performance, often built from internalized alankar patterns.' },
    ],
    quiz: [
      {
        question: 'What does "alankar" literally mean?',
        options: ['Speed exercise', 'Ornament/Decoration', 'Rhythmic cycle', 'Breathing pattern'],
        correctIndex: 1,
        explanation: 'Alankar literally means ornament or decoration. In music, alankars are systematic note patterns used as practice exercises to build technique.',
      },
      {
        question: 'What is a "paltaa"?',
        options: [
          'A type of bansuri',
          'A rhythmic pattern',
          'A variation of an alankar applied from different starting notes',
          'A breathing exercise',
        ],
        correctIndex: 2,
        explanation: 'A paltaa is a variation or permutation of an alankar — the same pattern applied starting from each successive note of the scale.',
      },
      {
        question: 'Which type of alankar involves zigzag movement?',
        options: ['Ascending', 'Descending', 'Mixed/Combined', 'All of the above'],
        correctIndex: 2,
        explanation: 'Mixed or combined alankars involve zigzag movement (e.g., Sa Re Ga Re, Re Ga Ma Ga). They are the most musical and appear frequently in actual performance.',
      },
    ],
    practiceLink: '/practice/sargam',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 4 — APPLIED THEORY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'raag-basics',
    title: 'Raag Basics',
    module: 'applied',
    moduleOrder: 4,
    order: 1,
    estimatedMinutes: 11,
    icon: '🎭',
    sections: [
      {
        type: 'text',
        title: 'What is a Raag?',
        content:
          'A **raag** (राग) is the central concept of Indian classical music — it is a melodic framework that goes far beyond a simple scale. While a scale is just a set of notes, a raag is a living, breathing musical entity with rules, moods, personality, and even a time of day.\n\nTo qualify as a raag (rather than just a random collection of notes), a melody must have:\n• At least **5 notes** (minimum for a raag; some have 6 or all 7)\n• A defined **aaroh** (ascending pattern) and **avaroh** (descending pattern)\n• Designated **vadi** (dominant note) and **samvadi** (sub-dominant)\n• A characteristic **pakad** (catch phrase) that identifies the raag\n• An associated **rasa** (emotional mood) and often a **samay** (time of day)\n\nTwo raags can use the exact same notes but sound completely different due to different emphasis, movement rules, and characteristic phrases.',
      },
      {
        type: 'comparison',
        title: 'Raag vs. Scale — Key Differences',
        content:
          'Understanding how a raag differs from a mere scale is crucial:',
        items: [
          { label: 'Movement rules', description: 'A scale goes straight up and down. A raag may skip notes, use zigzag approaches, and have different notes ascending vs. descending.' },
          { label: 'Note hierarchy', description: 'In a scale, all notes are equal. In a raag, the vadi and samvadi dominate; some notes are held longer, some are merely touched in passing.' },
          { label: 'Characteristic phrases (Pakad)', description: 'Every raag has signature phrases — short melodic fragments that instantly identify it. These are not part of a scale concept.' },
          { label: 'Mood and time', description: 'Raags carry specific emotional associations and are traditionally performed at particular times of day. Scales have no such associations.' },
        ],
      },
      {
        type: 'text',
        title: 'Beginner-Friendly Raags',
        content:
          '**Raag Yaman** (Kalyan Thaat)\n• Notes: Sa Re Ga Ma↑ Pa Dha Ni (all shuddha except Teevra Ma)\n• Aaroh: Ni Re Ga Ma↑ Pa Dha Ni Ṡa\n• Avaroh: Ṡa Ni Dha Pa Ma↑ Ga Re Sa\n• Vadi: Ga, Samvadi: Ni\n• Time: Early evening (sunset to night)\n• Mood: Romantic, devotional, luminous\n\n**Raag Bhupali** (Kalyan Thaat)\n• Notes: Sa Re Ga Pa Dha (pentatonic — no Ma, no Ni)\n• Aaroh: Sa Re Ga Pa Dha Ṡa\n• Avaroh: Ṡa Dha Pa Ga Re Sa\n• Vadi: Ga, Samvadi: Dha\n• Time: First quarter of night\n• Mood: Serene, peaceful, devotional\n\nBoth are excellent starting points because they use mostly shuddha swaras and have straightforward aaroh-avaroh patterns.',
      },
      {
        type: 'tip',
        title: 'How to Start Learning a Raag',
        content:
          '1. **Learn the aaroh-avaroh** — practice ascending and descending until automatic\n2. **Learn the pakad** — the signature phrase that defines the raag\n3. **Listen extensively** — find recordings by masters and listen repeatedly\n4. **Sing before playing** — vocalize the raag to internalize it, then translate to bansuri\n5. **Start simple** — play long, sustained notes before attempting ornamentation',
      },
    ],
    keyTerms: [
      { term: 'Raag (राग)', definition: 'A melodic framework with specific rules about notes, movement, emphasis, mood, and time — the central concept of Indian classical music.' },
      { term: 'Pakad (पकड़)', definition: 'The characteristic catch phrase of a raag — a short melodic fragment that immediately identifies it.' },
      { term: 'Samay (समय)', definition: 'The time of day traditionally associated with a raag\'s performance.' },
      { term: 'Rasa (रस)', definition: 'The emotional mood or aesthetic flavour evoked by a raag.' },
    ],
    quiz: [
      {
        question: 'What is the minimum number of notes required for a raag?',
        options: ['3', '5', '7', '12'],
        correctIndex: 1,
        explanation: 'A raag must have at least 5 notes. Five-note raags are called audav (pentatonic), six-note raags are shadav, and seven-note raags are sampurna.',
      },
      {
        question: 'What is a "pakad"?',
        options: [
          'A rhythmic pattern',
          'A breathing exercise',
          'The characteristic phrase that identifies a raag',
          'The speed of performance',
        ],
        correctIndex: 2,
        explanation: 'Pakad is the characteristic catch phrase of a raag — a short melodic fragment that immediately identifies it and distinguishes it from other raags using similar notes.',
      },
      {
        question: 'Which raag is commonly taught first to beginners?',
        options: ['Raag Bhairavi', 'Raag Todi', 'Raag Yaman', 'Raag Malkauns'],
        correctIndex: 2,
        explanation: 'Raag Yaman is often the first raag taught to beginners. It uses all shuddha swaras except Teevra Ma, has a straightforward structure, and its evening mood is inviting and beautiful.',
      },
    ],
    practiceLink: '/scale-trainer',
  },

  {
    id: 'meend-gamak',
    title: 'Meend & Gamak',
    module: 'applied',
    moduleOrder: 4,
    order: 2,
    estimatedMinutes: 10,
    icon: '〰️',
    sections: [
      {
        type: 'text',
        title: 'Ornamentation in Indian Music',
        content:
          'Indian classical music places enormous importance on **ornamentation** — the subtle embellishments that bring notes to life on the bansuri. These ornaments are considered essential, not optional — they are what transform a sequence of notes into music.\n\nOn the bansuri, ornamentation is particularly expressive because the instrument\'s open holes allow for smooth pitch manipulation. A bansuri player\'s artistry is often judged more by the quality of their meend, gamak, and kan swar than by the notes themselves.',
      },
      {
        type: 'comparison',
        title: 'Key Ornamental Techniques',
        content:
          'Here are the main ornamental techniques used in Indian classical music, with bansuri-specific guidance:',
        items: [
          { label: 'Meend (मींड) — Glide', description: 'A smooth, continuous pitch glide from one note to another. On bansuri, achieved by slowly sliding fingers off/on holes. The hallmark of bansuri playing — no other instrument can produce meend as naturally. The slide should be smooth and continuous, not stepped.' },
          { label: 'Gamak (गमक) — Oscillation', description: 'A rapid oscillation between two notes (usually adjacent). On bansuri, produced by quick finger movement on a hole. Creates intensity and energy. Used heavily in dhrupad and some khayal gayaki.' },
          { label: 'Kan (कण) — Grace Note', description: 'A brief, fleeting touch of an adjacent note before the main note. On bansuri, a quick tap on or off a hole. Very fast — should feel like a flicker, not a separate note. Example: touching Re briefly before landing on Ga.' },
          { label: 'Murki (मुर्की) — Rapid Cluster', description: 'A fast ornament involving 3–4 notes played as a quick cluster or turn. On bansuri, requires nimble fingers and clean articulation. Used to add sparkle and agility to phrases.' },
          { label: 'Andolan (आंदोलन) — Gentle Swing', description: 'A slow, gentle oscillation around a note — not reaching the next note but creating a subtle vibrato-like effect. Essential for komal swaras in many raags (e.g., komal Ga in Raag Todi).' },
        ],
      },
      {
        type: 'text',
        title: 'Bansuri-Specific Techniques',
        content:
          'The bansuri has unique advantages for ornamentation:\n\n• **Open holes** allow gradual uncovering for perfect meend — no keys or valves in the way\n• **Breath modulation** can create volume-based ornaments impossible on fixed-pitch instruments\n• **Finger vibrato** on half-covered holes produces natural andolan\n• **Tongue articulation** ("tu" or "du" syllables) can create rhythmic accents within ornaments\n\nThe combination of breath, finger, and tongue creates the three dimensions of bansuri ornamentation. Master players blend all three seamlessly.',
      },
      {
        type: 'tip',
        title: 'Practice Approach',
        content:
          'Start with meend between adjacent notes (Sa→Re, Re→Ga, etc.). Practice the glide very slowly — the slide should take 2–3 seconds, smoothly passing through all microtones in between. Then practice kan swar by touching Re briefly before playing Ga (Re-Ga). Only move to gamak and murki once your meend is smooth and controlled.',
      },
    ],
    keyTerms: [
      { term: 'Meend (मींड)', definition: 'A smooth glide between two notes — the bansuri\'s signature ornament, achieved by gradually sliding fingers.' },
      { term: 'Gamak (गमक)', definition: 'Rapid oscillation between two notes, creating intensity and energy.' },
      { term: 'Kan (कण)', definition: 'A grace note — a fleeting touch of an adjacent note before the main note.' },
      { term: 'Murki (मुर्की)', definition: 'A rapid ornamental cluster of 3–4 notes played as a quick turn.' },
    ],
    quiz: [
      {
        question: 'What is "meend" in Indian classical music?',
        options: [
          'A rhythmic pattern',
          'A smooth pitch glide between two notes',
          'A type of taal',
          'A fast melodic run',
        ],
        correctIndex: 1,
        explanation: 'Meend is a smooth, continuous pitch glide from one note to another. It is the bansuri\'s signature ornament, achieved by gradually sliding fingers on the open holes.',
      },
      {
        question: 'What is the difference between gamak and andolan?',
        options: [
          'Gamak is slow, andolan is fast',
          'Gamak is rapid oscillation between notes; andolan is gentle swinging around a single note',
          'They are the same technique',
          'Gamak uses breath, andolan uses fingers',
        ],
        correctIndex: 1,
        explanation: 'Gamak is a rapid oscillation between two distinct notes, while andolan is a gentle, slow swinging around a single note (like a wide vibrato) that doesn\'t quite reach the next note.',
      },
    ],
    practiceLink: '/practice/free',
  },

  {
    id: 'breath-tone',
    title: 'Breath & Tone Production',
    module: 'applied',
    moduleOrder: 4,
    order: 3,
    estimatedMinutes: 10,
    icon: '💨',
    sections: [
      {
        type: 'text',
        title: 'The Foundation of Bansuri Playing',
        content:
          'On the bansuri, **your breath IS the instrument.** The bansuri produces sound entirely through the player\'s breath stream — there are no strings, reeds, or keys to do the work for you. The quality of your tone — warm or thin, rich or breathy, focused or diffused — depends almost entirely on how you control your breath and embouchure.\n\nThis makes the bansuri both deceptively simple (just blow into a tube) and extraordinarily difficult to master (producing a beautiful, consistent tone requires years of practice). The good news: even small improvements in breath technique create dramatic improvements in sound quality.',
      },
      {
        type: 'comparison',
        title: 'Key Elements of Tone Production',
        content:
          'Four factors determine your bansuri tone:',
        items: [
          { label: 'Embouchure (Lip Position)', description: 'The position and shape of your lips against the blowing hole. Cover about 1/3 to 1/2 of the hole with your lower lip. The aperture (opening between your lips) should be small and focused, directed at the far edge of the hole. Even tiny adjustments change the tone dramatically.' },
          { label: 'Breath Angle', description: 'The angle at which air strikes the blowing edge. Too steep and the sound is airy; too flat and it\'s thin or breaks to the upper octave. Find the sweet spot where the note "blooms" — this is usually about 30-40 degrees from the plane of the flute.' },
          { label: 'Breath Pressure & Speed', description: 'The amount and speed of air flowing. Lower notes (mandra saptak) need slow, warm, relaxed air. Higher notes (taar saptak) need faster, more focused air. The transition between registers is about speed, not force — blowing harder just creates noise.' },
          { label: 'Diaphragmatic Support', description: 'Proper breath control comes from the diaphragm, not the chest or throat. The diaphragm provides steady, controlled airflow that sustains notes evenly. Chest breathing creates wavering, unstable tone.' },
        ],
      },
      {
        type: 'text',
        title: 'Diaphragmatic Breathing Exercise',
        content:
          'Practice this exercise daily before picking up your bansuri:\n\n1. **Lie on your back** with a book on your belly\n2. **Breathe in through your nose** — the book should rise (belly expands)\n3. **Breathe out through your mouth** with a slow, steady "sss" sound — the book lowers (belly contracts)\n4. **Time yourself**: aim for 4 seconds in, 8 seconds out, gradually increasing\n5. **Maintain steady airflow** — the "sss" should not waver in volume\n\nThis exercise trains your diaphragm to provide the consistent, controlled airflow that produces beautiful bansuri tone. After a month of daily practice, you will notice your notes are longer, steadier, and more resonant.',
      },
      {
        type: 'comparison',
        title: 'Common Mistakes & Fixes',
        content:
          'Here are the most common beginner tone problems and how to fix them:',
        items: [
          { label: 'Airy/Breathy Tone', description: 'Too much air escaping without vibrating. Fix: reduce aperture size, direct air more precisely at the far edge, and check lip coverage (should cover 1/3 to 1/2 of the hole).' },
          { label: 'No Sound in Upper Octave', description: 'Breath speed too slow for overblowing. Fix: increase air speed (not volume!) — think of cooling hot soup vs. blowing out candles. Tighten lip aperture slightly.' },
          { label: 'Wavering/Unstable Tone', description: 'Inconsistent air pressure, usually from chest breathing. Fix: practice diaphragmatic breathing exercises and long-tone practice (holding each note for 10+ seconds).' },
          { label: 'Notes Breaking/Cracking', description: 'Sudden jumps to upper octave. Fix: reduce breath pressure, relax your embouchure, and practice the transition zone between registers slowly.' },
        ],
      },
      {
        type: 'tip',
        title: 'Long Tone Practice',
        content:
          'The single most effective exercise for bansuri tone: play each note of the scale and **hold it for as long as possible** with a steady, even sound. Time yourself. Start with Sa and work up to Sa↑. Aim for 10 seconds per note initially, building to 20+ seconds. This builds both breath capacity and embouchure stability.',
      },
    ],
    keyTerms: [
      { term: 'Embouchure', definition: 'The position and shape of the lips when blowing into the bansuri — critical for tone quality.' },
      { term: 'Diaphragmatic Breathing', definition: 'Breathing from the diaphragm (belly breathing) rather than the chest — provides steady, controlled airflow.' },
      { term: 'Overblowing', definition: 'Increasing breath speed (not force) to produce notes in the upper octave (taar saptak) on the bansuri.' },
    ],
    quiz: [
      {
        question: 'How much of the blowing hole should be covered by the lower lip?',
        options: ['None', 'About 1/3 to 1/2', 'All of it', 'About 3/4'],
        correctIndex: 1,
        explanation: 'The lower lip should cover approximately 1/3 to 1/2 of the blowing hole. This coverage, combined with a focused air stream, produces the clearest tone.',
      },
      {
        question: 'How do you produce upper octave (taar saptak) notes?',
        options: [
          'By blowing much harder',
          'By covering more holes',
          'By increasing breath speed with a tighter aperture',
          'By tilting the flute away from you',
        ],
        correctIndex: 2,
        explanation: 'Upper octave notes are produced by increasing breath speed (not force) and tightening the lip aperture slightly. Think of the difference between gently cooling soup and blowing out candles.',
      },
      {
        question: 'What causes a wavering/unstable tone?',
        options: [
          'Playing too fast',
          'Inconsistent air pressure from chest breathing',
          'Using the wrong fingering',
          'Playing in the wrong key',
        ],
        correctIndex: 1,
        explanation: 'Wavering tone is usually caused by inconsistent air pressure from chest breathing. Diaphragmatic breathing provides the steady, controlled airflow needed for stable tone.',
      },
    ],
    practiceLink: '/practice/free',
  },

  {
    id: 'daily-routine',
    title: 'Building Your Practice Routine',
    module: 'applied',
    moduleOrder: 4,
    order: 4,
    estimatedMinutes: 8,
    icon: '📋',
    sections: [
      {
        type: 'text',
        title: 'Why Structure Matters',
        content:
          'Consistent, structured practice is far more effective than sporadic, aimless playing. A well-designed practice routine ensures you develop all aspects of bansuri playing — tone, technique, theory, and musicality — in a balanced way. Even 30 minutes of focused, structured practice yields better results than 2 hours of unfocused noodling.\n\nThe key principles of effective practice:\n• **Daily consistency** over duration — 30 minutes every day beats 3 hours once a week\n• **Deliberate practice** — focus on what\'s hard, not what\'s comfortable\n• **Progressive difficulty** — gradually increase challenge as each level becomes easy\n• **Active listening** — record yourself and listen critically',
      },
      {
        type: 'comparison',
        title: 'Suggested Daily Routine',
        content:
          'Here is a structured 45-minute practice routine that covers all essential areas:',
        items: [
          { label: 'Warm-up (5 min): Long Tones', description: 'Play each note of the shuddha saptak and hold for 8–10 seconds with steady breath. Focus on tone quality, not speed. This warms up your embouchure, opens your breath, and centers your intonation.' },
          { label: 'Scales (10 min): Aaroh-Avaroh', description: 'Play ascending and descending scales in vilambit (slow) and madhya (medium) laya. Use a metronome. Practice the shuddha saptak, then add komal/teevra variations. Focus on even timing and clean transitions.' },
          { label: 'Alankars (10 min): Pattern Practice', description: 'Pick 2–3 alankar patterns from the Sargam Practice section. Work through them at increasing speed. Focus on evenness — all notes should be equally clear and equally timed. Track your comfortable BPM.' },
          { label: 'Raag Practice (15 min): Musical Application', description: 'Work on your current raag. Start with the aaroh-avaroh, then practice the pakad (signature phrase). Try simple improvisation within the raag\'s rules. Listen to a recording of the raag for 5 minutes.' },
          { label: 'Cool-down (5 min): Free Play', description: 'End with free, relaxed playing. Explore sounds, try new ideas, or revisit favourite phrases. This is your reward for disciplined practice and keeps the joy alive.' },
        ],
      },
      {
        type: 'text',
        title: 'Tracking Progress',
        content:
          'Keep a practice journal (or use this app\'s Progress screen). Track:\n\n• **Date and duration** of each session\n• **Metronome speed** for each exercise — watch this number climb\n• **Accuracy scores** from the app\'s pitch detection\n• **Current raag** being studied\n• **Challenges** encountered and solutions tried\n• **Weekly goals** — specific, measurable targets\n\nProgress in music is often invisible day-to-day but dramatic over months. A practice journal makes the invisible visible and keeps you motivated.',
      },
      {
        type: 'tip',
        title: 'Adapting the Routine',
        content:
          'This routine is a starting point — adapt it to your level and goals:\n\n• **Complete beginner**: Spend more time on warm-up and scales, skip raag practice for now\n• **Intermediate**: Balance technique and musicality equally\n• **Time-limited (20 min)**: 3 min warm-up, 5 min scales, 5 min alankars, 7 min raag\n• **Before a performance**: Focus more on raag practice and reduce technical exercises\n\nThe most important thing is to practice every day, even if only for 15 minutes. Consistency compounds.',
      },
    ],
    keyTerms: [
      { term: 'Riyaz (रियाज़)', definition: 'The Hindi/Urdu word for musical practice — dedicated, disciplined repetition of exercises and musical material.' },
      { term: 'Deliberate Practice', definition: 'Focused practice on challenging material with immediate feedback — the most effective way to improve.' },
      { term: 'Long Tone', definition: 'An exercise where each note is sustained for as long as possible with steady, even breath — builds tone quality and breath control.' },
    ],
    quiz: [
      {
        question: 'What is the recommended warm-up exercise?',
        options: [
          'Fast scales to get fingers moving',
          'Long tones — holding each note with steady breath',
          'Jumping between distant notes',
          'Playing a full raag immediately',
        ],
        correctIndex: 1,
        explanation: 'Long tones (holding each note for 8–10 seconds with steady breath) are the ideal warm-up. They warm your embouchure, open your breath, and center your intonation without straining.',
      },
      {
        question: 'Which is more effective for improvement?',
        options: [
          '3 hours of practice once a week',
          '30 minutes of focused practice every day',
          'Playing only what you already know well',
          'Practicing without a metronome to feel free',
        ],
        correctIndex: 1,
        explanation: 'Daily consistency is far more effective than long but infrequent sessions. 30 minutes of focused, structured practice every day builds muscle memory, breath stamina, and neural pathways far better than sporadic long sessions.',
      },
    ],
    practiceLink: '/progress',
  },
]

// ── Helper functions ────────────────────────────────────────────────────────

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id)
}

export function getLessonsByModule(moduleId: string): Lesson[] {
  return LESSONS.filter((l) => l.module === moduleId).sort(
    (a, b) => a.order - b.order,
  )
}

export function getNextLesson(currentId: string): Lesson | undefined {
  const sorted = [...LESSONS].sort((a, b) =>
    a.moduleOrder !== b.moduleOrder
      ? a.moduleOrder - b.moduleOrder
      : a.order - b.order,
  )
  const idx = sorted.findIndex((l) => l.id === currentId)
  return idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : undefined
}

export function getPrevLesson(currentId: string): Lesson | undefined {
  const sorted = [...LESSONS].sort((a, b) =>
    a.moduleOrder !== b.moduleOrder
      ? a.moduleOrder - b.moduleOrder
      : a.order - b.order,
  )
  const idx = sorted.findIndex((l) => l.id === currentId)
  return idx > 0 ? sorted[idx - 1] : undefined
}
