"use server"

import { revalidatePath } from "next/cache"
import prisma from "../../../../lib/prisma"
import { requireAdmin } from "../_server/require-admin"
import {
  ActionError,
  HAS_ORDERS,
  PATH,
  WATCH_GONE,
  actionFail,
  lockWatch,
  removeObjects,
} from "../_server/watch-tx"
import { fail, type ActionRes } from "../_utils/action-result"
import {
  createWatchSchema,
  deleteWatchSchema,
  parsePriceInput,
  setWatchActiveSchema,
  updateWatchSchema,
  type CreateWatchInput,
  type DeleteWatchInput,
  type SetWatchActiveInput,
  type UpdateWatchInput,
} from "../_utils/watch-schema"
import { toAdminWatch, watchSelect } from "../_data/watches"
import type { AdminWatch } from "../_data/types"

export async function createWatch(
  input: CreateWatchInput
): Promise<ActionRes<AdminWatch>> {
  await requireAdmin()
  const parsed = createWatchSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { price, ...fields } = parsed.data

  try {
    const watch = await prisma.watch.create({
      // isActive left to the DB default (false): publishing is a separate step
      data: { ...fields, priceCents: parsePriceInput(price) * 100 },
      select: watchSelect,
    })
    revalidatePath(PATH)
    return {
      success: true,
      message: "Draft created",
      data: toAdminWatch(watch),
    }
  } catch (error) {
    return actionFail(error, "createWatch", {
      P2003: "This brand no longer exists.",
    })
  }
}

/**
 * Saves the drawer's fields. Fails if someone else saved the watch since it
 * was opened, rather than silently overwriting their changes.
 */
export async function updateWatch(
  input: UpdateWatchInput
): Promise<ActionRes<AdminWatch>> {
  await requireAdmin()
  const parsed = updateWatchSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { id, updatedAt, price, ...fields } = parsed.data

  try {
    const watch = await prisma.$transaction(async (tx) => {
      if (!(await lockWatch(tx, id))) throw new ActionError(WATCH_GONE)
      const current = await tx.watch.findUniqueOrThrow({
        where: { id },
        select: { name: true, updatedAt: true },
      })
      if (current.updatedAt.getTime() !== new Date(updatedAt).getTime()) {
        throw new ActionError(
          "Someone else changed this watch. Close and reopen it to see the latest."
        )
      }

      await tx.watch.update({
        where: { id },
        data: { ...fields, priceCents: parsePriceInput(price) * 100 },
      })

      if (current.name !== fields.name) {
        const images = await tx.watchImage.findMany({
          where: { watchId: id },
          select: { id: true },
          orderBy: { sortOrder: "asc" },
        })
        for (const [i, image] of images.entries()) {
          await tx.watchImage.update({
            where: { id: image.id },
            data: { alt: `${fields.name}, view ${i + 1}` },
          })
        }
      }

      return tx.watch.findUniqueOrThrow({ where: { id }, select: watchSelect })
    })
    revalidatePath(PATH)
    return { success: true, message: "Saved", data: toAdminWatch(watch) }
  } catch (error) {
    return actionFail(error, "updateWatch", {
      P2003: "This brand no longer exists.",
    })
  }
}

/** Publishing needs at least one image; unpublishing always works. */
export async function setWatchActive(
  input: SetWatchActiveInput
): Promise<ActionRes<{ isActive: boolean }>> {
  await requireAdmin()
  const parsed = setWatchActiveSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { id, isActive } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      if (!(await lockWatch(tx, id))) throw new ActionError(WATCH_GONE)
      if (
        isActive &&
        (await tx.watchImage.count({ where: { watchId: id } })) === 0
      ) {
        throw new ActionError("Add at least one image before publishing.")
      }
      await tx.watch.update({ where: { id }, data: { isActive } })
    })
    revalidatePath(PATH)
    return {
      success: true,
      message: isActive ? "Live" : "Hidden",
      data: { isActive },
    }
  } catch (error) {
    return actionFail(error, "setWatchActive")
  }
}

export async function deleteWatch(
  input: DeleteWatchInput
): Promise<ActionRes<{ id: string; brandId: string }>> {
  await requireAdmin()
  const parsed = deleteWatchSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { id } = parsed.data

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      if (!(await lockWatch(tx, id))) throw new ActionError(WATCH_GONE)
      const watch = await tx.watch.findUniqueOrThrow({
        where: { id },
        select: {
          brandId: true,
          images: { select: { key: true } },
          _count: { select: { orderItems: true } },
        },
      })
      // OrderItem → Watch has no cascade: sold watches stay for order history
      if (watch._count.orderItems > 0) throw new ActionError(HAS_ORDERS)
      await tx.watch.delete({ where: { id } }) // images, favorites, cart items cascade
      return watch
    })

    // the rows are gone, so the files are unreferenced and safe to delete
    await removeObjects(deleted.images.map((image) => image.key))
    revalidatePath(PATH)
    return {
      success: true,
      message: "Deleted",
      data: { id, brandId: deleted.brandId },
    }
  } catch (error) {
    return actionFail(error, "deleteWatch", { P2003: HAS_ORDERS })
  }
}
