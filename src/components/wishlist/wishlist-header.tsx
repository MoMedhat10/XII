import { cn } from "@/lib/utils"

import { eyebrow, monoCaption } from "../home/styles"
import { formatPrice } from "../dashboard/watches/watch-utils"

export function WishlistHeader({
  count,
  totalCents,
}: {
  count: number
  totalCents: number
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 border-b-4 pb-6 sm:gap-8 sm:pb-8">
      <div>
        <span className={cn(eyebrow, "mb-2")}>Private Register</span>
        <h1 className="font-heading text-[clamp(36px,6vw,88px)] leading-none font-bold tracking-[-0.02em]">
          Saved Pieces
        </h1>
      </div>
      <div className="grid w-full grid-cols-2 border-4 sm:w-auto">
        <div className="border-r-4 px-4 py-3 sm:min-w-40 sm:px-6 sm:py-4">
          <span className={cn(monoCaption, "block")}>PIECES</span>
          <span className="block font-heading text-[28px] leading-9 font-bold sm:text-[40px] sm:leading-12">
            {String(count).padStart(2, "0")}
          </span>
        </div>
        <div className="px-4 py-3 sm:min-w-40 sm:px-6 sm:py-4">
          <span className={cn(monoCaption, "block")}>TOTAL VALUE</span>
          <span className="block font-heading text-[28px] leading-9 font-bold text-gold sm:text-[40px] sm:leading-12">
            {formatPrice(totalCents)}
          </span>
        </div>
      </div>
    </div>
  )
}
