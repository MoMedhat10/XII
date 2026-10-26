export const WATCH_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const


export const MAX_WATCH_IMAGES = 4
export const MAX_WATCH_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_BRAND_LOGO_BYTES = 2 * 1024 * 1024
export const MAX_PRICE_DOLLARS = 10_000_000
export const MAX_STOCK = 9999


export const WATCH_IMAGE_EXT = {
  "image/png": "png",
  "image/webp": "webp",
  "image/jpeg": "jpg",
} as const satisfies Record<(typeof WATCH_IMAGE_TYPES)[number], string>


export const BRAND_LOGO_EXT = {
  "image/png": "png",
  "image/webp": "webp",
  "image/jpeg": "jpg",
} as const


export const BRAND_LOGO_TYPES = Object.keys(BRAND_LOGO_EXT) as [
  keyof typeof BRAND_LOGO_EXT,
  ...(keyof typeof BRAND_LOGO_EXT)[],
]