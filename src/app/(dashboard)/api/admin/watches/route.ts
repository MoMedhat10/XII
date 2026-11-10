import type { NextRequest } from "next/server"

import { logger } from "../../../../../../lib/pino"
import { getAdminWatchPage } from "../../../dashboard/watches/_data/watches"
import { adminApiGuard } from "../../../_server/require-admin"
import { watchFiltersSchema } from "../../../dashboard/watches/_utils/watch-schema"

/** GET /api/admin/watches?q&brand&status&page — one page of the admin table. */
export async function GET(request: NextRequest) {
  const denied = await adminApiGuard()
  if (denied) return denied

  // the schema falls back to defaults for bad values, so this never fails
  const filters = watchFiltersSchema.parse(
    Object.fromEntries(request.nextUrl.searchParams)
  )

  try {
    return Response.json(await getAdminWatchPage(filters))
  } catch (error) {
    logger.error(error, "Error loading admin watches")
    return Response.json(
      { message: "The watches couldn't be loaded." },
      { status: 503 }
    )
  }
}
