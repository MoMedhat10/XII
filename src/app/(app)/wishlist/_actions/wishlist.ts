"use server"

import { refresh } from "next/cache"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

import prisma from "../../../../../lib/prisma"
import { logger } from "../../../../../lib/pino"
import {
  removeFavoritesSchema,
  type RemoveFavoritesInput,
} from "../_utils/wishlist-schema"

type RemoveFavoritesRes =
  | { success: true; message: string; data: { removed: number } }
  | { success: false; message: string }

/** Unsaves watches for the current user, then re-renders the wishlist. */
export async function removeFavorites(
  input: RemoveFavoritesInput
): Promise<RemoveFavoritesRes> {
  const parsed = removeFavoritesSchema.safeParse(input)
  if (!parsed.success) return { success: false, message: "Invalid request." }
  const { watchIds } = parsed.data

  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, message: "Sign in to manage pieces." }

    // deleteMany is idempotent: a piece already removed in another tab is fine
    await prisma.favoriteWatch.deleteMany({
      where: { userId: user.id, watchId: { in: watchIds } },
    })

    refresh()
    return {
      success: true,
      message:
        watchIds.length === 1
          ? "Removed from your collection"
          : `Removed ${watchIds.length} pieces from your collection`,
      data: { removed: watchIds.length },
    }
  } catch (error) {
    logger.error(error, "Error removing favorites")
    return { success: false, message: "Couldn't update your saved pieces." }
  }
}
