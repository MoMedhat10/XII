"use client"

import type {
  AdminBrand,
  AdminWatch,
  AdminWatchImage,
} from "@/app/(dashboard)/_data/types"
import { cn } from "@/lib/utils"

import { LiveToggle } from "./live-toggle"
import { WatchRowActions } from "./watch-row-actions"
import { WatchRowImages } from "./watch-row-images"
import { brandNameFor, formatPrice, pad } from "./watch-utils"

export const tableColumns =
  "lg:grid lg:grid-cols-[minmax(180px,1.5fr)_minmax(0,2fr)_minmax(0,1fr)_110px_90px_70px_56px] lg:gap-5"

export type WatchRowHandlers = {
  onOpen: (watch: AdminWatch) => void
  onDelete: (watch: AdminWatch) => void
  onToggle: (watch: AdminWatch) => void
  onAddImages: (watch: AdminWatch) => void
  onRemoveImage: (watch: AdminWatch, image: AdminWatchImage) => void
  onSetCover: (watch: AdminWatch, imageId: string) => void
}

export function TableHead({ muted = false }: { muted?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        tableColumns,
        "hidden border-b-2 border-surface-variant py-3.5 font-mono text-[11px] tracking-[1px] uppercase",
        muted ? "text-surface-variant" : "text-muted-foreground"
      )}
    >
      <span>Images</span>
      <span>Reference</span>
      <span>Brand</span>
      <span className="text-right">Price</span>
      <span className="text-right">Stock</span>
      <span>Live</span>
      <span className="text-right">Actions</span>
    </div>
  )
}

function StockLabel({ stock }: { stock: number }) {
  return (
    <span
      className={cn(
        "font-heading text-sm font-bold tracking-[1px] tabular-nums",
        stock === 0 ? "text-gold" : "text-foreground"
      )}
    >
      {stock === 0 ? "SOLD OUT" : pad(stock)}
    </span>
  )
}

/** Stops row clicks from firing when using a control inside the row. */
const stop = (event: React.SyntheticEvent) => event.stopPropagation()

export function WatchesTable({
  watches,
  brands,
  pendingIds,
  imageBusyIds,
  handlers,
}: {
  watches: AdminWatch[]
  brands: AdminBrand[]
  pendingIds: ReadonlySet<string>
  /** watches with an image upload or reorder in flight */
  imageBusyIds: ReadonlySet<string>
  handlers: WatchRowHandlers
}) {
  return (
    <div role="list" aria-label="Watches">
      <TableHead />
      {watches.map((watch) => {
        const brand = brandNameFor(brands, watch.brandId)
        const toggleLabel = `${watch.isActive ? "Hide" : "Publish"} ${watch.name}`

        return (
          <div
            key={watch.id}
            role="listitem"
            onClick={() => handlers.onOpen(watch)}
            className={cn(
              tableColumns,
              "group/row cursor-pointer border-b-2 border-surface-variant py-[18px] transition-colors hover:bg-[#202222] lg:items-center",
              // Mobile / tablet: stacked card layout.
              "grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-4"
            )}
          >
            {/* Images: last row on mobile, first column on desktop */}
            <div
              onClick={stop}
              className="col-span-2 row-start-3 cursor-default lg:col-span-1 lg:row-start-auto"
            >
              <WatchRowImages
                watch={watch}
                busy={imageBusyIds.has(watch.id)}
                onAdd={handlers.onAddImages}
                onRemove={handlers.onRemoveImage}
                onSetCover={handlers.onSetCover}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-0.5">
              <button
                type="button"
                onClick={(event) => {
                  stop(event)
                  handlers.onOpen(watch)
                }}
                className="truncate text-left font-heading text-xl leading-[26px] font-semibold group-hover/row:text-gold"
              >
                {watch.name}
              </button>
              <span className="truncate font-mono text-[13px] text-muted-foreground">
                {watch.model || "—"}
                <span className="lg:hidden"> · {brand}</span>
              </span>
            </div>

            <span className="hidden truncate text-sm font-medium tracking-[0.08em] uppercase lg:block">
              {brand}
            </span>

            {/* Mobile: price + stock + live share one row */}
            <div className="col-span-2 row-start-2 flex items-center justify-between gap-4 lg:contents">
              <span className="font-heading text-lg font-bold text-gold lg:text-right">
                {formatPrice(watch.priceCents)}
              </span>
              <span className="flex items-center gap-2 lg:block lg:text-right">
                <span className="font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase lg:hidden">
                  Stock
                </span>
                <StockLabel stock={watch.stock} />
              </span>
              <span onClick={stop} className="flex cursor-default">
                <LiveToggle
                  checked={watch.isActive}
                  label={toggleLabel}
                  disabled={pendingIds.has(watch.id)}
                  onToggle={() => handlers.onToggle(watch)}
                />
              </span>
            </div>

            <div
              onClick={stop}
              className="col-start-2 row-start-1 flex cursor-default justify-end lg:col-start-auto lg:row-start-auto"
            >
              <WatchRowActions
                watch={watch}
                onEdit={handlers.onOpen}
                onDelete={handlers.onDelete}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
