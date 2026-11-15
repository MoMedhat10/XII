import "server-only"

import { logger } from "./pino"

let warned = false

/**
 * The site's public origin, no trailing slash: APP_URL, or on Vercel the
 * project's production domain (VERCEL_PROJECT_PRODUCTION_URL, a custom domain
 * once one is assigned). Used for links in emails and as the URL QStash calls,
 * so a wrong value silently breaks both. Null when neither is set.
 */
export function getAppUrl() {
  const explicit = process.env.APP_URL?.trim().replace(/\/$/, "")
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const vercel = vercelHost ? `https://${vercelHost}` : undefined

  if (
    explicit &&
    vercel &&
    explicit !== vercel &&
    process.env.VERCEL_ENV === "production" &&
    !warned
  ) {
    warned = true
    logger.warn(
      { appUrl: explicit, productionUrl: vercel },
      "APP_URL doesn't match this project's production domain"
    )
  }
  return explicit || vercel || null
}
