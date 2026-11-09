import { z } from "zod"

import { ORDER_STATUSES } from "./order-format"

export const ORDERS_PAGE_SIZE = 10
/** Most orders one page render can ask for through `?show=`. */
export const ORDERS_MAX_SHOW = 100

// Same rules as the wishlist: bad values fall back to one page, others round
// up to a whole page and are capped.
export const showSchema = z.coerce
  .number()
  .int()
  .catch(ORDERS_PAGE_SIZE)
  .transform((n) => {
    const pages = Math.ceil(n / ORDERS_PAGE_SIZE)
    return Math.min(
      Math.max(pages * ORDERS_PAGE_SIZE, ORDERS_PAGE_SIZE),
      ORDERS_MAX_SHOW
    )
  })

/** `?status=` filter; anything unknown means "all". */
export const statusFilterSchema = z.enum(ORDER_STATUSES).nullable().catch(null)

export const orderIdSchema = z.uuid()

export const cancelOrderSchema = z.object({ orderId: orderIdSchema })
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>
