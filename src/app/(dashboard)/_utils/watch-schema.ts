import { z } from "zod"
import {
  MAX_PRICE_DOLLARS,
  MAX_STOCK,
  MAX_WATCH_IMAGE_BYTES,
  MAX_WATCH_IMAGES,
  WATCH_IMAGE_TYPES,
} from "./upload-rules"

export const watchImageFileSchema = z
  .instanceof(File, { message: "Select an image file" })
  .refine(
    (file) => (WATCH_IMAGE_TYPES as readonly string[]).includes(file.type),
    "Use a JPEG, PNG, WebP image"
  )
  .refine(
    (file) => file.size <= MAX_WATCH_IMAGE_BYTES,
    "Images must be 5 MB or smaller"
  )

/** "12,400" → 12400. Returns NaN when there are no digits. */
export const parsePriceInput = (value: string) => {
  const digits = value.replace(/[^\d]/g, "")
  return digits ? Number.parseInt(digits, 10) : Number.NaN
}

export const formatPriceInput = (value: string) => {
  const amount = parsePriceInput(value)
  return Number.isNaN(amount) ? "" : amount.toLocaleString("en-US")
}

export const watchFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(120, "Name must not exceed 120 characters."),
  model: z
    .string()
    .trim()
    .min(1, "Model / reference is required.")
    .max(60, "Reference must not exceed 60 characters."),
  brandId: z.string().min(1, "Pick a brand."),
  price: z
    .string()
    .refine((value) => parsePriceInput(value) > 0, "Enter a price above $0.")
    .refine(
      (value) => !(parsePriceInput(value) > MAX_PRICE_DOLLARS),
      "Price must not exceed $10,000,000."
    ),
  stock: z
    .number({ error: "Enter a stock quantity." })
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative.")
    .max(MAX_STOCK, "Stock must not exceed 9,999."),
  description: z
    .string()
    .trim()
    .max(2000, "Description must not exceed 2000 characters."),
})

export type WatchFormInput = z.infer<typeof watchFormSchema>

const tmpWatchImageKey = z
  .string()
  .regex(
    /^tmp\/watches\/[0-9a-f-]{36}\.(png|webp|jpg)$/,
    "Invalid image upload."
  )

export const watchImageUploadSchema = z.object({
  contentType: z.enum(WATCH_IMAGE_TYPES, "Use a JPEG, PNG or WebP image."),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_WATCH_IMAGE_BYTES, "Images must be 5 MB or smaller."),
})

const unique = (values: string[]) => new Set(values).size === values.length

export const createWatchSchema = watchFormSchema.extend({
  brandId: z.uuid("Pick a brand."),
})

// isActive and images have their own actions (and rules), so they're not here
export const updateWatchSchema = watchFormSchema.extend({
  id: z.uuid(),
  brandId: z.uuid("Pick a brand."),
  /** the version the admin opened; a mismatch means someone else saved first */
  updatedAt: z.iso.datetime(),
})

export const setWatchActiveSchema = z.object({
  id: z.uuid(),
  isActive: z.boolean(),
})

export const deleteWatchSchema = z.object({ id: z.uuid() })

export const addWatchImagesSchema = z.object({
  watchId: z.uuid(),
  imageKeys: z
    .array(tmpWatchImageKey)
    .min(1, "Pick at least one image.")
    .max(MAX_WATCH_IMAGES, `Add at most ${MAX_WATCH_IMAGES} images.`)
    .refine(unique, "Duplicate image upload."),
})

export const deleteWatchImageSchema = z.object({ id: z.uuid() })

/** The full new order, first = cover. */
export const reorderWatchImagesSchema = z.object({
  watchId: z.uuid(),
  imageIds: z
    .array(z.uuid())
    .min(1)
    .max(MAX_WATCH_IMAGES)
    .refine(unique, "Duplicate image."),
})

export type CreateWatchInput = z.infer<typeof createWatchSchema>
export type UpdateWatchInput = z.infer<typeof updateWatchSchema>
export type SetWatchActiveInput = z.infer<typeof setWatchActiveSchema>
export type DeleteWatchInput = z.infer<typeof deleteWatchSchema>
export type AddWatchImagesInput = z.infer<typeof addWatchImagesSchema>
export type DeleteWatchImageInput = z.infer<typeof deleteWatchImageSchema>
export type ReorderWatchImagesInput = z.infer<typeof reorderWatchImagesSchema>

export const WATCH_STATUS_FILTERS = ["all", "live", "draft"] as const

export const WATCHES_PAGE_SIZE = 6

export const watchFiltersSchema = z.object({
  q: z.string().trim().max(100).catch(""),
  brand: z.union([z.uuid(), z.literal("")]).catch(""),
  status: z.enum(WATCH_STATUS_FILTERS).catch("all"),
  page: z.coerce.number().int().min(1).catch(1),
})

export type WatchFilters = z.infer<typeof watchFiltersSchema>
export type WatchStatusFilter = (typeof WATCH_STATUS_FILTERS)[number]
