"use client"

import { useUrlFilters } from "../../../_hooks/use-url-filters"
import { DEFAULT_USER_FILTERS, userFiltersSchema } from "../_utils/user-schema"

/** The users page's filters (q, role, status, sort, page), kept in the URL. */
export const useUserFilters = () =>
  useUrlFilters({
    schema: userFiltersSchema,
    defaults: DEFAULT_USER_FILTERS,
  })

export type UserFiltersApi = ReturnType<typeof useUserFilters>
