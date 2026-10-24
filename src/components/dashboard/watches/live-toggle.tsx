"use client"

import { cn } from "@/lib/utils"

export function LiveToggle({
  checked,
  label,
  disabled,
  onToggle,
}: {
  checked: boolean
  label: string
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "relative h-7 w-[52px] shrink-0 border-2 transition-colors disabled:cursor-wait disabled:opacity-60",
        checked
          ? "border-gold bg-gold"
          : "border-surface-variant bg-transparent"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-[3px] size-[18px] transition-[left] duration-150",
          checked ? "left-[27px] bg-black" : "left-[3px] bg-surface-variant"
        )}
      />
    </button>
  )
}
