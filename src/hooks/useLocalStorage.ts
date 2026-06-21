import { useCallback, useEffect, useState } from 'react'
import type { AppSettings, PracticeSession, UserStats } from '../types'

const SETTINGS_KEY = 'bansuri-settings'
const STATS_KEY = 'bansuri-stats'

const DEFAULT_SETTINGS: AppSettings = {
  fluteKey: 'C',
  bansuriType: 'middle',
  baseOctave: 5,
  onboardingComplete: false,
  voiceNavigationEnabled: true,
}

const DEFAULT_STATS: UserStats = {
  practiceStreak: 0,
  totalPracticeTime: 0,
  lastSessionDuration: 0,
  lastPracticeDate: null,
  sessions: [],
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/** Ensure saved settings have newer fields (baseOctave, bansuriType). */
function migrateSettings(settings: AppSettings): AppSettings {
  const migrated = { ...settings }
  if (!migrated.baseOctave) {
    migrated.baseOctave = DEFAULT_SETTINGS.baseOctave
  }
  if (!migrated.bansuriType) {
    migrated.bansuriType = DEFAULT_SETTINGS.bansuriType
  }
  if (migrated.voiceNavigationEnabled === undefined) {
    migrated.voiceNavigationEnabled = true
  }
  return migrated
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function useLocalStorage() {
  const [settings, setSettings] = useState<AppSettings>(() =>
    migrateSettings(loadJSON(SETTINGS_KEY, DEFAULT_SETTINGS)),
  )
  const [stats, setStats] = useState<UserStats>(() =>
    loadJSON(STATS_KEY, DEFAULT_STATS),
  )

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  }, [stats])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const saveSession = useCallback((session: PracticeSession) => {
    setStats((prev) => {
      const duration = (session.endTime - session.startTime) / 1000
      const today = todayString()
      let streak = prev.practiceStreak

      if (prev.lastPracticeDate === today) {
        // same day, keep streak
      } else if (prev.lastPracticeDate === yesterdayString()) {
        streak += 1
      } else {
        streak = 1
      }

      return {
        practiceStreak: streak,
        totalPracticeTime: prev.totalPracticeTime + duration,
        lastSessionDuration: duration,
        lastPracticeDate: today,
        sessions: [session, ...prev.sessions].slice(0, 50),
      }
    })
  }, [])

  return { settings, stats, updateSettings, saveSession }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  const hours = Math.floor(mins / 60)
  const remainMins = mins % 60
  return `${hours}h ${remainMins}m`
}
