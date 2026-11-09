"use client"

import Link from "next/link"

import type { CompareItem } from "@/app/(app)/compare/_hooks/use-compare-selection"
import {
  COMPARE_MAX,
  COMPARE_MIN,
  compareHref,
} from "@/app/(app)/compare/_utils/compare-schema"
import { ImageFallback } from "@/components/image-fallback"
import { cn } from "@/lib/utils"

import { gutter } from "../home/styles"

/** The picked watches (up to 4) and the way to the compare page. */
export function CompareTray({
  items,
  onRemove,
  onClear,
}: {
  items: CompareItem[]
  onRemove: (id: string) => void
  onClear: () => void
}) {
  const open = items.length > 0
  const ready = items.length >= COMPARE_MIN
  const empty = Math.max(COMPARE_MAX - items.length, 0)

  return (
    <div
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 transition-transform duration-[450ms] ease-[cubic-bezier(.2,.7,.2,1)]",
        open ? "translate-y-0" : "translate-y-[120%]"
      )}
    >
      <div className={cn(gutter, "pb-4 sm:pb-6")}>
        <div className="flex flex-col gap-3 border-4 border-black bg-[#f9f9f9] px-4 py-3 text-black lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-6 lg:py-4">
          <ul className="grid grid-cols-4 gap-2 lg:flex lg:flex-1 lg:gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="relative flex min-w-0 items-center gap-2 border-2 border-black bg-white p-1.5 lg:w-48 lg:p-2"
              >
                <ImageFallback
                  fill
                  unoptimized
                  sizes="40px"
                  src={item.image?.url}
                  alt={item.image?.alt || item.name}
                  label="·"
                  wrapperClassName="aspect-square w-9 shrink-0 border-2 border-black lg:w-10"
                  className="object-cover"
                />
                <span className="min-w-0 max-sm:hidden">
                  <span className="block truncate font-sans text-[10px] tracking-[1px] uppercase opacity-70">
                    {item.brand}
                  </span>
                  <span className="block truncate font-heading text-sm leading-5 font-bold">
                    {item.name}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${item.name} from comparison`}
                  onClick={() => onRemove(item.id)}
                  className="absolute -top-2 -right-2 flex size-5 cursor-pointer items-center justify-center border-2 border-black bg-white font-heading text-[10px] font-bold hover:bg-black hover:text-white"
                >
                  ✕
                </button>
              </li>
            ))}
            {Array.from({ length: empty }, (_, i) => (
              <li
                key={`empty-${i}`}
                aria-hidden="true"
                className="flex min-h-12 items-center justify-center border-2 border-dashed border-black/40 font-mono text-[10px] tracking-[1px] text-black/50 uppercase lg:min-h-14 lg:w-48"
              >
                Add a piece
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <button
              type="button"
              onClick={onClear}
              className="h-11 cursor-pointer px-2 font-sans text-xs font-bold tracking-[1.5px] uppercase underline-offset-4 hover:underline"
            >
              Clear
            </button>
            {ready ? (
              <Link
                href={compareHref(items.map((i) => i.id))}
                className="flex h-12 items-center border-4 border-black bg-gold px-6 font-sans text-[13px] font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-black"
              >
                Compare ({items.length})
              </Link>
            ) : (
              <span className="flex h-12 items-center border-4 border-black/40 px-5 font-sans text-[12px] font-bold tracking-[1.5px] text-black/50 uppercase">
                Pick at least {COMPARE_MIN}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
