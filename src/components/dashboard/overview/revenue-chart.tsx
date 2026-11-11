"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import type { AdminOverview } from "@/app/(dashboard)/dashboard/_data/overview-types"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import { sectionLabel } from "../styles"
import {
  formatCompactCents,
  formatLongDay,
  formatShortDay,
} from "./overview-format"

// One series, so no legend: the heading names it. Gold is the one accent.
const config = {
  revenueCents: { label: "Revenue", color: "var(--gold)" },
} satisfies ChartConfig

/** Every 7th or 14th day on longer ranges, so the labels never collide. */
const TICK_INTERVAL: Record<number, number> = { 7: 0, 30: 6, 90: 13 }

type Day = AdminOverview["daily"][number]

export function RevenueChart({ overview }: { overview: AdminOverview }) {
  const [asTable, setAsTable] = useState(false)
  const { daily, days } = overview
  const total = daily.reduce((n, d) => n + d.revenueCents, 0)
  const peak = daily.reduce(
    (best, d, i) => (d.revenueCents > daily[best].revenueCents ? i : best),
    0
  )

  return (
    <section
      aria-labelledby="revenue-heading"
      className="flex flex-col gap-4 border-b-2 border-surface-variant py-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="revenue-heading" className={sectionLabel}>
          Revenue per day · last {days} days
        </h2>
        {total > 0 && (
          <button
            type="button"
            onClick={() => setAsTable((t) => !t)}
            aria-pressed={asTable}
            className="border-b-2 border-surface-variant pb-0.5 font-heading text-xs font-bold tracking-[1.5px] text-muted-foreground uppercase transition-colors hover:border-gold hover:text-gold"
          >
            {asTable ? "Show chart" : "Show as table"}
          </button>
        )}
      </div>

      {total === 0 ? (
        <div className="flex h-[280px] flex-col items-center justify-center gap-2 border-2 border-surface-variant text-center">
          <span className="font-mono text-xs tracking-[1px] text-gold">$0</span>
          <p className="font-heading text-2xl font-bold">
            No sales in the last {days} days.
          </p>
        </div>
      ) : asTable ? (
        <DailyTable daily={daily} />
      ) : (
        <ChartContainer
          config={config}
          className="aspect-auto h-[280px] w-full"
          aria-label={`Revenue per day for the last ${days} days, ${formatCents(total)} in total. Peak ${formatCents(daily[peak].revenueCents)} on ${formatLongDay(daily[peak].date)}.`}
        >
          <BarChart
            data={daily}
            margin={{ top: 24, right: 0, bottom: 0, left: 0 }}
            barCategoryGap={2}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} stroke="var(--surface-variant)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: "var(--surface-variant)", strokeWidth: 2 }}
              tickMargin={8}
              interval={TICK_INTERVAL[days] ?? "preserveStartEnd"}
              tickFormatter={formatShortDay}
            />
            <YAxis
              width={56}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCompactCents}
            />
            <ChartTooltip
              cursor={{ fill: "var(--surface-variant)", opacity: 0.35 }}
              content={({ active, payload }) => {
                const day = payload?.[0]?.payload as Day | undefined
                return active && day ? <DayTooltip day={day} /> : null
              }}
            />
            <Bar
              dataKey="revenueCents"
              fill="var(--color-revenueCents)"
              radius={0}
              maxBarSize={48}
            >
              {/* one direct label, on the best day only */}
              <LabelList
                dataKey="revenueCents"
                content={({ index, x, y, width, value }) =>
                  index === peak ? (
                    <text
                      x={Number(x) + Number(width) / 2}
                      y={Number(y) - 8}
                      textAnchor="middle"
                      className="fill-foreground font-mono text-[11px] font-semibold"
                    >
                      {formatCompactCents(Number(value))}
                    </text>
                  ) : null
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </section>
  )
}

function DayTooltip({ day }: { day: Day }) {
  return (
    <div className="grid min-w-40 gap-1 border-2 border-foreground bg-background px-3 py-2 text-xs">
      <span className="font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase">
        {formatLongDay(day.date)}
      </span>
      <span className="flex justify-between gap-4">
        <span className="text-muted-foreground">Revenue</span>
        <span className="font-mono font-semibold tabular-nums">
          {formatCents(day.revenueCents)}
        </span>
      </span>
      <span className="flex justify-between gap-4">
        <span className="text-muted-foreground">Orders</span>
        <span className="font-mono font-semibold tabular-nums">
          {day.orders}
        </span>
      </span>
    </div>
  )
}

/** The same numbers as the chart, exactly, for screen readers and copying. */
function DailyTable({ daily }: { daily: Day[] }) {
  return (
    <div className="max-h-[280px] overflow-y-auto border-2 border-surface-variant">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-background">
          <tr className="border-b-2 border-surface-variant font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase">
            <th scope="col" className="px-3 py-2 font-normal">
              Day
            </th>
            <th scope="col" className="px-3 py-2 text-right font-normal">
              Orders
            </th>
            <th scope="col" className="px-3 py-2 text-right font-normal">
              Revenue
            </th>
          </tr>
        </thead>
        <tbody>
          {[...daily].reverse().map((d) => (
            <tr
              key={d.date}
              className={cn(
                "border-b border-surface-variant last:border-b-0",
                d.orders === 0 && "text-muted-foreground"
              )}
            >
              <th scope="row" className="px-3 py-1.5 font-mono font-normal">
                {formatLongDay(d.date)}
              </th>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                {d.orders}
              </td>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                {formatCents(d.revenueCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
