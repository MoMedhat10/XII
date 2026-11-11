import type { OrderFilters } from "./order-schema"

/**
 * Query keys for the orders page. Invalidating `orderKeys.all()`
 * refreshes every cached list and the open order's detail.
 * Plain module: the server page prefetches under the same keys.
 */
export const orderKeys = {
  all: () => ["admin", "orders"] as const,
  lists: () => [...orderKeys.all(), "list"] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  detail: (id: string) => [...orderKeys.all(), "detail", id] as const,
}
