import { z } from "zod"

import { ORDER_STATUSES } from "@/app/(app)/orders/_utils/order-format"

export const ORDER_STATUS_FILTERS = ["all", ...ORDER_STATUSES] as const
export const ORDER_RANGES = ["all", "7d", "30d", "90d"] as const
export const ORDER_SORTS = [
  "newest",
  "oldest",
  "total-high",
  "total-low",
] as const

export type OrderStatusFilter = (typeof ORDER_STATUS_FILTERS)[number]
export type OrderRange = (typeof ORDER_RANGES)[number]
export type OrderSort = (typeof ORDER_SORTS)[number]

export const ORDERS_PAGE_SIZE = 10

/** Every field falls back to its default, so any URL parses. */
export const orderFiltersSchema = z.object({
  q: z.string().trim().max(100).catch(""),
  status: z.enum(ORDER_STATUS_FILTERS).catch("all"),
  range: z.enum(ORDER_RANGES).catch("all"),
  sort: z.enum(ORDER_SORTS).catch("newest"),
  page: z.coerce.number().int().min(1).catch(1),
})

export type OrderFilters = z.infer<typeof orderFiltersSchema>

export const DEFAULT_ORDER_FILTERS: OrderFilters = {
  q: "",
  status: "all",
  range: "all",
  sort: "newest",
  page: 1,
}

export const orderIdSchema = z.object({ id: z.uuid() })

const carrierField = z
  .string()
  .trim()
  .min(1, "Enter the carrier.")
  .max(60, "Keep it under 60 characters.")

/** A number the admin typed in (e.g. a real carrier's), instead of a generated one. */
const ownTrackingNumber = z
  .string()
  .trim()
  .min(4, "Enter at least 4 characters.")
  .max(40, "Keep it under 40 characters.")
  .regex(/^[A-Za-z0-9 -]+$/, "Use letters, digits, spaces or dashes.")

export const shipOrderSchema = z.object({
  id: z.uuid(),
  carrier: carrierField,
  /** left out (or blank): the server generates an XII shipment number */
  trackingNumber: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    ownTrackingNumber.optional()
  ),
})

/**
 * The ship form. The order id comes from the drawer, and the tracking number
 * is only checked when the admin chose to type their own.
 */
export const shipFormSchema = z
  .object({
    carrier: carrierField,
    useOwnNumber: z.boolean(),
    trackingNumber: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.useOwnNumber) return
    const result = ownTrackingNumber.safeParse(values.trackingNumber)
    for (const issue of result.error?.issues ?? []) {
      ctx.addIssue({
        code: "custom",
        path: ["trackingNumber"],
        message: issue.message,
      })
    }
  })

export type OrderIdInput = z.infer<typeof orderIdSchema>
export type ShipOrderInput = z.infer<typeof shipOrderSchema>
export type ShipFormValues = z.infer<typeof shipFormSchema>
