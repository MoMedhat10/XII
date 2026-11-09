"use client"

import { useSyncExternalStore } from "react"
import { toast } from "sonner"

import { COMPARE_MAX } from "../_utils/compare-schema"

/** What the tray needs to show a picked watch. */
export type CompareItem = {
  id: string
  name: string
  brand: string
  image: { url: string; alt: string } | null
}

// The picks live in this browser only, as a convenience while browsing.
// The compare page itself always renders from its URL.
const KEY = "xii:compare"
const EMPTY: CompareItem[] = []
const listeners = new Set<() => void>()

let cachedRaw: string | null = null
let cachedItems: CompareItem[] = EMPTY

function read(): CompareItem[] {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    return EMPTY // storage blocked (private mode): no memory, still works
  }
  // same string → same array, so React sees a stable snapshot
  if (raw === cachedRaw) return cachedItems
  cachedRaw = raw
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : []
    cachedItems = Array.isArray(parsed)
      ? (parsed as CompareItem[])
          .filter((i) => i && typeof i.id === "string")
          .slice(0, COMPARE_MAX)
      : EMPTY
  } catch {
    cachedItems = EMPTY
  }
  return cachedItems
}

function write(items: CompareItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, COMPARE_MAX)))
  } catch {
    // storage blocked: the change just isn't remembered
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // other tabs
  const onStorage = (e: StorageEvent) => e.key === KEY && listener()
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

/** The 2–4 watches picked for comparison, shared by every card and the tray. */
export function useCompareSelection() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY)

  const has = (id: string) => items.some((i) => i.id === id)

  const toggle = (item: CompareItem) => {
    const current = read()
    if (current.some((i) => i.id === item.id)) {
      return write(current.filter((i) => i.id !== item.id))
    }
    if (current.length >= COMPARE_MAX) {
      toast.info(`You can compare up to ${COMPARE_MAX} pieces`)
      return
    }
    write([...current, item])
  }

  const remove = (id: string) => write(read().filter((i) => i.id !== id))
  const clear = () => write([])
  const replace = (next: CompareItem[]) => write(next)

  return { items, has, toggle, remove, clear, replace }
}
