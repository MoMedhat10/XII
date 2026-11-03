import { cn } from "@/lib/utils"

const stepper =
  "w-10 cursor-pointer bg-background font-heading text-lg font-bold transition-colors hover:bg-foreground hover:text-black disabled:cursor-default disabled:opacity-40 disabled:hover:bg-background disabled:hover:text-foreground"

export function CartQuantity({
  name,
  quantity,
  max,
  onChange,
}: {
  /** watch name, for the button labels */
  name: string
  quantity: number
  max: number
  /** fires on every click; saving is debounced by the caller */
  onChange: (quantity: number) => void
}) {
  return (
    <div className="flex h-11 border-4">
      <button
        type="button"
        aria-label={`Decrease quantity of ${name}`}
        disabled={quantity <= 1}
        onClick={() => onChange(quantity - 1)}
        className={cn(stepper, "border-r-4")}
      >
        −
      </button>
      <span
        aria-live="polite"
        className="flex w-11 items-center justify-center font-heading text-base font-bold"
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`Increase quantity of ${name}`}
        disabled={quantity >= max}
        onClick={() => onChange(quantity + 1)}
        className={cn(stepper, "border-l-4")}
      >
        +
      </button>
    </div>
  )
}
