"use client"

import type { AdminUserDetail } from "@/app/(dashboard)/dashboard/users/_data/types"
import type { ConfirmKind } from "@/app/(dashboard)/dashboard/users/_hooks/use-user-drawer"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

import { btn, btnDanger, btnOutline, portalTheme } from "../styles"

const COPY: Record<
  ConfirmKind,
  { eyebrow: string; confirm: string; pending: string }
> = {
  "sign-out": {
    eyebrow: "Sign out everywhere",
    confirm: "Sign out",
    pending: "Signing out…",
  },
  suspend: {
    eyebrow: "Suspend account",
    confirm: "Suspend",
    pending: "Suspending…",
  },
  delete: {
    eyebrow: "Delete user",
    confirm: "Delete",
    pending: "Deleting…",
  },
}

function Body({
  kind,
  detail,
}: {
  kind: ConfirmKind
  detail: AdminUserDetail
}) {
  const name = (
    <strong className="font-semibold text-foreground">
      {detail.user.username}
    </strong>
  )
  const sessions = detail.sessions.active
  const orders = detail.user.orderCount

  if (kind === "sign-out") {
    return (
      <>
        {name} is signed out on {sessions === 1 ? "their" : `all ${sessions}`}{" "}
        device{sessions === 1 ? "" : "s"} right away. They can sign back in with
        their password.
      </>
    )
  }
  if (kind === "suspend") {
    return (
      <>
        {name} is signed out now and can&apos;t sign in until you unsuspend
        them. Their orders, cart and wishlist are kept.
      </>
    )
  }
  return (
    <>
      {name}&apos;s account, cart and wishlist are removed.{" "}
      {orders > 0 && (
        <strong className="font-semibold text-foreground">
          {orders} order{orders === 1 ? "" : "s"} stay in your records
        </strong>
      )}
      {orders > 0 && " under their email. "}
      This can&apos;t be undone.
    </>
  )
}

export function UserConfirmDialog({
  open,
  kind,
  detail,
  pending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  kind: ConfirmKind
  detail: AdminUserDetail | undefined
  pending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const copy = COPY[kind]
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next)
      }}
    >
      <AlertDialogContent
        className={cn(
          portalTheme,
          "w-[min(460px,calc(100vw-32px))] gap-[18px] border-danger bg-background p-6 shadow-[12px_12px_0_var(--foreground)] data-[size=default]:max-w-none sm:p-7 data-[size=default]:sm:max-w-none"
        )}
      >
        <div className="flex items-center gap-3.5">
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center border-4 border-danger font-heading text-[22px] font-bold text-danger"
          >
            !
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-heading text-xs leading-4 font-bold tracking-[1.5px] text-danger uppercase">
              {copy.eyebrow}
            </span>
            <AlertDialogTitle className="font-heading text-[28px] leading-[1.1] font-bold tracking-[-0.02em]">
              Are you sure?
            </AlertDialogTitle>
          </div>
        </div>

        <AlertDialogDescription className="text-[15px] leading-6 text-pretty text-muted-foreground">
          {detail && <Body kind={kind} detail={detail} />}
        </AlertDialogDescription>

        <div className="flex gap-3">
          <AlertDialogCancel
            disabled={pending}
            className={cn(btn, btnOutline, "flex-1 px-4")}
          >
            Cancel
          </AlertDialogCancel>
          {/* A plain button (not AlertDialogAction) so it stays open while working. */}
          <Button
            type="button"
            disabled={pending || !detail}
            onClick={onConfirm}
            className={cn(btn, btnDanger, "flex-1 px-4")}
          >
            {pending && <Spinner aria-hidden="true" />}
            {pending ? copy.pending : copy.confirm}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
