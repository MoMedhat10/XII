import { getCurrentUser } from "@/app/(auth)/_utils/session"

import { logger } from "../../../../../lib/pino"
import { getFavoriteWatchIds } from "../../watches/_data/catalog"
import type { FavoritesState } from "../../watches/_data/types"

export async function GET() {
  try {
    const user = await getCurrentUser()
    const body: FavoritesState = user
      ? { signedIn: true, watchIds: await getFavoriteWatchIds(user.id) }
      : { signedIn: false, watchIds: [] }
    return Response.json(body)
  } catch (error) {
    logger.error(error, "Error loading favorites")
    return Response.json(
      { message: "Your saved pieces couldn't be loaded." },
      { status: 503 }
    )
  }
}
