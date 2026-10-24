"use client"

import type { AdminWatch } from "@/app/(dashboard)/_data/mock-watches"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { portalTheme } from "./watch-utils"

const item =
  "flex h-12 cursor-pointer justify-between rounded-none px-4 font-sans text-xs font-bold tracking-[1.5px] uppercase"

export function WatchRowActions({
  watch,
  onEdit,
  onDelete,
}: {
  watch: AdminWatch
  onEdit: (watch: AdminWatch) => void
  onDelete: (watch: AdminWatch) => void
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={`Actions for ${watch.name}`}
        className="flex size-11 items-center justify-center border-2 border-surface-variant font-heading text-lg leading-none font-bold tracking-[1px] transition-colors hover:border-foreground data-[state=open]:border-foreground data-[state=open]:bg-foreground data-[state=open]:text-black"
      >
        ⋯
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className={cn(
          portalTheme,
          "w-[200px] border-4 border-foreground bg-[#141515] p-0 shadow-[8px_8px_0_var(--gold)]"
        )}
      >
        <DropdownMenuItem
          onSelect={() => onEdit(watch)}
          className={cn(
            item,
            "border-b-2 border-surface-variant text-foreground focus:bg-foreground focus:text-black"
          )}
        >
          <span>Update</span>
          <span aria-hidden="true" className="font-heading">
            ✎
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onDelete(watch)}
          className={cn(
            item,
            "text-gold focus:bg-gold focus:text-black not-data-[variant=destructive]:focus:**:text-black"
          )}
        >
          <span>Delete</span>
          <span aria-hidden="true" className="font-heading">
            ✕
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
