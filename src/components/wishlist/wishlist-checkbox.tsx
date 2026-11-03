import { cn } from "@/lib/utils"

/** The square gold checkbox used for row and select-all selection. */
export function WishlistCheckbox({
  checked = false,
  label,
  onClick,
}: {
  checked?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "size-6 cursor-pointer border-4",
        checked ? "bg-gold" : "bg-transparent"
      )}
    />
  )
}
