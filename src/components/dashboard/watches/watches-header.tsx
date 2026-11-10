"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { PageHeader } from "../page-header"

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
    <PageHeader
      crumbs={["Admin", "Catalog", "Watches"]}
      eyebrow={<>Inventory · {total === null ? "—" : pad(total)} References</>}
      title="Watches"
      actions={
        <div
          className={cn(
            "flex w-full flex-wrap gap-3",
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
      }
    />
  )
}
