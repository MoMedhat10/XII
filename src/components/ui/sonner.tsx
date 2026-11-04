"use client"

import type { LucideIcon } from "lucide-react"
import {
  CheckIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { cn } from "@/lib/utils"

/** The small caps label above the message, e.g. "✓ SUCCESS". */
function ToastLabel({
  icon: Icon,
  text,
  className,
  spin,
}: {
  icon: LucideIcon
  text: string
  className: string
  spin?: boolean
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 font-heading text-[11px] leading-4 font-bold tracking-[1.5px] uppercase",
        className
      )}
    >
      <Icon
        aria-hidden="true"
        strokeWidth={3}
        className={cn("size-3", spin && "animate-spin")}
      />
      {text}
    </span>
  )
}

const icons: ToasterProps["icons"] = {
  success: <ToastLabel icon={CheckIcon} text="Success" className="text-gold" />,
  error: <ToastLabel icon={XIcon} text="Error" className="text-[#ffdad6]" />,
  info: <ToastLabel icon={InfoIcon} text="Notice" className="text-steel" />,
  warning: (
    <ToastLabel
      icon={TriangleAlertIcon}
      text="Warning"
      className="text-concrete"
    />
  ),
  loading: (
    <ToastLabel icon={Loader2Icon} text="Working" className="text-steel" spin />
  ),
}

/**
 * App-wide toaster in the XII style: a dark slab with a heavy border and a
 * colored bar on the left for the toast type. Always dark, because it renders
 * outside the pages' `.dark` wrappers.
 */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="dark"
    className="toaster dark"
    position="top-center"
    gap={12}
    offset={24}
    mobileOffset={16}
    icons={icons}
    style={{ "--width": "400px" } as React.CSSProperties}
    toastOptions={{
      unstyled: true,
      classNames: {
        toast:
          "grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-4 border-l-[10px] border-foreground bg-[#141515] py-3.5 pr-4 pl-4 font-sans text-foreground",
        icon: "col-start-1 row-start-1 m-0 h-auto w-auto",
        content: "col-start-1 row-start-2 min-w-0",
        title: "text-[15px] leading-[22px] font-medium",
        description: "mt-0.5 text-sm leading-5 text-muted-foreground",
        actionButton:
          "col-start-2 row-span-2 row-start-1 h-9 cursor-pointer border-2 border-foreground px-3 font-sans text-xs font-bold tracking-[1.5px] whitespace-nowrap uppercase transition-colors hover:bg-foreground hover:text-black",
        cancelButton:
          "col-start-2 row-span-2 row-start-1 h-9 cursor-pointer px-2 font-sans text-xs font-bold tracking-[1.5px] text-muted-foreground uppercase hover:text-foreground",
        default: "border-l-steel",
        success: "border-l-gold",
        error: "border-l-[#ba1a1a]",
        info: "border-l-steel",
        warning: "border-l-concrete",
        loading: "border-l-steel",
      },
    }}
    {...props}
  />
)

export { Toaster }
