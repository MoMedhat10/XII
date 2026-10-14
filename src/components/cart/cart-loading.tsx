import { cn } from "@/lib/utils"

import { gutter, monoCaption } from "../home/styles"

const block = "animate-pulse bg-card"

const widths = ["w-[55%]", "w-[42%]", "w-[48%]"]

export function CartLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading your bag"
      className={cn(gutter, "pt-20 pb-24 sm:pt-28 sm:pb-32")}
    >
      <div className="flex flex-wrap items-end justify-between gap-6 border-b-4 pb-6 sm:gap-8 sm:pb-8">
        <div className="flex flex-col gap-4">
          <div className={cn(block, "h-5 w-48")} />
          <div
            className={cn(
              block,
              "h-[clamp(36px,6vw,88px)] w-[min(380px,70vw)]"
            )}
          />
        </div>
        <div className="h-7 w-48 border-b-4 border-surface-variant" />
      </div>

      <div className="flex flex-col gap-10 pt-2 lg:flex-row lg:items-start lg:gap-12">
        <div className="min-w-0 lg:flex-1">
          {widths.map((w, i) => (
            <div
              key={i}
              className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-x-4 gap-y-4 border-b-2 border-surface-variant py-6 sm:grid-cols-[120px_minmax(0,1fr)_110px] sm:gap-x-6 sm:py-7"
            >
              <div className={cn(block, "aspect-square border-4")} />
              <div className="flex flex-col gap-3">
                <div className={cn(block, "h-3 w-[45%]")} />
                <div className={cn(block, "h-7", w)} />
                <div className="mt-2 flex items-center gap-4">
                  <div className={cn(block, "h-11 w-[132px] border-4")} />
                  <div className={cn(block, "h-3.5 w-28 max-sm:hidden")} />
                </div>
              </div>
              <div className="col-span-2 flex items-baseline justify-between sm:col-span-1 sm:flex-col sm:items-end sm:gap-2">
                <div className={cn(block, "h-[22px] w-24")} />
                <div className={cn(block, "h-2.5 w-14")} />
              </div>
            </div>
          ))}
        </div>

        <div className="w-full border-4 bg-[#141515] lg:mt-7 lg:w-[380px] xl:w-[440px]">
          <div className="border-b-4 px-6 py-5">
            <div className={cn(block, "h-3 w-28")} />
          </div>
          <div className="flex flex-col gap-5 px-6 py-3">
            <div className={cn(block, "h-3.5")} />
            <div className={cn(block, "h-3.5 w-4/5")} />
            <div className={cn(block, "h-3.5 w-[70%]")} />
            <div className="h-12 border-4" />
            <div className={cn(block, "h-10")} />
          </div>
          <div className="flex flex-col gap-3 px-6 pt-3 pb-6">
            <span className="flex h-[60px] items-center justify-center border-4 font-sans text-base font-bold tracking-[1.5px] text-surface-variant">
              CHECKOUT →
            </span>
            <span className="h-[52px] border-4" />
          </div>
        </div>
      </div>

      <span
        className={cn(monoCaption, "mt-6 block tracking-[0.2em] uppercase")}
      >
        Reserving your pieces…
      </span>
    </section>
  )
}
