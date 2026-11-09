import { cn } from "@/lib/utils"

const STEPS = ["Shipping", "Payment"] as const

export function CheckoutSteps({ step }: { step: 0 | 1 }) {
  return (
    <ol className="grid grid-cols-2 border-4">
      {STEPS.map((label, i) => (
        <li
          key={label}
          aria-current={i === step ? "step" : undefined}
          className={cn(
            "flex items-baseline gap-3 px-4 py-4 sm:px-6",
            i > 0 && "border-l-4",
            i === step && "bg-gold text-white",
            i > step && "text-muted-foreground"
          )}
        >
          <span className="font-mono text-[11px] tracking-[0.1em]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="font-heading text-sm leading-6 font-bold tracking-[1.5px] uppercase">
            {label}
          </span>
          {i < step && (
            <span className="ml-auto font-heading text-sm" aria-hidden="true">
              ✓
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}
