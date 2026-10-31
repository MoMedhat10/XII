import { logger } from "../../../../../../lib/pino"
import { getCatalogFacets } from "../../../watches/_data/catalog"

export async function GET() {
  try {
    return Response.json(await getCatalogFacets())
  } catch (error) {
    logger.error(error, "Error loading catalog facets")
    return Response.json(
      { message: "The catalog filters couldn't be loaded." },
      { status: 503 }
    )
  }
}
