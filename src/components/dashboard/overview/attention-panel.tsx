import Link from "next/link"

import type { AdminOverview } from "@/app/(dashboard)/dashboard/_data/overview-types"
import { cn } from "@/lib/utils"

import { pad, sectionLabel } from "../styles"

type Tone = "gold" | "danger" | "muted"

const TONE: Record<Tone, string> = {
  gold: "text-gold",
  danger: "text-danger",
  muted: "text-foreground",
}

/** Each row: a count, what it means, and where to go to deal with it. */
function Row({
  count,
  tone,
  tag,
  title,
  href,
  children,
}: {
  count: number
  tone: Tone
  /** a word that says what kind of problem it is, so it's never colour alone */
  tag: string
  title: string
  href: string
  children?: React.ReactNode
}) {
  return (
    <li className="border-t-2 border-surface-variant first:border-t-0">
      <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 py-4">
        <span
          className={cn(
            "font-heading text-4xl leading-none font-bold tabular-nums",
            TONE[tone]
          )}
        >
          {pad(count)}
        </span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase">
            {tag}
          </span>
          <Link
            href={href}
            className="self-start font-semibold transition-colors hover:text-gold"
          >
            {title} →
          </Link>
          {children}
        </div>
      </div>
    </li>
  )
}

const watchLink =
  "truncate font-mono text-xs text-muted-foreground transition-colors hover:text-gold"

export function AttentionPanel({ overview }: { overview: AdminOverview }) {
  const a = overview.attention
  const waited = a.oldestWaitingDays
  const clear =
    a.toShip === 0 &&
    a.soldOut.count === 0 &&
    a.lowStock.length === 0 &&
    a.unverified === 0

  return (
    <section
      aria-labelledby="attention-heading"
      className="flex flex-col gap-2"
    >
      <h2 id="attention-heading" className={sectionLabel}>
        Needs attention · right now
      </h2>
      {clear ? (
        <p className="border-2 border-surface-variant px-4 py-8 text-center font-heading text-xl font-bold">
          Nothing needs you right now.
        </p>
      ) : (
        <ul className="flex flex-col">
          {a.toShip > 0 && (
            <Row
              count={a.toShip}
              tone="gold"
              tag="Fulfilment"
              title={`${a.toShip === 1 ? "Order" : "Orders"} to ship`}
              href="/dashboard/orders?status=PAID&sort=oldest"
            >
              {waited !== null && (
                <span className="font-mono text-xs text-muted-foreground">
                  Oldest waiting{" "}
                  {waited === 0
                    ? "since today"
                    : `${waited} ${waited === 1 ? "day" : "days"}`}
                </span>
              )}
            </Row>
          )}
          {a.soldOut.count > 0 && (
            <Row
              count={a.soldOut.count}
              tone="danger"
              tag="Sold out · live"
              title={`Live ${a.soldOut.count === 1 ? "watch" : "watches"} with no stock`}
              href="/dashboard/watches?status=live"
            >
              {a.soldOut.watches.map((w) => (
                <Link
                  key={w.id}
                  href={`/dashboard/watches?q=${encodeURIComponent(w.name)}`}
                  className={watchLink}
                >
                  {w.brand} · {w.name}
                </Link>
              ))}
            </Row>
          )}
          {a.lowStock.length > 0 && (
            <Row
              count={a.lowStock.length}
              tone="gold"
              tag="Low stock"
              title="Almost sold out"
              href="/dashboard/watches?status=live"
            >
              {a.lowStock.map((w) => (
                <Link
                  key={w.id}
                  href={`/dashboard/watches?q=${encodeURIComponent(w.name)}`}
                  className={watchLink}
                >
                  {w.brand} · {w.name} — {w.stock} left
                </Link>
              ))}
            </Row>
          )}
          {a.unverified > 0 && (
            <Row
              count={a.unverified}
              tone="muted"
              tag="Accounts"
              title={`${a.unverified === 1 ? "Customer hasn't" : "Customers haven't"} verified their email`}
              href="/dashboard/users?status=unverified"
            >
              <span className="font-mono text-xs text-muted-foreground">
                Signed up over a day ago. They can&apos;t sign in until they do.
              </span>
            </Row>
          )}
        </ul>
      )}
    </section>
  )
}
