"use client"

import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

import type { AdminOrderDetail } from "@/app/(dashboard)/dashboard/orders/_data/types"
import type { OrderActions } from "@/app/(dashboard)/dashboard/orders/_hooks/mutations"
import type { OrderDialogKind } from "@/app/(dashboard)/dashboard/orders/_hooks/use-order-drawer"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { OrderStatusTrack } from "@/components/orders/order-status-track"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import {
  btn,
  btnDangerOutline,
  btnGold,
  btnOutline,
  closeBtn,
  eyebrowSm,
  portalTheme,
  sectionLabel,
} from "../styles"
import { formatDay } from "../users/user-badges"

type DetailQuery = {
  data: AdminOrderDetail | undefined
  isError: boolean
  error: Error | null
  isFetching: boolean
  refetch: () => unknown
}

const section =
  "flex flex-col gap-3 border-b-2 border-surface-variant px-5 py-5 sm:px-7"

export function OrderDrawer({
  open,
  detail,
  actions,
  onOpenChange,
  onAsk,
}: {
  open: boolean
  detail: DetailQuery
  actions: OrderActions
  onOpenChange: (open: boolean) => void
  onAsk: (kind: OrderDialogKind) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          portalTheme,
          "gap-0 bg-background p-0 text-sm data-[side=right]:w-full data-[side=right]:border-foreground data-[side=right]:sm:max-w-[560px]"
        )}
      >
        {detail.data ? (
          <DrawerBody detail={detail.data} actions={actions} onAsk={onAsk} />
        ) : (
          <>
            <SheetTitle className="sr-only">Order</SheetTitle>
            <SheetDescription className="sr-only">
              Order details
            </SheetDescription>
            <div className="flex justify-end px-5 pt-7 sm:px-7">
              <SheetClose asChild>
                <button type="button" aria-label="Close" className={closeBtn}>
                  ✕
                </button>
              </SheetClose>
            </div>
            {detail.isError ? (
              <div
                role="alert"
                className="flex flex-col items-start gap-4 px-5 py-10 sm:px-7"
              >
                <span className="font-mono text-xs tracking-[1px] text-danger uppercase">
                  Couldn&apos;t load this order
                </span>
                <p className="text-[15px] text-muted-foreground">
                  {detail.error?.message}
                </p>
                <Button
                  type="button"
                  disabled={detail.isFetching}
                  onClick={() => void detail.refetch()}
                  className={cn(btn, btnOutline)}
                >
                  {detail.isFetching ? "Retrying…" : "Retry"}
                </Button>
              </div>
            ) : (
              <div
                aria-busy="true"
                aria-label="Loading order"
                className="flex flex-col gap-3 px-5 py-6 sm:px-7"
              >
                <div className="h-3 w-28 animate-[xii-pulse_1.4s_ease-in-out_infinite] bg-card" />
                <div className="h-9 w-56 animate-[xii-pulse_1.4s_ease-in-out_infinite] bg-card" />
                <div className="mt-6 h-20 animate-[xii-pulse_1.4s_ease-in-out_infinite] bg-card" />
                <div className="h-40 animate-[xii-pulse_1.4s_ease-in-out_infinite] bg-card" />
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success("Tracking number copied")
  } catch {
    toast.error("Couldn't copy. Select the number instead.")
  }
}

function DrawerBody({
  detail,
  actions,
  onAsk,
}: {
  detail: AdminOrderDetail
  actions: OrderActions
  onAsk: (kind: OrderDialogKind) => void
}) {
  const { order: o, items, shipping, allowed } = detail
  const busy =
    actions.ship.isPending ||
    actions.deliver.isPending ||
    actions.cancel.isPending

  const timeline = [
    { label: "Placed", at: o.createdAt },
    { label: "Shipped", at: o.shippedAt },
    { label: "Delivered", at: o.deliveredAt },
    { label: "Cancelled", at: o.cancelledAt, danger: true },
  ].filter((t) => t.at)

  return (
    <>
      <div className="flex flex-col gap-3 border-b-4 border-foreground px-5 pt-7 pb-5 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className={eyebrowSm}>
              Order · Placed {formatDay(o.createdAt)}
            </span>
            <SheetTitle className="truncate font-mono text-[32px] leading-[1.1] font-bold tracking-[-0.01em]">
              {o.ref}
            </SheetTitle>
            <SheetDescription className="font-heading text-2xl font-bold text-gold tabular-nums">
              {formatCents(o.totalCents)}
              <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                {o.itemCount} {o.itemCount === 1 ? "piece" : "pieces"}
              </span>
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <button type="button" aria-label="Close" className={closeBtn}>
              ✕
            </button>
          </SheetClose>
        </div>
        <OrderStatusBadge status={o.status} className="self-start" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <section className={section} aria-labelledby="order-status">
          <h3 id="order-status" className={sectionLabel}>
            Status
          </h3>
          <OrderStatusTrack status={o.status} />
          <ol className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-1.5 font-mono text-[13px]">
            {timeline.map((t) => (
              <li key={t.label} className="contents">
                <span
                  className={cn(
                    "text-muted-foreground",
                    t.danger && "text-danger"
                  )}
                >
                  {t.label}
                </span>
                <span>{formatDay(t.at)}</span>
              </li>
            ))}
          </ol>
        </section>

        {o.trackingNumber && (
          <section className={section} aria-labelledby="order-tracking">
            <h3 id="order-tracking" className={sectionLabel}>
              Shipment · {o.carrier}
            </h3>
            <div className="flex items-center justify-between gap-3 border-2 border-surface-variant px-3.5 py-2.5">
              <span className="min-w-0 font-mono text-[15px] font-semibold break-all select-all">
                {o.trackingNumber}
              </span>
              <button
                type="button"
                onClick={() => void copy(o.trackingNumber!)}
                className="shrink-0 font-heading text-xs font-bold tracking-[1.5px] text-muted-foreground uppercase transition-colors hover:text-gold"
              >
                Copy
              </button>
            </div>
          </section>
        )}

        <section className={section} aria-labelledby="order-items">
          <h3 id="order-items" className={sectionLabel}>
            Items · {items.length} {items.length === 1 ? "line" : "lines"}
          </h3>
          <ul className="flex flex-col">
            {items.map((i) => (
              <li
                key={i.id}
                className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 border-t-2 border-surface-variant py-3 first:border-t-0 first:pt-0"
              >
                <span className="relative size-14 border-2 border-surface-variant bg-[#141515]">
                  {i.imageUrl && (
                    <Image
                      src={i.imageUrl}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase">
                    {i.brand} · {i.model}
                  </span>
                  <span className="truncate font-semibold">{i.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {i.quantity} × {formatCents(i.unitPriceCents)}
                  </span>
                </span>
                <span className="font-heading font-bold tabular-nums">
                  {formatCents(i.lineTotalCents)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t-2 border-surface-variant pt-2 font-heading font-bold">
            <span>{o.status === "CANCELLED" ? "Refund" : "Total paid"}</span>
            <span className="text-gold tabular-nums">
              {formatCents(o.totalCents)}
            </span>
          </div>
        </section>

        <section className={section} aria-labelledby="order-customer">
          <h3 id="order-customer" className={sectionLabel}>
            Customer
          </h3>
          <div className="flex items-start justify-between gap-3">
            <span className="flex min-w-0 flex-col gap-0.5">
              <span
                className={cn(
                  "truncate font-semibold",
                  !o.customer && "text-muted-foreground"
                )}
              >
                {o.customer?.username ?? "Account deleted"}
              </span>
              <span className="truncate font-mono text-[13px] text-muted-foreground">
                {o.customerEmail}
              </span>
            </span>
            {o.customer && (
              <Link
                href={`/dashboard/users?q=${encodeURIComponent(o.customerEmail)}`}
                className="shrink-0 border-b-2 border-foreground pb-0.5 font-heading text-xs font-bold tracking-[1.5px] uppercase transition-colors hover:border-gold hover:text-gold"
              >
                View user →
              </Link>
            )}
          </div>
        </section>

        <section className={section} aria-labelledby="order-ship-to">
          <h3 id="order-ship-to" className={sectionLabel}>
            Ship to
          </h3>
          {shipping ? (
            <address className="text-[15px] leading-6 not-italic">
              <span className="block font-semibold">{shipping.name}</span>
              {shipping.lines.map((l, i) => (
                <span key={i} className="block">
                  {l}
                </span>
              ))}
              {shipping.phone && (
                <span className="block font-mono text-[13px] text-muted-foreground">
                  {shipping.phone}
                </span>
              )}
            </address>
          ) : (
            <p className="text-muted-foreground">No address on file.</p>
          )}
        </section>
      </div>

      <div className="flex flex-col gap-3 border-t-4 border-foreground px-5 py-[18px] sm:px-7">
        {allowed.ship || allowed.deliver || allowed.cancel ? (
          <div className="flex flex-wrap gap-3">
            {allowed.ship && (
              <Button
                type="button"
                disabled={busy}
                onClick={() => onAsk("ship")}
                className={cn(btn, btnGold, "flex-1 px-4")}
              >
                Mark shipped
              </Button>
            )}
            {allowed.deliver && (
              <Button
                type="button"
                disabled={busy}
                onClick={() => onAsk("deliver")}
                className={cn(btn, btnGold, "flex-1 px-4")}
              >
                Mark delivered
              </Button>
            )}
            {allowed.cancel && (
              <Button
                type="button"
                disabled={busy}
                onClick={() => onAsk("cancel")}
                className={cn(btn, btnDangerOutline, "flex-1 px-4")}
              >
                Cancel order
              </Button>
            )}
          </div>
        ) : (
          <p className="font-mono text-xs text-muted-foreground">
            {o.status === "CANCELLED"
              ? "This order was cancelled. Nothing more to do."
              : "Delivered. Nothing more to do."}
          </p>
        )}
        {allowed.ship && (
          <p className="font-mono text-[11px] text-muted-foreground">
            Shipped orders can&apos;t be cancelled.
          </p>
        )}
      </div>
    </>
  )
}
