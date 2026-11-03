import { cn } from "@/lib/utils"

import { monoCaption } from "../home/styles"
import { WishlistCheckbox } from "./wishlist-checkbox"
import { columns } from "./wishlist-layout"

export function WishlistTableHead({
  allSelected,
  onToggleAll,
}: {
  allSelected: boolean
  onToggleAll: () => void
}) {
  return (
    <div
      className={cn(
        columns,
        monoCaption,
        "border-b-2 border-surface-variant px-4 py-4"
      )}
    >
      <WishlistCheckbox
        checked={allSelected}
        label="Select all"
        onClick={onToggleAll}
      />
      <span className="xl:hidden">SELECT ALL</span>
      <span className="max-xl:hidden" />
      <span className="max-xl:hidden">REFERENCE</span>
      <span className="max-xl:hidden">BRAND</span>
      <span className="max-xl:hidden">AVAILABILITY</span>
      <span className="text-right max-xl:hidden">PRICE</span>
      <span className="max-xl:hidden" />
    </div>
  )
}
