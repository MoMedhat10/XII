"use client"

import { useUrlFilters } from "../../../_hooks/use-url-filters"
import { watchFiltersSchema } from "../_utils/watch-schema"
import { DEFAULT_FILTERS } from "../_utils/watches-client"

/** The watches page's filters (q, brand, status, page), kept in the URL. */
export const useWatchFilters = () =>
  useUrlFilters({ schema: watchFiltersSchema, defaults: DEFAULT_FILTERS })

export type WatchFiltersApi = ReturnType<typeof useWatchFilters>
