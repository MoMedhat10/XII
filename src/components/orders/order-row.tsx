import Link from "next/link"

import type { OrderSummary } from "@/app/(app)/orders/_data/types"
import { ImageFallback } from "@/components/image-fallback"
import { formatPrice } from "../dashboard/watches/watch-utils"
import { cn } from "@/lib/utils"

import { OrderStatusBadge } from "./order-status-badge"
import { rowLayout } from "./orders-layout"

const pieces = (n: number) => (n === 1 ? "1 piece" : `${n} pieces`)

export function OrderRow({ order }: { order: OrderSummary }) {
  const href = `/orders/${order.id}`

  return (
    <div
      className={cn(
        rowLayout,
        "relative border-b-2 border-surface-variant px-4 py-5 transition-colors hover:bg-card"
      )}
    >
      <ImageFallback
        fill
        unoptimized
        sizes="88px"
        src={order.preview?.url}
        alt={order.preview?.alt || order.firstItemName}
        label="Photo"
        wrapperClassName="aspect-square border-4"
        className="object-cover"
      />
      <div className="min-w-0">
        <span className="block font-mono text-xs leading-5 tracking-[0.1em] text-muted-foreground uppercase sm:text-sm">
          {order.ref}
          <span className="xl:hidden"> · {order.placedLabel}</span>
        </span>
        {/* the stretched link makes the whole row clickable */}
        <Link
          href={href}
          className="block truncate font-heading text-xl leading-7 font-semibold transition-colors after:absolute after:inset-0 hover:text-gold sm:text-2xl sm:leading-8"
        >
          {order.firstItemName}
        </Link>
        {order.moreCount > 0 && (
          <span className="block font-sans text-sm leading-5 text-muted-foreground">
            + {order.moreCount} more
          </span>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3 xl:hidden">
          <OrderStatusBadge status={order.status} />
          <span className="font-sans text-sm text-muted-foreground">
            {pieces(order.itemCount)}
          </span>
        </div>
      </div>
      <span className="font-sans text-base leading-6 max-xl:hidden">
        {order.placedLabel}
      </span>
      <span className="max-xl:hidden">
        <OrderStatusBadge status={order.status} />
      </span>
      <span className="font-sans text-base leading-6 max-xl:hidden">
        {pieces(order.itemCount)}
      </span>
      <span className="font-heading text-lg leading-7 font-bold tracking-[1px] text-gold max-xl:col-start-2 sm:text-xl xl:text-right">
        {formatPrice(order.totalCents)}
      </span>
      <span
        aria-hidden="true"
        className="font-sans text-xs font-bold tracking-[1.5px] uppercase max-xl:hidden xl:text-right"
      >
        View →
      </span>
    </div>
  )
}
