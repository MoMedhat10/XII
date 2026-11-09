import type { ComponentProps } from "react"

import {
  fieldControl,
  fieldLabel,
} from "@/components/dashboard/watches/watch-utils"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export const errorText = "text-[13px] font-medium text-red-500"
export const errorBorder =
  "border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500"

/** Label + input + error message, wired for screen readers. */
export function CheckoutField({
  id,
  label,
  error,
  className,
  ...props
}: ComponentProps<"input"> & {
  id: string
  label: string
  error?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(fieldControl, error && errorBorder)}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className={errorText}>
          {error}
        </p>
      )}
    </div>
  )
}
