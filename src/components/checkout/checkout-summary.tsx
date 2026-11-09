import type { CartLine } from "@/app/(app)/cart/_data/types"
import { lineTotal } from "@/app/(app)/cart/_utils/cart-lines"
import { formatPrice } from "@/components/dashboard/watches/watch-utils"
import { ImageFallback } from "@/components/image-fallback"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

import { button, monoCaption } from "../home/styles"

const summaryRow =
  "flex justify-between gap-4 border-b-2 border-surface-variant py-3"

export function CheckoutSummary({
  lines,
  subtotalCents,
  address,
  canPlace,
  pending,
}: {
  lines: CartLine[]
  subtotalCents: number
  /** shown once the shipping step is done */
  address: string[] | null
  canPlace: boolean
  pending: boolean
}) {
  const total = formatPrice(subtotalCents)

  return (
    <aside className="w-full border-4 bg-[#141515] lg:sticky lg:top-8 lg:w-[380px] xl:w-[440px]">
      <div className={cn(monoCaption, "border-b-4 px-6 py-5 tracking-[0.1em]")}>
        ORDER SUMMARY
      </div>

      <ul className="px-6">
        {lines.map((line) => (
          <li
            key={line.id}
            className="grid grid-cols-[56px_1fr_auto] items-center gap-3 border-b-2 border-surface-variant py-4"
          >
            <ImageFallback
              fill
              unoptimized
              sizes="56px"
              src={line.image?.url}
              alt={line.image?.alt || line.name}
              label="·"
              wrapperClassName="aspect-square border-2"
              className="object-cover"
            />
            <div className="min-w-0">
              <span className="block truncate font-heading text-base leading-6 font-semibold">
                {line.name}
              </span>
              <span className="block font-sans text-xs text-muted-foreground">
                {line.quantity} × {formatPrice(line.priceCents)}
              </span>
            </div>
            <span className="font-heading text-sm font-bold text-gold">
              {formatPrice(lineTotal(line))}
            </span>
          </li>
        ))}
      </ul>

      <dl className="px-6 pt-2 font-sans text-base leading-6">
        <div className={summaryRow}>
          <dt>Subtotal</dt>
          <dd>{total}</dd>
        </div>
        <div className={summaryRow}>
          <dt>Insured courier</dt>
          <dd className="font-semibold text-gold">Complimentary</dd>
        </div>
      </dl>

      {address && (
        <div className="mx-6 mt-4 border-2 border-surface-variant px-4 py-3">
          <span className={cn(monoCaption, "mb-1 block uppercase")}>
            Ship to
          </span>
          <address className="font-sans text-sm leading-5 not-italic">
            {address.map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
          </address>
        </div>
      )}

      <div className="mx-6 mt-6 flex items-baseline justify-between gap-4 border-t-4 pt-4">
        <span className="font-heading text-sm font-bold tracking-[1.5px] uppercase">
          Total
        </span>
        <span className="font-heading text-[32px] leading-10 font-bold text-gold sm:text-[40px] sm:leading-12">
          {total}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-6 pt-5 pb-6">
        <button
          type="submit"
          form="checkout-form"
          disabled={!canPlace || pending}
          className={cn(
            button,
            "h-[60px] cursor-pointer justify-center gap-3 border-foreground bg-gold text-white hover:bg-black disabled:cursor-default disabled:opacity-60 disabled:hover:bg-gold"
          )}
        >
          {pending && <Spinner aria-hidden="true" />}
          {pending ? "Placing order…" : `Place order · ${total}`}
        </button>
        <span className="font-mono text-[11px] leading-[18px] tracking-[0.1em] text-muted-foreground uppercase">
          2-yr warranty · 30-day returns · Signed delivery
        </span>
      </div>
    </aside>
  )
}
