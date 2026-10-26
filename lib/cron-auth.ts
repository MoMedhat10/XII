import "server-only"
import { timingSafeEqual } from "node:crypto"

/** True when the request carries `Authorization: Bearer $CRON_SECRET`. */
export function isCronAuthorized(request: Request) {
  const expected = process.env.CRON_SECRET
  const [scheme, token] = (request.headers.get("authorization") ?? "").split(
    " "
  )
  if (!expected || scheme !== "Bearer" || !token) return false

  const a = Buffer.from(token)
  const b = Buffer.from(expected)
  // constant-time compare, so the secret can't be guessed from response timing
  return a.length === b.length && timingSafeEqual(a, b)
}
