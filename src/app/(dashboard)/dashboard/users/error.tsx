"use client"

import { useEffect, useTransition } from "react"

import { UsersHeader } from "@/components/dashboard/users/users-header"
import { UsersError } from "@/components/dashboard/users/users-states"

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
      <UsersHeader summary={null} />
      <UsersError
        retrying={retrying}
        onRetry={() => startTransition(unstable_retry)}
      />
    </>
  )
}
