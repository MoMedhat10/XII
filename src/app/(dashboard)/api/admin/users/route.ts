import type { NextRequest } from "next/server"

import { logger } from "../../../../../../lib/pino"
import { getUserPage } from "../../../dashboard/users/_data/users"
import { userFiltersSchema } from "../../../dashboard/users/_utils/user-schema"
import { adminApiGuard } from "../../../_server/require-admin"

/** GET /api/admin/users?q&role&status&sort&page — one page of the users table. */
export async function GET(request: NextRequest) {
  const denied = await adminApiGuard()
  if (denied) return denied

  // the schema falls back to defaults for bad values, so this never fails
  const filters = userFiltersSchema.parse(
    Object.fromEntries(request.nextUrl.searchParams)
  )

  try {
    return Response.json(await getUserPage(filters))
  } catch (error) {
    logger.error(error, "Error loading admin users")
    return Response.json(
      { message: "The users couldn't be loaded." },
      { status: 503 }
    )
  }
}
