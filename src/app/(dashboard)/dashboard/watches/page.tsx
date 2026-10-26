import type { Metadata } from "next"

import { WatchesManager } from "@/components/dashboard/watches/watches-manager"

import { watchFiltersSchema } from "../../_utils/watch-schema"
import { getAdminBrands } from "../../_data/brands"
import { getAdminWatchPage } from "../../_data/watches"

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
  const [data, brands] = await Promise.all([
    getAdminWatchPage(filters),
    getAdminBrands(),
  ])

  return (
    <WatchesManager
      data={data}
      brands={brands}
      filters={{ ...filters, page: data.page }}
    />
  )
}
