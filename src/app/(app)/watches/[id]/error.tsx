"use client"

import { useEffect } from "react"

import { WatchError } from "@/components/watch/watch-error"

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

  return <WatchError onRetry={unstable_retry} />
}
