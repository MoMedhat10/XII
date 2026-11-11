import type { Metadata } from "next"
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query"

import { OverviewManager } from "@/components/dashboard/overview/overview-manager"

import { requireAdmin } from "../_server/require-admin"
import { getOverview } from "./_data/overview"
import { overviewKeys } from "./_utils/overview-keys"
import { overviewFiltersSchema } from "./_utils/overview-schema"

export const metadata: Metadata = {
  title: "Overview — XII Admin",
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireAdmin()
  const filters = overviewFiltersSchema.parse(await searchParams)

  // one client per request: a shared one would leak data between users
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: overviewKeys.detail(filters),
    queryFn: () => getOverview(filters),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OverviewManager />
    </HydrationBoundary>
  )
}
