import "server-only"
import { Receiver } from "@upstash/qstash"

import { getAppUrl } from "./app-url"
import { logger } from "./pino"

export const JOBS_PATH = "/api/jobs"
export const JOBS_FAILED_PATH = "/api/jobs/failed"

/**
 * The public URL QStash calls for `path`, from `getAppUrl()`. Publishing and
 * verifying both use it, so a signature only matches the endpoint it was
 * published to. Null when there is no app URL.
 */
export function qstashUrl(path: string) {
  const base = getAppUrl()
  return base ? `${base}${path}` : null
}

let receiver: Receiver | undefined

function getReceiver() {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY
  if (!currentSigningKey || !nextSigningKey) return null
  receiver ??= new Receiver({ currentSigningKey, nextSigningKey })
  return receiver
}

/**
 * Reads the body of a request QStash signed (`Upstash-Signature`) for the
 * endpoint at `path`, or returns null when the signature is missing, invalid,
 * or was issued for another URL. Missing signing keys or app URL reject
 * everything (fails closed). A signature can be replayed for 5 minutes, which
 * is harmless here because every job is idempotent.
 */
export async function readQStashBody(request: Request, path: string) {
  const signature = request.headers.get("upstash-signature")
  const verifier = getReceiver()
  const url = qstashUrl(path)
  if (!signature || !verifier || !url) return null

  const body = await request.text()
  try {
    const valid = await verifier.verify({ signature, body, url })
    return valid ? body : null
  } catch (error) {
    logger.warn({ error }, "invalid QStash signature")
    return null
  }
}
