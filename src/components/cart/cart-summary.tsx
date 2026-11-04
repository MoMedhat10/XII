"use client"

import { toast } from "sonner"

import { formatPrice } from "@/components/dashboard/watches/watch-utils"
import { cn } from "@/lib/utils"

import { button, monoCaption } from "../home/styles"

export function CartSummary({ subtotalCents }: { subtotalCents: number }) {
  const subtotal = formatPrice(subtotalCents)

  return (
    <aside className="w-full border-4 bg-[#141515] lg:sticky lg:top-8 lg:mt-7 lg:w-[380px] xl:w-[440px]">
      <div className={cn(monoCaption, "border-b-4 px-6 py-5 tracking-[0.1em]")}>
        ORDER SUMMARY
      </div>
      <dl className="px-6 pt-2 font-sans text-base leading-6">
        <div className="flex justify-between gap-4 border-b-2 border-surface-variant py-3">
          <dt>Subtotal</dt>
          <dd>{subtotal}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b-2 border-surface-variant py-3">
          <dt>Insured courier</dt>
          <dd className="font-semibold text-gold">Complimentary</dd>
        </div>
        <div className="flex justify-between gap-4 border-b-2 border-surface-variant py-3">
          <dt>Duties &amp; tax</dt>
          <dd className="text-muted-foreground">At checkout</dd>
        </div>
      </dl>

      <div className="mx-6 mt-6 flex items-baseline justify-between gap-4 border-t-4 pt-4">
        <span className="font-heading text-sm font-bold tracking-[1.5px] uppercase">
          Total
        </span>
        <span className="font-heading text-[32px] leading-10 font-bold text-gold sm:text-[40px] sm:leading-12">
          {subtotal}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-6 pt-5 pb-6">
        <button
          type="button"
          onClick={() => toast.info("Checkout is coming soon")}
          className={cn(
            button,
            "h-[60px] cursor-pointer justify-center border-foreground bg-gold text-white hover:bg-black"
          )}
        >
          Checkout →
        </button>
        <button
          type="button"
          onClick={() => toast.info("Boutique viewings are coming soon")}
          className="h-[52px] cursor-pointer border-4 bg-background font-sans text-[13px] font-bold tracking-[1.5px] uppercase transition-colors hover:bg-foreground hover:text-black"
        >
          Book a boutique viewing
        </button>
        <span className="font-mono text-[11px] leading-[18px] tracking-[0.1em] text-muted-foreground uppercase">
          2-yr warranty · 30-day returns · Signed delivery
        </span>
      </div>
    </aside>
  )
}
