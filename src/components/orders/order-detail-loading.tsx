import { cn } from "@/lib/utils"

import { gutter } from "../home/styles"

const block = "animate-pulse bg-card"

export function OrderDetailLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading your order"
      className={cn(gutter, "pt-20 pb-40 sm:pt-28")}
    >
      <div className="flex flex-col gap-4 border-b-4 pb-6 sm:pb-8">
        <div className={cn(block, "h-5 w-48")} />
        <div
          className={cn(block, "h-[clamp(32px,5vw,72px)] w-[min(480px,80vw)]")}
        />
      </div>
      <div className={cn(block, "mt-8 h-24 border-4")} />
      <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="flex flex-col lg:flex-1">
          {Array.from({ length: 2 }, (_, i) => (
            <div
              key={i}
              className="grid grid-cols-[72px_1fr] gap-4 border-b-2 border-surface-variant py-5 sm:grid-cols-[88px_1fr]"
            >
              <div className={cn(block, "aspect-square border-4")} />
              <div className="flex flex-col gap-2">
                <div className={cn(block, "h-4 w-40 max-w-full")} />
                <div className={cn(block, "h-7 w-56 max-w-full")} />
              </div>
            </div>
          ))}
        </div>
        <div
          className={cn(
            block,
            "h-[360px] w-full border-4 lg:w-[380px] xl:w-[440px]"
          )}
        />
      </div>
    </section>
  )
}
