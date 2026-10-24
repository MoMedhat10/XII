/* eslint-disable @next/next/no-img-element -- previews are blob: URLs from local uploads */
"use client"

import type { AdminWatch } from "@/app/(dashboard)/_data/mock-watches"
import { MAX_WATCH_IMAGES } from "@/app/(dashboard)/_utils/watch-schema"
import { cn } from "@/lib/utils"

/** Inline image strip: cover tag, upload progress, remove and add tiles. */
export function WatchRowImages({
  watch,
  onAdd,
  onRemove,
}: {
  watch: AdminWatch
  onAdd: (watch: AdminWatch) => void
  onRemove: (watch: AdminWatch, imageId: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {watch.images.map((image, index) => {
        const uploading = image.progress < 100
        return (
          <div
            key={image.id}
            className={cn(
              "group/img relative size-12 border-2 bg-[#141515]",
              index === 0 ? "border-gold" : "border-surface-variant"
            )}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="size-full object-cover"
            />
            {index === 0 && !uploading && (
              <span className="absolute bottom-0 left-0 bg-gold px-[3px] font-heading text-[8px] leading-3 font-bold tracking-[0.5px] text-black">
                COVER
              </span>
            )}
            {uploading ? (
              <div
                role="progressbar"
                aria-label={`Uploading image ${index + 1}`}
                aria-valuenow={Math.round(image.progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="absolute inset-x-1 bottom-1 h-1 bg-surface-variant"
              >
                <div
                  className="h-1 bg-gold transition-[width]"
                  style={{ width: `${image.progress}%` }}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onRemove(watch, image.id)}
                aria-label={`Delete image ${index + 1} of ${watch.name}`}
                className="absolute -top-0.5 -right-0.5 flex size-[18px] items-center justify-center bg-[#141515] font-heading text-[10px] font-bold text-foreground transition-colors hover:bg-gold hover:text-black"
              >
                ✕
              </button>
            )}
          </div>
        )
      })}
      {watch.images.length < MAX_WATCH_IMAGES && (
        <button
          type="button"
          onClick={() => onAdd(watch)}
          aria-label={`Add images to ${watch.name}`}
          className="flex size-12 items-center justify-center border-2 border-dashed border-gold font-heading text-xl font-bold text-gold transition-colors hover:bg-gold hover:text-black"
        >
          +
        </button>
      )}
    </div>
  )
}
