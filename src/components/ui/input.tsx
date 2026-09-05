import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-none border-2 border-black bg-background px-4 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white dark:bg-[#1a1c1c] dark:focus:border-[#B08D57]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
