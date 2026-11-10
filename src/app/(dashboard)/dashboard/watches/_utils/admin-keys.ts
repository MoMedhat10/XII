import type { WatchFilters } from "./watch-schema"

/**
 * Every admin query key, in one place. Keys are arrays that get more specific
 * left to right, so invalidating a prefix refreshes everything under it:
 * `adminKeys.watches()` hits every cached watch list (any filters, any page).
 *
 * Plain module (no "use client"): the server page uses the same keys when it
 * prefetches, which is how the client finds that data on first render.
 */
export const adminKeys = {
  all: ["admin"] as const,
  watches: () => [...adminKeys.all, "watches"] as const,
  watchLists: () => [...adminKeys.watches(), "list"] as const,
  watchList: (filters: WatchFilters) =>
    [...adminKeys.watchLists(), filters] as const,
  brands: () => [...adminKeys.all, "brands"] as const,
}

/** Mutation keys, so pending writes can be counted and listed (useMutationState). */
export const adminMutationKeys = {
  watches: () => [...adminKeys.watches()] as const,
  setActive: () => [...adminKeys.watches(), "set-active"] as const,
  images: () => [...adminKeys.watches(), "images"] as const,
}
