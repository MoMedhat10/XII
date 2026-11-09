"use client"

import { useRouter } from "next/navigation"

import type { CartPage } from "@/app/(app)/cart/_data/types"
import { useCart } from "@/app/(app)/cart/_hooks/use-cart"
import { cn } from "@/lib/utils"

import { gutter } from "../home/styles"
import { CartEmpty } from "./cart-empty"
import { CartHeader } from "./cart-header"
import { CartLine } from "./cart-line"
import { CartSummary } from "./cart-summary"

export function CartView(page: CartPage) {
  const cart = useCart(page)
  const router = useRouter()

  // Save a quantity changed in the last few hundred ms before leaving.
  const checkout = async () => {
    await cart.flushQuantities()
    router.push("/checkout")
  }

  if (!cart.lines.length) {
    return (
      <CartEmpty
        picks={cart.picks}
        pending={cart.pending}
        onAdd={cart.addPick}
      />
    )
  }

  return (
    <section className={cn(gutter, "pt-20 pb-24 sm:pt-28 sm:pb-32")}>
      <CartHeader pieces={cart.pieces} />

      <div className="flex flex-col gap-10 pt-2 lg:flex-row lg:items-start lg:gap-12">
        <div className="min-w-0 lg:flex-1">
          {cart.lines.map((line) => (
            <CartLine
              key={line.id}
              line={line}
              disabled={cart.pending}
              onQty={(quantity) => cart.setQty(line, quantity)}
              onRemove={() => cart.remove(line)}
              onSaveForLater={() => cart.saveForLater(line)}
            />
          ))}
        </div>

        <CartSummary subtotalCents={cart.subtotalCents} onCheckout={checkout} />
      </div>
    </section>
  )
}
