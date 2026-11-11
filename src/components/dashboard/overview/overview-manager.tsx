"use client"

import { useOverview } from "@/app/(dashboard)/dashboard/_hooks/overview-queries"
import { useOverviewRange } from "@/app/(dashboard)/dashboard/_hooks/use-overview-range"
import { cn } from "@/lib/utils"

import { AttentionPanel } from "./attention-panel"
import { CatalogStrip } from "./catalog-strip"
import { KpiTiles } from "./kpi-tiles"
import { OverviewHeader } from "./overview-header"
import { OverviewError, OverviewLoading } from "./overview-states"
import { RangePicker } from "./range-picker"
import { RecentActivity } from "./recent-activity"
import { RevenueChart } from "./revenue-chart"
import { TopSellers } from "./top-sellers"

/**
 * The admin overview. The server prefetches the chosen range into the
 * TanStack cache; switching range runs on the client.
 */
export function OverviewManager() {
  const { filters, setRange } = useOverviewRange()
  const query = useOverview(filters)
  const { data } = query

  const picker = <RangePicker value={filters.range} onChange={setRange} />

  if (!data) {
    return (
      <>
        <OverviewHeader actions={picker} />
        {query.isError ? (
          <OverviewError
            message={query.error?.message}
            retrying={query.isFetching}
            onRetry={() => void query.refetch()}
          />
        ) : (
          <OverviewLoading />
        )}
      </>
    )
  }

  return (
    <>
      <OverviewHeader actions={picker} />
      <div
        aria-busy={query.stale || undefined}
        className={cn(
          "transition-opacity",
          query.stale && "pointer-events-none opacity-50"
        )}
      >
        <KpiTiles overview={data} />
        <RevenueChart overview={data} />
        <div className="grid gap-10 py-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <AttentionPanel overview={data} />
          <TopSellers overview={data} />
        </div>
        <RecentActivity overview={data} />
        <CatalogStrip overview={data} />
      </div>
    </>
  )
}
