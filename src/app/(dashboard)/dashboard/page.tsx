import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader } from "@/components/dashboard/page-header"
import { pad, sectionLabel } from "@/components/dashboard/styles"
import { cn } from "@/lib/utils"

import { getAdminOverview } from "./_data/overview"

export const metadata: Metadata = {
  title: "Overview — XII Admin",
}

type Tile = {
  label: string
  value: number
  href?: string
  tone?: "gold" | "danger"
}

const TONE = { gold: "text-gold", danger: "text-danger" }

function TileGrid({ label, tiles }: { label: string; tiles: Tile[] }) {
  return (
    <section aria-label={label} className="mt-10 flex flex-col gap-3">
      <h2 className={sectionLabel}>{label}</h2>
      <div className="grid grid-cols-2 border-t-4 border-l-4 sm:grid-cols-3 xl:grid-cols-5">
        {tiles.map(({ label, value, href, tone }) => {
          const body = (
            <>
              <span className="font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase group-hover:text-black">
                {label}
              </span>
              <span
                className={cn(
                  "font-heading text-5xl font-bold tabular-nums group-hover:text-black",
                  tone && TONE[tone]
                )}
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

export default async function DashboardPage() {
  const stats = await getAdminOverview()

  return (
    <>
      <PageHeader crumbs={["Admin", "Overview"]} title="Overview" />

      <TileGrid
        label="Inventory"
        tiles={[
          {
            label: "References",
            value: stats.watches,
            href: "/dashboard/watches",
          },
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
          {
            label: "Sold out",
            value: stats.soldOut,
            tone: stats.soldOut > 0 ? "gold" : undefined,
          },
          { label: "Brands", value: stats.brands },
        ]}
      />

      <TileGrid
        label="Users"
        tiles={[
          {
            label: "Users",
            value: stats.users,
            href: "/dashboard/users",
          },
          {
            label: "Suspended",
            value: stats.suspended,
            href: "/dashboard/users?status=suspended",
            tone: stats.suspended > 0 ? "danger" : undefined,
          },
        ]}
      />
    </>
  )
}
