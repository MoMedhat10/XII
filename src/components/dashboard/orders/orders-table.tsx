"use client"

import Image from "next/image"

import type { AdminOrderRow } from "@/app/(dashboard)/dashboard/orders/_data/types"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import { formatDay } from "../users/user-badges"

export const orderColumns =
  "xl:grid xl:grid-cols-[150px_minmax(0,1.4fr)_minmax(0,1.6fr)_110px_130px_24px] xl:items-center xl:gap-5"

export function OrdersTableHead({ muted = false }: { muted?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        orderColumns,
        "hidden border-b-2 border-surface-variant py-3.5 font-mono text-[11px] tracking-[1px] uppercase",
        muted ? "text-surface-variant" : "text-muted-foreground"
      )}
    >
      <span>Order</span>
      <span>Customer</span>
      <span>Items</span>
      <span>Status</span>
      <span className="text-right">Total</span>
      <span />
    </div>
  )
}

const mobileLabel =
  "font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase xl:hidden"

/** Who placed it: their username, or a note once the account is gone. */
export function OrderCustomer({ order }: { order: AdminOrderRow }) {
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span
        className={cn(
          "truncate font-semibold",
          !order.customer && "text-muted-foreground"
        )}
      >
        {order.customer?.username ?? "Account deleted"}
      </span>
      <span className="truncate font-mono text-[13px] text-muted-foreground">
        {order.customerEmail}
      </span>
    </span>
  )
}

export function OrdersTable({
  orders,
  onOpen,
}: {
  orders: AdminOrderRow[]
  onOpen: (order: AdminOrderRow) => void
}) {
  return (
    <div role="list" aria-label="Orders">
      <OrdersTableHead />
      {orders.map((o) => (
        <div key={o.id} role="listitem">
          <button
            type="button"
            onClick={() => onOpen(o)}
            aria-label={`Open order ${o.ref}`}
            className={cn(
              orderColumns,
              "group/row grid w-full grid-cols-2 gap-x-4 gap-y-3 border-b-2 border-surface-variant py-[18px] text-left transition-colors hover:bg-[#202222]"
            )}
          >
            <span className="flex flex-col gap-0.5">
              <span className="font-mono text-[15px] font-semibold group-hover/row:text-gold">
                {o.ref}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {formatDay(o.createdAt)}
              </span>
            </span>

            <span className="flex justify-end xl:hidden">
              <OrderStatusBadge status={o.status} className="self-start" />
            </span>

            <span className="col-span-2 xl:col-span-1">
              <OrderCustomer order={o} />
            </span>

            <span className="col-span-2 flex min-w-0 items-center gap-3 xl:col-span-1">
              <span className="relative size-11 shrink-0 border-2 border-surface-variant bg-[#141515]">
                {o.previewUrl && (
                  <Image
                    src={o.previewUrl}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                )}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate">{o.firstItemName}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {o.itemCount} {o.itemCount === 1 ? "piece" : "pieces"}
                  {o.moreCount > 0 && ` · + ${o.moreCount} more`}
                </span>
              </span>
            </span>

            <span className="hidden xl:block">
              <OrderStatusBadge status={o.status} />
            </span>

            <span className="col-span-2 flex items-baseline justify-between gap-0.5 xl:col-span-1 xl:block xl:text-right">
              <span className={mobileLabel}>Total</span>
              <span
                className={cn(
                  "font-heading text-lg font-bold tabular-nums",
                  o.status === "CANCELLED"
                    ? "text-muted-foreground line-through"
                    : "text-gold"
                )}
              >
                {formatCents(o.totalCents)}
              </span>
            </span>

            <span
              aria-hidden="true"
              className="hidden font-heading text-lg text-muted-foreground group-hover/row:text-gold xl:block"
            >
              →
            </span>
          </button>
        </div>
      ))}
    </div>
  )
}
