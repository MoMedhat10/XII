import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

import { WishlistView } from "@/components/wishlist/wishlist-view"

import { getWishlistPage } from "./_data/wishlist"
import { showSchema } from "./_utils/wishlist-schema"

export const metadata: Metadata = {
  title: "Saved Pieces — XII",
  description:
    "Your private register of saved timepieces at XII — review, compare and move them to your bag.",
  robots: { index: false, follow: false },
}

export default async function WishlistPage({
  searchParams,
}: PageProps<"/wishlist">) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const show = showSchema.parse((await searchParams).show)
  const page = await getWishlistPage(user.id, show)

  return <WishlistView {...page} />
}
