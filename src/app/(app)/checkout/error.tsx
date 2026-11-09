"use client"

import { useEffect } from "react"

import { CheckoutError } from "@/components/checkout/checkout-error"

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

  return <CheckoutError onRetry={unstable_retry} />
}
