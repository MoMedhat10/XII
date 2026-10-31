import { Suspense } from "react"
import type { Metadata } from "next"

import { CatalogPageFallback } from "@/components/watches/catalog-states"
import { CatalogView } from "@/components/watches/catalog-view"

export const metadata: Metadata = {
  title: "All Watches — XII",
  description:
    "Browse the XII catalog: search, filter by brand and price, and save pieces to your vitrine.",
}

export default function WatchesPage() {
  
  return (
    <Suspense fallback={<CatalogPageFallback />}>
      <CatalogView />
    </Suspense>
  )
}
