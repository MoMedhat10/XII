"use client"

import { useUrlFilters } from "../../../_hooks/use-url-filters"
import {
  DEFAULT_ORDER_FILTERS,
  orderFiltersSchema,
} from "../_utils/order-schema"

/** The orders page's filters (q, status, range, sort, page), kept in the URL. */
export const useOrderFilters = () =>
  useUrlFilters({
    schema: orderFiltersSchema,
    defaults: DEFAULT_ORDER_FILTERS,
  })

export type OrderFiltersApi = ReturnType<typeof useOrderFilters>
