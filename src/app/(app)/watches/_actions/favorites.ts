"use server"

import { getCurrentUser } from "@/app/(auth)/_utils/session"

import prisma from "../../../../../lib/prisma"
import { logger } from "../../../../../lib/pino"
import { favoriteSchema, type FavoriteInput } from "../_utils/catalog-schema"

type FavoriteRes =
  | { success: true; message: string; data: FavoriteInput }
  | { success: false; message: string }

/** Saves or unsaves a watch for the current user. Idempotent both ways. */
export async function setFavorite(input: FavoriteInput): Promise<FavoriteRes> {
  const parsed = favoriteSchema.safeParse(input)
  if (!parsed.success) return { success: false, message: "Invalid request." }
  const { watchId, saved } = parsed.data

  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, message: "Sign in to save pieces." }
    }

    if (saved) {
      const watch = await prisma.watch.findFirst({
        where: { id: watchId, isActive: true },
        select: { id: true },
      })

      if (!watch) {
        return { success: false, message: "This piece is no longer available." }
      }

      await prisma.favoriteWatch.upsert({
        where: { userId_watchId: { userId: user.id, watchId } },
        create: { userId: user.id, watchId },
        update: {},
      })
      
    } else {
      await prisma.favoriteWatch.deleteMany({
        where: { userId: user.id, watchId },
      })
    }

    return {
      success: true,
      message: saved ? "Saved to your vitrine" : "Removed from your vitrine",
      data: { watchId, saved },
    }
  } catch (error) {
    logger.error(error, "Error updating favorite")
    return { success: false, message: "Couldn't update your saved pieces." }
  }
}
