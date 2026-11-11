import { countryName } from "../../checkout/_utils/countries"
import { formatPhoneDisplay } from "../../checkout/_utils/phone"

type ShipFields = {
  shipName: string | null
  shipPhone: string | null
  shipLine1: string | null
  shipLine2: string | null
  shipCity: string | null
  shipRegion: string | null
  shipPostalCode: string | null
  shipCountry: string | null
}

export type ShippingAddress = {
  name: string
  phone: string | null
  /** street, city line, country: ready to print one per line */
  lines: string[]
}

/** An order's shipping snapshot for display, or null when it has none. */
export function formatShipping(o: ShipFields): ShippingAddress | null {
  if (!o.shipName) return null
  return {
    name: o.shipName,
    phone: o.shipPhone && formatPhoneDisplay(o.shipPhone),
    lines: [
      o.shipLine1,
      o.shipLine2,
      [o.shipCity, o.shipRegion, o.shipPostalCode].filter(Boolean).join(", "),
      o.shipCountry && countryName(o.shipCountry),
    ].filter((l): l is string => Boolean(l)),
  }
}

/** Every `ship*` column, for a Prisma select. */
export const shippingSelect = {
  shipName: true,
  shipPhone: true,
  shipLine1: true,
  shipLine2: true,
  shipCity: true,
  shipRegion: true,
  shipPostalCode: true,
  shipCountry: true,
} as const
