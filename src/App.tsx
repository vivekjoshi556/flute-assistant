import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { useApp } from './context/AppContext'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { HomeScreen } from './screens/HomeScreen'
import { FreePracticeScreen } from './screens/FreePracticeScreen'
import { GuidedPracticeScreen } from './screens/GuidedPracticeScreen'
import { NoteReferenceScreen } from './screens/NoteReferenceScreen'
import { ScaleTrainerScreen } from './screens/ScaleTrainerScreen'
import { ProgressScreen } from './screens/ProgressScreen'
import { SargamPracticeScreen } from './screens/SargamPracticeScreen'
import { SessionSummaryScreen } from './screens/SessionSummaryScreen'
import { DifficultNotesPracticeScreen } from './screens/DifficultNotesPracticeScreen'
import type { PracticeSession } from './types'

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { settings } = useApp()
  if (!settings.onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route
        path="/"
        element={
          <OnboardingGuard>
            <HomeScreen />
          </OnboardingGuard>
        }
      />
      <Route
        path="/practice/free"
        element={
          <OnboardingGuard>
            <FreePracticeScreen />
          </OnboardingGuard>
        }
      />
      <Route
        path="/practice/guided"
        element={
          <OnboardingGuard>
            {/* build failed so remove mode="guided" */}
            <GuidedPracticeScreen />
          </OnboardingGuard>
        }
      />
      <Route
        path="/reference"
        element={
          <OnboardingGuard>
            <NoteReferenceScreen />
          </OnboardingGuard>
        }
      />
      <Route
        path="/scale-trainer"
        element={
          <OnboardingGuard>
            <ScaleTrainerScreen />
          </OnboardingGuard>
        }
      />
      <Route
        path="/progress"
        element={
          <OnboardingGuard>
            <ProgressScreen />
          </OnboardingGuard>
        }
      />
      <Route
        path="/practice/sargam"
        element={
          <OnboardingGuard>
            <SargamPracticeScreen />
          </OnboardingGuard>
        }
      />
      <Route
        path="/session-summary"
        element={
          <OnboardingGuard>
            <SessionSummaryScreen />
          </OnboardingGuard>
        }
      />
      <Route
        path="/practice/difficult-notes"
        element={
          <OnboardingGuard>
            <DifficultNotesPracticeScreen />
          </OnboardingGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  const [activeSession, setActiveSession] = useState<PracticeSession | null>(null)

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppProvider
        activeSession={activeSession}
        setActiveSession={setActiveSession}
      >
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
