import type { OverviewFilters } from "./overview-schema"

/**
 * Query keys for the overview. Every admin write that changes orders, users
 * or stock invalidates `overviewKeys.all()`. Plain module: the server page
 * prefetches under the same keys.
 */
export const overviewKeys = {
  all: () => ["admin", "overview"] as const,
  detail: (filters: OverviewFilters) =>
    [...overviewKeys.all(), filters] as const,
}
