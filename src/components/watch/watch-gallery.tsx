"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Dialog as DialogPrimitive } from "radix-ui"

import type { CatalogWatchImage } from "@/app/(app)/watches/_data/types"
import { ImageFallback } from "@/components/image-fallback"
import { cn } from "@/lib/utils"

const pad = (n: number) => String(n).padStart(2, "0")

const caption = (img: CatalogWatchImage | undefined, i: number) =>
  img?.alt.trim() || `Image ${i + 1}`

/** Arrow keys belong to the field when the user is typing somewhere. */
const isTyping = (e: KeyboardEvent) => {
  const el = e.target as HTMLElement | null
  return Boolean(
    el?.closest("input, textarea, select, [contenteditable='true']")
  )
}

const stripes =
  "bg-[repeating-linear-gradient(135deg,#232525_0_6px,#1b1b1b_6px_12px)]"

const arrowButton =
  "flex shrink-0 cursor-pointer items-center justify-center border-4 border-foreground bg-background font-heading font-bold text-foreground transition-colors hover:bg-foreground hover:text-black"

/** Faint dial outline drawn over the placeholder when there's no photo. */
function DialMark() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      stroke="#f9f9f9"
      strokeWidth="1"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 w-[70%] -translate-x-1/2 -translate-y-1/2 opacity-[0.12]"
    >
      <circle cx="200" cy="200" r="185" />
      <circle cx="200" cy="200" r="172" strokeDasharray="4 4" />
      <circle cx="200" cy="200" r="120" strokeDasharray="6 3" />
      <circle cx="200" cy="200" r="8" stroke="#B08D57" strokeWidth="2" />
    </svg>
  )
}

export function WatchGallery({
  images,
  title,
  className,
}: {
  images: CatalogWatchImage[]
  /** "Brand · Name", shown in the fullscreen viewer */
  title: string
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)

  const count = images.length
  const multi = count > 1
  const current = images[Math.min(index, count - 1)]
  const counter = `${pad(index + 1)} / ${pad(count)}`
  const alt = current?.alt || title
  // only seen when the photo is missing or fails to load
  const placeholder = current ? "No photograph" : "Photography coming soon"

  const go = (step: number) => setIndex((i) => (i + step + count) % count)

  useEffect(() => {
    if (count < 2) return
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || isTyping(e)) {
        return
      }
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count)
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [count])

  return (
    <div
      className={cn(
        "flex min-w-0 animate-[xii-up_.8s_var(--ease-xii)_both] items-start gap-4",
        className
      )}
    >
      {multi && (
        <div
          role="tablist"
          aria-label="Watch images"
          className="flex w-16 shrink-0 flex-col gap-3 sm:w-24"
        >
          {images.map((img, i) => {
            const active = i === index
            return (
              <button
                key={img.url}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Show image ${i + 1}: ${caption(img, i)}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "relative aspect-square w-full cursor-pointer overflow-hidden border-4 transition-opacity hover:opacity-100",
                  active
                    ? "border-gold opacity-100"
                    : "border-surface-variant opacity-60",
                  !img.url && stripes
                )}
              >
                {img.url && (
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
                <span className="absolute bottom-0 left-0 bg-surface-container px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {pad(i + 1)}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="relative aspect-4/5 max-h-[calc(100vh-220px)] min-w-0 flex-1 overflow-hidden border-4 border-foreground">
        <ImageFallback
          key={index}
          src={current?.url}
          alt={alt}
          label={placeholder}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
          wrapperClassName="absolute inset-0 animate-in fade-in-0 duration-300 bg-[repeating-linear-gradient(135deg,#232525_0_12px,#1b1b1b_12px_24px)]"
        />
        {!current && <DialMark />}

        {current && (
          <button
            type="button"
            aria-label={`Open ${caption(current, index)} fullscreen`}
            onClick={() => setOpen(true)}
            className="absolute inset-0 cursor-zoom-in"
          />
        )}

        {multi && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className={cn(
                arrowButton,
                "absolute top-1/2 left-4 size-12 -translate-y-1/2 text-lg"
              )}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className={cn(
                arrowButton,
                "absolute top-1/2 right-4 size-12 -translate-y-1/2 text-lg"
              )}
            >
              →
            </button>
            <span className="pointer-events-none absolute bottom-4 left-4 border-2 border-foreground bg-background px-2.5 py-1 font-mono text-xs tracking-widest">
              {counter}
            </span>
          </>
        )}
        {current && (
          <span className="pointer-events-none absolute right-4 bottom-4 hidden font-mono text-xs tracking-widest text-muted-foreground sm:block">
            CLICK TO ENLARGE ⤢
          </span>
        )}
      </div>

      <DialogPrimitive.Root
        open={open && Boolean(current)}
        onOpenChange={setOpen}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-100 bg-[rgba(10,10,10,.96)] data-open:animate-in data-open:fade-in-0" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="dark fixed inset-0 z-100 flex flex-col text-foreground outline-none data-open:animate-in data-open:fade-in-0"
          >
            <div className="flex h-21 shrink-0 items-center justify-between gap-4 border-b-4 border-foreground px-[clamp(24px,4.4vw,64px)]">
              <DialogPrimitive.Title className="truncate font-heading text-sm font-bold tracking-[1.5px] uppercase">
                {title}
              </DialogPrimitive.Title>
              <div className="flex items-center gap-5">
                {multi && (
                  <span className="font-mono text-xs tracking-widest">
                    {counter}
                  </span>
                )}
                <DialogPrimitive.Close
                  aria-label="Close"
                  className={cn(arrowButton, "size-12 bg-transparent text-lg")}
                >
                  ✕
                </DialogPrimitive.Close>
              </div>
            </div>

            {/* clicking the dark area around the image closes the viewer */}
            <div
              onClick={(e) => e.target === e.currentTarget && setOpen(false)}
              className="flex min-h-0 flex-1 items-center justify-center gap-6 p-4 sm:p-8"
            >
              {multi && (
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => go(-1)}
                  className={cn(arrowButton, "hidden size-14 text-xl sm:flex")}
                >
                  ←
                </button>
              )}
              <div className="relative aspect-4/5 max-h-full w-full max-w-[min(100%,calc((100vh-148px)*0.8))] border-4 border-foreground">
                <ImageFallback
                  key={index}
                  src={current?.url}
                  alt={alt}
                  label={placeholder}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  wrapperClassName="absolute inset-0 bg-[repeating-linear-gradient(135deg,#232525_0_14px,#1b1b1b_14px_28px)]"
                />
              </div>
              {multi && (
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => go(1)}
                  className={cn(arrowButton, "hidden size-14 text-xl sm:flex")}
                >
                  →
                </button>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  )
}
