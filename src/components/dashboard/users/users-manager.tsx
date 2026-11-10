"use client"

import { useUserActions } from "@/app/(dashboard)/dashboard/users/_hooks/mutations"
import {
  useUserDetail,
  useUserPage,
} from "@/app/(dashboard)/dashboard/users/_hooks/queries"
import { useUserDrawer } from "@/app/(dashboard)/dashboard/users/_hooks/use-user-drawer"
import { useUserFilters } from "@/app/(dashboard)/dashboard/users/_hooks/use-user-filters"
import { cn } from "@/lib/utils"

import { AdminPagination } from "../admin-pagination"
import { UserConfirmDialog } from "./user-confirm-dialog"
import { UserDrawer } from "./user-drawer"
import { UsersHeader } from "./users-header"
import { UsersError, UsersLoading, UsersNoResults } from "./users-states"
import { UsersTable } from "./users-table"
import { UsersToolbar } from "./users-toolbar"

/**
 * The admin users page. The server prefetches the first page into the
 * TanStack cache; filters, the drawer and every action run on the client.
 */
export function UsersManager() {
  const filters = useUserFilters()
  const page = useUserPage(filters.filters, filters.goToPage)
  const drawer = useUserDrawer()
  const detail = useUserDetail(drawer.id)
  const actions = useUserActions({ onDeleted: drawer.forget })

  const { data } = page

  if (!data) {
    return (
      <>
        <UsersHeader summary={null} />
        {page.isError ? (
          <UsersError
            message={page.error?.message}
            retrying={page.isFetching}
            onRetry={() => void page.refetch()}
          />
        ) : (
          <UsersLoading />
        )}
      </>
    )
  }

  const user = detail.data?.user
  const confirmPending = {
    "sign-out": actions.signOut.isPending,
    suspend: actions.suspend.isPending,
    delete: actions.remove.isPending,
  }[drawer.confirm.kind]

  const confirm = () => {
    if (!user) return
    const target = { id: user.id, username: user.username }
    const done = { onSuccess: drawer.closeConfirm }
    if (drawer.confirm.kind === "sign-out") actions.signOut.mutate(target, done)
    else if (drawer.confirm.kind === "suspend")
      actions.suspend.mutate({ ...target, suspended: true }, done)
    // a successful delete closes the drawer and dialog itself (onDeleted)
    else actions.remove.mutate(target)
  }

  return (
    <>
      <UsersHeader summary={data.summary} />

      {/* always shown: the filters must stay reachable even when nothing matches */}
      <UsersToolbar
        filters={{ ...filters.filters, q: filters.search }}
        onChange={(patch) =>
          patch.q !== undefined
            ? filters.changeSearch(patch.q)
            : filters.updateFilters(patch)
        }
        onClear={filters.clearFilters}
      />
      <div
        aria-busy={page.stale || undefined}
        className={cn(
          "transition-opacity",
          page.stale && "pointer-events-none opacity-50"
        )}
      >
        {data.total === 0 ? (
          <UsersNoResults onClear={filters.clearFilters} />
        ) : (
          <>
            <UsersTable
              users={data.users}
              viewerId={data.viewerId}
              onOpen={(c) => drawer.openUser(c.id)}
            />
            <AdminPagination
              page={data.page}
              pageCount={data.pageCount}
              total={data.total}
              pageSize={data.pageSize}
              onPageChange={filters.goToPage}
            />
          </>
        )}
      </div>

      <UserDrawer
        open={drawer.open}
        detail={detail}
        viewerId={data.viewerId}
        actions={actions}
        onOpenChange={drawer.onOpenChange}
        onAsk={drawer.ask}
      />

      <UserConfirmDialog
        open={drawer.confirm.open}
        kind={drawer.confirm.kind}
        detail={detail.data}
        pending={confirmPending}
        onOpenChange={(open) => !open && drawer.closeConfirm()}
        onConfirm={confirm}
      />
    </>
  )
}
