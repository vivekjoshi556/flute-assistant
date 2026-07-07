import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import {
  getExercisesGroupedByLesson,
  getExercisesByLesson,
} from '../music/lessonExercises'
import { MODULES, getLessonById } from '../music/lessons'

export function LessonExercisesScreen() {
  const navigate = useNavigate()
  const grouped = getExercisesGroupedByLesson()

  const moduleForLesson = (lessonId: string) =>
    MODULES.find((m) => m.id === getLessonById(lessonId)?.module)

  return (
    <Layout title="Lesson Exercises" backTo="/">
      <div className="space-y-8 pb-24">
        <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-6">
          <h2 className="font-display text-2xl font-semibold text-text">
            Play What You Learn
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Hands-on bansuri exercises tied to each lesson — komal swaras, thaats,
            meend patterns, and more. Listen first, then play along with mic feedback.
          </p>
        </div>

        {grouped.map(({ lessonId, exercises }) => {
          const lesson = getLessonById(lessonId)
          if (!lesson) return null
          const mod = moduleForLesson(lessonId)

          return (
            <section key={lessonId} className="space-y-3">
              <div className="flex items-center gap-3 px-1">
                <span className="text-2xl">{lesson.icon}</span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-accent">
                    {mod?.name ?? lesson.module}
                  </p>
                  <h3 className="font-semibold text-text">{lesson.title}</h3>
                </div>
              </div>

              <div className="space-y-2">
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => navigate(`/learn/exercises/${ex.id}`)}
                    className="group flex w-full items-center gap-4 rounded-xl border border-border bg-surface-raised p-4 text-left transition-all hover:border-accent/40 hover:bg-surface-overlay"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-lg">
                      🪈
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text group-hover:text-accent transition-colors">
                        {ex.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">
                        {ex.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs text-text-muted">{ex.estimatedMinutes} min</span>
                      <span className="mt-1 block text-text-muted group-hover:text-accent">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </Layout>
  )
}

export function getExerciseCountForLesson(lessonId: string): number {
  return getExercisesByLesson(lessonId).length
}
