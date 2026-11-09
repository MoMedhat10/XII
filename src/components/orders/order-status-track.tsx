import type { OrderStatus } from "@/app/generated/prisma/enums"
import { cn } from "@/lib/utils"

const STEPS = [
  { status: "PAID", label: "Paid", note: "Payment received" },
  { status: "SHIPPED", label: "Shipped", note: "With insured courier" },
  { status: "DELIVERED", label: "Delivered", note: "Signed for" },
] as const

/** Paid → Shipped → Delivered, or a single bar for a cancelled order. */
export function OrderStatusTrack({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="border-4 border-surface-variant px-5 py-4">
        <span className="block font-heading text-sm leading-6 font-bold tracking-[1.5px] text-muted-foreground uppercase">
          Cancelled
        </span>
        <span className="block font-sans text-sm text-muted-foreground">
          This order was cancelled and will not ship.
        </span>
      </div>
    )
  }

  const current = STEPS.findIndex((s) => s.status === status)
  return (
    <ol className="grid grid-cols-3 border-4">
      {STEPS.map((step, i) => {
        const done = i <= current
        return (
          <li
            key={step.status}
            aria-current={i === current ? "step" : undefined}
            className={cn(
              "flex flex-col gap-1 px-3 py-4 sm:px-5",
              i > 0 && "border-l-4",
              i === current && "bg-gold text-white",
              !done && "text-muted-foreground"
            )}
          >
            <span className="font-mono text-[11px] tracking-[0.1em]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-heading text-sm leading-6 font-bold tracking-[1.5px] uppercase">
              {step.label}
            </span>
            <span
              className={cn(
                "font-sans text-xs leading-5 max-sm:hidden",
                i !== current && "text-muted-foreground"
              )}
            >
              {step.note}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
