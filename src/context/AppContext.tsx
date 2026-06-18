import { createContext, useContext, type ReactNode } from 'react'
import type { AppSettings, PracticeSession, UserStats } from '../types'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface AppContextValue {
  settings: AppSettings
  stats: UserStats
  updateSettings: (patch: Partial<AppSettings>) => void
  saveSession: (session: PracticeSession) => void
  activeSession: PracticeSession | null
  setActiveSession: (session: PracticeSession | null) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({
  children,
  activeSession,
  setActiveSession,
}: {
  children: ReactNode
  activeSession: PracticeSession | null
  setActiveSession: (session: PracticeSession | null) => void
}) {
  const { settings, stats, updateSettings, saveSession } = useLocalStorage()

  return (
    <AppContext.Provider
      value={{
        settings,
        stats,
        updateSettings,
        saveSession,
        activeSession,
        setActiveSession,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
