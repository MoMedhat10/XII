"use client"

import type { AdminUserRow } from "@/app/(dashboard)/dashboard/users/_data/types"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import { pad } from "../styles"
import { UserBadges, formatDay } from "./user-badges"

export const userColumns =
  "xl:grid xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_110px_80px_130px_110px_24px] xl:items-center xl:gap-5"

export function UsersTableHead({ muted = false }: { muted?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        userColumns,
        "hidden border-b-2 border-surface-variant py-3.5 font-mono text-[11px] tracking-[1px] uppercase",
        muted ? "text-surface-variant" : "text-muted-foreground"
      )}
    >
      <span>User</span>
      <span>Status</span>
      <span>Joined</span>
      <span className="text-right">Orders</span>
      <span className="text-right">Spent</span>
      <span className="text-right">Last order</span>
      <span />
    </div>
  )
}

const mobileLabel =
  "font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase xl:hidden"

export function UsersTable({
  users,
  viewerId,
  onOpen,
}: {
  users: AdminUserRow[]
  viewerId: string
  onOpen: (user: AdminUserRow) => void
}) {
  return (
    <div role="list" aria-label="Users">
      <UsersTableHead />
      {users.map((c) => (
        <div key={c.id} role="listitem">
          <button
            type="button"
            onClick={() => onOpen(c)}
            aria-label={`Open ${c.username}`}
            className={cn(
              userColumns,
              "group/row grid w-full grid-cols-2 gap-x-4 gap-y-3 border-b-2 border-surface-variant py-[18px] text-left transition-colors hover:bg-[#202222]"
            )}
          >
            <span className="col-span-2 flex min-w-0 flex-col gap-0.5 xl:col-span-1">
              <span className="truncate font-heading text-xl leading-[26px] font-semibold group-hover/row:text-gold">
                {c.username}
              </span>
              <span className="truncate font-mono text-[13px] text-muted-foreground">
                {c.email}
              </span>
            </span>

            <span className="col-span-2 xl:col-span-1">
              <UserBadges user={c} isViewer={c.id === viewerId} />
              {c.role === "CUSTOMER" &&
                c.verifiedAt &&
                !c.suspendedAt &&
                c.id !== viewerId && (
                  <span className="font-mono text-xs text-muted-foreground">
                    Active
                  </span>
                )}
            </span>

            <span className="flex flex-col gap-0.5 font-mono text-[13px]">
              <span className={mobileLabel}>Joined</span>
              {formatDay(c.joinedAt)}
            </span>

            <span className="flex flex-col gap-0.5 xl:text-right">
              <span className={mobileLabel}>Orders</span>
              <span className="font-heading text-lg font-bold tabular-nums">
                {pad(c.orderCount)}
              </span>
            </span>

            <span className="flex flex-col gap-0.5 xl:text-right">
              <span className={mobileLabel}>Spent</span>
              <span
                className={cn(
                  "font-heading text-lg font-bold tabular-nums",
                  c.lifetimeCents > 0 ? "text-gold" : "text-muted-foreground"
                )}
              >
                {formatCents(c.lifetimeCents)}
              </span>
            </span>

            <span className="flex flex-col gap-0.5 font-mono text-[13px] xl:text-right">
              <span className={mobileLabel}>Last order</span>
              {formatDay(c.lastOrderAt)}
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
