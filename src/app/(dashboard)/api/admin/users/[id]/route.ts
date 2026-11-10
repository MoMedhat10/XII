import type { NextRequest } from "next/server"

import { logger } from "../../../../../../../lib/pino"
import { getUserDetail } from "../../../../dashboard/users/_data/users"
import { userIdSchema } from "../../../../dashboard/users/_utils/user-schema"
import { adminApiGuard } from "../../../../_server/require-admin"

/** GET /api/admin/users/:id — everything the user drawer shows. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard()
  if (denied) return denied

  const parsed = userIdSchema.safeParse(await params)
  if (!parsed.success) {
    return Response.json({ message: "User not found." }, { status: 404 })
  }

  try {
    const detail = await getUserDetail(parsed.data.id)
    if (!detail) {
      return Response.json(
        { message: "This user no longer exists." },
        { status: 404 }
      )
    }
    return Response.json(detail)
  } catch (error) {
    logger.error(error, "Error loading admin user")
    return Response.json(
      { message: "The user couldn't be loaded." },
      { status: 503 }
    )
  }
}
