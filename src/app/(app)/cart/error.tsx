"use client"

import { useEffect } from "react"

import { CartError } from "@/components/cart/cart-error"

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

  return <CartError onRetry={unstable_retry} />
}
