"use client"

import type { AdminOrderDetail } from "@/app/(dashboard)/dashboard/orders/_data/types"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import { btn, btnDanger, btnGold, btnOutline, portalTheme } from "../styles"

export type OrderConfirmKind = "deliver" | "cancel"

const COPY: Record<
  OrderConfirmKind,
  { eyebrow: string; confirm: string; pending: string; back: string }
> = {
  deliver: {
    eyebrow: "Mark delivered",
    confirm: "Mark delivered",
    pending: "Saving…",
    back: "Back",
  },
  cancel: {
    eyebrow: "Cancel order",
    confirm: "Cancel order",
    pending: "Cancelling…",
    // "Cancel" next to "Cancel order" would be confusing
    back: "Keep order",
  },
}

export function OrderConfirmDialog({
  open,
  kind,
  detail,
  pending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  kind: OrderConfirmKind
  detail: AdminOrderDetail | undefined
  pending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const copy = COPY[kind]
  const danger = kind === "cancel"
  const o = detail?.order
  const ref = (
    <strong className="font-semibold text-foreground">{o?.ref}</strong>
  )

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
          "w-[min(460px,calc(100vw-32px))] gap-[18px] bg-background p-6 data-[size=default]:max-w-none sm:p-7 data-[size=default]:sm:max-w-none",
          danger
            ? "border-danger shadow-[12px_12px_0_var(--foreground)]"
            : "border-foreground shadow-[12px_12px_0_var(--gold)]"
        )}
      >
        <div className="flex items-center gap-3.5">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-12 shrink-0 items-center justify-center border-4 font-heading text-[22px] font-bold",
              danger ? "border-danger text-danger" : "border-gold text-gold"
            )}
          >
            {danger ? "!" : "✓"}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span
              className={cn(
                "font-heading text-xs leading-4 font-bold tracking-[1.5px] uppercase",
                danger ? "text-danger" : "text-gold"
              )}
            >
              {copy.eyebrow}
            </span>
            <AlertDialogTitle className="font-heading text-[28px] leading-[1.1] font-bold tracking-[-0.02em]">
              Are you sure?
            </AlertDialogTitle>
          </div>
        </div>

        <AlertDialogDescription className="text-[15px] leading-6 text-pretty text-muted-foreground">
          {o &&
            (danger ? (
              <>
                {ref} is cancelled and won&apos;t ship.{" "}
                <strong className="font-semibold text-foreground">
                  {o.itemCount} {o.itemCount === 1 ? "piece goes" : "pieces go"}{" "}
                  back in stock
                </strong>{" "}
                and the customer is emailed that {formatCents(o.totalCents)}{" "}
                will be refunded. This can&apos;t be undone.
              </>
            ) : (
              <>
                {ref} is marked as signed for by the customer. It can&apos;t be
                changed afterwards.
              </>
            ))}
        </AlertDialogDescription>

        <div className="flex gap-3">
          <AlertDialogCancel
            disabled={pending}
            className={cn(btn, btnOutline, "flex-1 px-4")}
          >
            {copy.back}
          </AlertDialogCancel>
          {/* A plain button (not AlertDialogAction) so it stays open while working. */}
          <Button
            type="button"
            disabled={pending || !detail}
            onClick={onConfirm}
            className={cn(btn, danger ? btnDanger : btnGold, "flex-1 px-4")}
          >
            {pending && <Spinner aria-hidden="true" />}
            {pending ? copy.pending : copy.confirm}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
