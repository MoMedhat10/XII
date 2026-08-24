import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border-4 border-transparent uppercase tracking-[1.5px] font-bold text-sm transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground",
        solid:
          "border-primary bg-primary text-primary-foreground hover:bg-background hover:text-primary",
        gold:
          "border-black bg-[#B08D57] text-white hover:bg-black hover:text-white dark:border-white",
        outline:
          "border-border bg-background hover:bg-primary hover:text-primary-foreground",
        secondary:
          "border-secondary bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground",
        ghost:
          "border-transparent hover:bg-muted hover:text-foreground",
        destructive:
          "border-destructive bg-destructive/10 text-destructive hover:bg-destructive hover:text-white",
        link: "text-primary underline-offset-4 hover:underline border-none",
      },
      size: {
        default:
          "h-12 gap-2 px-6 py-3",
        xs: "h-8 gap-1 px-3 py-1 text-xs",
        sm: "h-10 gap-1.5 px-4 py-2 text-xs",
        lg: "h-14 gap-2 px-8 py-4 text-base",
        icon: "size-12",
        "icon-xs": "size-8",
        "icon-sm": "size-10",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

