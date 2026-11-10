import { logger } from "../../../../../../lib/pino"
import { getAdminBrands } from "../../../dashboard/watches/_data/brands"
import { adminApiGuard } from "../../../_server/require-admin"

/** GET /api/admin/brands — every brand, with its watch count. */
export async function GET() {
  const denied = await adminApiGuard()
  if (denied) return denied

  try {
    return Response.json(await getAdminBrands())
  } catch (error) {
    logger.error(error, "Error loading admin brands")
    return Response.json(
      { message: "The brands couldn't be loaded." },
      { status: 503 }
    )
  }
}
