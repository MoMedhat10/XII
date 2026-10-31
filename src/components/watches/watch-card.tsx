"use client"

import { ImageFallback } from "@/components/image-fallback"
import type { CatalogWatch } from "@/app/(app)/watches/_data/types"
import { cn } from "@/lib/utils"
import { formatPrice } from "../dashboard/watches/watch-utils"

const sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"

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

export function WatchCard({
  watch,
  index,
  saved,
  onToggleSave,
}: {
  watch: CatalogWatch
  /** position in its page, for the staggered entrance */
  index: number
  saved: boolean
  onToggleSave: () => void
}) {
  const [cover, second] = watch.images
  const swaps = Boolean(second)

  return (
    <article
      style={{ animationDelay: `${index * 50}ms` }}
      className="group animate-[xii-up_0.6s_cubic-bezier(0.2,0.7,0.2,1)_both] border-4 bg-background text-foreground transition-colors duration-200 hover:bg-foreground hover:text-black"
    >
      <div className="relative border-b-4 border-foreground transition-colors group-hover:border-black">
        <ImageFallback
          fill
          sizes={sizes}
          src={cover?.url}
          alt={cover?.alt || watch.name}
          label="No photograph"
          wrapperClassName="aspect-[4/5]"
          className="object-cover"
        />
        {/* second image fades in on hover, as in the design */}
        {second && (
          <ImageFallback
            fill
            sizes={sizes}
            src={second.url}
            alt={second.alt || watch.name}
            wrapperClassName="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            className="object-cover"
          />
        )}

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
            "absolute top-3 right-3 flex size-10 items-center justify-center border-4 transition-colors",
            saved
              ? "border-gold bg-gold text-black"
              : "border-foreground bg-background text-foreground hover:border-gold hover:text-gold"
          )}
        >
          <HeartIcon filled={saved} />
        </button>

        {watch.images.length > 0 && (
          <span
            className="absolute bottom-3 left-3 flex gap-1"
            aria-hidden="true"
          >
            {watch.images.map((image, k) => (
              <span
                key={image.url}
                className={cn(
                  "h-1 w-4 transition-colors",
                  k === 0 &&
                    (swaps
                      ? "bg-gold group-hover:bg-surface-variant"
                      : "bg-gold"),
                  k === 1 && "bg-surface-variant group-hover:bg-gold",
                  k > 1 && "bg-surface-variant"
                )}
              />
            ))}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 px-5 pt-4 pb-5">
        <span className="font-sans text-[13px] leading-5 tracking-[0.1em] uppercase opacity-75">
          {watch.brand}
        </span>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-heading text-2xl leading-[30px] font-semibold">
            {watch.name}
          </h3>
          <span className="font-heading text-lg leading-7 font-bold tracking-[0.5px] whitespace-nowrap text-gold transition-colors group-hover:text-[#7C5A3C]">
            {formatPrice(watch.priceCents)}
          </span>
        </div>
      </div>
    </article>
  )
}
