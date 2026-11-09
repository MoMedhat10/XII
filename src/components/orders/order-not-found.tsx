import Link from "next/link"

import { button, eyebrow, gutter } from "@/components/home/styles"
import { cn } from "@/lib/utils"

/** Same page for unknown ids and other customers' orders. */
export function OrderNotFound() {
  return (
    <section className={cn(gutter, "pt-20 pb-30 sm:pt-28")}>
      <div className="relative flex flex-col items-center gap-5 overflow-hidden border-4 border-foreground bg-[#141515] px-8 py-30 text-center">
        <span className={eyebrow}>Order not found</span>
        <h2 className="font-heading text-[clamp(36px,4vw,56px)] leading-[1.05] font-bold tracking-[-0.02em] text-balance">
          No record under this reference.
        </h2>
        <p className="max-w-[460px] font-sans text-xl leading-[30px] text-pretty text-muted-foreground">
          The link may be mistyped, or the order belongs to another account.
        </p>
        <Link
          href="/orders"
          className={cn(
            button,
            "border-foreground bg-gold text-white hover:bg-black"
          )}
        >
          Your orders
        </Link>
      </div>
    </section>
  )
}
