import type { NextRequest } from "next/server"

import { logger } from "../../../../../lib/pino"
import { getCatalogPage } from "../../watches/_data/catalog"
import { parseCatalogParams } from "../../watches/_utils/catalog-schema"

export async function GET(request: NextRequest) {
  const parsed = parseCatalogParams(request.nextUrl.searchParams)
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid filters." },
      { status: 400 }
    )
  }

  try {
    return Response.json(await getCatalogPage(parsed.data))
  } catch (error) {
    logger.error(error, "Error loading catalog page")
    return Response.json(
      { message: "The catalog couldn't be loaded." },
      { status: 503 }
    )
  }
}
