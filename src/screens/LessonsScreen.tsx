import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { LESSONS, MODULES } from '../music/lessons'

export function useLessonProgress() {
  const [progress, setProgress] = useState<Record<string, { completed: boolean; quizScore?: number }>>(() => {
    const stored = localStorage.getItem('bansuri-lesson-progress')
    return stored ? JSON.parse(stored) : {}
  })

  const markCompleted = (lessonId: string, score?: number) => {
    const updated = { ...progress, [lessonId]: { completed: true, quizScore: score } }
    setProgress(updated)
    localStorage.setItem('bansuri-lesson-progress', JSON.stringify(updated))
  }

  return { progress, markCompleted }
}

export function LessonsScreen() {
  const navigate = useNavigate()
  const { progress } = useLessonProgress()
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(MODULES.map(m => m.id)))

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  const moduleStats = useMemo(() => {
    return MODULES.reduce((acc, mod) => {
      const moduleLessons = LESSONS.filter(l => l.module === mod.id)
      const completedCount = moduleLessons.filter(l => progress[l.id]?.completed).length
      acc[mod.id] = { total: moduleLessons.length, completed: completedCount }
      return acc
    }, {} as Record<string, { total: number; completed: number }>)
  }, [progress])

  return (
    <Layout title="Learn" backTo="/">
      <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
        {MODULES.sort((a, b) => a.order - b.order).map(mod => {
          const stats = moduleStats[mod.id]
          const isExpanded = expandedModules.has(mod.id)
          const lessons = LESSONS.filter(l => l.module === mod.id).sort((a, b) => a.order - b.order)

          return (
            <div key={mod.id} className="bg-surface border border-border rounded-xl overflow-hidden">
              {/* Module Header */}
              <button
                className="w-full px-4 py-4 flex items-center justify-between bg-surface-raised hover:bg-surface-overlay transition-colors text-left"
                onClick={() => toggleModule(mod.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl" aria-hidden="true">{mod.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-text">Module {mod.order}: {mod.name}</h2>
                    <p className="text-sm text-text-muted mt-1">{mod.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="text-sm font-medium text-text-muted">
                      {stats.completed} / {stats.total}
                    </div>
                    <div className="w-24 h-2 bg-surface-overlay rounded-full overflow-hidden border border-border">
                      <div 
                        className="h-full bg-accent transition-all duration-500" 
                        style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {/* Module Lessons List */}
              {isExpanded && (
                <div className="divide-y divide-border border-t border-border">
                  {lessons.map(lesson => {
                    const isCompleted = progress[lesson.id]?.completed
                    return (
                      <button
                        key={lesson.id}
                        className="w-full p-4 flex items-center gap-4 hover:bg-surface-overlay transition-colors text-left"
                        onClick={() => navigate(`/learn/${lesson.id}`)}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-overlay border border-border text-lg shrink-0">
                          {lesson.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className={`font-semibold ${isCompleted ? 'text-text-muted' : 'text-text'}`}>
                              {lesson.order}. {lesson.title}
                            </h3>
                            <span className="text-xs text-text-muted shrink-0 ml-2">
                              {lesson.estimatedMinutes} min
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded flex items-center gap-1">
                                ✓ Completed
                                {progress[lesson.id]?.quizScore !== undefined && (
                                  <span className="opacity-75">
                                    • Quiz: {progress[lesson.id]?.quizScore}/{lesson.quiz.length}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-text-muted">
                                {lesson.sections.length} sections • {lesson.quiz.length} questions
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
