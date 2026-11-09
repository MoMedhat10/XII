"use client"

import { useEffect, useRef, useState, type RefObject } from "react"

import type { WatchDetail } from "@/app/(app)/watches/[id]/_data/types"
import { formatPrice } from "@/components/dashboard/watches/watch-utils"
import { cn } from "@/lib/utils"

import { gutter, monoCaption } from "../home/styles"
import { columnAnchor, columnVars, compareGrid } from "./compare-table"

/**
 * Watch names pinned to the top of the screen once the photo row has
 * scrolled away, so you always know which column is which.
 *
 * It lives outside the table's sideways-scrolling box (a sticky row inside
 * that box would stick to the box, not the page), so it copies the table's
 * width and follows its sideways scroll.
 */
export function CompareNameBar({
  watches,
  scrollRef,
  tableRef,
  headerRef,
}: {
  watches: WatchDetail[]
  scrollRef: RefObject<HTMLDivElement | null>
  tableRef: RefObject<HTMLDivElement | null>
  headerRef: RefObject<HTMLDivElement | null>
}) {
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState<number>()
  const barRef = useRef<HTMLDivElement>(null)

  // Show once the photos are above the screen, while the table is still on it.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const header = headerRef.current?.getBoundingClientRect()
      const table = scrollRef.current?.getBoundingClientRect()
      setVisible(
        Boolean(header && table && header.bottom < 0 && table.bottom > 120)
      )
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [headerRef, scrollRef])

  // Same width as the table, so the columns line up when it overflows.
  useEffect(() => {
    const table = tableRef.current
    if (!table) return
    const observer = new ResizeObserver(() => setWidth(table.scrollWidth))
    observer.observe(table)
    return () => observer.disconnect()
  }, [tableRef])

  // Follow the table's sideways scroll.
  useEffect(() => {
    const box = scrollRef.current
    if (!box) return
    let frame = 0
    const sync = () => {
      frame = 0
      if (barRef.current) barRef.current.scrollLeft = box.scrollLeft
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync)
    }
    sync()
    box.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      box.removeEventListener("scroll", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [scrollRef, visible])

  const jumpTo = (id: string) =>
    document
      .getElementById(columnAnchor(id))
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      })

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        "fixed inset-x-0 top-0 z-30 transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)]",
        visible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className={gutter}>
        <div
          ref={barRef}
          className="overflow-hidden border-x-4 border-b-4 bg-background"
        >
          <div
            style={{ ...columnVars(watches.length), width }}
            className={compareGrid}
          >
            <div className="sticky left-0 hidden items-center bg-background px-4 sm:flex">
              <span className={cn(monoCaption, "uppercase")}>
                {watches.length} pieces
              </span>
            </div>
            {watches.map((w, i) => (
              <button
                key={w.id}
                type="button"
                onClick={() => jumpTo(w.id)}
                className={cn(
                  "min-w-0 cursor-pointer px-3 py-2.5 text-left transition-colors hover:bg-card sm:px-4",
                  i > 0 && "border-l-4",
                  "sm:border-l-4"
                )}
              >
                <span className="block truncate font-sans text-[10px] tracking-[1.5px] text-muted-foreground uppercase">
                  {w.brand}
                </span>
                <span className="block truncate font-heading text-sm leading-5 font-bold sm:text-base">
                  {w.name}
                </span>
                <span className="block font-heading text-xs font-bold text-gold">
                  {formatPrice(w.priceCents)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
