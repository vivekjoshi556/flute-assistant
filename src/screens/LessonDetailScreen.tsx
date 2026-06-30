import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { getLessonById, getNextLesson, getPrevLesson } from '../music/lessons'
import { useLessonProgress } from './LessonsScreen'
import { useTonePlayer } from '../hooks/useTonePlayer'
import { useApp } from '../context/AppContext'
import type { IndianNote } from '../types'

export function LessonDetailScreen() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const { settings } = useApp()
  const { play } = useTonePlayer(settings.fluteKey)
  const { progress, markCompleted } = useLessonProgress()

  const lesson = lessonId ? getLessonById(lessonId) : undefined
  const prevLesson = lessonId ? getPrevLesson(lessonId) : undefined
  const nextLesson = lessonId ? getNextLesson(lessonId) : undefined

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  if (!lesson) {
    return (
      <Layout title="Not Found" backTo="/learn">
        <div className="p-8 text-center text-text-muted">Lesson not found.</div>
      </Layout>
    )
  }

  const isCompleted = progress[lesson.id]?.completed

  const handleQuizSelect = (qIndex: number, optIndex: number) => {
    if (quizSubmitted) return
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optIndex }))
  }

  const submitQuiz = () => {
    if (Object.keys(selectedAnswers).length < lesson.quiz.length) return
    let score = 0
    lesson.quiz.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctIndex) score++
    })
    setQuizSubmitted(true)
    markCompleted(lesson.id, score)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  const playNote = (noteLabel: string) => {
    // Basic extraction of base note
    const cleanNote = noteLabel.replace(/[^A-Za-z]/g, '').toUpperCase() as IndianNote
    let octave = settings.baseOctave
    if (noteLabel.includes('↑') || noteLabel.includes('̇')) octave += 1
    if (noteLabel.includes('↓') || noteLabel.includes('̣')) octave -= 1
    // Basic fallback validation
    const validNotes: IndianNote[] = ['SA', 'RE', 'GA', 'MA', 'PA', 'DHA', 'NI']
    if (validNotes.includes(cleanNote)) {
      play(cleanNote, 800, octave)
    }
  }

  return (
    <Layout title={lesson.title} onBack={() => navigate('/learn')}>
      <div className="max-w-3xl mx-auto p-4 space-y-8 pb-32">
        {/* Header */}
        <div className="text-center space-y-4 pb-6 border-b border-border">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-raised border border-border text-3xl">
            {lesson.icon}
          </div>
          <h1 className="text-3xl font-bold text-text">{lesson.title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-text-muted">
            <span>Module {lesson.moduleOrder} • Lesson {lesson.order}</span>
            <span>⏱️ {lesson.estimatedMinutes} min read</span>
            {isCompleted && <span className="text-accent font-medium">✓ Completed</span>}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {lesson.sections.map((sec, idx) => (
            <section key={idx} className="space-y-4">
              {sec.title && <h2 className="text-xl font-bold text-text">{sec.title}</h2>}
              
              {/* Text content rendered carefully (simple markdown-like replacement) */}
              <div 
                className="text-text-muted leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: sec.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong className="text-text">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em className="text-text italic">$1</em>')
                }}
              />

              {/* Note Diagram */}
              {sec.type === 'note-diagram' && sec.notes && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {sec.notes.map((n, i) => (
                    <button
                      key={i}
                      onClick={() => playNote(n)}
                      className="px-3 py-2 bg-surface-raised border border-border rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors"
                      title="Click to hear"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {/* Comparison / Items */}
              {sec.type === 'comparison' && sec.items && (
                <ul className="space-y-3 pt-2">
                  {sec.items.map((item, i) => (
                    <li key={i} className="bg-surface-raised border border-border rounded-lg p-4">
                      <strong className="text-text block mb-1">{item.label}</strong>
                      <span className="text-text-muted text-sm">{item.description}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Tip */}
              {sec.type === 'tip' && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 flex gap-4 mt-4">
                  <span className="text-accent text-xl shrink-0">💡</span>
                  <div className="text-text-muted text-sm leading-relaxed">{sec.content}</div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Key Terms */}
        {lesson.keyTerms && lesson.keyTerms.length > 0 && (
          <div className="bg-surface-raised border border-border rounded-xl p-6 mt-12">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <span>📖</span> Key Terms
            </h2>
            <dl className="space-y-4">
              {lesson.keyTerms.map((term, i) => (
                <div key={i}>
                  <dt className="font-semibold text-text">{term.term}</dt>
                  <dd className="text-sm text-text-muted mt-1">{term.definition}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Quiz */}
        {lesson.quiz && lesson.quiz.length > 0 && (
          <div className="border-t border-border pt-12 mt-12 space-y-8">
            <h2 className="text-2xl font-bold text-text text-center">Knowledge Check</h2>
            <div className="space-y-8">
              {lesson.quiz.map((q, qIndex) => {
                const isCorrect = selectedAnswers[qIndex] === q.correctIndex
                
                return (
                  <div key={qIndex} className="bg-surface-raised border border-border rounded-xl p-6">
                    <p className="font-medium text-text mb-4">
                      {qIndex + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => {
                        const isSelected = selectedAnswers[qIndex] === optIndex
                        const isRightOption = optIndex === q.correctIndex

                        let btnClass = 'w-full text-left p-3 rounded-lg border transition-all text-sm '
                        
                        if (!quizSubmitted) {
                          btnClass += isSelected 
                            ? 'bg-accent/20 border-accent text-text' 
                            : 'bg-surface border-border text-text-muted hover:border-text-muted hover:text-text'
                        } else {
                          if (isRightOption) {
                            btnClass += 'bg-accent/20 border-accent text-accent font-medium'
                          } else if (isSelected && !isRightOption) {
                            btnClass += 'bg-danger/20 border-danger text-danger'
                          } else {
                            btnClass += 'bg-surface border-border opacity-50 text-text-muted'
                          }
                        }

                        return (
                          <button
                            key={optIndex}
                            onClick={() => handleQuizSelect(qIndex, optIndex)}
                            disabled={quizSubmitted}
                            className={btnClass}
                          >
                            <span className="inline-block w-6 font-mono opacity-50">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                    {quizSubmitted && (
                      <div className={`mt-4 p-4 rounded-lg text-sm flex gap-3 ${isCorrect ? 'bg-accent/10 border border-accent/20 text-accent' : 'bg-danger/10 border border-danger/20 text-danger'}`}>
                        <span className="text-xl shrink-0">{isCorrect ? '✅' : '❌'}</span>
                        <div>
                          <strong className="block mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</strong>
                          <span className="opacity-90">{q.explanation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {!quizSubmitted && (
              <button
                onClick={submitQuiz}
                disabled={Object.keys(selectedAnswers).length < lesson.quiz.length}
                className="w-full py-4 rounded-xl bg-accent text-surface-raised font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Submit Answers
              </button>
            )}
            
            {quizSubmitted && (
              <div className="text-center p-6 bg-surface-raised border border-border rounded-xl">
                <h3 className="text-xl font-bold text-text mb-2">Lesson Completed! 🎉</h3>
                <p className="text-text-muted mb-6">
                  You scored {Object.values(selectedAnswers).reduce((score, ans, i) => ans === lesson.quiz[i].correctIndex ? score + 1 : score, 0)} out of {lesson.quiz.length}.
                </p>
                {lesson.practiceLink && (
                  <button
                    onClick={() => navigate(lesson.practiceLink!)}
                    className="px-6 py-3 bg-accent text-surface-raised rounded-full font-bold inline-block hover:brightness-110 transition-all"
                  >
                    Go to Practice Exercise
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-12 border-t border-border mt-12">
          {prevLesson ? (
            <button
              onClick={() => {
                setQuizSubmitted(false); setSelectedAnswers({}); window.scrollTo(0, 0);
                navigate(`/learn/${prevLesson.id}`)
              }}
              className="px-4 py-2 border border-border rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors text-sm"
            >
              ← Previous: {prevLesson.title}
            </button>
          ) : <div />}
          
          {nextLesson ? (
            <button
              onClick={() => {
                setQuizSubmitted(false); setSelectedAnswers({}); window.scrollTo(0, 0);
                navigate(`/learn/${nextLesson.id}`)
              }}
              className="px-4 py-2 border border-border rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors text-sm"
            >
              Next: {nextLesson.title} →
            </button>
          ) : (
            <button
              onClick={() => navigate('/learn')}
              className="px-4 py-2 border border-border rounded-lg text-accent hover:bg-accent/10 transition-colors text-sm"
            >
              Back to Modules
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}
