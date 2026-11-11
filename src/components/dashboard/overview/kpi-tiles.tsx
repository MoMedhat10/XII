import type { AdminOverview } from "@/app/(dashboard)/dashboard/_data/overview-types"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import { pad } from "../styles"
import { formatChange } from "./overview-format"

/**
 * The four headline numbers for the period. The change is an arrow plus
 * text, never colour alone; red/green stay reserved for status.
 */
export function KpiTiles({ overview }: { overview: AdminOverview }) {
  const { kpis, days } = overview
  const tiles = [
    {
      label: "Revenue",
      kpi: kpis.revenueCents,
      format: formatCents,
      gold: true,
    },
    { label: "Orders", kpi: kpis.orders, format: pad },
    { label: "Avg order", kpi: kpis.avgOrderCents, format: formatCents },
    { label: "New customers", kpi: kpis.newCustomers, format: pad },
  ]

  return (
    <dl
      aria-label={`Last ${days} days`}
      className="grid grid-cols-2 border-b-2 border-surface-variant xl:grid-cols-4"
    >
      {tiles.map(({ label, kpi, format, gold }, i) => {
        const change = formatChange(kpi.value, kpi.previous)
        return (
          <div
            key={label}
            className={cn(
              "flex min-w-0 flex-col gap-2 border-surface-variant py-6 pr-4",
              // 2 × 2 below xl, one row of 4 from xl
              i % 2 === 1 && "max-xl:border-l-2 max-xl:pl-4",
              i >= 2 && "max-xl:border-t-2",
              i > 0 && "xl:border-l-2 xl:pl-6"
            )}
          >
            <dt className="font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase">
              {label}
            </dt>
            <dd
              className={cn(
                "truncate font-heading text-[clamp(28px,3.4vw,44px)] leading-none font-bold tabular-nums",
                gold && "text-gold"
              )}
            >
              {format(kpi.value)}
            </dd>
            <dd className="font-mono text-xs text-muted-foreground">
              <span
                className={cn(
                  "font-semibold",
                  change?.direction === "up" && "text-foreground"
                )}
              >
                {change?.label ?? "—"}
              </span>{" "}
              vs previous {days} days
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
