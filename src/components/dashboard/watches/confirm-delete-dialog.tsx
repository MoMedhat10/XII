/* eslint-disable @next/next/no-img-element -- small storage thumbnail in the image delete dialog */
"use client"

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

import { btn, btnGold, btnOutline, eyebrowSm, portalTheme } from "./watch-utils"

export type DeleteTarget =
  | { kind: "watch"; id: string; name: string }
  | { kind: "brand"; id: string; name: string }
  | {
      kind: "image"
      id: string
      name: string
      watchId: string
      url: string
      position: number
      isCover: boolean
      isLastOfLive: boolean
    }

const BODY: Record<Exclude<DeleteTarget["kind"], "image">, string> = {
  watch:
    "will be permanently removed from inventory, along with its images. Customers who saved it lose it from their wishlist. This can't be undone.",
  brand:
    "will be permanently removed. Its logo and description go with it. This can't be undone.",
}

const EYEBROW: Record<DeleteTarget["kind"], string> = {
  watch: "Delete watch",
  brand: "Delete brand",
  image: "Delete image",
}

function Body({ target }: { target: DeleteTarget }) {
  if (target.kind !== "image") {
    return (
      <>
        <strong className="font-semibold text-foreground">{target.name}</strong>{" "}
        {BODY[target.kind]}
      </>
    )
  }
  return (
    <>
      Image {target.position} of{" "}
      <strong className="font-semibold text-foreground">{target.name}</strong>{" "}
      will be permanently removed. This can&apos;t be undone.
      {target.isCover && <> The next image becomes the cover.</>}
      {target.isLastOfLive && (
        <strong className="mt-2 block font-semibold text-gold">
          This is its only image, so the watch will be unpublished and moved
          to drafts.
        </strong>
      )}
    </>
  )
}

export function ConfirmDeleteDialog({
  open,
  target,
  pending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  target: DeleteTarget | null
  pending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          portalTheme,
          "w-[min(460px,calc(100vw-32px))] gap-[18px] border-gold bg-background p-6 shadow-[12px_12px_0_var(--foreground)] data-[size=default]:max-w-none sm:p-7 data-[size=default]:sm:max-w-none"
        )}
      >
        <div className="flex items-center gap-3.5">
          {target?.kind === "image" ? (
            <img
              src={target.url}
              alt=""
              className="size-12 shrink-0 border-4 border-gold object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center border-4 border-gold font-heading text-[22px] font-bold text-gold"
            >
              !
            </span>
          )}
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className={eyebrowSm}>
              {EYEBROW[target?.kind ?? "watch"]}
            </span>
            <AlertDialogTitle className="font-heading text-[28px] leading-[1.1] font-bold tracking-[-0.02em]">
              Are you sure?
            </AlertDialogTitle>
          </div>
        </div>

        <AlertDialogDescription className="text-[15px] leading-6 text-pretty text-muted-foreground">
          {target && <Body target={target} />}
        </AlertDialogDescription>

        <div className="flex gap-3">
          <AlertDialogCancel
            disabled={pending}
            className={cn(btn, btnOutline, "flex-1 px-4")}
          >
            Cancel
          </AlertDialogCancel>
          {/* A plain button (not AlertDialogAction) so it stays open while deleting. */}
          <Button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={cn(btn, btnGold, "flex-1 px-4")}
          >
            {pending && <Spinner aria-hidden="true" />}
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
