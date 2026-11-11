"use client"

import {
  DEFAULT_ORDER_FILTERS,
  ORDER_STATUS_FILTERS,
  type OrderFilters,
  type OrderRange,
  type OrderSort,
  type OrderStatusFilter,
} from "@/app/(dashboard)/dashboard/orders/_utils/order-schema"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { toolbarControl as control } from "../styles"

const STATUS_LABELS: Record<OrderStatusFilter, string> = {
  all: "All",
  PAID: "To ship",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

const RANGE_LABELS: Record<OrderRange, string> = {
  all: "All time",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
}

const SORT_LABELS: Record<OrderSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  "total-high": "Highest total",
  "total-low": "Lowest total",
}

const select =
  "min-w-[160px] flex-1 cursor-pointer px-3.5 text-[13px] font-semibold tracking-[1px] uppercase sm:flex-none"

export function OrdersToolbar({
  filters,
  onChange,
  onClear,
}: {
  /** with `q` = what's typed in the search box */
  filters: OrderFilters
  onChange: (patch: Partial<OrderFilters>) => void
  onClear: () => void
}) {
  const d = DEFAULT_ORDER_FILTERS
  const filtered =
    filters.q.trim() !== "" ||
    filters.status !== d.status ||
    filters.range !== d.range ||
    filters.sort !== d.sort

  return (
    <div className="flex flex-wrap items-center gap-3 border-b-2 border-surface-variant py-5">
      <Input
        type="search"
        value={filters.q}
        maxLength={100}
        onChange={(event) => onChange({ q: event.target.value })}
        placeholder="Search ref, email, name or watch"
        aria-label="Search orders"
        className={cn(control, "min-w-0 flex-[1_1_240px] px-4 text-[15px]")}
      />

      <div
        role="radiogroup"
        aria-label="Filter by status"
        className="flex border-2 border-surface-variant max-sm:w-full max-sm:flex-wrap"
      >
        {ORDER_STATUS_FILTERS.map((status) => {
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
                  ? status === "PAID"
                    ? "bg-gold text-black"
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
        value={filters.range}
        onChange={(event) =>
          onChange({ range: event.target.value as OrderRange })
        }
        aria-label="Filter by date placed"
        className={cn(control, select)}
      >
        {Object.entries(RANGE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={filters.sort}
        onChange={(event) =>
          onChange({ sort: event.target.value as OrderSort })
        }
        aria-label="Sort orders"
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
