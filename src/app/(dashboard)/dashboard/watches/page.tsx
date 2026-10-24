import type { Metadata } from "next"

import { WatchesManager } from "@/components/dashboard/watches/watches-manager"

import { MOCK_BRANDS, MOCK_WATCHES, wait } from "../../_data/mock-watches"
import { watchFiltersSchema } from "../../_utils/watch-schema"

export const metadata: Metadata = {
  title: "Watches — XII Admin",
}

export default async function AdminWatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const filters = watchFiltersSchema.parse(params)

  // Simulation only: a slow fetch so loading.tsx shows, plus
  // ?simulate=error | empty | no-brands to preview those states.
  await wait(1200)
  const scenario = params.simulate
  if (scenario === "error") {
    throw new Error("Simulated failure while loading watches")
  }
  const empty = scenario === "empty" || scenario === "no-brands"

  return (
    <WatchesManager
      initialWatches={empty ? [] : MOCK_WATCHES}
      initialBrands={scenario === "no-brands" ? [] : MOCK_BRANDS}
      initialFilters={filters}
    />
  )
}
