import type { CartLine as CartLineData } from "@/app/(app)/cart/_data/types"
import { lineTotal } from "@/app/(app)/cart/_utils/cart-lines"
import { formatPrice } from "@/components/dashboard/watches/watch-utils"
import { ImageFallback } from "@/components/image-fallback"

import { CartQuantity } from "./cart-quantity"

const textAction =
  "cursor-pointer border-b-2 border-surface-variant pb-0.5 font-sans text-xs font-bold tracking-[1.5px] uppercase transition-colors hover:border-gold hover:text-gold disabled:cursor-default disabled:opacity-60 disabled:hover:border-surface-variant disabled:hover:text-current"

export function CartLine({
  line,
  disabled,
  onQty,
  onRemove,
  onSaveForLater,
}: {
  line: CartLineData
  /** a remove or save for later is in flight (the stepper stays usable) */
  disabled: boolean
  onQty: (quantity: number) => void
  onRemove: () => void
  onSaveForLater: () => void
}) {
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-x-4 gap-y-4 border-b-2 border-surface-variant py-6 transition-colors hover:bg-card sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:gap-x-6 sm:py-7">
      <ImageFallback
        fill
        unoptimized
        sizes="120px"
        src={line.image?.url}
        alt={line.image?.alt || line.name}
        label="Photo"
        wrapperClassName="aspect-square border-4"
        className="object-cover"
      />

      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="font-sans text-xs leading-5 tracking-[0.1em] text-muted-foreground uppercase sm:text-sm">
          {line.model} · {line.spec}
        </span>
        <span className="font-heading text-xl leading-7 font-semibold sm:text-[28px] sm:leading-[34px]">
          {line.name}
        </span>
        {line.flag && (
          <span className="self-start border-2 border-gold px-2 py-0.5 font-heading text-[11px] leading-4 font-bold tracking-[1.5px] text-gold uppercase">
            {line.flag}
          </span>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-3">
          <CartQuantity
            name={line.name}
            quantity={line.quantity}
            max={line.max}
            onChange={onQty}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={onSaveForLater}
            className={textAction}
          >
            ♡ Save for later
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className={textAction}
          >
            Remove
          </button>
        </div>
      </div>

      <div className="col-span-2 flex items-baseline justify-between gap-1 sm:col-span-1 sm:flex-col sm:justify-start sm:text-right">
        <span className="font-heading text-xl leading-7 font-bold tracking-[1px] text-gold sm:text-[22px]">
          {formatPrice(lineTotal(line))}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {line.quantity > 1
            ? `${formatPrice(line.priceCents)} each`
            : `Max ${line.max}`}
        </span>
      </div>
    </div>
  )
}
