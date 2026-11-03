import type {
  MovementType,
  WatchCondition,
  WatchGender,
} from "@/app/generated/prisma/enums"

import type { CatalogWatchImage } from "../../_data/types"

export type WatchDetail = {
  id: string
  name: string
  brand: string
  model: string
  priceCents: number
  stock: number
  description: string
  gender: WatchGender | null
  movement: MovementType | null
  caliber: string | null
  caseMaterial: string | null
  condition: WatchCondition | null
  /** in display order; may be empty */
  images: CatalogWatchImage[]
}

/** What the current visitor has done with this watch. */
export type WatchViewer = {
  signedIn: boolean
  saved: boolean
  inBag: boolean
}
