import type { AdminUserSummary } from "@/app/(dashboard)/dashboard/users/_data/types"
import { cn } from "@/lib/utils"

import { PageHeader } from "../page-header"
import { pad } from "../styles"

export function UsersHeader({
  summary,
}: {
  /** null while loading or after an error */
  summary: AdminUserSummary | null
}) {
  const value = (n: number | undefined) => (n === undefined ? "—" : pad(n))
  const tiles = [
    { label: "Users", value: summary?.users },
    { label: "Customers", value: summary?.customers },
    { label: "Admins", value: summary?.admins },
    {
      label: "Suspended",
      value: summary?.suspended,
      danger: (summary?.suspended ?? 0) > 0,
    },
    { label: "New · 30 days", value: summary?.newLast30d },
  ]

  return (
    <>
      <PageHeader
        crumbs={["Admin", "Accounts", "Users"]}
        eyebrow={<>Accounts · {value(summary?.users)} Users</>}
        title="Users"
      />
      <dl className="grid grid-cols-2 border-b-2 border-surface-variant sm:grid-cols-5">
        {tiles.map(({ label, value: n, danger }, i) => (
          <div
            key={label}
            className={cn(
              "flex flex-col gap-1 py-5 pr-4",
              i > 0 && "sm:border-l-2 sm:border-surface-variant sm:pl-5",
              i % 2 === 1 &&
                "max-sm:border-l-2 max-sm:border-surface-variant max-sm:pl-4"
            )}
          >
            <dt className="font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase">
              {label}
            </dt>
            <dd
              className={cn(
                "font-heading text-3xl font-bold tabular-nums",
                danger && "text-danger"
              )}
            >
              {value(n)}
            </dd>
          </div>
        ))}
      </dl>
    </>
  )
}
