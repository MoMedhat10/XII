import type { OrdersPage } from "@/app/(app)/orders/_data/types"
import { STATUS_LABEL } from "@/app/(app)/orders/_utils/order-format"
import { ORDERS_PAGE_SIZE } from "@/app/(app)/orders/_utils/orders-schema"
import { cn } from "@/lib/utils"

import { gutter, monoCaption } from "../home/styles"
import { ShowMore } from "../show-more"
import { OrderRow } from "./order-row"
import { OrdersEmpty } from "./orders-empty"
import { OrdersHeader } from "./orders-header"
import { OrdersStatusFilter } from "./orders-status-filter"
import { OrdersTableHead } from "./orders-table-head"

export function OrdersView(page: OrdersPage) {
  if (!page.counts.ALL) return <OrdersEmpty />

  const total = page.status ? page.counts[page.status] : page.counts.ALL
  const statusQuery = page.status ? `&status=${page.status}` : ""

  return (
    <section className={cn(gutter, "pt-20 pb-40 sm:pt-28")}>
      <OrdersHeader
        count={page.counts.ALL}
        lifetimeCents={page.lifetimeCents}
      />
      <OrdersStatusFilter status={page.status} counts={page.counts} />

      {page.orders.length ? (
        <>
          <OrdersTableHead />
          {page.orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </>
      ) : (
        <p className={cn(monoCaption, "py-16 text-center uppercase")}>
          No {page.status && STATUS_LABEL[page.status].toLowerCase()} orders
        </p>
      )}

      {page.nextShow && (
        <ShowMore
          href={`?show=${page.nextShow}${statusQuery}`}
          shown={page.orders.length}
          total={total}
          nextCount={Math.min(ORDERS_PAGE_SIZE, total - page.orders.length)}
        />
      )}
    </section>
  )
}
