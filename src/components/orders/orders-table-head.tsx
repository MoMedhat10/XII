import { cn } from "@/lib/utils"

import { monoCaption } from "../home/styles"
import { columns } from "./orders-layout"

export function OrdersTableHead() {
  return (
    <div
      className={cn(
        columns,
        monoCaption,
        "border-b-2 border-surface-variant px-4 py-4 uppercase"
      )}
    >
      <span className="col-span-2">Order</span>
      <span>Placed</span>
      <span>Status</span>
      <span>Pieces</span>
      <span className="text-right">Total</span>
      <span />
    </div>
  )
}
