"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import type { CompareViewer } from "@/app/(app)/compare/_data/compare"
import { useCompareSelection } from "@/app/(app)/compare/_hooks/use-compare-selection"
import {
  COMPARE_ROWS,
  countDifferences,
} from "@/app/(app)/compare/_utils/compare-rows"
import {
  COMPARE_MIN,
  compareHref,
} from "@/app/(app)/compare/_utils/compare-schema"
import type { WatchDetail } from "@/app/(app)/watches/[id]/_data/types"
import { cn } from "@/lib/utils"

import { eyebrow, gutter, monoCaption } from "../home/styles"
import { CompareEmpty } from "./compare-empty"
import { CompareNameBar } from "./compare-name-bar"
import { CompareTable } from "./compare-table"

export function CompareView({
  watches,
  missing,
  viewer,
}: {
  watches: WatchDetail[]
  /** ids in the URL that are unknown or no longer on sale */
  missing: number
  viewer: CompareViewer
}) {
  const router = useRouter()
  const { replace } = useCompareSelection()
  const [onlyDifferences, setOnlyDifferences] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Keep the catalog's tray in step with what this page shows.
  const key = watches.map((w) => w.id).join(",")
  useEffect(() => {
    replace(
      watches.map((w) => ({
        id: w.id,
        name: w.name,
        brand: w.brand,
        image: w.images[0] ?? null,
      }))
    )
    // the key changes exactly when the shown watches do
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const remove = (id: string) =>
    router.replace(
      compareHref(watches.filter((w) => w.id !== id).map((w) => w.id)),
      {
        scroll: false,
      }
    )

  const note =
    missing > 0 &&
    (missing === 1
      ? "1 piece in this link is no longer available."
      : `${missing} pieces in this link are no longer available.`)

  const differences = countDifferences(watches)

  if (watches.length < COMPARE_MIN) {
    return <CompareEmpty watch={watches[0] ?? null} note={note || null} />
  }

  return (
    <section className={cn(gutter, "pt-20 pb-30 sm:pt-28")}>
      <div className="flex flex-wrap items-end justify-between gap-6 border-b-4 pb-6 sm:pb-8">
        <div>
          <span className={cn(eyebrow, "mb-2")}>Side by Side</span>
          <h1 className="font-heading text-[clamp(36px,6vw,88px)] leading-none font-bold tracking-[-0.02em]">
            Compare
          </h1>
        </div>
      </div>

      {note && (
        <p
          role="status"
          className={cn(
            monoCaption,
            "mt-6 border-2 border-gold px-4 py-3 text-gold uppercase"
          )}
        >
          {note}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className={cn(monoCaption, "uppercase")}>
          {watches.length} pieces · differ on {differences} of{" "}
          {COMPARE_ROWS.length} details
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={onlyDifferences}
          onClick={() => setOnlyDifferences((v) => !v)}
          className="flex cursor-pointer items-center gap-3 font-sans text-xs font-bold tracking-[1.5px] uppercase"
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex h-6 w-11 border-4 p-0.5 transition-colors",
              onlyDifferences
                ? "justify-end border-gold bg-gold"
                : "justify-start"
            )}
          >
            <span
              className={cn(
                "size-3",
                onlyDifferences ? "bg-black" : "bg-foreground"
              )}
            />
          </span>
          Show only differences
        </button>
      </div>

      <div className="mt-4">
        <CompareTable
          watches={watches}
          viewer={viewer}
          onlyDifferences={onlyDifferences}
          onRemove={remove}
          scrollRef={scrollRef}
          tableRef={tableRef}
          headerRef={headerRef}
        />
      </div>

      <CompareNameBar
        watches={watches}
        scrollRef={scrollRef}
        tableRef={tableRef}
        headerRef={headerRef}
      />
    </section>
  )
}
