"use client"

import { useEffect } from "react"

import { WishlistError } from "@/components/wishlist/wishlist-error"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <WishlistError onRetry={unstable_retry} />
}
