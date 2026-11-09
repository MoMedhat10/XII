import "server-only"
import prisma from "../../../../../lib/prisma"
import type { WatchDetail } from "../../watches/[id]/_data/types"
import { detailSelect, toWatchDetail } from "../../watches/[id]/_data/watch"

export type CompareViewer = {
  signedIn: boolean
  savedIds: string[]
  inBagIds: string[]
}

/**
 * The live watches for these ids, in URL order. Unknown or hidden ids are
 * dropped and counted in `missing`.
 */
export async function getCompareWatches(
  ids: string[]
): Promise<{ watches: WatchDetail[]; missing: number }> {
  if (!ids.length) return { watches: [], missing: 0 }
  const rows = await prisma.watch.findMany({
    where: { id: { in: ids }, isActive: true },
    select: detailSelect,
  })
  const byId = new Map(rows.map((r) => [r.id, toWatchDetail(r)]))
  const watches = ids
    .map((id) => byId.get(id))
    .filter((w): w is WatchDetail => Boolean(w))
  return { watches, missing: ids.length - watches.length }
}

/** Which of these watches the user has saved or has in the bag. */
export async function getCompareViewer(
  userId: string,
  ids: string[]
): Promise<CompareViewer> {
  const [saved, inBag] = await Promise.all([
    prisma.favoriteWatch.findMany({
      where: { userId, watchId: { in: ids } },
      select: { watchId: true },
    }),
    prisma.cartItem.findMany({
      where: { cart: { userId }, watchId: { in: ids } },
      select: { watchId: true },
    }),
  ])
  return {
    signedIn: true,
    savedIds: saved.map((s) => s.watchId),
    inBagIds: inBag.map((c) => c.watchId),
  }
}
