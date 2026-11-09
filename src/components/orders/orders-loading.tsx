import { cn } from "@/lib/utils"

import { gutter } from "../home/styles"
import { rowLayout } from "./orders-layout"

const block = "animate-pulse bg-card"

const row = cn(rowLayout, "border-b-2 border-surface-variant px-4 py-5")

export function OrdersLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading your orders"
      className={cn(gutter, "pt-20 pb-40 sm:pt-28")}
    >
      <div className="flex flex-wrap items-end justify-between gap-6 border-b-4 pb-6 sm:gap-8 sm:pb-8">
        <div className="flex flex-col gap-4">
          <div className={cn(block, "h-5 w-40")} />
          <div
            className={cn(
              block,
              "h-[clamp(36px,6vw,88px)] w-[min(420px,80vw)]"
            )}
          />
        </div>
        <div className="grid w-full grid-cols-2 border-4 sm:w-auto">
          <div className="border-r-4 px-4 py-3 sm:min-w-40 sm:px-6 sm:py-4">
            <div className={cn(block, "mb-2 h-4 w-16")} />
            <div className={cn(block, "h-9 w-14 sm:h-12")} />
          </div>
          <div className="px-4 py-3 sm:min-w-40 sm:px-6 sm:py-4">
            <div className={cn(block, "mb-2 h-4 w-24")} />
            <div className={cn(block, "h-9 w-24 sm:h-12 sm:w-32")} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b-2 border-surface-variant py-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={cn(block, "h-10 w-24")} />
        ))}
      </div>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={row}>
          <div className={cn(block, "aspect-square border-4")} />
          <div className="flex flex-col gap-2">
            <div className={cn(block, "h-4 w-32 max-w-full")} />
            <div className={cn(block, "h-7 w-56 max-w-full xl:h-8")} />
          </div>
          <div className={cn(block, "h-5 w-24 max-xl:hidden")} />
          <div className={cn(block, "h-5 w-20 max-xl:hidden")} />
          <div className={cn(block, "h-5 w-16 max-xl:hidden")} />
          <div
            className={cn(block, "h-6 w-24 max-xl:col-start-2 xl:ml-auto")}
          />
          <div className={cn(block, "h-4 w-14 max-xl:hidden xl:ml-auto")} />
        </div>
      ))}
    </section>
  )
}
