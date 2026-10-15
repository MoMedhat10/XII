import "server-only"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

export async function requireAdmin() {
  const user = await getCurrentUser()

  if (!user) redirect("/login")
  if (user.role !== "ADMIN") notFound()
    
  return user
}