import type { Metadata } from "next"

import { AdminShell } from "@/components/dashboard/admin-shell"
import { requireAdmin } from "./_utils/require-admin"

export const metadata: Metadata = {
  title: "Admin — XII",
  robots: { index: false, follow: false },
}


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return <AdminShell>{children}</AdminShell>
}
