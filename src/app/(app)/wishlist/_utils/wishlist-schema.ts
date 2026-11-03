import { z } from "zod"

export const WISHLIST_PAGE_SIZE = 12
/** Most pieces one page render can ask for through `?show=`. */
export const WISHLIST_MAX_SHOW = 96

// Bad or missing values fall back to one page. Others round up to a whole
// page and are capped, so `?show=9999` can't load the whole table.
export const showSchema = z.coerce
  .number()
  .int()
  .catch(WISHLIST_PAGE_SIZE)
  .transform((n) => {
    const pages = Math.ceil(n / WISHLIST_PAGE_SIZE)
    return Math.min(
      Math.max(pages * WISHLIST_PAGE_SIZE, WISHLIST_PAGE_SIZE),
      WISHLIST_MAX_SHOW
    )
  })

export const watchIdsSchema = z.array(z.uuid()).min(1).max(WISHLIST_MAX_SHOW)

export const removeFavoritesSchema = z.object({ watchIds: watchIdsSchema })
export type RemoveFavoritesInput = z.infer<typeof removeFavoritesSchema>
