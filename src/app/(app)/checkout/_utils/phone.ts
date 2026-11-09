import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js"

import { COUNTRIES } from "./countries"

export type { CountryCode }

const regionNames = new Intl.DisplayNames("en", { type: "region" })

const SHIPPING_CODES = new Set<string>(COUNTRIES.map((c) => c.code))

const toOption = (code: CountryCode) => ({
  code,
  dial: `+${getCountryCallingCode(code)}`,
  name: regionNames.of(code) ?? code,
})

/** Dial-code options: shipping countries first, then every other country A–Z. */
export const DIAL_CODES = [
  ...COUNTRIES.map((c) => toOption(c.code)),
  ...getCountries()
    .filter((c) => !SHIPPING_CODES.has(c))
    .map(toOption)
    .sort((a, b) => a.name.localeCompare(b.name)),
]

const DIAL_SET = new Set<string>(getCountries())

export const isDialCountry = (c: string): c is CountryCode => DIAL_SET.has(c)

export const dialCountryName = (c: CountryCode) => regionNames.of(c) ?? c

/** The parsed number when it's valid for that country, otherwise null. */
export function parsePhone(national: string, country: CountryCode) {
  const parsed = parsePhoneNumberFromString(national, country)
  return parsed?.isValid() ? parsed : null
}

/** Formats while typing: "225550100" → "22 555 01 00" for CH. */
export const formatPhoneTyping = (value: string, country: CountryCode) =>
  new AsYouType(country).input(value)

/**
 * A pasted international number ("+44 20 7946 0958") → its country and the
 * national part, or null when it doesn't start with "+" or isn't recognised.
 */
export function splitInternational(value: string) {
  if (!value.trim().startsWith("+")) return null
  const parsed = parsePhoneNumberFromString(value)
  if (!parsed?.country) return null
  return { country: parsed.country, national: parsed.formatNational() }
}

/** A typed national number shown with its code, e.g. "+41 22 555 01 00". */
export function formatPhoneInternational(national: string, country: string) {
  if (!isDialCountry(country)) return national
  return parsePhone(national, country)?.formatInternational() ?? national
}

/** "+41225550100" → "+41 22 555 01 00"; raw value for older free-text numbers. */
export const formatPhoneDisplay = (e164: string) =>
  parsePhoneNumberFromString(e164)?.formatInternational() ?? e164
