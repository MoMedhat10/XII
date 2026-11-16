"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Re-renders the current route's server components once, the shared header
 * included. Used on the order page right after checkout: placeOrder empties
 * the bag, but client navigation keeps the layout, so the header's bag badge
 * would stay stale. Refreshing here (not at checkout) avoids /checkout's
 * empty-bag redirect to /cart racing the navigation.
 */
export function RefreshOnMount() {
  const router = useRouter()
  useEffect(() => {
    router.refresh()
  }, [router])
  return null
}
