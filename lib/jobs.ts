import "server-only"
import { Client } from "@upstash/qstash"
import { after } from "next/server"
import { z } from "zod"

import {
  sendOrderEmail,
  type OrderEmailKind,
} from "@/app/(app)/checkout/_utils/order-email"
import { logger } from "./pino"
import { JOBS_FAILED_PATH, JOBS_PATH, qstashUrl } from "./qstash-auth"
import { deleteObjects } from "./storage"

// Background jobs on Upstash QStash. QStash POSTs each job to /api/jobs and
// retries it (with backoff) until the handler returns 2xx, so every job here
// must be idempotent and must throw to be retried.
//
// Always enqueue AFTER the database transaction commits, never inside it, so a
// rolled-back change never sends an email or deletes a file.

const S3_DELETE_LIMIT = 1000
const RETRIES = 5

const orderEmailKinds = [
  "confirmation",
  "shipped",
  "cancelled",
] as const satisfies readonly OrderEmailKind[]

export const jobSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("order.email"),
    kind: z.enum(orderEmailKinds),
    orderId: z.string().min(1),
  }),
  z.object({
    type: z.literal("storage.delete"),
    keys: z.array(z.string().min(1)).min(1).max(S3_DELETE_LIMIT),
  }),
])

export type Job = z.infer<typeof jobSchema>

/** Runs one job. Throws on failure so QStash retries it. */
export async function runJob(job: Job) {
  switch (job.type) {
    case "order.email":
      return sendOrderEmail(job.kind, job.orderId)
    case "storage.delete":
      await deleteObjects(job.keys)
      return
  }
}

let client: Client | undefined

function getClient() {
  const token = process.env.QSTASH_TOKEN
  if (!token) return null
  client ??= new Client({
    token,
    ...(process.env.QSTASH_URL ? { baseUrl: process.env.QSTASH_URL } : {}),
  })
  return client
}

/**
 * Hands a job to QStash. When QStash isn't configured or can't be reached,
 * the job runs inline instead (no retries, like before the queue existed),
 * so an outage there is never worse than not having a queue. Never throws.
 *
 * `dedupeId` must not contain ":" (QStash rejects it with a 400); use "-".
 */
export async function publishJob(job: Job, dedupeId: string) {
  const qstash = getClient()
  const url = qstashUrl(JOBS_PATH)
  const failureCallback = qstashUrl(JOBS_FAILED_PATH)
  if (qstash && url && failureCallback) {
    try {
      await qstash.publishJSON({
        url,
        body: job,
        deduplicationId: dedupeId,
        retries: RETRIES,
        failureCallback,
      })
      return
    } catch (error) {
      logger.warn(
        { error, job: job.type, dedupeId },
        "job publish failed; running inline"
      )
    }
  } else {
    logger.warn(
      { job: job.type, dedupeId },
      "QStash not configured; running job inline"
    )
  }

  try {
    await runJob(job)
  } catch (error) {
    logger.error({ error, job, dedupeId }, "inline job failed")
  }
}

/** Queues a job once the response is sent, so the action never waits on it. */
export function enqueue(job: Job, dedupeId: string) {
  after(() => publishJob(job, dedupeId))
}

/** Queues one order email. One per order and kind, however often it's called. */
export function enqueueOrderEmail(kind: OrderEmailKind, orderId: string) {
  enqueue(
    { type: "order.email", kind, orderId },
    `order-email-${kind}-${orderId}`
  )
}

/**
 * Deletes storage objects now and, if that fails, queues the delete to be
 * retried, so a storage hiccup doesn't leave orphaned files behind. Never throws.
 */
export async function deleteObjectsOrRetry(keys: string[]) {
  if (!keys.length) return
  try {
    await deleteObjects(keys)
  } catch (error) {
    logger.warn({ error, keys }, "storage delete failed; queueing a retry")
    for (let i = 0; i < keys.length; i += S3_DELETE_LIMIT) {
      const batch = keys.slice(i, i + S3_DELETE_LIMIT)
      await publishJob(
        { type: "storage.delete", keys: batch },
        `storage-delete-${crypto.randomUUID()}`
      )
    }
  }
}
