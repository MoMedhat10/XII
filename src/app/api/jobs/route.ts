import { NextResponse } from "next/server"

import { Prisma } from "@/app/generated/prisma/client"
import { jobSchema, runJob } from "../../../../lib/jobs"
import { logger } from "../../../../lib/pino"
import { JOBS_PATH, readQStashBody } from "../../../../lib/qstash-auth"

// QStash delivers every background job here. 2xx = done; anything else is
// retried with backoff, then reported to ./failed.

const ok = () => NextResponse.json({ success: true })

export async function POST(request: Request) {
  const body = await readQStashBody(request, JOBS_PATH)
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
  const parsed = jobSchema.safeParse(raw)
  if (!parsed.success) {
    // A retry can't fix a malformed job, so acknowledge it.
    logger.error({ issues: parsed.error.issues }, "invalid job dropped")
    return ok()
  }
  const job = parsed.data

  try {
    await runJob(job)
    return ok()
  } catch (error) {
    // The order is gone: nothing left to email about.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      logger.warn({ job }, "job target no longer exists; dropped")
      return ok()
    }
    logger.error({ error, job }, "job failed; QStash will retry")
    return NextResponse.json(
      { success: false, message: "Job failed" },
      { status: 500 }
    )
  }
}
