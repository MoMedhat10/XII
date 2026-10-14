import Link from "next/link"

import { cn } from "@/lib/utils"

import { button, eyebrow, gridBackdrop } from "../home/styles"

export function WishlistEmpty() {
  return (
    <section className="relative flex min-h-[calc(100vh-88px)] items-center justify-center overflow-hidden bg-[#141515] px-6 py-24">
      <div className={cn(gridBackdrop, "opacity-[0.06]")} />
      <svg
        viewBox="0 0 400 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden="true"
        className="absolute aspect-square w-[min(560px,86vw)] animate-[spin_90s_linear_infinite] opacity-[0.18]"
      >
        <circle cx="200" cy="200" r="185" />
        <circle cx="200" cy="200" r="172" strokeDasharray="4 4" />
        <circle cx="200" cy="200" r="120" strokeDasharray="6 3" />
        <circle cx="200" cy="200" r="10" stroke="var(--gold)" strokeWidth="2" />
      </svg>

      <div className="relative flex max-w-[560px] flex-col items-center gap-6 text-center">
        <div className="flex size-[72px] items-center justify-center border-4 bg-background">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </div>
        <span className={eyebrow}>Saved Collection · 00</span>
        <h1 className="font-heading text-[clamp(34px,5vw,72px)] leading-[1.05] font-bold tracking-[-0.02em] text-balance">
          The vitrine is empty.
        </h1>
        <p className="font-sans text-lg leading-7 text-pretty text-muted-foreground sm:text-[22px] sm:leading-8">
          Tap the heart on any timepiece to keep it here for later.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          <Link
            href="/#drop"
            className={cn(
              button,
              "border-foreground bg-gold text-white hover:bg-black"
            )}
          >
            Browse Catalog
          </Link>
          <Link
            href="/#advisor"
            className={cn(
              button,
              "border-foreground bg-background hover:bg-foreground hover:text-black"
            )}
          >
            Size Guide
          </Link>
        </div>
      </div>
    </section>
  )
}
