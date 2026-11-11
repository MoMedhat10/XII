import Link from "next/link"

import type { AdminOverview } from "@/app/(dashboard)/dashboard/_data/overview-types"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import { sectionLabel } from "../styles"
import { UserBadges, formatDay } from "../users/user-badges"

const row =
  "group/row grid items-center gap-3 border-t-2 border-surface-variant py-3 transition-colors first:border-t-0 hover:bg-[#202222]"
const allLink =
  "self-start border-b-2 border-foreground pb-0.5 font-heading text-xs font-bold tracking-[1.5px] uppercase transition-colors hover:border-gold hover:text-gold"

export function RecentActivity({ overview }: { overview: AdminOverview }) {
  return (
    <section
      aria-label="Recent activity"
      className="grid gap-10 border-t-2 border-surface-variant py-8 xl:grid-cols-2"
    >
      <div className="flex flex-col gap-2">
        <h2 className={sectionLabel}>Latest orders</h2>
        {overview.recentOrders.length === 0 ? (
          <p className="py-3 text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="flex flex-col">
            {overview.recentOrders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/dashboard/orders?q=${o.ref}`}
                  className={cn(
                    row,
                    "grid-cols-[minmax(0,1fr)_auto_auto] max-sm:grid-cols-[minmax(0,1fr)_auto]"
                  )}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="font-mono text-[13px] font-semibold group-hover/row:text-gold">
                      {o.ref}
                    </span>
                    <span className="truncate font-mono text-[11px] text-muted-foreground">
                      {formatDay(o.createdAt)} ·{" "}
                      {o.customer?.username ?? o.customerEmail}
                    </span>
                  </span>
                  <OrderStatusBadge
                    status={o.status}
                    className="max-sm:hidden"
                  />
                  <span className="text-right font-heading font-bold tabular-nums">
                    {formatCents(o.totalCents)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/dashboard/orders" className={allLink}>
          All orders →
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className={sectionLabel}>Latest sign-ups</h2>
        {overview.recentSignups.length === 0 ? (
          <p className="py-3 text-muted-foreground">No customers yet.</p>
        ) : (
          <ul className="flex flex-col">
            {overview.recentSignups.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/dashboard/users?q=${encodeURIComponent(u.email)}`}
                  className={cn(row, "grid-cols-[minmax(0,1fr)_auto]")}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold group-hover/row:text-gold">
                      {u.username}
                    </span>
                    <span className="truncate font-mono text-[11px] text-muted-foreground">
                      {u.email}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {formatDay(u.joinedAt)}
                    </span>
                    <UserBadges
                      user={{
                        role: "CUSTOMER",
                        verifiedAt: u.verifiedAt,
                        suspendedAt: null,
                      }}
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/dashboard/users" className={allLink}>
          All users →
        </Link>
      </div>
    </section>
  )
}
