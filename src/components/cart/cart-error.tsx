"use client"

import { useTransition } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { button, gridBackdrop } from "../home/styles"

export function CartError({ onRetry }: { onRetry: () => void }) {
  const [retrying, startTransition] = useTransition()

  return (
    <section className="relative flex min-h-[calc(100vh-88px)] items-center justify-center overflow-hidden bg-[#141515] px-6 py-24">
      <div className={cn(gridBackdrop, "opacity-[0.06]")} />
      <svg
        viewBox="0 0 400 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden="true"
        className={cn(
          "absolute aspect-square w-[min(560px,86vw)] animate-[spin_3s_linear_infinite] opacity-[0.22]",
          !retrying && "[animation-play-state:paused]"
        )}
      >
        <circle cx="200" cy="200" r="185" />
        <circle cx="200" cy="200" r="172" strokeDasharray="4 4" />
        <circle cx="200" cy="200" r="120" strokeDasharray="6 3" />
        <line
          x1="200"
          y1="200"
          x2="95"
          y2="120"
          stroke="var(--gold)"
          strokeWidth="3"
        />
        <line x1="200" y1="200" x2="260" y2="110" strokeWidth="5" />
        <circle cx="200" cy="200" r="8" fill="var(--gold)" stroke="none" />
      </svg>

      <div className="relative flex max-w-[600px] flex-col items-center gap-6 text-center">
        <span className="border-4 border-gold px-3.5 py-1.5 text-center font-heading text-xs leading-6 font-bold tracking-[1.5px] text-gold uppercase sm:text-sm">
          Error 503 · Movement stopped
        </span>
        <h1 className="font-heading text-[clamp(34px,5vw,72px)] leading-[1.05] font-bold tracking-[-0.02em] text-balance">
          We couldn&apos;t open your bag.
        </h1>
        <p className="font-sans text-lg leading-7 text-pretty text-muted-foreground sm:text-[22px] sm:leading-8">
          Your pieces are still reserved — nothing has been lost. Try again in a
          moment.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            disabled={retrying}
            onClick={() => startTransition(onRetry)}
            className={cn(
              button,
              "cursor-pointer border-foreground bg-gold text-white hover:bg-black disabled:opacity-70"
            )}
          >
            {retrying ? "Retrying…" : "Retry"}
          </button>
          <Link
            href="/"
            className={cn(
              button,
              "border-foreground bg-background hover:bg-foreground hover:text-black"
            )}
          >
            Contact Concierge
          </Link>
        </div>
        <span className="font-mono text-[11px] tracking-[.2em] text-muted-foreground uppercase">
          Ref. BAG-LOAD-503 · Reservation held 30 min
        </span>
      </div>
    </section>
  )
}
