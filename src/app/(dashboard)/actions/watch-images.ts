"use server"

import { revalidatePath } from "next/cache"
import prisma from "../../../../lib/prisma"
import { requireAdmin } from "../_server/require-admin"
import {
  ActionError,
  IMAGES_CHANGED,
  PATH,
  WATCH_GONE,
  actionFail,
  lockWatch,
  promoteImages,
  removeObjects,
} from "../_server/watch-tx"
import { fail, type ActionRes } from "../_utils/action-result"
import { createPresignedPut } from "../../../../lib/storage"
import { MAX_WATCH_IMAGES, WATCH_IMAGE_EXT } from "../_utils/upload-rules"
import {
  addWatchImagesSchema,
  deleteWatchImageSchema,
  reorderWatchImagesSchema,
  watchImageUploadSchema,
  type AddWatchImagesInput,
  type DeleteWatchImageInput,
  type ReorderWatchImagesInput,
} from "../_utils/watch-schema"
import { getAdminWatchImages } from "../_data/watches"
import type { AdminWatchImage } from "../_data/types"

export async function createWatchImageUpload(input: {
  contentType: string
  size: number
}): Promise<ActionRes<{ key: string; url: string }>> {
  await requireAdmin()
  const parsed = watchImageUploadSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)

  const key = `tmp/watches/${crypto.randomUUID()}.${WATCH_IMAGE_EXT[parsed.data.contentType]}`
  const url = await createPresignedPut(key, parsed.data.contentType)
  return { success: true, message: "OK", data: { key, url } }
}

export async function addWatchImages(
  input: AddWatchImagesInput
): Promise<ActionRes<AdminWatchImage[]>> {
  await requireAdmin()
  const parsed = addWatchImagesSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { watchId, imageKeys } = parsed.data

  const watch = await prisma.watch.findUnique({
    where: { id: watchId },
    select: { name: true },
  })
  if (!watch) {
    await removeObjects(imageKeys)
    return fail(WATCH_GONE)
  }

  const images = await promoteImages(watchId, imageKeys)
  if (!images) return fail("An image upload is missing or isn't a valid image.")

  try {
    await prisma.$transaction(async (tx) => {
      if (!(await lockWatch(tx, watchId))) throw new ActionError(WATCH_GONE)
      const current = await tx.watchImage.aggregate({
        where: { watchId },
        _count: true,
        _max: { sortOrder: true },
      })
      const room = MAX_WATCH_IMAGES - current._count
      if (images.length > room) {
        throw new ActionError(
          room > 0
            ? `Only ${room} more image${room === 1 ? "" : "s"} can be added.`
            : `This watch already has ${MAX_WATCH_IMAGES} images.`
        )
      }
      const start = (current._max.sortOrder ?? -1) + 1
      await tx.watchImage.createMany({
        data: images.map((image, i) => ({
          watchId,
          key: image.key,
          alt: `${watch.name}, view ${current._count + i + 1}`,
          sizeBytes: image.sizeBytes,
          contentType: image.contentType,
          sortOrder: start + i,
        })),
      })
    })
  } catch (error) {
    await removeObjects(images.map((image) => image.key)) // don't leave files behind if the rows failed
    return actionFail(error, "addWatchImages")
  }

  // committed: from here on the files belong to saved rows, so never delete them
  revalidatePath(PATH)
  const count = images.length
  try {
    return {
      success: true,
      message: `${count} image${count === 1 ? "" : "s"} added`,
      data: await getAdminWatchImages(watchId),
    }
  } catch (error) {
    return actionFail(error, "addWatchImages (reload)")
  }
}

/**
 * Deletes one image. Deleting the last image of a live watch also
 * unpublishes it, so a published watch always has a photo.
 */
export async function deleteWatchImage(
  input: DeleteWatchImageInput
): Promise<
  ActionRes<{ imageId: string; isActive: boolean; unpublished: boolean }>
> {
  await requireAdmin()
  const parsed = deleteWatchImageSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { id } = parsed.data

  const image = await prisma.watchImage.findUnique({
    where: { id },
    select: { watchId: true },
  })
  if (!image) return fail("This image no longer exists.")

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (!(await lockWatch(tx, image.watchId)))
        throw new ActionError(WATCH_GONE)
      // re-read under the lock: it may have been deleted meanwhile
      const row = await tx.watchImage.findUnique({
        where: { id },
        select: { key: true },
      })
      if (!row) throw new ActionError("This image no longer exists.")
      await tx.watchImage.delete({ where: { id } })

      const left = await tx.watchImage.count({
        where: { watchId: image.watchId },
      })
      const watch = await tx.watch.findUniqueOrThrow({
        where: { id: image.watchId },
        select: { isActive: true },
      })
      const unpublished = watch.isActive && left === 0
      if (unpublished) {
        await tx.watch.update({
          where: { id: image.watchId },
          data: { isActive: false },
        })
      }
      return {
        key: row.key,
        isActive: watch.isActive && !unpublished,
        unpublished,
      }
    })

    await removeObjects([result.key])
    revalidatePath(PATH)
    return {
      success: true,
      message: result.unpublished
        ? "Image deleted, watch moved to drafts"
        : "Image deleted",
      data: {
        imageId: id,
        isActive: result.isActive,
        unpublished: result.unpublished,
      },
    }
  } catch (error) {
    return actionFail(error, "deleteWatchImage")
  }
}

export async function reorderWatchImages(
  input: ReorderWatchImagesInput
): Promise<ActionRes<AdminWatchImage[]>> {
  await requireAdmin()
  const parsed = reorderWatchImagesSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { watchId, imageIds } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      if (!(await lockWatch(tx, watchId))) throw new ActionError(WATCH_GONE)
      const current = await tx.watchImage.findMany({
        where: { watchId },
        select: { id: true },
      })
      const same =
        current.length === imageIds.length &&
        current.every((image) => imageIds.includes(image.id))
      if (!same) throw new ActionError(IMAGES_CHANGED)

      // two passes so @@unique([watchId, sortOrder]) never sees a duplicate
      for (const [i, id] of imageIds.entries()) {
        await tx.watchImage.update({
          where: { id },
          data: { sortOrder: -(i + 1) },
        })
      }
      for (const [i, id] of imageIds.entries()) {
        await tx.watchImage.update({ where: { id }, data: { sortOrder: i } })
      }
    })
    revalidatePath(PATH)
    return {
      success: true,
      message: "Cover updated",
      data: await getAdminWatchImages(watchId),
    }
  } catch (error) {
    return actionFail(error, "reorderWatchImages")
  }
}
