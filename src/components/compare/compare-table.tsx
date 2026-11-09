"use client"

import type { CSSProperties, Ref } from "react"

import type { CompareViewer } from "@/app/(app)/compare/_data/compare"
import { cheapestId, groupRows } from "@/app/(app)/compare/_utils/compare-rows"
import type { WatchDetail } from "@/app/(app)/watches/[id]/_data/types"
import { cn } from "@/lib/utils"

import { monoCaption } from "../home/styles"
import { CompareColumnHead } from "./compare-column-head"
import { CompareText } from "./compare-text"

// Shared with the pinned name bar so its columns line up with these.
// Phones: no label column; each row's label sits above its values, so two
// watches fit side by side. sm and up: a label column pinned on the left.
export const compareGrid =
  "grid grid-cols-[repeat(var(--n),minmax(140px,1fr))] sm:grid-cols-[160px_repeat(var(--n),minmax(200px,1fr))]"

export const columnVars = (n: number) => ({ "--n": n }) as CSSProperties

/** Each watch column's head carries this, so the name bar can scroll to it. */
export const columnAnchor = (id: string) => `compare-col-${id}`

export function CompareTable({
  watches,
  viewer,
  onlyDifferences,
  onRemove,
  scrollRef,
  tableRef,
  headerRef,
}: {
  watches: WatchDetail[]
  viewer: CompareViewer
  onlyDifferences: boolean
  onRemove: (id: string) => void
  /** the sideways-scrolling box */
  scrollRef?: Ref<HTMLDivElement>
  /** the table itself, for its full width */
  tableRef?: Ref<HTMLDivElement>
  /** the photo row, so the name bar knows when it has scrolled away */
  headerRef?: Ref<HTMLDivElement>
}) {
  const cheapest = cheapestId(watches)
  const groups = groupRows(watches, onlyDifferences)

  return (
    // the table scrolls sideways in its own box, never the page
    <div ref={scrollRef} className="overflow-x-auto border-4">
      <div
        ref={tableRef}
        role="table"
        aria-label="Watch comparison"
        style={columnVars(watches.length)}
        className="min-w-max sm:min-w-0"
      >
        <div
          ref={headerRef}
          role="row"
          className={cn(compareGrid, "border-b-4")}
        >
          <div
            role="columnheader"
            className="sticky left-0 z-10 hidden bg-background p-4 sm:block"
          >
            <span className={cn(monoCaption, "uppercase")}>
              {watches.length} pieces
            </span>
          </div>
          {watches.map((w, i) => (
            <div
              key={w.id}
              id={columnAnchor(w.id)}
              role="columnheader"
              className={cn(
                "scroll-mt-28",
                i > 0 && "border-l-4",
                "sm:border-l-4"
              )}
            >
              <CompareColumnHead
                watch={w}
                signedIn={viewer.signedIn}
                saved={viewer.savedIds.includes(w.id)}
                inBag={viewer.inBagIds.includes(w.id)}
                cheapest={w.id === cheapest}
                onRemove={() => onRemove(w.id)}
              />
            </div>
          ))}
        </div>

        {!groups.length && (
          <p
            className={cn(
              monoCaption,
              "px-4 py-10 text-center uppercase sm:px-6"
            )}
          >
            These pieces match on every detail.
          </p>
        )}

        {groups.map((group) => (
          <div key={group.title} role="rowgroup">
            <div
              role="row"
              className="border-t-4 bg-[#141515] first:border-t-0"
            >
              <div role="rowheader" className="px-3 py-3 sm:px-4">
                {/* stays readable while the table scrolls sideways */}
                <span className="sticky left-3 inline-block font-heading text-xs leading-5 font-bold tracking-[1.5px] uppercase sm:left-4">
                  <span className="font-mono font-normal text-gold">
                    {group.number}
                  </span>{" "}
                  · {group.title}
                </span>
              </div>
            </div>

            {group.rows.map(({ row, differs }) => (
              <div
                key={row.label}
                role="row"
                className={cn(compareGrid, "border-t-2 border-surface-variant")}
              >
                <div
                  role="rowheader"
                  className={cn(
                    "col-span-full bg-background px-3 pt-3 sm:sticky sm:left-0 sm:z-10 sm:col-span-1 sm:p-4",
                    differs && "sm:border-l-4 sm:border-l-gold"
                  )}
                >
                  <span
                    className={cn(
                      "sticky left-3 inline-flex items-center gap-2 font-sans text-[12px] tracking-widest uppercase sm:static",
                      differs ? "text-gold" : "text-steel"
                    )}
                  >
                    {row.label}
                    {differs && <span className="sr-only"> (differs)</span>}
                  </span>
                </div>
                {watches.map((w, i) => {
                  const value = row.value(w)
                  const lowest = row.label === "Price" && w.id === cheapest
                  return (
                    <div
                      key={w.id}
                      role="cell"
                      className={cn(
                        "px-3 pt-1 pb-3 sm:p-4",
                        i > 0 && "border-l-4",
                        "sm:border-l-4",
                        differs && "bg-gold/10"
                      )}
                    >
                      {!value ? (
                        <span className="font-heading text-base text-muted-foreground">
                          —
                        </span>
                      ) : row.long ? (
                        <CompareText text={value} />
                      ) : (
                        <span
                          className={cn(
                            "inline-flex flex-wrap items-center gap-2 font-heading text-base leading-6 font-semibold sm:text-lg",
                            differs && "text-gold"
                          )}
                        >
                          {value}
                          {lowest && (
                            <span className="border-2 border-gold px-1.5 py-0.5 font-heading text-[10px] leading-3 font-bold tracking-[1.5px] uppercase">
                              ★ Lowest
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
