import type { Metadata } from "next"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

import { CompareView } from "@/components/compare/compare-view"

import { getCompareViewer, getCompareWatches } from "./_data/compare"
import { compareIdsSchema } from "./_utils/compare-schema"

export const metadata: Metadata = {
  title: "Compare — XII",
  description:
    "Compare up to four XII timepieces side by side: price, movement, caliber, case and more.",
  // any combination of ids is a new URL; none should be indexed
  robots: { index: false, follow: false },
}

/** Open to guests: the selection lives in the URL, not an account. */
export default async function ComparePage({
  searchParams,
}: PageProps<"/compare">) {
  const ids = compareIdsSchema.parse((await searchParams).ids)
  const [{ watches, missing }, user] = await Promise.all([
    getCompareWatches(ids),
    getCurrentUser(),
  ])
  const viewer = user
    ? await getCompareViewer(
        user.id,
        watches.map((w) => w.id)
      )
    : { signedIn: false, savedIds: [], inBagIds: [] }

  return <CompareView watches={watches} missing={missing} viewer={viewer} />
}
