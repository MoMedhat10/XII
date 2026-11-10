import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader } from "@/components/dashboard/page-header"
import { pad } from "@/components/dashboard/watches/watch-utils"

import { getAdminOverview } from "./_data/overview"

export const metadata: Metadata = {
  title: "Overview — XII Admin",
}

export default async function DashboardPage() {
  const stats = await getAdminOverview()

  const tiles = [
    { label: "References", value: stats.watches, href: "/dashboard/watches" },
    {
      label: "Live",
      value: stats.live,
      href: "/dashboard/watches?status=live",
    },
    {
      label: "Drafts",
      value: stats.drafts,
      href: "/dashboard/watches?status=draft",
    },
    { label: "Sold out", value: stats.soldOut, gold: stats.soldOut > 0 },
    { label: "Brands", value: stats.brands },
  ]

  return (
    <>
      <PageHeader crumbs={["Admin", "Overview"]} title="Overview" />

      <section
        aria-label="Inventory at a glance"
        className="mt-10 grid grid-cols-2 border-t-4 border-l-4 sm:grid-cols-3 xl:grid-cols-5"
      >
        {tiles.map(({ label, value, href, gold }) => {
          const body = (
            <>
              <span className="font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase group-hover:text-black">
                {label}
              </span>
              <span
                className={
                  gold
                    ? "font-heading text-5xl font-bold text-gold tabular-nums group-hover:text-black"
                    : "font-heading text-5xl font-bold tabular-nums"
                }
              >
                {pad(value)}
              </span>
            </>
          )
          const tile =
            "flex min-h-[140px] flex-col justify-between gap-6 border-r-4 border-b-4 p-5"
          return href ? (
            <Link
              key={label}
              href={href}
              className={`${tile} group transition-colors hover:bg-foreground hover:text-black`}
            >
              {body}
            </Link>
          ) : (
            <div key={label} className={tile}>
              {body}
            </div>
          )
        })}
      </section>
    </>
  )
}
