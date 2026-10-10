import { cn } from "@/lib/utils"

import { Reveal } from "./reveal"
import { button, gutter } from "./styles"
import { ScrollLink } from "./scroll-link"

export function Cta() {
  return (
    <section className="border-t-4 bg-[#f9f9f9] text-black">
      <Reveal
        className={cn(
          gutter,
          "flex flex-wrap items-end justify-between gap-10 py-28"
        )}
      >
        <h2 className="max-w-[820px] font-heading text-[clamp(48px,6.6vw,96px)] leading-[1.04] font-bold tracking-[-0.02em]">
          Acquire a piece of permanence.
        </h2>
        <div className="flex flex-wrap gap-4">
          <ScrollLink
            href="/#drop"
            className={cn(
              button,
              "border-black bg-gold text-white hover:bg-black"
            )}
          >
            Browse Catalog
          </ScrollLink>
          <ScrollLink
            href="/#footer"
            className={cn(
              button,
              "border-black bg-[#f9f9f9] text-black hover:bg-black hover:text-white"
            )}
          >
            Book a Private Viewing
          </ScrollLink>
        </div>
      </Reveal>
    </section>
  )
}
