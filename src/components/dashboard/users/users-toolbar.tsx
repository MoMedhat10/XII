"use client"

import {
  USER_STATUSES,
  DEFAULT_USER_FILTERS,
  type UserFilters,
  type UserRoleFilter,
  type UserSort,
  type UserStatusFilter,
} from "@/app/(dashboard)/dashboard/users/_utils/user-schema"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { toolbarControl as control } from "../styles"

const ROLE_LABELS: Record<UserRoleFilter, string> = {
  all: "All accounts",
  customer: "Customers",
  admin: "Admins",
}

const STATUS_LABELS: Record<UserStatusFilter, string> = {
  all: "All",
  verified: "Verified",
  unverified: "Unverified",
  suspended: "Suspended",
}

const SORT_LABELS: Record<UserSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  orders: "Most orders",
}

const select =
  "min-w-[160px] flex-1 cursor-pointer px-3.5 text-[13px] font-semibold tracking-[1px] uppercase sm:flex-none"

export function UsersToolbar({
  filters,
  onChange,
  onClear,
}: {
  /** with `q` = what's typed in the search box */
  filters: UserFilters
  onChange: (patch: Partial<UserFilters>) => void
  onClear: () => void
}) {
  const d = DEFAULT_USER_FILTERS
  const filtered =
    filters.q.trim() !== "" ||
    filters.role !== d.role ||
    filters.status !== d.status ||
    filters.sort !== d.sort

  return (
    <div className="flex flex-wrap items-center gap-3 border-b-2 border-surface-variant py-5">
      <Input
        type="search"
        value={filters.q}
        maxLength={100}
        onChange={(event) => onChange({ q: event.target.value })}
        placeholder="Search username or email"
        aria-label="Search users"
        className={cn(control, "min-w-0 flex-[1_1_240px] px-4 text-[15px]")}
      />

      <select
        value={filters.role}
        onChange={(event) =>
          onChange({ role: event.target.value as UserRoleFilter })
        }
        aria-label="Filter by role"
        className={cn(control, select)}
      >
        {Object.entries(ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <div
        role="radiogroup"
        aria-label="Filter by account status"
        className="flex border-2 border-surface-variant max-sm:w-full"
      >
        {USER_STATUSES.map((status) => {
          const active = filters.status === status
          return (
            <button
              key={status}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange({ status })}
              className={cn(
                "h-11 px-3.5 font-heading text-xs font-bold tracking-[1.5px] uppercase transition-colors max-sm:flex-1 max-sm:px-2",
                active
                  ? status === "suspended"
                    ? "bg-danger text-black"
                    : "bg-foreground text-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {STATUS_LABELS[status]}
            </button>
          )
        })}
      </div>

      <select
        value={filters.sort}
        onChange={(event) => onChange({ sort: event.target.value as UserSort })}
        aria-label="Sort users"
        className={cn(control, select)}
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {filtered && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear all filters"
          className="h-12 border-2 border-surface-variant px-4 font-heading text-xs font-bold tracking-[1.5px] text-muted-foreground uppercase transition-colors hover:border-gold hover:text-gold max-sm:w-full"
        >
          ✕ Clear
        </button>
      )}
    </div>
  )
}
