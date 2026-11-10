import type { UserFilters } from "./user-schema"

/**
 * Query keys for the users page. Invalidating `userKeys.all()`
 * refreshes every cached list and the open user's detail.
 * Plain module: the server page prefetches under the same keys.
 */
export const userKeys = {
  all: () => ["admin", "users"] as const,
  lists: () => [...userKeys.all(), "list"] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  detail: (id: string) => [...userKeys.all(), "detail", id] as const,
}
