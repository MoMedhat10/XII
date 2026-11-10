import type { Metadata } from "next"
import { cookies } from "next/headers"

import { SIDEBAR_COOKIE } from "@/components/dashboard/admin-nav"
import { AdminShell } from "@/components/dashboard/admin-shell"
import { requireAdmin } from "./_server/require-admin"

export const metadata: Metadata = {
  title: "Admin — XII",
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, cookieStore] = await Promise.all([requireAdmin(), cookies()])
  const collapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "collapsed"

  return (
    <AdminShell
      user={{ username: user.username, email: user.email }}
      defaultCollapsed={collapsed}
    >
      {children}
    </AdminShell>
  )
}
