"use client"

import Link, { useLinkStatus } from "next/link"

import { cn } from "@/lib/utils"

import { monoCaption } from "../home/styles"

function Label({ count }: { count: number }) {
  const { pending } = useLinkStatus()
  return <>{pending ? "Loading…" : `Show ${count} more`}</>
}

/**
 * A link to `?show=N`, so the server renders more rows. `replace` keeps each
 * step out of the back-button history; `scroll={false}` keeps the position.
 */
export function WishlistShowMore({
  href,
  shown,
  total,
  nextCount,
}: {
  href: string
  shown: number
  total: number
  nextCount: number
}) {
  return (
    <div className="mt-14 flex flex-col items-center gap-4">
      <span className={cn(monoCaption, "uppercase")}>
        Showing {shown} of {total}
      </span>
      <div className="h-1 w-60 bg-surface-variant">
        <div
          className="h-full bg-gold transition-[width] duration-400"
          style={{ width: `${total ? (shown / total) * 100 : 0}%` }}
        />
      </div>
      <Link
        href={href}
        replace
        scroll={false}
        className="flex h-14 items-center border-4 bg-background px-10 font-sans text-base font-bold tracking-[1.5px] uppercase transition-colors hover:bg-foreground hover:text-black"
      >
        <Label count={nextCount} />
      </Link>
    </div>
  )
}
