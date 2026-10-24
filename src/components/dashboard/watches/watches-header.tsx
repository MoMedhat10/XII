"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { btn, btnGold, btnOutline, pad } from "./watch-utils"

export function WatchesHeader({
  total,
  brandCount,
  disabled = false,
  onOpenBrands,
  onNewWatch,
}: {
  /** null while the count is unknown (loading / error). */
  total: number | null
  brandCount: number | null
  disabled?: boolean
  onOpenBrands?: () => void
  onNewWatch?: () => void
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 border-b-4 pb-7">
      <div className="flex min-w-0 flex-auto flex-col gap-2">
        <span className="font-heading text-sm leading-6 font-bold tracking-[1.5px] whitespace-nowrap text-gold uppercase">
          Inventory · {total === null ? "—" : pad(total)} References
        </span>
        <h1 className="font-heading text-[clamp(48px,6vw,88px)] leading-none font-bold tracking-[-0.02em]">
          Watches
        </h1>
      </div>

      <div
        className={cn(
          "flex w-full flex-wrap gap-3 sm:w-auto",
          disabled && "pointer-events-none opacity-40"
        )}
      >
        <Button
          type="button"
          onClick={onOpenBrands}
          disabled={disabled}
          className={cn(btn, btnOutline, "flex-1 px-[22px] sm:flex-none")}
        >
          <span
            aria-hidden="true"
            className="circle size-3.5 border-2 border-current"
          />
          Brands
          <span className="font-mono text-xs tracking-normal">
            {brandCount ?? "—"}
          </span>
        </Button>
        <Button
          type="button"
          onClick={onNewWatch}
          disabled={disabled}
          className={cn(btn, btnGold, "flex-1 sm:flex-none")}
        >
          + New watch
        </Button>
      </div>
    </header>
  )
}
