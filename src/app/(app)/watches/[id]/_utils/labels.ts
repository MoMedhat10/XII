import type {
  MovementType,
  WatchCondition,
  WatchGender,
} from "@/app/generated/prisma/enums"

export const GENDER_LABEL: Record<WatchGender, string> = {
  MEN: "Men",
  WOMEN: "Women",
  UNISEX: "Unisex",
}

export const MOVEMENT_LABEL: Record<MovementType, string> = {
  AUTOMATIC: "Automatic",
  MANUAL: "Manual-wind",
  QUARTZ: "Quartz",
  SOLAR: "Solar",
  SMART: "Smart",
}

export const CONDITION_LABEL: Record<WatchCondition, string> = {
  NEW: "New",
  PRE_OWNED: "Pre-owned",
  REFURBISHED: "Refurbished",
}

/** Same low-stock threshold as the wishlist's flag. */
export function stockLabel(stock: number) {
  if (stock <= 0) return "Sold out"
  if (stock <= 3) return `Only ${stock} left`
  return "In stock"
}
