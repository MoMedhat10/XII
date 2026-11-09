import Link from "next/link"

import type { OrderDetail } from "@/app/(app)/orders/_data/types"
import { ImageFallback } from "@/components/image-fallback"
import { formatPrice } from "../dashboard/watches/watch-utils"
import { cn } from "@/lib/utils"

import { eyebrow, gutter, monoCaption, textLink } from "../home/styles"
import { CancelOrderButton } from "./cancel-order-button"
import { OrderStatusBadge } from "./order-status-badge"
import { OrderStatusTrack } from "./order-status-track"

const summaryRow =
  "flex justify-between gap-4 border-b-2 border-surface-variant py-3"

export function OrderDetailView({ order }: { order: OrderDetail }) {
  const total = formatPrice(order.totalCents)

  return (
    <section className={cn(gutter, "pt-20 pb-40 sm:pt-28")}>
      <div className="flex flex-wrap items-end justify-between gap-6 border-b-4 pb-6 sm:pb-8">
        <div className="min-w-0">
          <span className={cn(eyebrow, "mb-2")}>
            Order · {order.placedLabel}
          </span>
          <h1 className="font-heading text-[clamp(32px,5vw,72px)] leading-none font-bold tracking-[-0.02em] break-all">
            {order.ref}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <OrderStatusBadge status={order.status} className="text-sm" />
          <Link href="/orders" className={textLink}>
            All orders
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <OrderStatusTrack status={order.status} />
      </div>

      <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="min-w-0 lg:flex-1">
          <div
            className={cn(
              monoCaption,
              "border-b-2 border-surface-variant py-4 uppercase"
            )}
          >
            {order.items.length === 1
              ? "1 line"
              : `${order.items.length} lines`}
          </div>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[72px_1fr] items-start gap-x-4 gap-y-2 border-b-2 border-surface-variant py-5 sm:grid-cols-[88px_1fr_auto] sm:items-center"
            >
              <ImageFallback
                fill
                unoptimized
                sizes="88px"
                src={item.image?.url}
                alt={item.image?.alt || item.name}
                label="Photo"
                wrapperClassName="aspect-square border-4"
                className="object-cover"
              />
              <div className="min-w-0">
                <span className="block font-sans text-xs leading-5 tracking-[0.1em] text-muted-foreground uppercase sm:text-sm">
                  {item.brand} · {item.model}
                </span>
                <Link
                  href={`/watches/${item.watchId}`}
                  className="block font-heading text-xl leading-7 font-semibold transition-colors hover:text-gold sm:text-2xl sm:leading-8"
                >
                  {item.name}
                </Link>
                <span className="mt-1 block font-sans text-sm text-muted-foreground">
                  {item.quantity} × {formatPrice(item.unitPriceCents)}
                </span>
              </div>
              <span className="font-heading text-lg leading-7 font-bold tracking-[1px] text-gold max-sm:col-start-2 sm:text-right sm:text-xl">
                {formatPrice(item.lineTotalCents)}
              </span>
            </div>
          ))}
        </div>

        <aside className="w-full border-4 bg-[#141515] lg:sticky lg:top-8 lg:w-[380px] xl:w-[440px]">
          <div className={cn(monoCaption, "border-b-4 px-6 py-5")}>
            ORDER SUMMARY
          </div>
          <dl className="px-6 pt-2 font-sans text-base leading-6">
            <div className={summaryRow}>
              <dt>Subtotal</dt>
              <dd>{total}</dd>
            </div>
            <div className={summaryRow}>
              <dt>Insured courier</dt>
              <dd className="font-semibold text-gold">Complimentary</dd>
            </div>
            <div className={summaryRow}>
              <dt>Last update</dt>
              <dd className="text-muted-foreground">{order.updatedLabel}</dd>
            </div>
          </dl>

          <div className="mx-6 mt-6 flex items-baseline justify-between gap-4 border-t-4 pt-4">
            <span className="font-heading text-sm font-bold tracking-[1.5px] uppercase">
              Total paid
            </span>
            <span className="font-heading text-[32px] leading-10 font-bold text-gold sm:text-[40px] sm:leading-12">
              {total}
            </span>
          </div>

          <div className="flex flex-col gap-3 px-6 pt-5 pb-6">
            {order.canCancel && (
              <CancelOrderButton orderId={order.id} orderRef={order.ref} />
            )}
            <span className="font-mono text-[11px] leading-[18px] tracking-[0.1em] break-all text-muted-foreground uppercase">
              Confirmation sent to {order.customerEmail}
            </span>
          </div>
        </aside>
      </div>
    </section>
  )
}
