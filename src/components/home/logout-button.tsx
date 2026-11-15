"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { logout } from "@/app/(auth)/_actions"
import { cn } from "@/lib/utils"

/** Signs out, drops the previous user's cached data and re-renders the page. */
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [pending, startTransition] = useTransition()

  const signOut = () => {
    startTransition(async () => {
      const result = await logout()

      if (!result.success) {
        toast.error(result.message)
      } else {
        toast.success(result.message)
        // drop the previous user's cached data (e.g. their saved hearts)
        queryClient.clear()
      }

      router.refresh()
    })
  }

  return { signOut, pending }
}

export function LogoutButton({
  className,
  children = "Logout",
  title,
}: {
  className?: string
  children?: React.ReactNode
  title?: string
}) {
  const { signOut, pending } = useLogout()

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      title={title}
      className={cn(className, "cursor-pointer disabled:opacity-50")}
    >
      {children}
    </button>
  )
}
