import type { Metadata } from "next"
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query"

import { WatchesManager } from "@/components/dashboard/watches/watches-manager"

import { getAdminBrands } from "./_data/brands"
import { getAdminWatchPage } from "./_data/watches"
import { requireAdmin } from "../../_server/require-admin"
import { adminKeys } from "./_utils/admin-keys"
import { watchFiltersSchema } from "./_utils/watch-schema"

export const metadata: Metadata = {
  title: "Watches — XII Admin",
}

/**
 * Prefetches the first screen on the server, under the same keys the client
 * queries use, so the page arrives with data and no loading state. After
 * that, the client cache owns it (see WatchesManager).
 */
export default async function AdminWatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // prefetchQuery swallows errors (the client just fetches again), so the
  // auth redirect has to happen out here
  await requireAdmin()
  const filters = watchFiltersSchema.parse(await searchParams)

  // one client per request: a shared one would leak data between users
  const queryClient = new QueryClient()
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: adminKeys.watchList(filters),
      queryFn: () => getAdminWatchPage(filters),
    }),
    queryClient.prefetchQuery({
      queryKey: adminKeys.brands(),
      queryFn: getAdminBrands,
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WatchesManager />
    </HydrationBoundary>
  )
}
