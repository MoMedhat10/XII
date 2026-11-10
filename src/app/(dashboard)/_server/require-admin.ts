import "server-only"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

/** For pages, layouts and actions: redirects to login, or 404s non-admins. */
export async function requireAdmin() {
  const user = await getCurrentUser()

  if (!user) redirect("/login")
  if (user.role !== "ADMIN") notFound()

  return user
}

/**
 * For route handlers, where a redirect would hand fetch() an HTML page.
 * Returns an error response to send back, or null when the caller is an admin.
 */
export async function adminApiGuard(): Promise<Response | null> {
  const user = await getCurrentUser()

  if (!user) {
    return Response.json(
      { message: "Your session expired. Sign in again." },
      { status: 401 }
    )
  }
  if (user.role !== "ADMIN") {
    return Response.json({ message: "Not allowed." }, { status: 403 })
  }
  return null
}
