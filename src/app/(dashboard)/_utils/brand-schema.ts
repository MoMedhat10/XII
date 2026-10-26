import { z } from "zod"
import { BRAND_LOGO_TYPES, MAX_BRAND_LOGO_BYTES } from "./upload-rules"

export const brandFields = {
  name: z.string().trim().min(1, "Name is required.").max(60, "Name must not exceed 60 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(500, "Description must not exceed 500 characters."),
}

const tmpLogoKey = z
  .string()
  .regex(/^tmp\/brands\/[0-9a-f-]{36}\.(png|webp|jpg)$/, "Invalid logo upload.")

export const logoUploadSchema = z.object({
  contentType: z.enum(BRAND_LOGO_TYPES, "Use a PNG, WebP or JPEG logo."),
  size: z.number().int().positive().max(MAX_BRAND_LOGO_BYTES, "Logos must be 2 MB or smaller."),
})

export const createBrandSchema = z.object({
  ...brandFields,
  logoKey: tmpLogoKey, // every brand needs a logo
})

export const updateBrandSchema = z.object({
  id: z.uuid(),
  ...brandFields,
  // no "remove": a logo can be replaced but never dropped
  logo: z.discriminatedUnion("action", [
    z.object({ action: z.literal("keep") }),
    z.object({ action: z.literal("replace"), key: tmpLogoKey }),
  ]),
})

export type CreateBrandInput = z.infer<typeof createBrandSchema>
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>