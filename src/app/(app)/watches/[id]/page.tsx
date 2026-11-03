import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

import { gutter } from "@/components/home/styles"
import { WatchBuyPanel } from "@/components/watch/watch-buy-panel"
import { WatchDetails } from "@/components/watch/watch-details"
import { WatchGallery } from "@/components/watch/watch-gallery"
import { cn } from "@/lib/utils"

import type { WatchViewer } from "./_data/types"
import { getWatchDetail, getWatchViewer } from "./_data/watch"

export async function generateMetadata({
  params,
}: PageProps<"/watches/[id]">): Promise<Metadata> {
  const watch = await getWatchDetail((await params).id)
  if (!watch) {
    return {
      title: "Piece not found — XII",
      robots: { index: false, follow: false },
    }
  }
  const cover = watch.images[0]
  return {
    title: `${watch.name} — XII`,
    description: `${watch.brand} ${watch.name}, ref. ${watch.model}. Insured courier delivery with a certificate of authenticity.`,
    openGraph: { images: cover ? [{ url: cover.url, alt: cover.alt }] : [] },
  }
}

export default async function WatchPage({
  params,
}: PageProps<"/watches/[id]">) {
  const { id } = await params
  const [watch, user] = await Promise.all([
    getWatchDetail(id),
    getCurrentUser(),
  ])
  if (!watch) notFound()

  const viewer: WatchViewer = user
    ? { signedIn: true, ...(await getWatchViewer(watch.id, user.id)) }
    : { signedIn: false, saved: false, inBag: false }

  return (
    <>
      <section
        className={cn(
          gutter,
          "flex flex-col gap-10 pt-20 sm:pt-28 lg:flex-row lg:items-start"
        )}
      >
        <WatchGallery
          images={watch.images}
          title={`${watch.brand} · ${watch.name}`}
          className="lg:flex-1"
        />
        <WatchBuyPanel
          watch={watch}
          viewer={viewer}
          className="lg:w-[clamp(340px,30vw,440px)]"
        />
      </section>

      <section className={cn(gutter, "pt-20 pb-30")}>
        <WatchDetails watch={watch} />
      </section>
    </>
  )
}
