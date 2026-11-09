import { cn } from "@/lib/utils"

import { gutter } from "../home/styles"

const block = "animate-pulse bg-card"

export function CompareLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading comparison"
      className={cn(gutter, "pt-20 pb-30 sm:pt-28")}
    >
      <div className="flex flex-col gap-4 border-b-4 pb-6 sm:pb-8">
        <div className={cn(block, "h-5 w-32")} />
        <div
          className={cn(block, "h-[clamp(36px,6vw,88px)] w-[min(380px,70vw)]")}
        />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-[160px_1fr_1fr_1fr]">
        <div className={cn(block, "hidden h-96 sm:block")} />
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className={cn(
              block,
              "aspect-4/5 border-4 sm:aspect-square",
              i === 2 && "max-sm:hidden"
            )}
          />
        ))}
      </div>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={`section-${i}`} className="mt-4 flex flex-col gap-2">
          <div className={cn(block, "h-10 w-full")} />
          <div className={cn(block, "h-12 w-full opacity-60")} />
          <div className={cn(block, "h-12 w-full opacity-60")} />
        </div>
      ))}
    </section>
  )
}
