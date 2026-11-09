import { cn } from "@/lib/utils"

import { gutter } from "../home/styles"

const block = "animate-pulse bg-card"

export function CheckoutLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading checkout"
      className={cn(gutter, "pt-20 pb-24 sm:pt-28")}
    >
      <div className="flex flex-col gap-4 border-b-4 pb-6 sm:pb-8">
        <div className={cn(block, "h-5 w-40")} />
        <div
          className={cn(block, "h-[clamp(36px,6vw,88px)] w-[min(420px,80vw)]")}
        />
      </div>
      <div className="flex flex-col gap-10 pt-8 lg:flex-row lg:items-start lg:gap-12">
        <div className="flex flex-col gap-6 lg:flex-1">
          <div className={cn(block, "h-16 border-4")} />
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className={cn(block, "h-4 w-24")} />
                <div className={cn(block, "h-12")} />
              </div>
            ))}
          </div>
        </div>
        <div
          className={cn(
            block,
            "h-[480px] w-full border-4 lg:w-[380px] xl:w-[440px]"
          )}
        />
      </div>
    </section>
  )
}
