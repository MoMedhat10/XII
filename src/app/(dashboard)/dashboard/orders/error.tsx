"use client"

import { useEffect, useTransition } from "react"

import { OrdersHeader } from "@/components/dashboard/orders/orders-header"
import { OrdersError } from "@/components/dashboard/orders/orders-states"

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
      <OrdersHeader summary={null} />
      <OrdersError
        retrying={retrying}
        onRetry={() => startTransition(unstable_retry)}
      />
    </>
  )
}
