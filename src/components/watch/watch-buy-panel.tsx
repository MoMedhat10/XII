"use client"

import Link from "next/link"

import type {
  WatchDetail,
  WatchViewer,
} from "@/app/(app)/watches/[id]/_data/types"
import { useWatchActions } from "@/app/(app)/watches/[id]/_hooks/use-watch-actions"
import {
  CONDITION_LABEL,
  stockLabel,
} from "@/app/(app)/watches/[id]/_utils/labels"
import { eyebrow, monoCaption } from "@/components/home/styles"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

const badge =
  "flex h-8 shrink-0 items-center gap-2 border-2 px-2.5 font-sans text-xs font-bold tracking-[1px] whitespace-nowrap uppercase"

const bagButton =
  "flex h-[60px] items-center justify-center border-4 font-sans text-base font-bold tracking-[1.5px] uppercase transition-colors"

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}

/** Price, availability and the bag / save actions. */
export function WatchBuyPanel({
  watch,
  viewer,
  className,
}: {
  watch: WatchDetail
  viewer: WatchViewer
  className?: string
}) {
  const soldOut = watch.stock <= 0
  const { saved, inBag, bagPending, savePending, addToBag, toggleSave } =
    useWatchActions(watch.id, viewer, soldOut)

  return (
    <aside
      className={cn(
        "w-full max-w-[440px] animate-[xii-up_.8s_var(--ease-xii)_.1s_both] border-4 border-foreground bg-[#141515] lg:sticky lg:top-8",
        className
      )}
    >
      <div className="flex flex-col gap-2 border-b-4 border-foreground px-7 pt-7 pb-6">
        <span className={eyebrow}>{watch.brand}</span>
        <h1 className="font-heading text-[clamp(40px,3.6vw,56px)] leading-none font-bold tracking-[-0.02em] text-balance">
          {watch.name}
        </h1>
        <span className={cn(monoCaption, "text-steel")}>
          REF. {watch.model}
        </span>
        <span className="mt-3 font-heading text-[32px] leading-none font-bold text-gold">
          {formatCents(watch.priceCents)}
        </span>

        <div className="mt-3 flex flex-wrap gap-2">
          {watch.condition && (
            <span className={cn(badge, "border-gold text-gold")}>
              {CONDITION_LABEL[watch.condition]}
            </span>
          )}
          <span
            className={cn(
              badge,
              soldOut
                ? "border-surface-variant text-steel"
                : "border-foreground text-foreground"
            )}
          >
            <span aria-hidden="true" className="size-2 bg-current" />
            {stockLabel(watch.stock)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-7 py-6" aria-live="polite">
        {inBag && !bagPending ? (
          <Link
            href="/cart"
            className={cn(
              bagButton,
              "border-gold bg-gold text-black hover:bg-background hover:text-gold"
            )}
          >
            In your bag ✓ · View bag
          </Link>
        ) : (
          <button
            type="button"
            onClick={addToBag}
            disabled={soldOut || bagPending}
            className={cn(
              bagButton,
              soldOut
                ? "cursor-not-allowed border-surface-variant bg-surface-dim text-steel"
                : bagPending
                  ? "cursor-wait border-gold bg-background text-gold"
                  : "cursor-pointer border-foreground bg-foreground text-black hover:bg-background hover:text-foreground"
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
            "flex h-14 cursor-pointer items-center justify-center gap-2.5 border-4 font-sans text-sm font-bold tracking-[1.5px] uppercase transition-colors disabled:cursor-wait",
            saved
              ? "border-gold bg-gold text-black"
              : "border-foreground bg-transparent text-foreground hover:border-gold hover:text-gold"
          )}
        >
          <HeartIcon filled={saved} />
          {saved ? "Saved to vitrine" : "Save to vitrine"}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 border-t-2 border-dashed border-surface-variant px-7 py-4 font-sans text-sm leading-[22px] text-muted-foreground">
        <span>Armored, insured courier · Ferrari Group / Malca-Amit</span>
        <span>Certificate of authenticity included</span>
      </div>
    </aside>
  )
}
