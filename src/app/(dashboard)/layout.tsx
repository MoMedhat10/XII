import type { Metadata } from "next"

import { AdminShell } from "@/components/dashboard/admin-shell"

export const metadata: Metadata = {
  title: "Admin — XII",
  robots: { index: false, follow: false },
}

// The UI runs on mock data for now. Gate it with `await requireAdmin()`
// (from ./_utils/require-admin) once the pages read real data.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminShell>{children}</AdminShell>
}
