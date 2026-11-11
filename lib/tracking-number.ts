import { randomInt } from "node:crypto"

// Plain module (no server-only): the seed scripts use it too.

/** No 0/O or 1/I, so a number is easy to read aloud and retype. */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
const LENGTH = 12

export const TRACKING_PREFIX = "XII"

/**
 * A new XII shipment number, e.g. "XII7K3M9Q2T4P8". It isn't registered with
 * any carrier, so never link it to a carrier's tracking page. 32^12 ≈ 10^18
 * possibilities; `Order.trackingNumber` is unique to rule out the rest.
 */
export function generateTrackingNumber() {
  let code = TRACKING_PREFIX
  for (let i = 0; i < LENGTH; i++) code += ALPHABET[randomInt(ALPHABET.length)]
  return code
}
