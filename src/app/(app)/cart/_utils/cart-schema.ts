import { z } from "zod"

import { watchIdsSchema } from "../../wishlist/_utils/wishlist-schema"

/** Most of one watch a bag can hold, even when more is in stock. */
export const CART_MAX_PER_PIECE = 5

/** How long the stepper waits after the last click before saving. */
export const QTY_SAVE_DELAY_MS = 400

export const addToBagSchema = z.object({ watchIds: watchIdsSchema })
export type AddToBagInput = z.infer<typeof addToBagSchema>

export const cartWatchSchema = z.object({ watchId: z.uuid() })
export type CartWatchInput = z.infer<typeof cartWatchSchema>

export const setQuantitySchema = z.object({
  watchId: z.uuid(),
  quantity: z.number().int().min(1).max(CART_MAX_PER_PIECE),
})
export type SetQuantityInput = z.infer<typeof setQuantitySchema>
