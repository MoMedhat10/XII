"use client"

import { useEffect } from "react"

import { OrdersError } from "@/components/orders/orders-error"

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

  return <OrdersError onRetry={unstable_retry} />
}
