"use client"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

import { pad } from "./watch-utils"

/** Page numbers with gaps once there are many pages: 01 … 04 05 06 … 12 */
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const pages = [...new Set([1, pageCount, page - 1, page, page + 1])]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b)
  return pages.flatMap((p, i) =>
    i > 0 && p - pages[i - 1] > 1 ? (["gap", p] as const) : [p]
  )
}

const edge =
  "h-11 px-4 font-sans text-xs font-bold tracking-[1.5px] uppercase transition-colors hover:bg-foreground hover:text-black disabled:pointer-events-none disabled:opacity-35"

export function WatchesPagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}: {
  page: number
  pageCount: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}) {
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-7">
      <span className="font-mono text-xs tracking-[1px] text-muted-foreground uppercase">
        Showing {pad(first)}–{pad(last)} of {pad(total)}
      </span>

      <Pagination className="mx-0 w-auto max-sm:w-full">
        <PaginationContent className="gap-0 border-4 max-sm:w-full">
          <PaginationItem className="max-sm:flex-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className={cn(edge, "border-r-4 max-sm:w-full")}
            >
              ← Prev
            </button>
          </PaginationItem>
          {pageWindow(page, pageCount).map((entry, index) => (
            <PaginationItem
              key={entry === "gap" ? `gap-${index}` : entry}
              className={cn(entry !== page && "max-sm:hidden")}
            >
              {entry === "gap" ? (
                <span className="flex h-11 w-12 items-center justify-center border-r-2 border-surface-variant font-heading text-sm text-muted-foreground">
                  …
                </span>
              ) : (
                <button
                  type="button"
                  aria-label={`Page ${entry}`}
                  aria-current={entry === page ? "page" : undefined}
                  onClick={() => onPageChange(entry)}
                  className={cn(
                    "h-11 w-12 border-r-2 border-surface-variant font-heading text-sm font-bold transition-colors",
                    entry === page
                      ? "bg-gold text-black"
                      : "hover:bg-foreground hover:text-black"
                  )}
                >
                  {pad(entry)}
                </button>
              )}
            </PaginationItem>
          ))}
          <PaginationItem className="max-sm:flex-1">
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= pageCount}
              onClick={() => onPageChange(page + 1)}
              className={cn(edge, "max-sm:w-full")}
            >
              Next →
            </button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
