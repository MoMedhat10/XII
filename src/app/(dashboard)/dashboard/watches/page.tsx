import type { Metadata } from "next"

import { WatchesManager } from "@/components/dashboard/watches/watches-manager"

import { watchFiltersSchema } from "../../_utils/watch-schema"
import { getAdminBrands } from "../../_data/brands"

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
  const brands = await getAdminBrands()  

  return (
    <WatchesManager
      initialWatches={[]}
      initialBrands={brands}
      initialFilters={filters}
    />
  )
}
