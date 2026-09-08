"use client"

import { useSyncExternalStore } from "react"

interface CooldownStore {
  getSnapshot: () => number
  getServerSnapshot: () => number
  subscribe: (callback: () => void) => () => void
  start: (duration?: number) => void
  reset: () => void
}

// Map to share store instances by key across components / re-renders
const stores = new Map<string, CooldownStore>()

function createCooldownStore(key: string, defaultDuration = 90): CooldownStore {
  const subscribers = new Set<() => void>()
  let timerId: ReturnType<typeof setInterval> | null = null

  const calculateRemaining = (): number => {
    if (typeof window === "undefined") return 0
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return 0
      const expiry = parseInt(stored, 10)
      if (isNaN(expiry)) {
        localStorage.removeItem(key)
        return 0
      }
      const diff = Math.ceil((expiry - Date.now()) / 1000)
      if (diff <= 0) {
        localStorage.removeItem(key)
        return 0
      }
      return diff
    } catch {
      return 0
    }
  }

  let currentRemaining = calculateRemaining()

  const notify = () => {
    subscribers.forEach((cb) => cb())
  }

  const stopTimer = () => {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
  }

  const tick = () => {
    const next = calculateRemaining()
    if (next !== currentRemaining) {
      currentRemaining = next
      notify()
    }
    if (next <= 0) {
      stopTimer()
    }
  }

  const startTimer = () => {
    if (timerId !== null) return
    timerId = setInterval(tick, 1000)
  }

  // If already active on initialization, start the timer
  if (currentRemaining > 0) {
    startTimer()
  }

  const start = (duration = defaultDuration) => {
    if (typeof window === "undefined") return
    try {
      const expiry = Date.now() + duration * 1000
      localStorage.setItem(key, expiry.toString())
      currentRemaining = duration
      notify()
      startTimer()
    } catch (e) {
      console.error("Failed to save cooldown to localStorage", e)
    }
  }

  const reset = () => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(key)
      currentRemaining = 0
      stopTimer()
      notify()
    } catch (e) {
      console.error("Failed to clear cooldown from localStorage", e)
    }
  }

  // Cross-tab storage synchronization listener
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key === key) {
        const next = calculateRemaining()
        currentRemaining = next
        notify()
        if (next > 0) {
          startTimer()
        } else {
          stopTimer()
        }
      }
    })
  }

  return {
    getSnapshot: () => currentRemaining,
    getServerSnapshot: () => 0,
    subscribe: (callback: () => void) => {
      subscribers.add(callback)
      // Check immediately on subscription
      const remaining = calculateRemaining()
      if (remaining !== currentRemaining) {
        currentRemaining = remaining
        callback()
      }
      if (remaining > 0) {
        startTimer()
      }
      return () => {
        subscribers.delete(callback)
      }
    },
    start,
    reset,
  }
}

function getOrCreateStore(key: string, defaultDuration: number): CooldownStore {
  let store = stores.get(key)
  if (!store) {
    store = createCooldownStore(key, defaultDuration)
    stores.set(key, store)
  }
  return store
}

export function useCooldown(key = "xii_verify_email_cooldown", durationSeconds = 90) {
  const store = getOrCreateStore(key, durationSeconds)
  const secondsLeft = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  )

  return {
    secondsLeft,
    isActive: secondsLeft > 0,
    start: (duration?: number) => store.start(duration),
    reset: () => store.reset(),
  }
}
