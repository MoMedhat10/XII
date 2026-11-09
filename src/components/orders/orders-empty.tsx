import Link from "next/link"

import { cn } from "@/lib/utils"

import { button, eyebrow, gridBackdrop } from "../home/styles"

export function OrdersEmpty() {
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
            strokeLinecap="square"
            aria-hidden="true"
          >
            <path d="M3 7l9-4 9 4v10l-9 4-9-4V7Z" />
            <path d="M3 7l9 4 9-4M12 11v10" />
          </svg>
        </div>
        <span className={eyebrow}>Order Register · 00</span>
        <h1 className="font-heading text-[clamp(34px,5vw,72px)] leading-[1.05] font-bold tracking-[-0.02em] text-balance">
          No orders yet.
        </h1>
        <p className="font-sans text-lg leading-7 text-pretty text-muted-foreground sm:text-[22px] sm:leading-8">
          Every piece you acquire is recorded here, from payment to signed
          delivery.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          <Link
            href="/watches"
            className={cn(
              button,
              "border-foreground bg-gold text-white hover:bg-black"
            )}
          >
            Browse Catalog
          </Link>
          <Link
            href="/cart"
            className={cn(
              button,
              "border-foreground bg-background hover:bg-foreground hover:text-black"
            )}
          >
            View Bag
          </Link>
        </div>
      </div>
    </section>
  )
}
