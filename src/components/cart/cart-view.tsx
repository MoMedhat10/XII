"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { ImageFallback } from "@/components/image-fallback"
import { cn } from "@/lib/utils"

import { button, eyebrow, gutter, monoCaption } from "../home/styles"
import { CartEmpty } from "./cart-empty"
import { usd, type CartItem } from "./cart-types"

const textAction =
  "cursor-pointer border-b-2 border-surface-variant pb-0.5 font-sans text-xs font-bold tracking-[1.5px] uppercase transition-colors hover:border-gold hover:text-gold"

const stepper =
  "w-10 cursor-pointer bg-background font-heading text-lg font-bold transition-colors hover:bg-foreground hover:text-black disabled:cursor-default disabled:opacity-40 disabled:hover:bg-background disabled:hover:text-foreground"

export function CartView({
  items: initialItems,
  picks,
}: {
  items: CartItem[]
  picks: CartItem[]
}) {
  // Local-only simulation: nothing is persisted.
  const [items, setItems] = useState(initialItems)
  const [promo, setPromo] = useState("")

  const pieces = items.reduce((sum, i) => sum + i.qty, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  const setQty = (id: string, delta: number) =>
    setItems((list) =>
      list.map((i) =>
        i.id === id
          ? { ...i, qty: Math.min(i.max, Math.max(1, i.qty + delta)) }
          : i
      )
    )

  const drop = (item: CartItem, saved: boolean) => {
    setItems((list) => list.filter((i) => i.id !== item.id))
    toast.success(
      saved ? `${item.name} moved to your wishlist` : `${item.name} removed`
    )
  }

  const addPick = (pick: CartItem) => {
    setItems([pick])
    toast.success("Added to your bag")
  }

  const applyPromo = () => {
    if (!promo.trim()) return
    toast.error("That promo code isn't valid")
  }

  if (!items.length) {
    return <CartEmpty picks={picks} onAdd={addPick} />
  }

  return (
    <section className={cn(gutter, "pt-20 pb-24 sm:pt-28 sm:pb-32")}>
      <div className="flex flex-wrap items-end justify-between gap-6 border-b-4 pb-6 sm:gap-8 sm:pb-8">
        <div>
          <span className={cn(eyebrow, "mb-2")}>
            Your Bag · {String(pieces).padStart(2, "0")}{" "}
            {pieces === 1 ? "Piece" : "Pieces"}
          </span>
          <h1 className="font-heading text-[clamp(36px,6vw,88px)] leading-none font-bold tracking-[-0.02em]">
            The Bag
          </h1>
        </div>
        <Link
          href="/#drop"
          className="border-b-4 pb-1 font-heading text-sm leading-6 font-bold tracking-[1.5px] uppercase transition-colors hover:border-gold hover:text-gold"
        >
          ← Continue Browsing
        </Link>
      </div>

      <div className="flex flex-col gap-10 pt-2 lg:flex-row lg:items-start lg:gap-12">
        <div className="min-w-0 lg:flex-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-x-4 gap-y-4 border-b-2 border-surface-variant py-6 transition-colors hover:bg-card sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:gap-x-6 sm:py-7"
            >
              <ImageFallback
                fill
                unoptimized
                sizes="120px"
                src={item.image}
                alt={item.name}
                label="Photo"
                wrapperClassName="aspect-square border-4"
                className="object-cover"
              />

              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="font-sans text-xs leading-5 tracking-[0.1em] text-muted-foreground uppercase sm:text-sm">
                  {item.ref} · {item.spec}
                </span>
                <span className="font-heading text-xl leading-7 font-semibold sm:text-[28px] sm:leading-[34px]">
                  {item.name}
                </span>
                {item.flag && (
                  <span className="self-start border-2 border-gold px-2 py-0.5 font-heading text-[11px] leading-4 font-bold tracking-[1.5px] text-gold uppercase">
                    {item.flag}
                  </span>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-3">
                  <div className="flex h-11 border-4">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      disabled={item.qty <= 1}
                      onClick={() => setQty(item.id, -1)}
                      className={cn(stepper, "border-r-4")}
                    >
                      −
                    </button>
                    <span
                      aria-live="polite"
                      className="flex w-11 items-center justify-center font-heading text-base font-bold"
                    >
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      disabled={item.qty >= item.max}
                      onClick={() => setQty(item.id, 1)}
                      className={cn(stepper, "border-l-4")}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => drop(item, true)}
                    className={textAction}
                  >
                    ♡ Save for later
                  </button>
                  <button
                    type="button"
                    onClick={() => drop(item, false)}
                    className={textAction}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="col-span-2 flex items-baseline justify-between gap-1 sm:col-span-1 sm:flex-col sm:justify-start sm:text-right">
                <span className="font-heading text-xl leading-7 font-bold tracking-[1px] text-gold sm:text-[22px]">
                  {usd(item.price * item.qty)}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {item.qty > 1 ? `${usd(item.price)} each` : `Max ${item.max}`}
                </span>
              </div>
            </div>
          ))}
        </div>

        <aside className="w-full border-4 bg-[#141515] lg:sticky lg:top-8 lg:mt-7 lg:w-[380px] xl:w-[440px]">
          <div
            className={cn(monoCaption, "border-b-4 px-6 py-5 tracking-[0.1em]")}
          >
            ORDER SUMMARY
          </div>
          <dl className="px-6 pt-2 font-sans text-base leading-6">
            <div className="flex justify-between gap-4 border-b-2 border-surface-variant py-3">
              <dt>Subtotal</dt>
              <dd>{usd(subtotal)}</dd>
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

          <form
            className="mx-6 mt-5 flex h-12 border-4"
            onSubmit={(e) => {
              e.preventDefault()
              applyPromo()
            }}
          >
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="PROMO CODE"
              aria-label="Promo code"
              className="min-w-0 flex-1 bg-transparent px-3.5 font-mono text-[13px] font-medium tracking-[0.1em] outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="cursor-pointer border-l-4 bg-background px-4 font-sans text-xs font-bold tracking-[1.5px] uppercase transition-colors hover:bg-foreground hover:text-black"
            >
              Apply
            </button>
          </form>

          <div className="mx-6 mt-6 flex items-baseline justify-between gap-4 border-t-4 pt-4">
            <span className="font-heading text-sm font-bold tracking-[1.5px] uppercase">
              Total
            </span>
            <span className="font-heading text-[32px] leading-10 font-bold text-gold sm:text-[40px] sm:leading-12">
              {usd(subtotal)}
            </span>
          </div>

          <div className="flex flex-col gap-3 px-6 pt-5 pb-6">
            <button
              type="button"
              onClick={() => toast("Checkout is coming soon")}
              className={cn(
                button,
                "h-[60px] cursor-pointer justify-center border-foreground bg-gold text-white hover:bg-black"
              )}
            >
              Checkout →
            </button>
            <button
              type="button"
              onClick={() => toast("Boutique viewings are coming soon")}
              className="h-[52px] cursor-pointer border-4 bg-background font-sans text-[13px] font-bold tracking-[1.5px] uppercase transition-colors hover:bg-foreground hover:text-black"
            >
              Book a boutique viewing
            </button>
            <span className="font-mono text-[11px] leading-[18px] tracking-[0.1em] text-muted-foreground uppercase">
              2-yr warranty · 30-day returns · Signed delivery
            </span>
          </div>
        </aside>
      </div>
    </section>
  )
}
