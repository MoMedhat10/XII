/* eslint-disable @next/next/no-img-element -- previews are blob: URLs from local uploads */
"use client"

import type {
  AdminWatch,
  AdminWatchImage,
} from "@/app/(dashboard)/_data/types"
import { MAX_WATCH_IMAGES } from "@/app/(dashboard)/_utils/upload-rules"
import { cn } from "@/lib/utils"

const tileBtn =
  "absolute flex items-center justify-center bg-[#141515] font-heading font-bold text-foreground transition-colors hover:bg-gold hover:text-black disabled:pointer-events-none"

/** Inline image strip: cover tag, upload progress, delete, set-cover and add tiles. */
export function WatchRowImages({
  watch,
  busy,
  onAdd,
  onRemove,
  onSetCover,
}: {
  watch: AdminWatch
  /** an upload or reorder is in flight for this watch */
  busy: boolean
  onAdd: (watch: AdminWatch) => void
  /** opens the delete confirmation */
  onRemove: (watch: AdminWatch, image: AdminWatchImage) => void
  onSetCover: (watch: AdminWatch, imageId: string) => void
}) {
  return (
    <div
      aria-busy={busy || undefined}
      className="flex flex-wrap items-center gap-1.5"
    >
      {watch.images.map((image, index) => {
        const uploading = image.progress < 100
        const cover = index === 0
        return (
          <div
            key={image.id}
            className={cn(
              "group/img relative size-12 border-2 bg-[#141515]",
              cover ? "border-gold" : "border-surface-variant",
              uploading && "opacity-70"
            )}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="size-full object-cover"
            />
            {cover && !uploading && (
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
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRemove(watch, image)}
                  aria-label={`Delete image ${index + 1} of ${watch.name}`}
                  className={cn(
                    tileBtn,
                    "-top-0.5 -right-0.5 size-[18px] text-[10px]"
                  )}
                >
                  ✕
                </button>
                {!cover && (
                  // hidden until hover/focus on pointer devices, always shown on touch
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onSetCover(watch, image.id)}
                    aria-label={`Make image ${index + 1} the cover of ${watch.name}`}
                    title="Set as cover"
                    className={cn(
                      tileBtn,
                      "bottom-0 left-0 h-3 px-[3px] text-[8px] leading-3 tracking-[0.5px] opacity-0 group-hover/img:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                    )}
                  >
                    COVER
                  </button>
                )}
              </>
            )}
          </div>
        )
      })}
      {watch.images.length < MAX_WATCH_IMAGES && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onAdd(watch)}
          aria-label={`Add images to ${watch.name}`}
          className="flex size-12 items-center justify-center border-2 border-dashed border-gold font-heading text-xl font-bold text-gold transition-colors hover:bg-gold hover:text-black disabled:cursor-wait disabled:opacity-35"
        >
          +
        </button>
      )}
    </div>
  )
}
