import Link from "next/link"

import type { AdminOverview } from "@/app/(dashboard)/dashboard/_data/overview-types"
import { cn } from "@/lib/utils"

import { pad, sectionLabel } from "../styles"

type Tile = {
  label: string
  value: number
  href?: string
  tone?: "gold" | "danger"
}

const TONE = { gold: "text-gold", danger: "text-danger" }

/** Today's totals (not tied to the period): catalog and accounts. */
export function CatalogStrip({ overview }: { overview: AdminOverview }) {
  const c = overview.catalog
  const tiles: Tile[] = [
    { label: "References", value: c.watches, href: "/dashboard/watches" },
    { label: "Live", value: c.live, href: "/dashboard/watches?status=live" },
    {
      label: "Drafts",
      value: c.drafts,
      href: "/dashboard/watches?status=draft",
    },
    {
      label: "Sold out",
      value: c.soldOut,
      tone: c.soldOut > 0 ? "gold" : undefined,
    },
    { label: "Brands", value: c.brands },
    { label: "Users", value: c.users, href: "/dashboard/users" },
    {
      label: "Suspended",
      value: c.suspended,
      href: "/dashboard/users?status=suspended",
      tone: c.suspended > 0 ? "danger" : undefined,
    },
  ]

  return (
    <section
      aria-labelledby="catalog-heading"
      className="flex flex-col gap-3 pb-4"
    >
      <h2 id="catalog-heading" className={sectionLabel}>
        Catalog & accounts · today
      </h2>
      <div className="grid grid-cols-2 border-t-4 border-l-4 sm:grid-cols-4 xl:grid-cols-7">
        {tiles.map(({ label, value, href, tone }) => {
          const body = (
            <>
              <span className="font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase group-hover:text-black">
                {label}
              </span>
              <span
                className={cn(
                  "font-heading text-3xl font-bold tabular-nums group-hover:text-black",
                  tone && TONE[tone]
                )}
              >
                {pad(value)}
              </span>
            </>
          )
          const tile =
            "flex min-h-[104px] flex-col justify-between gap-4 border-r-4 border-b-4 p-4"
          return href ? (
            <Link
              key={label}
              href={href}
              className={cn(
                tile,
                "group transition-colors hover:bg-foreground hover:text-black"
              )}
            >
              {body}
            </Link>
          ) : (
            <div key={label} className={tile}>
              {body}
            </div>
          )
        })}
      </div>
    </section>
  )
}
