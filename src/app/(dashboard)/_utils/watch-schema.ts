import { z } from "zod"

export const WATCH_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const
export const BRAND_LOGO_TYPES = [
  "image/svg+xml",
  "image/png",
  "image/webp",
  "image/jpeg",
] as const
export const MAX_WATCH_IMAGES = 8
export const MAX_WATCH_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_BRAND_LOGO_BYTES = 2 * 1024 * 1024
export const MAX_PRICE_DOLLARS = 10_000_000
export const MAX_STOCK = 9999

// ---------------------------------------------------------------------------
// Files (validated when picked, before they enter state)
// ---------------------------------------------------------------------------

export const watchImageFileSchema = z
  .instanceof(File, { message: "Select an image file" })
  .refine(
    (file) => (WATCH_IMAGE_TYPES as readonly string[]).includes(file.type),
    "Use a JPEG, PNG, WebP or AVIF image"
  )
  .refine(
    (file) => file.size <= MAX_WATCH_IMAGE_BYTES,
    "Images must be 5 MB or smaller"
  )

export const brandLogoFileSchema = z
  .instanceof(File, { message: "Select an image file" })
  .refine(
    (file) => (BRAND_LOGO_TYPES as readonly string[]).includes(file.type),
    "Use an SVG, PNG, WebP or JPEG logo"
  )
  .refine(
    (file) => file.size <= MAX_BRAND_LOGO_BYTES,
    "Logos must be 2 MB or smaller"
  )

// ---------------------------------------------------------------------------
// Price input: whole US dollars typed as "12,400"
// ---------------------------------------------------------------------------

/** "12,400" → 12400. Returns NaN when there are no digits. */
export const parsePriceInput = (value: string) => {
  const digits = value.replace(/[^\d]/g, "")
  return digits ? Number.parseInt(digits, 10) : Number.NaN
}

/** Keeps only digits and adds thousands separators while typing. */
export const formatPriceInput = (value: string) => {
  const amount = parsePriceInput(value)
  return Number.isNaN(amount) ? "" : amount.toLocaleString("en-US")
}

// ---------------------------------------------------------------------------
// Watch drawer form
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Brand dialog form (names are unique, case-insensitively, like the DB)
// ---------------------------------------------------------------------------

export function createBrandFormSchema(
  brands: { id: string; name: string }[],
  editingId: string | null
) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required.")
      .max(60, "Name must not exceed 60 characters.")
      .refine(
        (name) =>
          !brands.some(
            (brand) =>
              brand.id !== editingId &&
              brand.name.toLowerCase() === name.toLowerCase()
          ),
        { error: (issue) => `"${String(issue.input).trim()}" already exists.` }
      ),
    description: z
      .string()
      .trim()
      .max(500, "Description must not exceed 500 characters."),
    logoUrl: z.string().nullable(),
  })
}

export type BrandFormInput = z.infer<ReturnType<typeof createBrandFormSchema>>

// ---------------------------------------------------------------------------
// List filters (parsed from the URL, so every field falls back safely)
// ---------------------------------------------------------------------------

export const WATCH_STATUS_FILTERS = ["all", "live", "draft"] as const

export const watchFiltersSchema = z.object({
  q: z.string().trim().max(100).catch(""),
  brand: z.string().trim().max(64).catch(""),
  status: z.enum(WATCH_STATUS_FILTERS).catch("all"),
  page: z.coerce.number().int().min(1).catch(1),
})

export type WatchFilters = z.infer<typeof watchFiltersSchema>
export type WatchStatusFilter = (typeof WATCH_STATUS_FILTERS)[number]
