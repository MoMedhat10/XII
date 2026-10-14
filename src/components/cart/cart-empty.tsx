import Link from "next/link"

import { ImageFallback } from "@/components/image-fallback"
import { cn } from "@/lib/utils"

import { button, eyebrow, gridBackdrop, monoCaption } from "../home/styles"
import { usd, type CartItem, type CartUndo } from "./cart-types"
import { CartUndoBar } from "./cart-undo-bar"

export function CartEmpty({
  picks,
  undo,
  onUndo,
  onAdd,
}: {
  picks: CartItem[]
  undo: CartUndo | null
  onUndo: () => void
  onAdd: (pick: CartItem) => void
}) {
  return (
    <section className="relative flex min-h-[calc(100vh-88px)] flex-col items-center justify-center overflow-hidden bg-[#141515] px-6 pt-24 pb-16 sm:py-24">
      <div className={cn(gridBackdrop, "opacity-[0.06]")} />
      <svg
        viewBox="0 0 400 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 aspect-square w-[min(560px,86vw)] -translate-x-1/2 -translate-y-1/2 animate-[spin_90s_linear_infinite] opacity-[0.18]"
      >
        <circle cx="200" cy="200" r="185" />
        <circle cx="200" cy="200" r="172" strokeDasharray="4 4" />
        <circle cx="200" cy="200" r="120" strokeDasharray="6 3" />
        <circle cx="200" cy="200" r="10" stroke="var(--gold)" strokeWidth="2" />
      </svg>

      <div className="relative flex max-w-[600px] flex-col items-center gap-6 text-center">
        {undo && <CartUndoBar undo={undo} onUndo={onUndo} className="w-full" />}
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
            <path d="M6 7h12l-1 14H7L6 7Z" />
            <path d="M9 7V5a3 3 0 0 1 6 0v2" />
          </svg>
        </div>
        <span className={eyebrow}>Your Bag · 00 Pieces</span>
        <h1 className="font-heading text-[clamp(34px,5vw,72px)] leading-[1.05] font-bold tracking-[-0.02em] text-balance">
          Nothing on the bench yet.
        </h1>
        <p className="font-sans text-lg leading-7 text-pretty text-muted-foreground sm:text-[22px] sm:leading-8">
          Pieces you add will wait here, reserved for 30 minutes.
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
            href="/wishlist"
            className={cn(
              button,
              "border-foreground bg-background hover:bg-foreground hover:text-black"
            )}
          >
            ♡ From Wishlist
          </Link>
        </div>
      </div>

      {picks.length > 0 && (
        <div className="relative mt-16 w-full max-w-[960px] border-t-4 pt-6 sm:mt-24">
          <span className={cn(monoCaption, "mb-4 block")}>
            FROM YOUR WISHLIST
          </span>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {picks.map((pick) => (
              <div
                key={pick.id}
                className="group border-4 bg-background text-left transition-colors hover:bg-foreground hover:text-black"
              >
                <ImageFallback
                  fill
                  unoptimized
                  sizes="320px"
                  src={pick.image}
                  alt={pick.name}
                  label="Photo"
                  wrapperClassName="aspect-[4/3] border-b-4 border-current"
                  className="object-cover"
                />
                <div className="flex justify-between gap-2 px-4 py-3 font-heading text-lg leading-6 font-semibold">
                  <span>{pick.name}</span>
                  <span className="text-gold group-hover:text-[#7C5A3C]">
                    {usd(pick.price)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onAdd(pick)}
                  className="h-11 w-full cursor-pointer border-t-4 border-current font-sans text-xs font-bold tracking-[1.5px] uppercase"
                >
                  + Add to Bag
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
