import { useState } from 'react'

const EDUCATION = [
  {
    title: 'What is Sa?',
    body: 'Sa is your home note — the root of the scale. On your bansuri, it is the note you get when all holes are covered. Every other note is measured from Sa.',
  },
  {
    title: 'What is Re?',
    body: 'Re is the second note, one step above Sa. Think of it as the first step upward in your scale.',
  },
  {
    title: 'What is Ga?',
    body: 'Ga is the third note. It sits between Re and Ma, completing the lower half of the scale.',
  },
  {
    title: 'How tuning works',
    body: 'Each note has a target frequency. When you play, the app compares your sound to that target. The closer you are, the more in-tune you are.',
  },
  {
    title: 'How cents work',
    body: 'Cents measure tiny pitch differences. Zero cents means perfect. +10 means slightly sharp (too high). -10 means slightly flat (too low).',
  },
  {
    title: 'How scales work',
    body: 'A scale is a sequence of notes in order: Sa Re Ga Ma Pa Dha Ni Sa. Practicing scales builds muscle memory and breath control.',
  },
]

export function EducationalPanel() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-raised text-sm text-text-muted hover:text-text transition-colors"
      >
        <span>Learn the Basics</span>
        <span className="text-lg">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="divide-y divide-border">
          {EDUCATION.map((item, i) => (
            <div key={item.title}>
              <button
                type="button"
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-surface-overlay transition-colors"
              >
                {item.title}
              </button>
              {expanded === i && (
                <p className="px-4 pb-3 text-sm text-text-muted leading-relaxed">
                  {item.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
