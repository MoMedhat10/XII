"use client"

import { useState } from "react"
import { toast } from "sonner"

import type { DeleteTarget } from "@/components/dashboard/watches/confirm-delete-dialog"

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
  const [deleting, setDeleting] = useState(false)

  const ask = (target: DeleteTarget) => setConfirm({ open: true, target })

  const onOpenChange = (open: boolean) => {
    if (!deleting) setConfirm((c) => ({ ...c, open }))
  }

  const confirmDelete = async () => {
    const target = confirm.target
    if (!target) return
    setDeleting(true)
    try {
      // TS can't pair run[kind] with the narrowed target on its own
      const runner = run[target.kind] as (t: DeleteTarget) => Promise<string>
      const message = await runner(target)
      setConfirm((c) => ({ ...c, open: false }))
      toast.success(message)
    } catch (error) {
      toast.error(errorMessage(error, "Delete failed."))
    } finally {
      setDeleting(false)
    }
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
