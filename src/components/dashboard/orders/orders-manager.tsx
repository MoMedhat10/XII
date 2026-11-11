"use client"

import { toServerError } from "@/app/(dashboard)/_utils/action-client"
import { useOrderActions } from "@/app/(dashboard)/dashboard/orders/_hooks/mutations"
import {
  useOrderDetail,
  useOrderPage,
} from "@/app/(dashboard)/dashboard/orders/_hooks/queries"
import { useOrderDrawer } from "@/app/(dashboard)/dashboard/orders/_hooks/use-order-drawer"
import { useOrderFilters } from "@/app/(dashboard)/dashboard/orders/_hooks/use-order-filters"
import { DEFAULT_ORDER_FILTERS } from "@/app/(dashboard)/dashboard/orders/_utils/order-schema"
import { cn } from "@/lib/utils"

import { AdminPagination } from "../admin-pagination"
import { OrderConfirmDialog } from "./order-confirm-dialog"
import { OrderDrawer } from "./order-drawer"
import { OrderShipDialog } from "./order-ship-dialog"
import { OrdersHeader } from "./orders-header"
import { OrdersError, OrdersLoading, OrdersNoResults } from "./orders-states"
import { OrdersTable } from "./orders-table"
import { OrdersToolbar } from "./orders-toolbar"

/**
 * The admin orders page. The server prefetches the first page into the
 * TanStack cache; filters, the drawer and every action run on the client.
 */
export function OrdersManager() {
  const filters = useOrderFilters()
  const page = useOrderPage(filters.filters, filters.goToPage)
  const drawer = useOrderDrawer()
  const detail = useOrderDetail(drawer.id)
  const actions = useOrderActions()

  const { data } = page

  if (!data) {
    return (
      <>
        <OrdersHeader summary={null} />
        {page.isError ? (
          <OrdersError
            message={page.error?.message}
            retrying={page.isFetching}
            onRetry={() => void page.refetch()}
          />
        ) : (
          <OrdersLoading />
        )}
      </>
    )
  }

  const order = detail.data?.order
  const { kind } = drawer.dialog
  const done = { onSuccess: drawer.closeDialog }
  const f = filters.filters
  const d = DEFAULT_ORDER_FILTERS
  const filtered = f.q !== d.q || f.status !== d.status || f.range !== d.range

  return (
    <>
      <OrdersHeader summary={data.summary} />

      {/* always shown: the filters must stay reachable even when nothing matches */}
      <OrdersToolbar
        filters={{ ...f, q: filters.search }}
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
          <OrdersNoResults filtered={filtered} onClear={filters.clearFilters} />
        ) : (
          <>
            <OrdersTable
              orders={data.orders}
              onOpen={(o) => drawer.openOrder(o.id)}
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

      <OrderDrawer
        open={drawer.open}
        detail={detail}
        actions={actions}
        onOpenChange={drawer.onOpenChange}
        onAsk={(next) => {
          // a failed attempt's field errors must not show on the next one
          if (next === "ship") actions.ship.reset()
          drawer.ask(next)
        }}
      />

      <OrderShipDialog
        open={drawer.dialog.open && kind === "ship"}
        orderRef={order?.ref}
        saving={actions.ship.isPending}
        serverError={toServerError(actions.ship.error)}
        onOpenChange={(open) => !open && drawer.closeDialog()}
        onSubmit={({ carrier, useOwnNumber, trackingNumber }) =>
          order &&
          actions.ship.mutate(
            {
              id: order.id,
              carrier,
              // left out: the server generates an XII shipment number
              trackingNumber: useOwnNumber ? trackingNumber : undefined,
            },
            done
          )
        }
      />

      <OrderConfirmDialog
        open={drawer.dialog.open && kind !== "ship"}
        kind={kind === "cancel" ? "cancel" : "deliver"}
        detail={detail.data}
        pending={
          kind === "cancel"
            ? actions.cancel.isPending
            : actions.deliver.isPending
        }
        onOpenChange={(open) => !open && drawer.closeDialog()}
        onConfirm={() => {
          if (!order) return
          if (kind === "cancel") actions.cancel.mutate(order.id, done)
          else actions.deliver.mutate(order.id, done)
        }}
      />
    </>
  )
}
