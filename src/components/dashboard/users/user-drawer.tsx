"use client"

import Image from "next/image"

import type { AdminUserDetail } from "@/app/(dashboard)/dashboard/users/_data/types"
import type { UserActions } from "@/app/(dashboard)/dashboard/users/_hooks/mutations"
import type { ConfirmKind } from "@/app/(dashboard)/dashboard/users/_hooks/use-user-drawer"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import {
  btn,
  btnDangerOutline,
  btnOutline,
  closeBtn,
  eyebrowSm,
  pad,
  portalTheme,
  sectionLabel,
  textLinkDanger,
} from "../styles"
import { UserBadges, formatDay } from "./user-badges"

type DetailQuery = {
  data: AdminUserDetail | undefined
  isError: boolean
  error: Error | null
  isFetching: boolean
  refetch: () => unknown
}

const section =
  "flex flex-col gap-3 border-b-2 border-surface-variant px-5 py-5 sm:px-7"

export function UserDrawer({
  open,
  detail,
  viewerId,
  actions,
  onOpenChange,
  onAsk,
}: {
  open: boolean
  detail: DetailQuery
  viewerId: string
  actions: UserActions
  onOpenChange: (open: boolean) => void
  onAsk: (kind: ConfirmKind) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          portalTheme,
          "gap-0 bg-background p-0 text-sm data-[side=right]:w-full data-[side=right]:border-foreground data-[side=right]:sm:max-w-[520px]"
        )}
      >
        {detail.data ? (
          <DrawerBody
            detail={detail.data}
            viewerId={viewerId}
            actions={actions}
            onAsk={onAsk}
          />
        ) : (
          <>
            <SheetTitle className="sr-only">User</SheetTitle>
            <SheetDescription className="sr-only">
              User details
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
                  Couldn&apos;t load this user
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
                aria-label="Loading user"
                className="flex flex-col gap-3 px-5 py-6 sm:px-7"
              >
                <div className="h-3 w-28 animate-[xii-pulse_1.4s_ease-in-out_infinite] bg-card" />
                <div className="h-9 w-56 animate-[xii-pulse_1.4s_ease-in-out_infinite] bg-card" />
                <div className="h-3 w-40 animate-[xii-pulse_1.4s_ease-in-out_infinite] bg-card" />
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

function DrawerBody({
  detail,
  viewerId,
  actions,
  onAsk,
}: {
  detail: AdminUserDetail
  viewerId: string
  actions: UserActions
  onAsk: (kind: ConfirmKind) => void
}) {
  const { user: c, recentOrders, wishlist, cart, sessions } = detail
  const target = { id: c.id, username: c.username }
  const isViewer = c.id === viewerId
  // the server enforces the same rule; hiding the buttons just avoids the error
  const canManage = c.role === "CUSTOMER" && !isViewer
  const busy =
    actions.signOut.isPending ||
    actions.verify.isPending ||
    actions.suspend.isPending ||
    actions.remove.isPending

  const stats = [
    { label: "Orders", value: pad(c.orderCount) },
    { label: "Spent", value: formatCents(c.lifetimeCents), gold: true },
    { label: "Wishlist", value: pad(wishlist.count) },
    { label: "In cart", value: pad(c.cartCount) },
  ]

  return (
    <>
      <div className="flex flex-col gap-3 border-b-4 border-foreground px-5 pt-7 pb-5 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className={eyebrowSm}>
              {c.role === "ADMIN" ? "Admin" : "Customer"} · Joined{" "}
              {formatDay(c.joinedAt)}
            </span>
            <SheetTitle className="truncate font-heading text-[36px] leading-[1.05] font-bold tracking-[-0.02em]">
              {c.username}
            </SheetTitle>
            <SheetDescription className="truncate font-mono text-[13px] text-muted-foreground">
              {c.email}
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <button type="button" aria-label="Close" className={closeBtn}>
              ✕
            </button>
          </SheetClose>
        </div>
        <UserBadges user={c} isViewer={isViewer} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <dl className="grid grid-cols-4 border-b-2 border-surface-variant">
          {stats.map(({ label, value, gold }, i) => (
            <div
              key={label}
              className={cn(
                "flex flex-col gap-1 px-3 py-4 first:pl-5 sm:first:pl-7",
                i > 0 && "border-l-2 border-surface-variant"
              )}
            >
              <dt className={sectionLabel}>{label}</dt>
              <dd
                className={cn(
                  "truncate font-heading text-lg font-bold tabular-nums",
                  gold && "text-gold"
                )}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <section className={section} aria-labelledby="user-orders">
          <h3 id="user-orders" className={sectionLabel}>
            Recent orders
          </h3>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="flex flex-col">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-t-2 border-surface-variant py-2.5 first:border-t-0"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-mono text-[13px] font-semibold">
                      {o.ref}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {formatDay(o.createdAt)} · {o.itemCount}{" "}
                      {o.itemCount === 1 ? "item" : "items"}
                    </span>
                  </span>
                  <OrderStatusBadge status={o.status} />
                  <span className="text-right font-heading font-bold tabular-nums">
                    {formatCents(o.totalCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={section} aria-labelledby="user-wishlist">
          <h3 id="user-wishlist" className={sectionLabel}>
            Wishlist · {pad(wishlist.count)}
          </h3>
          {wishlist.items.length === 0 ? (
            <p className="text-muted-foreground">Nothing saved.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2.5">
              {wishlist.items.map((w) => (
                <li key={w.watchId} className="flex min-w-0 flex-col gap-1">
                  <div className="relative aspect-square border-2 border-surface-variant bg-[#141515]">
                    {w.imageUrl && (
                      <Image
                        src={w.imageUrl}
                        alt=""
                        fill
                        sizes="140px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <span className="truncate text-xs font-semibold">
                    {w.name}
                  </span>
                  <span className="truncate font-mono text-[11px] text-muted-foreground uppercase">
                    {w.brand}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {wishlist.count > wishlist.items.length && (
            <span className="font-mono text-xs text-muted-foreground">
              + {wishlist.count - wishlist.items.length} more
            </span>
          )}
        </section>

        <section className={section} aria-labelledby="user-cart">
          <h3 id="user-cart" className={sectionLabel}>
            Cart
          </h3>
          {cart.lines.length === 0 ? (
            <p className="text-muted-foreground">Empty.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-1.5">
                {cart.lines.map((l) => (
                  <li
                    key={l.watchId}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span className="min-w-0 truncate">
                      {l.name}{" "}
                      <span className="font-mono text-xs text-muted-foreground">
                        × {l.quantity}
                      </span>
                    </span>
                    <span className="font-mono text-[13px] tabular-nums">
                      {formatCents(l.quantity * l.unitPriceCents)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t-2 border-surface-variant pt-2 font-heading font-bold">
                <span>Total</span>
                <span className="text-gold tabular-nums">
                  {formatCents(cart.totalCents)}
                </span>
              </div>
            </>
          )}
        </section>

        <section className={section} aria-labelledby="user-account">
          <h3 id="user-account" className={sectionLabel}>
            Account
          </h3>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-1.5 font-mono text-[13px]">
            <dt className="text-muted-foreground">Sessions</dt>
            <dd>
              {sessions.active} active · last sign-in{" "}
              {formatDay(sessions.lastSignInAt)}
            </dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd className={cn(!c.verifiedAt && "text-gold")}>
              {c.verifiedAt
                ? `Verified ${formatDay(c.verifiedAt)}`
                : "Not verified"}
            </dd>
            {c.suspendedAt && (
              <>
                <dt className="text-muted-foreground">Suspended</dt>
                <dd className="text-danger">
                  Since {formatDay(c.suspendedAt)}
                </dd>
              </>
            )}
          </dl>
        </section>
      </div>

      <div className="flex flex-col gap-3 border-t-4 border-foreground px-5 py-[18px] sm:px-7">
        <div className="flex flex-wrap gap-3">
          {!c.verifiedAt && (
            <Button
              type="button"
              disabled={busy}
              onClick={() => actions.verify.mutate(target)}
              className={cn(btn, btnOutline, "flex-1 px-4")}
            >
              {actions.verify.isPending && <Spinner aria-hidden="true" />}
              Mark verified
            </Button>
          )}
          {canManage && (
            <>
              <Button
                type="button"
                disabled={busy || sessions.active === 0}
                onClick={() => onAsk("sign-out")}
                title={sessions.active === 0 ? "No active sessions" : undefined}
                className={cn(btn, btnOutline, "flex-1 px-4")}
              >
                Sign out everywhere
              </Button>
              {c.suspendedAt ? (
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    actions.suspend.mutate({ ...target, suspended: false })
                  }
                  className={cn(btn, btnOutline, "flex-1 px-4")}
                >
                  {actions.suspend.isPending && <Spinner aria-hidden="true" />}
                  Unsuspend
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => onAsk("suspend")}
                  className={cn(btn, btnDangerOutline, "flex-1 px-4")}
                >
                  Suspend
                </Button>
              )}
            </>
          )}
        </div>
        {canManage ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAsk("delete")}
            className={cn(textLinkDanger, "disabled:opacity-40")}
          >
            Delete user
          </button>
        ) : (
          <p className="font-mono text-xs text-muted-foreground">
            {isViewer
              ? "This is your account: it can't be suspended or deleted here."
              : "Admin accounts can't be suspended or deleted here."}
          </p>
        )}
      </div>
    </>
  )
}
