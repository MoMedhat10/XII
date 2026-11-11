import { z } from "zod"

export const OVERVIEW_RANGES = ["7d", "30d", "90d"] as const
export type OverviewRange = (typeof OVERVIEW_RANGES)[number]

export const RANGE_DAYS: Record<OverviewRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
}

/** Falls back to 30 days, so any URL parses. */
export const overviewFiltersSchema = z.object({
  range: z.enum(OVERVIEW_RANGES).catch("30d"),
})

export type OverviewFilters = z.infer<typeof overviewFiltersSchema>

export const DEFAULT_OVERVIEW_FILTERS: OverviewFilters = { range: "30d" }
