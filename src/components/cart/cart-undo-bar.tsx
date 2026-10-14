import { cn } from "@/lib/utils"

import type { CartUndo } from "./cart-types"

export function CartUndoBar({
  undo,
  onUndo,
  className,
}: {
  undo: CartUndo
  onUndo: () => void
  className?: string
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-4 border-foreground bg-foreground px-5 py-3 text-black",
        className
      )}
    >
      <span className="font-sans text-base font-semibold">
        {undo.item.name} {undo.saved ? "moved to wishlist" : "removed"}.
      </span>
      <button
        type="button"
        onClick={onUndo}
        className="cursor-pointer border-b-2 border-black pb-0.5 font-sans text-[13px] font-bold tracking-[1.5px] uppercase"
      >
        Undo
      </button>
    </div>
  )
}
