import Link from "next/link"

import type { OrderStatus } from "@/app/generated/prisma/enums"
import type { OrderCounts } from "@/app/(app)/orders/_data/types"
import {
  ORDER_STATUSES,
  STATUS_LABEL,
} from "@/app/(app)/orders/_utils/order-format"
import { cn } from "@/lib/utils"

const pad = (n: number) => String(n).padStart(2, "0")

/** Plain links to `?status=`; changing the filter starts back at one page. */
export function OrdersStatusFilter({
  status,
  counts,
}: {
  status: OrderStatus | null
  counts: OrderCounts
}) {
  const chips = [
    { key: "ALL", label: "All", href: "/orders", count: counts.ALL },
    ...ORDER_STATUSES.map((s) => ({
      key: s,
      label: STATUS_LABEL[s],
      href: `/orders?status=${s}`,
      count: counts[s],
    })),
  ]
  const active = status ?? "ALL"

  return (
    <nav
      aria-label="Filter orders by status"
      className="flex flex-wrap gap-2 border-b-2 border-surface-variant py-5"
    >
      {chips.map((chip) => {
        const current = chip.key === active
        return (
          <Link
            key={chip.key}
            href={chip.href}
            replace
            scroll={false}
            aria-current={current ? "page" : undefined}
            className={cn(
              "inline-flex h-10 items-center gap-2 border-4 px-4 font-sans text-xs font-bold tracking-[1.5px] uppercase transition-colors",
              current
                ? "border-gold bg-gold text-white"
                : "bg-background hover:bg-foreground hover:text-black"
            )}
          >
            {chip.label}
            <span className="font-mono font-normal opacity-80">
              {pad(chip.count)}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
