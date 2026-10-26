"use client"

import { useState } from "react"

import type { AdminBrand, AdminWatch, AdminWatchPage } from "../_data/types"
import { mergeServerWatches, toggleId } from "../_utils/watches-client"


export function useWatchList({
  data,
  brands: serverBrands,
}: {
  data: AdminWatchPage
  brands: AdminBrand[]
}) {
  const [watches, setWatches] = useState(data.watches)
  const [brands, setBrands] = useState(serverBrands)
  /** rows whose live toggle is saving */
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set())
  /** rows with an image upload or reorder in flight (image controls lock) */
  const [imageBusyIds, setImageBusyIds] = useState<ReadonlySet<string>>(
    new Set()
  )

  // Server props change after navigation, back/forward, and every action's
  // revalidatePath. Reset local state from them (React's "adjust state when a
  // prop changes" pattern), so the server stays the source of truth.
  const [synced, setSynced] = useState({ data, serverBrands })
  if (synced.data !== data || synced.serverBrands !== serverBrands) {
    if (synced.data !== data) {
      setWatches(mergeServerWatches(data.watches, watches, imageBusyIds))
    }
    if (synced.serverBrands !== serverBrands) setBrands(serverBrands)
    setSynced({ data, serverBrands })
  }

  const patchWatch = (id: string, update: (watch: AdminWatch) => AdminWatch) =>
    setWatches((list) => list.map((w) => (w.id === id ? update(w) : w)))

  const removeWatch = (id: string) =>
    setWatches((list) => list.filter((w) => w.id !== id))

  return {
    /** the server's page info and counts */
    data,
    watches,
    brands,
    setBrands,
    patchWatch,
    removeWatch,
    pendingIds,
    setPending: toggleId(setPendingIds),
    imageBusyIds,
    setImageBusy: toggleId(setImageBusyIds),
  }
}

export type WatchList = ReturnType<typeof useWatchList>
