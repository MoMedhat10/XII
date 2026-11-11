"use client"

import {
  OVERVIEW_RANGES,
  type OverviewRange,
} from "@/app/(dashboard)/dashboard/_utils/overview-schema"
import { cn } from "@/lib/utils"

const LABELS: Record<OverviewRange, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
}

/** The period every number on the overview covers. */
export function RangePicker({
  value,
  onChange,
}: {
  value: OverviewRange
  onChange: (range: OverviewRange) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Period"
      className="flex border-2 border-surface-variant max-sm:w-full"
    >
      {OVERVIEW_RANGES.map((range) => {
        const active = value === range
        return (
          <button
            key={range}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(range)}
            className={cn(
              "h-11 px-4 font-heading text-xs font-bold tracking-[1.5px] uppercase transition-colors max-sm:flex-1",
              active
                ? "bg-foreground text-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {LABELS[range]}
          </button>
        )
      })}
    </div>
  )
}
