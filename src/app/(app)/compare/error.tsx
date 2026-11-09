"use client"

import { useEffect } from "react"

import { CompareError } from "@/components/compare/compare-error"

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

  return <CompareError onRetry={unstable_retry} />
}
