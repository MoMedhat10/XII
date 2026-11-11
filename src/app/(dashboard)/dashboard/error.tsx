"use client"

import { useEffect, useTransition } from "react"

import { OverviewHeader } from "@/components/dashboard/overview/overview-header"
import { OverviewError } from "@/components/dashboard/overview/overview-states"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  const [retrying, startTransition] = useTransition()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <OverviewHeader />
      <OverviewError
        retrying={retrying}
        onRetry={() => startTransition(unstable_retry)}
      />
    </>
  )
}
