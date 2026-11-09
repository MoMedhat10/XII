"use client"

import Link from "next/link"

import type { WatchDetail } from "@/app/(app)/watches/[id]/_data/types"
import { useWatchActions } from "@/app/(app)/watches/[id]/_hooks/use-watch-actions"
import { formatPrice } from "@/components/dashboard/watches/watch-utils"
import { ImageFallback } from "@/components/image-fallback"
import { cn } from "@/lib/utils"

const action =
  "flex h-11 items-center justify-center border-4 font-sans text-[11px] font-bold tracking-[1.5px] uppercase transition-colors"

/** Photo, name, price and the bag / save / remove actions for one column. */
export function CompareColumnHead({
  watch,
  signedIn,
  saved: savedInitially,
  inBag: inBagInitially,
  cheapest,
  onRemove,
}: {
  watch: WatchDetail
  signedIn: boolean
  saved: boolean
  inBag: boolean
  cheapest: boolean
  onRemove: () => void
}) {
  const soldOut = watch.stock <= 0
  const { saved, inBag, bagPending, savePending, addToBag, toggleSave } =
    useWatchActions(
      watch.id,
      { signedIn, saved: savedInitially, inBag: inBagInitially },
      soldOut
    )
  const cover = watch.images[0]

  return (
    <div className="flex h-full flex-col gap-3 p-3 sm:p-4">
      <div className="relative">
        <ImageFallback
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 30vw, 45vw"
          src={cover?.url}
          alt={cover?.alt || watch.name}
          label="No photograph"
          wrapperClassName="aspect-4/5 border-4 sm:aspect-square"
          className="object-cover"
        />
        <button
          type="button"
          aria-label={`Remove ${watch.name} from comparison`}
          onClick={onRemove}
          className="absolute top-2 right-2 flex size-9 cursor-pointer items-center justify-center border-4 border-foreground bg-background font-heading text-sm font-bold transition-colors hover:bg-foreground hover:text-black"
        >
          ✕
        </button>
        {cheapest && (
          <span className="absolute bottom-2 left-2 border-2 border-black bg-gold px-2 py-0.5 font-heading text-[11px] leading-4 font-bold tracking-[1.5px] text-black uppercase">
            Lowest price
          </span>
        )}
      </div>

      <div className="min-w-0">
        <span className="block truncate font-sans text-xs tracking-widest text-muted-foreground uppercase">
          {watch.brand} · {watch.model}
        </span>
        <Link
          href={`/watches/${watch.id}`}
          className="block font-heading text-lg leading-6 font-semibold text-balance transition-colors hover:text-gold sm:text-xl sm:leading-7"
        >
          {watch.name}
        </Link>
        <span className="mt-1 block font-heading text-lg font-bold text-gold">
          {formatPrice(watch.priceCents)}
        </span>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {inBag && !bagPending ? (
          <Link
            href="/cart"
            className={cn(action, "border-gold bg-gold text-black")}
          >
            In bag ✓
          </Link>
        ) : (
          <button
            type="button"
            onClick={addToBag}
            disabled={soldOut || bagPending}
            className={cn(
              action,
              soldOut
                ? "cursor-not-allowed border-surface-variant text-steel"
                : "cursor-pointer border-foreground bg-foreground text-black hover:bg-background hover:text-foreground disabled:cursor-wait"
            )}
          >
            {soldOut ? "Sold out" : bagPending ? "Adding…" : "Add to bag"}
          </button>
        )}
        <button
          type="button"
          onClick={toggleSave}
          disabled={savePending}
          aria-pressed={saved}
          className={cn(
            action,
            "cursor-pointer disabled:cursor-wait",
            saved
              ? "border-gold text-gold"
              : "border-foreground hover:border-gold hover:text-gold"
          )}
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>
    </div>
  )
}
