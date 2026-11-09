import Link from "next/link"

import type { WatchDetail } from "@/app/(app)/watches/[id]/_data/types"
import { formatPrice } from "@/components/dashboard/watches/watch-utils"
import { ImageFallback } from "@/components/image-fallback"
import { cn } from "@/lib/utils"

import { button, eyebrow, gridBackdrop } from "../home/styles"

/** Fewer than two watches to compare: show what's left and the way back. */
export function CompareEmpty({
  watch,
  note,
}: {
  watch: WatchDetail | null
  note: string | null
}) {
  return (
    <section className="relative flex min-h-[calc(100vh-88px)] items-center justify-center overflow-hidden bg-[#141515] px-6 py-24">
      <div className={cn(gridBackdrop, "opacity-[0.06]")} />
      <div className="relative flex max-w-[560px] flex-col items-center gap-6 text-center">
        <span className={eyebrow}>Side by Side · {watch ? "01" : "00"}</span>
        <h1 className="font-heading text-[clamp(34px,5vw,72px)] leading-[1.05] font-bold tracking-[-0.02em] text-balance">
          Pick at least two pieces.
        </h1>
        <p className="font-sans text-lg leading-7 text-pretty text-muted-foreground sm:text-[22px] sm:leading-8">
          Tick “Compare” on up to four watches in the catalog, or select them in
          your wishlist.
        </p>
        {note && (
          <p className="font-mono text-xs tracking-[0.1em] text-gold uppercase">
            {note}
          </p>
        )}

        {watch && (
          <Link
            href={`/watches/${watch.id}`}
            className="flex w-full max-w-sm items-center gap-4 border-4 bg-background p-3 text-left transition-colors hover:border-gold"
          >
            <ImageFallback
              fill
              sizes="64px"
              src={watch.images[0]?.url}
              alt={watch.images[0]?.alt || watch.name}
              label="·"
              wrapperClassName="aspect-square w-16 shrink-0 border-2"
              className="object-cover"
            />
            <span className="min-w-0">
              <span className="block truncate font-sans text-xs tracking-widest text-muted-foreground uppercase">
                {watch.brand}
              </span>
              <span className="block truncate font-heading text-lg font-semibold">
                {watch.name}
              </span>
              <span className="block font-heading font-bold text-gold">
                {formatPrice(watch.priceCents)}
              </span>
            </span>
          </Link>
        )}

        <Link
          href="/watches"
          className={cn(
            button,
            "border-foreground bg-gold text-white hover:bg-black"
          )}
        >
          Browse Catalog
        </Link>
      </div>
    </section>
  )
}
