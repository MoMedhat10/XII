"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export type PasswordInputProps = React.ComponentProps<"input">

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "h-12 w-full min-w-0 rounded-none border-2 border-black bg-background px-4 py-2 pr-12 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white dark:bg-[#1a1c1c] dark:focus:border-[#B08D57]",
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center border-l-2 border-black dark:border-white bg-transparent text-foreground hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
