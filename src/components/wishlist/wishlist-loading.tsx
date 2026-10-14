import { cn } from "@/lib/utils"

import { gutter } from "../home/styles"

const block = "animate-pulse bg-card"

const row =
  "grid grid-cols-[24px_72px_1fr] items-start gap-x-4 gap-y-3 border-b-2 border-surface-variant px-4 py-5 sm:grid-cols-[24px_88px_1fr] xl:grid-cols-[40px_88px_minmax(220px,1.6fr)_minmax(150px,1fr)_minmax(150px,1fr)_120px_196px] xl:items-center xl:gap-5"

export function WishlistLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading your collection"
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

      <div className="border-b-2 border-surface-variant px-4 py-4">
        <div className={cn(block, "h-4 w-full")} />
      </div>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={row}>
          <div className={cn(block, "size-6")} />
          <div className={cn(block, "aspect-square border-4")} />
          <div className="flex flex-col gap-2">
            <div className={cn(block, "h-4 w-40 max-w-full")} />
            <div className={cn(block, "h-7 w-56 max-w-full xl:h-8 xl:w-72")} />
          </div>
          <div className={cn(block, "h-5 w-32 max-xl:hidden")} />
          <div className={cn(block, "h-5 w-24 max-xl:hidden")} />
          <div
            className={cn(block, "h-6 w-20 max-xl:col-start-3 xl:ml-auto")}
          />
          <div className="flex gap-2 max-xl:col-span-3 xl:justify-end">
            <div className={cn(block, "h-11 flex-1 xl:w-32 xl:flex-none")} />
            <div className={cn(block, "size-11 shrink-0")} />
          </div>
        </div>
      ))}
    </section>
  )
}
