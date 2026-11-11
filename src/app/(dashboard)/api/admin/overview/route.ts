import type { NextRequest } from "next/server"

import { logger } from "../../../../../../lib/pino"
import { getOverview } from "../../../dashboard/_data/overview"
import { overviewFiltersSchema } from "../../../dashboard/_utils/overview-schema"
import { adminApiGuard } from "../../../_server/require-admin"

/** GET /api/admin/overview?range — everything the overview page shows. */
export async function GET(request: NextRequest) {
  const denied = await adminApiGuard()
  if (denied) return denied

  // the schema falls back to defaults for bad values, so this never fails
  const filters = overviewFiltersSchema.parse(
    Object.fromEntries(request.nextUrl.searchParams)
  )

  try {
    return Response.json(await getOverview(filters))
  } catch (error) {
    logger.error(error, "Error loading admin overview")
    return Response.json(
      { message: "The overview couldn't be loaded." },
      { status: 503 }
    )
  }
}
