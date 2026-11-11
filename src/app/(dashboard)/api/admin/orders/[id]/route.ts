import type { NextRequest } from "next/server"

import { logger } from "../../../../../../../lib/pino"
import { getOrderDetail } from "../../../../dashboard/orders/_data/orders"
import { orderIdSchema } from "../../../../dashboard/orders/_utils/order-schema"
import { adminApiGuard } from "../../../../_server/require-admin"

/** GET /api/admin/orders/:id — everything the order drawer shows. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard()
  if (denied) return denied

  const parsed = orderIdSchema.safeParse(await params)
  if (!parsed.success) {
    return Response.json({ message: "Order not found." }, { status: 404 })
  }

  try {
    const detail = await getOrderDetail(parsed.data.id)
    if (!detail) {
      return Response.json(
        { message: "This order no longer exists." },
        { status: 404 }
      )
    }
    return Response.json(detail)
  } catch (error) {
    logger.error(error, "Error loading admin order")
    return Response.json(
      { message: "The order couldn't be loaded." },
      { status: 503 }
    )
  }
}
