import Link from "next/link"

import { cn } from "@/lib/utils"

import { gutter, monoCaption } from "../home/styles"

const crumb = "transition-colors hover:text-gold"

/** Timepieces / Brand / Name: a way back that never leaves the site. */
export function WatchBreadcrumb({
  brand,
  brandId,
  name,
}: {
  brand: string
  brandId: string
  name: string
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn(gutter, "pt-8 sm:pt-10")}>
      <ol
        className={cn(monoCaption, "flex min-w-0 items-center gap-2 uppercase")}
      >
        <li className="shrink-0">
          <Link href="/watches" className={crumb}>
            Timepieces
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="shrink-0">
          <Link
            href={`/watches?brand=${encodeURIComponent(brandId)}`}
            className={crumb}
          >
            {brand}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="min-w-0 truncate text-foreground">
          {name}
        </li>
      </ol>
    </nav>
  )
}
