"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { cancelOrder } from "@/app/(app)/orders/_actions/orders"
import {
  btn,
  btnGold,
  btnOutline,
  eyebrowSm,
  portalTheme,
} from "@/components/dashboard/watches/watch-utils"
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

export function CancelOrderButton({
  orderId,
  orderRef,
}: {
  orderId: string
  orderRef: string
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const confirm = () =>
    startTransition(async () => {
      const res = await cancelOrder({ orderId })
      if (!res.success) return void toast.error(res.message)
      setOpen(false)
      toast.success(res.message)
    })

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-[52px] cursor-pointer border-4 bg-background font-sans text-[13px] font-bold tracking-[1.5px] uppercase transition-colors hover:bg-foreground hover:text-black"
      >
        Cancel order
      </button>

      <AlertDialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <AlertDialogContent
          className={cn(
            portalTheme,
            "w-[min(460px,calc(100vw-32px))] gap-[18px] border-gold bg-background p-6 shadow-[12px_12px_0_var(--foreground)] data-[size=default]:max-w-none sm:p-7 data-[size=default]:sm:max-w-none"
          )}
        >
          <div className="flex items-center gap-3.5">
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center border-4 border-gold font-heading text-[22px] font-bold text-gold"
            >
              !
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className={eyebrowSm}>Cancel order</span>
              <AlertDialogTitle className="font-heading text-[28px] leading-[1.1] font-bold tracking-[-0.02em]">
                Are you sure?
              </AlertDialogTitle>
            </div>
          </div>

          <AlertDialogDescription className="text-[15px] leading-6 text-pretty text-muted-foreground">
            Order{" "}
            <strong className="font-semibold text-foreground">
              {orderRef}
            </strong>{" "}
            will be cancelled before it ships and the pieces return to the
            vitrine. This can&apos;t be undone.
          </AlertDialogDescription>

          <div className="flex gap-3">
            <AlertDialogCancel
              disabled={pending}
              className={cn(btn, btnOutline, "flex-1 px-4")}
            >
              Keep order
            </AlertDialogCancel>
            {/* A plain button (not AlertDialogAction) so it stays open while cancelling. */}
            <Button
              type="button"
              disabled={pending}
              onClick={confirm}
              className={cn(btn, btnGold, "flex-1 px-4")}
            >
              {pending && <Spinner aria-hidden="true" />}
              {pending ? "Cancelling…" : "Cancel order"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
