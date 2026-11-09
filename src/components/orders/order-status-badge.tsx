import type { OrderStatus } from "@/app/generated/prisma/enums"
import { STATUS_LABEL } from "@/app/(app)/orders/_utils/order-format"
import { cn } from "@/lib/utils"

const TONE: Record<OrderStatus, string> = {
  PAID: "border-gold text-gold",
  SHIPPED: "border-foreground text-foreground",
  DELIVERED: "border-foreground bg-foreground text-black",
  CANCELLED: "border-surface-variant text-muted-foreground",
}

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-block border-2 px-2 py-0.5 font-heading text-[11px] leading-4 font-bold tracking-[1.5px] uppercase",
        TONE[status],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
