"use server"

import { revalidatePath } from "next/cache"
import { Prisma } from "@/app/generated/prisma/client"
import prisma from "../../../../lib/prisma"
import { logger } from "../../../../lib/pino"
import { createPresignedPut, deleteObjects, moveObject } from "../../../../lib/storage"
import { requireAdmin } from "../_utils/require-admin"
import { verifyUploadedImage } from "../_utils/verify-upload"
import { BRAND_LOGO_EXT, BRAND_LOGO_TYPES, MAX_BRAND_LOGO_BYTES } from "../_utils/upload-rules"
import {
  createBrandSchema, logoUploadSchema, updateBrandSchema,
  type CreateBrandInput, type UpdateBrandInput,
} from "../_utils/brand-schema"
import { brandSelect, toAdminBrand } from "../_data/brands"
import type { AdminBrand } from "../_data/types"
import { fail, type ActionRes } from "../_utils/action-result"


async function promoteLogo(tmpKey: string) {
  const ok = await verifyUploadedImage(tmpKey, { maxBytes: MAX_BRAND_LOGO_BYTES, allowed: BRAND_LOGO_TYPES })
  if (!ok) return null
  const key = tmpKey.replace(/^tmp\//, "")
  await moveObject(tmpKey, key)
  return key
}

async function removeObject(key: string | null | undefined) {
  if (!key) return
  await deleteObjects([key]).catch((error) => logger.warn({ error, key }, "logo delete failed; cron will sweep"))
}

function prismaFail(error: unknown, where: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return fail("A brand with this name already exists.")
    if (error.code === "P2025") return fail("This brand no longer exists.")
    if (error.code === "P2003") return fail("This brand still has watches.")
  }
  logger.error(error, `${where} failed`)
  return fail("Something went wrong. Please try again.")
}

export async function createBrandLogoUpload(input: {
  contentType: string
  size: number
}): Promise<ActionRes<{ key: string; url: string }>> {
  await requireAdmin()
  const parsed = logoUploadSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)

  const key = `tmp/brands/${crypto.randomUUID()}.${BRAND_LOGO_EXT[parsed.data.contentType]}`
  const url = await createPresignedPut(key, parsed.data.contentType)
  return { success: true, message: "OK", data: { key, url } }
}

export async function createBrand(input: CreateBrandInput): Promise<ActionRes<AdminBrand>> {
  await requireAdmin()
  const parsed = createBrandSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { name, description, logoKey: tmpKey } = parsed.data

  const logoKey = await promoteLogo(tmpKey)
  if (!logoKey) return fail("The logo upload is missing or isn't a valid image.")

  try {
    const brand = await prisma.brand.create({ data: { name, description, logoKey }, select: brandSelect })
    revalidatePath("/dashboard/watches")
    return { success: true, message: "Brand created", data: toAdminBrand(brand) }
  } catch (error) {
    await removeObject(logoKey) // don't leave the logo behind if the row failed (e.g. duplicate name)
    return prismaFail(error, "createBrand")
  }
}

export async function updateBrand(input: UpdateBrandInput): Promise<ActionRes<AdminBrand>> {
  await requireAdmin()
  const parsed = updateBrandSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { id, name, description, logo } = parsed.data

  const current = await prisma.brand.findUnique({ where: { id }, select: { logoKey: true } })
  if (!current) return fail("This brand no longer exists.")

  let logoKey = current.logoKey
  if (logo.action === "replace") {
    const promoted = await promoteLogo(logo.key)
    if (!promoted) return fail("The logo upload is missing or isn't a valid image.")
    logoKey = promoted
  }

  try {
    const brand = await prisma.brand.update({ where: { id }, data: { name, description, logoKey }, select: brandSelect })
    // DB is updated, so the old file is now unreferenced and safe to delete
    if (current.logoKey !== logoKey) await removeObject(current.logoKey)
    revalidatePath("/dashboard/watches")
    return { success: true, message: "Brand updated", data: toAdminBrand(brand) }
  } catch (error) {
    if (logo.action === "replace") await removeObject(logoKey)
    return prismaFail(error, "updateBrand")
  }
}

export async function deleteBrand(id: string): Promise<ActionRes<null>> {
  await requireAdmin()
  const brand = await prisma.brand.findUnique({
    where: { id },
    select: { logoKey: true, _count: { select: { watches: true } } },
  })
  if (!brand) return fail("This brand no longer exists.")
  if (brand._count.watches > 0) return fail("Move or delete this brand's watches first.")

  try {
    await prisma.brand.delete({ where: { id } }) // FK Restrict still guards a race
    await removeObject(brand.logoKey)
    revalidatePath("/dashboard/watches")
    return { success: true, message: "Brand deleted", data: null }
  } catch (error) {
    return prismaFail(error, "deleteBrand")
  }
}