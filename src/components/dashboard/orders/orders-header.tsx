import type { AdminOrderSummary } from "@/app/(dashboard)/dashboard/orders/_data/types"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import { PageHeader } from "../page-header"
import { pad } from "../styles"

export function OrdersHeader({
  summary,
}: {
  /** null while loading or after an error */
  summary: AdminOrderSummary | null
}) {
  const count = (n: number | undefined) => (n === undefined ? "—" : pad(n))
  const tiles = [
    {
      label: "To ship",
      value: count(summary?.toShip),
      // the work waiting for the admin, so it's the one that stands out
      gold: (summary?.toShip ?? 0) > 0,
    },
    { label: "Shipped", value: count(summary?.shipped) },
    { label: "Delivered", value: count(summary?.delivered) },
    { label: "Cancelled", value: count(summary?.cancelled) },
    {
      label: "Revenue · 30 days",
      value: summary ? formatCents(summary.revenue30dCents) : "—",
    },
  ]

  return (
    <>
      <PageHeader
        crumbs={["Admin", "Commerce", "Orders"]}
        eyebrow={<>Commerce · {count(summary?.toShip)} to ship</>}
        title="Orders"
      />
      <dl className="grid grid-cols-2 border-b-2 border-surface-variant sm:grid-cols-5">
        {tiles.map(({ label, value, gold }, i) => (
          <div
            key={label}
            className={cn(
              "flex min-w-0 flex-col gap-1 py-5 pr-4",
              i > 0 && "sm:border-l-2 sm:border-surface-variant sm:pl-5",
              i % 2 === 1 &&
                "max-sm:border-l-2 max-sm:border-surface-variant max-sm:pl-4",
              // the odd one out on phones spans the full row
              i === tiles.length - 1 &&
                "max-sm:col-span-2 max-sm:border-t-2 max-sm:border-l-0 max-sm:pl-0"
            )}
          >
            <dt className="font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase">
              {label}
            </dt>
            <dd
              className={cn(
                "truncate font-heading text-3xl font-bold tabular-nums",
                gold && "text-gold"
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </>
  )
}
