"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import type { DeleteTarget } from "./types"

import { errorMessage } from "../_utils/watches-client"

/** One delete per kind: resolves with the success toast text, throws on failure. */
export type DeleteRunners = {
  [K in DeleteTarget["kind"]]: (
    target: Extract<DeleteTarget, { kind: K }>
  ) => Promise<string>
}

export function useDeleteConfirm({ run }: { run: DeleteRunners }) {
  const [confirm, setConfirm] = useState<{
    open: boolean
    target: DeleteTarget | null
  }>({ open: false, target: null })
  // pending until the delete and its refresh are done, so the dialog closes
  // in the same commit that removes the item from the page
  const [deleting, startDeleting] = useTransition()

  const ask = (target: DeleteTarget) => setConfirm({ open: true, target })

  const onOpenChange = (open: boolean) => {
    if (!deleting) setConfirm((c) => ({ ...c, open }))
  }

  const confirmDelete = () => {
    const target = confirm.target
    if (!target) return
    startDeleting(async () => {
      try {
        // TS can't pair run[kind] with the narrowed target on its own
        const runner = run[target.kind] as (t: DeleteTarget) => Promise<string>
        const message = await runner(target)
        startDeleting(() => setConfirm((c) => ({ ...c, open: false })))
        toast.success(message)
      } catch (error) {
        toast.error(errorMessage(error, "Delete failed."))
      }
    })
  }

  return {
    open: confirm.open,
    target: confirm.target,
    deleting,
    ask,
    onOpenChange,
    confirmDelete,
  }
}
