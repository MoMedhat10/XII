import type { AdminUserRow } from "@/app/(dashboard)/dashboard/users/_data/types"
import { formatOrderDate } from "@/app/(app)/orders/_utils/order-format"
import { cn } from "@/lib/utils"

/** "9 Nov 2026", or "—" when there's no date. */
export const formatDay = (iso: string | null) =>
  iso ? formatOrderDate(new Date(iso)) : "—"

const badge =
  "inline-block border-2 px-1.5 py-px font-heading text-[10px] leading-4 font-bold tracking-[1.5px] uppercase"

/** Account state at a glance. Red only for suspended: it's the problem state. */
export function UserBadges({
  user,
  isViewer = false,
  className,
}: {
  user: Pick<AdminUserRow, "role" | "verifiedAt" | "suspendedAt">
  isViewer?: boolean
  className?: string
}) {
  return (
    <span className={cn("flex flex-wrap gap-1.5", className)}>
      {isViewer && (
        <span className={cn(badge, "border-gold bg-gold text-black")}>You</span>
      )}
      {user.role === "ADMIN" && (
        <span className={cn(badge, "border-foreground text-foreground")}>
          Admin
        </span>
      )}
      {user.suspendedAt && (
        <span className={cn(badge, "border-danger bg-danger text-black")}>
          Suspended
        </span>
      )}
      {!user.verifiedAt && (
        <span className={cn(badge, "border-gold text-gold")}>Unverified</span>
      )}
    </span>
  )
}
