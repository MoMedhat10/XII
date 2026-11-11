import type { NextRequest } from "next/server"

import { logger } from "../../../../../../lib/pino"
import { getOrderPage } from "../../../dashboard/orders/_data/orders"
import { orderFiltersSchema } from "../../../dashboard/orders/_utils/order-schema"
import { adminApiGuard } from "../../../_server/require-admin"

/** GET /api/admin/orders?q&status&range&sort&page — one page of the orders table. */
export async function GET(request: NextRequest) {
  const denied = await adminApiGuard()
  if (denied) return denied

  // the schema falls back to defaults for bad values, so this never fails
  const filters = orderFiltersSchema.parse(
    Object.fromEntries(request.nextUrl.searchParams)
  )

  try {
    return Response.json(await getOrderPage(filters))
  } catch (error) {
    logger.error(error, "Error loading admin orders")
    return Response.json(
      { message: "The orders couldn't be loaded." },
      { status: 503 }
    )
  }
}
