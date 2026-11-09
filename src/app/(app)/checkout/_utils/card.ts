// Demo checkout: card details are validated here and then discarded.
// Nothing about the card is stored or logged.

export const digitsOnly = (value: string) => value.replace(/\D/g, "")

/** The standard checksum every real card number passes. */
export function luhnValid(number: string) {
  const digits = digitsOnly(number)
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return digits.length > 0 && sum % 10 === 0
}

export type CardBrand = "Visa" | "Mastercard" | "Amex" | null

export function cardBrand(number: string): CardBrand {
  const d = digitsOnly(number)
  if (/^4/.test(d)) return "Visa"
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard"
  if (/^3[47]/.test(d)) return "Amex"
  return null
}

/** How many digits a card number has: 15 for Amex, 16 for the rest. */
export const cardLength = (number: string) =>
  cardBrand(number) === "Amex" ? 15 : 16

/** "4242424242424242" → "4242 4242 4242 4242" (Amex: 4-6-5). */
export function formatCardNumber(value: string) {
  const all = digitsOnly(value)
  const d = all.slice(0, cardLength(all))
  if (cardBrand(d) === "Amex") {
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)]
      .filter(Boolean)
      .join(" ")
  }
  return d.replace(/(\d{4})(?=\d)/g, "$1 ")
}

/** "0427" → "04/27" while typing. */
export function formatExpiry(value: string) {
  const d = digitsOnly(value).slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

/** True when an MM/YY expiry is this month or later. */
export function expiryValid(value: string, now = new Date()) {
  const m = /^(\d{2})\/(\d{2})$/.exec(value)
  if (!m) return false
  const month = Number(m[1])
  const year = 2000 + Number(m[2])
  if (month < 1 || month > 12) return false
  return (
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1)
  )
}

/** The demo card that is always declined, to test the failure path. */
export const DECLINE_CARD = "4000000000000002"
