"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { logout } from "@/app/(auth)/_actions"
import { cn } from "@/lib/utils"

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logout()

      if (!result.success) {
        toast.error(result.message)
      } else {
        toast.success(result.message)
      }

      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className={cn(className, "cursor-pointer disabled:opacity-50")}
    >
      Logout
    </button>
  )
}
