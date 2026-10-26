import { NextResponse } from "next/server"

import { isCronAuthorized } from "../../../../../../lib/cron-auth"
import { logger } from "../../../../../../lib/pino"
import { deleteObjects, listObjects } from "../../../../../../lib/storage"

// Only tmp/ is swept: tmp/ holds uploads that were never verified or saved.
// Never add brands/, watches/ or orders/ here.
const PREFIXES = ["tmp/watches/", "tmp/brands/"]
// Far longer than an upload URL lives (5 min) plus the time to save the
// form, so nothing in progress is ever deleted.
const MAX_AGE_MS = 24 * 60 * 60 * 1000
const S3_DELETE_LIMIT = 1000

async function staleKeys(prefix: string, before: Date) {
  const keys: string[] = []
  let token: string | undefined
  do {
    const page = await listObjects(prefix, token)
    for (const object of page.Contents ?? []) {
      if (object.Key && object.LastModified && object.LastModified < before) {
        keys.push(object.Key)
      }
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (token)
  return keys
}

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const before = new Date(Date.now() - MAX_AGE_MS)
    const keys = (
      await Promise.all(PREFIXES.map((prefix) => staleKeys(prefix, before)))
    ).flat()

    for (let i = 0; i < keys.length; i += S3_DELETE_LIMIT) {
      await deleteObjects(keys.slice(i, i + S3_DELETE_LIMIT))
    }

    logger.info({ deleted: keys.length }, "tmp storage cleanup completed")
    return NextResponse.json({ success: true, deleted: keys.length })
  } catch (error) {
    logger.error(error, "tmp storage cleanup failed")
    return NextResponse.json(
      { success: false, message: "Cron execution failed" },
      { status: 500 }
    )
  }
}
