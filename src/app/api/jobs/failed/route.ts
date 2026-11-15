import { NextResponse } from "next/server"
import { z } from "zod"

import { logger } from "../../../../../lib/pino"
import {
  JOBS_FAILED_PATH,
  readQStashBody,
} from "../../../../../lib/qstash-auth"

// QStash calls this once a job has used up all its retries (and it is in the
// dead-letter queue). Logged at error level so it can be alerted on.

const callbackSchema = z.object({
  status: z.number().optional(),
  retried: z.number().optional(),
  sourceMessageId: z.string().optional(),
  dlqId: z.string().optional(),
  sourceBody: z.string().optional(), // base64 of the job
  body: z.string().optional(), // base64 of the last response
})

const decode = (base64?: string) =>
  base64 ? Buffer.from(base64, "base64").toString("utf8") : undefined

export async function POST(request: Request) {
  const body = await readQStashBody(request, JOBS_FAILED_PATH)
  if (body === null) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }

  let raw: unknown
  try {
    raw = JSON.parse(body)
  } catch {
    raw = undefined
  }
  const parsed = callbackSchema.safeParse(raw)
  const info = parsed.success ? parsed.data : {}

  logger.error(
    {
      messageId: info.sourceMessageId,
      dlqId: info.dlqId,
      status: info.status,
      retried: info.retried,
      job: decode(info.sourceBody),
      lastResponse: decode(info.body),
    },
    "job failed permanently"
  )
  return NextResponse.json({ success: true })
}
