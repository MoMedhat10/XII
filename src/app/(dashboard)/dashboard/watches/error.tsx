"use client"

import { useEffect } from "react"

import { WatchesHeader } from "@/components/dashboard/watches/watches-header"
import { WatchesError } from "@/components/dashboard/watches/watches-states"

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

  return (
    <>
      <WatchesHeader total={null} brandCount={null} disabled />
      <WatchesError onRetry={unstable_retry} />
    </>
  )
}
