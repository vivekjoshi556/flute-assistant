import { useEffect, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { PracticeLayout } from '../components/PracticeLayout'
import { useTargetPractice } from '../hooks/useTargetPractice'
import { useApp } from '../context/AppContext'
import { getExerciseById } from '../music/lessonExercises'
import { getLessonById } from '../music/lessons'
import { exerciseNotesToTargets } from '../music/noteVariants'

export function LessonExerciseDetailScreen() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const { settings } = useApp()

  const exercise = exerciseId ? getExerciseById(exerciseId) : undefined
  const lesson = exercise ? getLessonById(exercise.lessonId) : undefined

  const targets = useMemo(
    () => (exercise ? exerciseNotesToTargets(exercise.notes, settings.baseOctave) : []),
    [exercise, settings.baseOctave],
  )

  const pendingStart = useRef(false)

  const practice = useTargetPractice({
    fluteKey: settings.fluteKey,
    targets,
    enabled: !!exercise,
  })

  useEffect(() => {
    pendingStart.current = false
  }, [exerciseId])

  useEffect(() => {
    if (exercise && targets.length > 0 && !pendingStart.current) {
      pendingStart.current = true
      practice.start()
    }
  }, [exerciseId, exercise, targets.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [exerciseId])

  if (!exercise || !lesson) {
    return (
      <Layout title="Not Found" backTo="/learn/exercises">
        <div className="p-8 text-center text-text-muted">Exercise not found.</div>
      </Layout>
    )
  }

  const isComplete = practice.phase === 'done'

  return (
    <Layout title={exercise.title} backTo="/learn/exercises" showMicHint>
      <div className="space-y-4 pb-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            to={`/learn/${lesson.id}`}
            className="rounded-full border border-border bg-surface-raised px-3 py-1 text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
          >
            ← {lesson.title}
          </Link>
          <span className="text-text-muted">{exercise.description}</span>
        </div>

        {!isComplete ? (
          <PracticeLayout
            target={practice.target}
            targetSequence={targets}
            currentIndex={practice.currentIndex}
            reading={practice.reading}
            chartPoints={practice.chartPoints}
            feedback={practice.feedback}
            targetCents={practice.targetCents}
            fluteKey={settings.fluteKey}
            baseOctave={settings.baseOctave}
            showHints={practice.showHints}
            hintsAvailable
            statusLabel="Play"
            footer={
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => practice.finishEarly()}
                  className="rounded-full border border-border px-6 py-2.5 text-sm text-text-muted transition-colors hover:text-text"
                >
                  Stop Exercise
                </button>
              </div>
            }
          />
        ) : (
          <div className="rounded-2xl border border-accent/30 bg-accent/10 p-8 text-center">
            <div className="mb-3 text-4xl">🌟</div>
            <h2 className="text-xl font-bold text-text">Exercise Complete</h2>
            <p className="mt-2 text-accent">{exercise.successMessage}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => practice.start()}
                className="rounded-full bg-accent px-6 py-2.5 font-semibold text-surface-raised hover:brightness-110"
              >
                Practice Again
              </button>
              <Link
                to="/learn/exercises"
                className="rounded-full border border-border px-6 py-2.5 text-sm text-text-muted hover:text-text"
              >
                All Exercises
              </Link>
            </div>
          </div>
        )}

        {practice.error && (
          <p className="text-center text-sm text-danger">{practice.error}</p>
        )}
      </div>
    </Layout>
  )
}
