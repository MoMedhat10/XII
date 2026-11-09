"use client"

import Link from "next/link"

import { ImageFallback } from "@/components/image-fallback"
import type { CatalogWatch } from "@/app/(app)/watches/_data/types"
import { cn } from "@/lib/utils"
import { formatPrice } from "../dashboard/watches/watch-utils"

const defaultSizes = "(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"

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

/**
 * The watch card used by the catalog and the home page's Curated Drop.
 * The whole card links to the watch; the heart only shows when
 * `onToggleSave` is passed, the Compare toggle when `onToggleCompare` is.
 */
export function WatchCard({
  watch,
  saved = false,
  onToggleSave,
  compared = false,
  onToggleCompare,
  index,
  sizes = defaultSizes,
  className,
}: {
  watch: CatalogWatch
  saved?: boolean
  onToggleSave?: () => void
  compared?: boolean
  onToggleCompare?: () => void
  /** position in its page, for the staggered entrance */
  index?: number
  sizes?: string
  className?: string
}) {
  const staggered = index !== undefined

  return (
    <article
      style={staggered ? { animationDelay: `${index * 50}ms` } : undefined}
      className={cn(
        "group relative h-full border-4 bg-card text-foreground transition-colors duration-200 hover:bg-foreground hover:text-black",
        staggered && "animate-[xii-up_0.6s_var(--ease-xii)_both]",
        className
      )}
    >
      <div className="relative">
        <ImageFallback
          fill
          sizes={sizes}
          src={watch.image?.url}
          alt={watch.image?.alt || watch.name}
          label="No photograph"
          wrapperClassName="aspect-4/5 border-b-4"
          className="object-cover"
        />

        {onToggleSave && (
          <button
            type="button"
            aria-label={
              saved
                ? `Remove ${watch.name} from vitrine`
                : `Save ${watch.name} to vitrine`
            }
            aria-pressed={saved}
            onClick={onToggleSave}
            className={cn(
              // above the card's stretched link, so saving doesn't navigate
              "absolute top-3 right-3 z-10 flex size-10 cursor-pointer items-center justify-center border-4 transition-colors",
              saved
                ? "border-gold bg-gold text-black"
                : "border-foreground bg-background text-foreground hover:border-gold hover:text-gold"
            )}
          >
            <HeartIcon filled={saved} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="block font-sans text-sm leading-5 tracking-widest uppercase">
              {watch.model}
            </span>
            <h3 className="font-heading text-[28px] leading-[34px] font-semibold">
              {/* the ::after overlay makes the whole card clickable */}
              <Link
                href={`/watches/${watch.id}`}
                className="outline-none after:absolute after:inset-0 focus-visible:after:outline-4 focus-visible:after:outline-gold"
              >
                {watch.name}
              </Link>
            </h3>
          </div>
          <span className="font-heading text-lg leading-6 font-bold tracking-[1.5px] whitespace-nowrap text-gold">
            {formatPrice(watch.priceCents)}
          </span>
        </div>

        <dl className="flex flex-col gap-2 border-t-2 border-current pt-4 font-sans text-base leading-[26px]">
          <div className="flex justify-between gap-4">
            <dt>Caliber</dt>
            <dd className="text-right font-semibold">{watch.caliber || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t-2 border-current pt-2">
            <dt>Case</dt>
            <dd className="text-right font-semibold">
              {watch.caseMaterial || "—"}
            </dd>
          </div>
        </dl>

        {onToggleCompare && (
          <button
            type="button"
            role="checkbox"
            aria-checked={compared}
            aria-label={`Compare ${watch.name}`}
            onClick={onToggleCompare}
            // above the card's stretched link, so ticking doesn't navigate
            className="relative z-10 flex cursor-pointer items-center gap-3 self-start font-sans text-xs font-bold tracking-[1.5px] uppercase"
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-5 items-center justify-center border-4 border-current text-[10px]",
                compared && "border-gold bg-gold text-black"
              )}
            >
              {compared && "✓"}
            </span>
            {compared ? "Comparing" : "Compare"}
          </button>
        )}
      </div>
    </article>
  )
}
