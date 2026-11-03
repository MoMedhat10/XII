import { z } from "zod"

import { watchIdsSchema } from "../../wishlist/_utils/wishlist-schema"

export const addToBagSchema = z.object({ watchIds: watchIdsSchema })
export type AddToBagInput = z.infer<typeof addToBagSchema>
