import Link from "next/link"

import { button, eyebrow, gutter } from "@/components/home/styles"
import { cn } from "@/lib/utils"

/** Shown when the id is unknown or the watch was withdrawn. */
export function WatchNotFound() {
  return (
    <section className={cn(gutter, "pt-20 pb-30 sm:pt-28")}>
      <div className="relative flex flex-col items-center gap-5 overflow-hidden border-4 border-foreground bg-[#141515] px-8 py-30 text-center">
        <svg
          viewBox="0 0 400 400"
          fill="none"
          stroke="#f9f9f9"
          strokeWidth="1.2"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -mt-[260px] -ml-[260px] w-[520px] animate-[xii-spin_90s_linear_infinite] opacity-[0.14] motion-reduce:animate-none"
        >
          <circle cx="200" cy="200" r="185" />
          <circle cx="200" cy="200" r="172" strokeDasharray="4 4" />
          <circle cx="200" cy="200" r="120" strokeDasharray="6 3" />
          <circle cx="200" cy="200" r="10" stroke="#B08D57" strokeWidth="2" />
        </svg>

        <span className={cn(eyebrow, "relative")}>Reference not found</span>
        <h2 className="relative font-heading text-[clamp(36px,4vw,56px)] leading-[1.05] font-bold tracking-[-0.02em] text-balance">
          This piece has left the vitrine.
        </h2>
        <p className="relative max-w-[460px] font-sans text-xl leading-[30px] text-pretty text-muted-foreground">
          It may have been sold or withdrawn from the catalog.
        </p>
        <Link
          href="/watches"
          className={cn(
            button,
            "relative border-foreground bg-gold text-white hover:bg-black"
          )}
        >
          Browse the catalog
        </Link>
      </div>
    </section>
  )
}
