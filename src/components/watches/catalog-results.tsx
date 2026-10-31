"use client"

import type { CatalogResults as Results } from "@/app/(app)/watches/_hooks/use-catalog-results"
import { cn } from "@/lib/utils"

import { monoCaption } from "../home/styles"
import {
  CardSkeleton,
  CatalogError,
  CatalogLoading,
  CatalogNoMatch,
  catalogGrid,
} from "./catalog-states"
import { WatchCard } from "./watch-card"

export function CatalogResults({
  results,
  query,
  isSaved,
  onToggleSave,
  onRetry,
  onClearFilters,
}: {
  results: Results
  /** the committed search, for the "nothing matches" title */
  query: string
  isSaved: (watchId: string) => boolean
  onToggleSave: (watchId: string) => void
  onRetry: () => void
  onClearFilters: () => void
}) {
  const { view, pages, watches, total, nextCount } = results

  if (view === "loading") return <CatalogLoading />
  if (view === "error") {
    return <CatalogError retrying={results.isRetrying} onRetry={onRetry} />
  }
  if (view === "empty") {
    return <CatalogNoMatch query={query} onClear={onClearFilters} />
  }

  const shown = watches.length
  const all = total ?? shown

  return (
    <>
      <div
        aria-busy={results.isStale}
        className={cn(
          catalogGrid,
          "transition-opacity",
          results.isStale && "opacity-60"
        )}
      >
        {pages.map((page) =>
          page.watches.map((w, i) => (
            <WatchCard
              key={w.id}
              watch={w}
              index={i}
              saved={isSaved(w.id)}
              onToggleSave={() => onToggleSave(w.id)}
            />
          ))
        )}
        {results.isFetchingNextPage &&
          Array.from({ length: Math.min(3, nextCount) }, (_, i) => (
            <CardSkeleton key={`more-${i}`} delay={i * 150} />
          ))}
      </div>

      <div className="mt-14 flex flex-col items-center gap-4">
        <span className={cn(monoCaption, "uppercase")}>
          Showing {shown} of {all}
        </span>
        <div className="h-1 w-60 bg-surface-variant">
          <div
            className="h-full bg-gold transition-[width] duration-400"
            style={{ width: `${all ? (shown / all) * 100 : 0}%` }}
          />
        </div>
        {results.hasNextPage && (
          <button
            type="button"
            onClick={results.loadMore}
            disabled={results.isFetchingNextPage}
            className="h-14 border-4 bg-background px-10 font-sans text-base font-bold tracking-[1.5px] uppercase transition-colors hover:bg-foreground hover:text-black disabled:opacity-70"
          >
            {results.isFetchingNextPage ? "Loading…" : `Load ${nextCount} more`}
          </button>
        )}
      </div>
    </>
  )
}
