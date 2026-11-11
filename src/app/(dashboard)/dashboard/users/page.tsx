import type { Metadata } from "next"
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query"

import { UsersManager } from "@/components/dashboard/users/users-manager"

import { requireAdmin } from "../../_server/require-admin"
import { getUserPage } from "./_data/users"
import { userFiltersSchema } from "./_utils/user-schema"
import { userKeys } from "./_utils/keys"

export const metadata: Metadata = {
  title: "Users — XII Admin",
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireAdmin()
  const filters = userFiltersSchema.parse(await searchParams)

  // one client per request: a shared one would leak data between users
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => getUserPage(filters),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersManager />
    </HydrationBoundary>
  )
}
