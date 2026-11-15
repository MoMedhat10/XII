import { unstable_rethrow } from "next/navigation"

import { getBagCount } from "@/app/(app)/cart/_data/cart"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

import { logger } from "../../../lib/pino"
import type { HeaderUser } from "./nav-config"
import { SiteNav } from "./site-nav"

/**
 * The header on every customer page. Rendered on the server, so the
 * refresh() that cart actions, login and logout already call keeps the user
 * and the bag count current. A failure here shows the guest header rather
 * than breaking the page.
 */
export async function SiteHeader() {
  let header: HeaderUser | null = null
  try {
    const user = await getCurrentUser()
    if (user) {
      header = {
        username: user.username,
        isAdmin: user.role === "ADMIN",
        bagCount: await getBagCount(user.id),
      }
    }
  } catch (error) {
    // let Next.js internals (dynamic-rendering bailout from cookies()) through
    unstable_rethrow(error)
    logger.error({ error }, "site header data failed")
  }

  return <SiteNav user={header} />
}
