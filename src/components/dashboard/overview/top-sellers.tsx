import Image from "next/image"

import type {
  AdminOverview,
  OverviewSeller,
} from "@/app/(dashboard)/dashboard/_data/overview-types"
import { formatCents } from "@/lib/money"

import { sectionLabel } from "../styles"

const thumb =
  "relative size-10 shrink-0 border-2 border-surface-variant bg-[#141515]"

/** A ranked list; the gold bar shows each row's revenue against the leader's. */
function SellerList({
  title,
  sellers,
  empty,
}: {
  title: string
  sellers: OverviewSeller[]
  empty: string
}) {
  const leader = sellers[0]?.revenueCents ?? 0
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-heading text-sm font-bold tracking-[1.5px] uppercase">
        {title}
      </h3>
      {sellers.length === 0 ? (
        <p className="py-3 text-muted-foreground">{empty}</p>
      ) : (
        <ol className="flex flex-col">
          {sellers.map((s, i) => (
            <li
              key={s.key}
              className="flex flex-col gap-2 border-t-2 border-surface-variant py-3 first:border-t-0"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.brand !== null && (
                  <span className={thumb}>
                    {s.imageUrl && (
                      <Image
                        src={s.imageUrl}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    )}
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold">{s.name}</span>
                  <span className="truncate font-mono text-[11px] text-muted-foreground uppercase">
                    {s.brand ? `${s.brand} · ` : ""}
                    {s.units} {s.units === 1 ? "piece" : "pieces"}
                  </span>
                </span>
                <span className="shrink-0 font-heading font-bold tabular-nums">
                  {formatCents(s.revenueCents)}
                </span>
              </div>
              <span
                aria-hidden="true"
                className="ml-8 block h-1 bg-surface-variant"
              >
                <span
                  className="block h-full bg-gold"
                  style={{
                    width: `${leader ? (s.revenueCents / leader) * 100 : 0}%`,
                  }}
                />
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function TopSellers({ overview }: { overview: AdminOverview }) {
  const empty = `No sales in the last ${overview.days} days.`
  return (
    <section aria-labelledby="sellers-heading" className="flex flex-col gap-4">
      <h2 id="sellers-heading" className={sectionLabel}>
        Top sellers · last {overview.days} days, by revenue
      </h2>
      <div className="grid gap-8 sm:grid-cols-2">
        <SellerList
          title="Watches"
          sellers={overview.topWatches}
          empty={empty}
        />
        <SellerList title="Brands" sellers={overview.topBrands} empty={empty} />
      </div>

      <div className="flex flex-col gap-2 border-t-2 border-surface-variant pt-5">
        <h3 className="font-heading text-sm font-bold tracking-[1.5px] uppercase">
          Most wished for{" "}
          <span className="font-mono text-[11px] font-normal tracking-[1px] text-muted-foreground">
            · all time
          </span>
        </h3>
        {overview.mostWanted.length === 0 ? (
          <p className="py-3 text-muted-foreground">
            No watch has been saved yet.
          </p>
        ) : (
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {overview.mostWanted.map((w) => (
              <li
                key={w.id}
                className="flex items-center gap-3 border-t-2 border-surface-variant py-2.5 max-sm:first:border-t-0 sm:[&:nth-child(-n+2)]:border-t-0"
              >
                <span className={thumb}>
                  {w.imageUrl && (
                    <Image
                      src={w.imageUrl}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold">{w.name}</span>
                  <span className="truncate font-mono text-[11px] text-muted-foreground uppercase">
                    {w.brand}
                  </span>
                </span>
                <span className="shrink-0 text-right font-mono text-xs leading-5">
                  <span className="block">♥ {w.wishlists}</span>
                  <span className="block text-muted-foreground">
                    {w.inCarts} in {w.inCarts === 1 ? "cart" : "carts"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
