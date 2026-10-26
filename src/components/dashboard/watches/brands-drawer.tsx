/* eslint-disable @next/next/no-img-element -- logos are blob: URLs from local uploads */
"use client"

import type { AdminBrand } from "@/app/(dashboard)/_data/types"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import {
  btn,
  btnGold,
  closeBtn,
  eyebrowSm,
  initials,
  pad,
  portalTheme,
} from "./watch-utils"

const rowLink =
  "border-b-2 border-surface-variant pb-0.5 font-sans text-[11px] font-bold tracking-[1.5px] uppercase transition-colors hover:border-gold hover:text-gold"

export function BrandLogo({
  brand,
  className,
}: {
  brand: Pick<AdminBrand, "name" | "logoUrl">
  className?: string
}) {
  return (
    <div
      className={cn(
        "circle flex size-12 shrink-0 items-center justify-center overflow-hidden border-2 border-foreground font-heading text-[13px] font-bold",
        className
      )}
    >
      {brand.logoUrl ? (
        <img
          src={brand.logoUrl}
          alt={`${brand.name} logo`}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials(brand.name)}</span>
      )}
    </div>
  )
}

export function BrandsDrawer({
  open,
  brands,
  freshId,
  onOpenChange,
  onNewBrand,
  onEditBrand,
  onDeleteBrand,
  onFilterBrand,
}: {
  open: boolean
  brands: AdminBrand[]
  /** The brand created most recently, highlighted in the list. */
  freshId: string | null
  onOpenChange: (open: boolean) => void
  onNewBrand: () => void
  onEditBrand: (brand: AdminBrand) => void
  onDeleteBrand: (brand: AdminBrand) => void
  onFilterBrand: (brand: AdminBrand) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          portalTheme,
          "gap-0 bg-background p-0 text-sm data-[side=right]:w-full data-[side=right]:border-foreground data-[side=right]:sm:max-w-[460px]"
        )}
      >
        <div className="flex flex-col gap-[18px] border-b-4 border-foreground px-5 pt-7 pb-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className={eyebrowSm}>Maisons · {pad(brands.length)}</span>
              <SheetTitle className="font-heading text-[40px] leading-[1.05] font-bold tracking-[-0.02em]">
                Brands
              </SheetTitle>
              <SheetDescription className="sr-only">
                Create, edit and delete brands, or filter the inventory by
                brand.
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <button type="button" aria-label="Close" className={closeBtn}>
                ✕
              </button>
            </SheetClose>
          </div>
          <Button
            type="button"
            onClick={onNewBrand}
            className={cn(btn, btnGold, "w-full")}
          >
            + New brand
          </Button>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {brands.length === 0 && (
            <li className="px-7 py-10 text-center font-mono text-xs tracking-[1px] text-muted-foreground uppercase">
              No brands yet
            </li>
          )}
          {brands.map((brand) => {
            const count = brand.watchCount;
            return (
              <li
                key={brand.id}
                className={cn(
                  "grid animate-[xii-up_.4s_var(--ease-xii)_both] grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3.5 border-b-2 border-surface-variant px-5 py-4 sm:px-7",
                  brand.id === freshId && "bg-gold/15"
                )}
              >
                <BrandLogo brand={brand} />
                <button
                  type="button"
                  onClick={() => onFilterBrand(brand)}
                  title="Show this brand's watches"
                  className="flex min-w-0 flex-col gap-0.5 text-left transition-colors hover:text-gold"
                >
                  <span className="truncate font-heading text-lg leading-6 font-semibold">
                    {brand.name}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {count === 0
                      ? "No watches yet"
                      : `${pad(count)} ${count === 1 ? "watch" : "watches"}`}
                  </span>
                </button>
                <div className="flex gap-3.5">
                  <button
                    type="button"
                    onClick={() => onEditBrand(brand)}
                    className={rowLink}
                  >
                    Edit
                  </button>
                  {count === 0 && (
                    <button
                      type="button"
                      onClick={() => onDeleteBrand(brand)}
                      className={cn(rowLink, "text-muted-foreground")}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <p className="border-t-2 border-surface-variant px-5 py-4 font-mono text-xs text-muted-foreground sm:px-7">
          Click a brand to filter inventory. Brands with watches can&apos;t be
          deleted.
        </p>
      </SheetContent>
    </Sheet>
  )
}
