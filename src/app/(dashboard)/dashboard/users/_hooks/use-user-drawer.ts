"use client"

import { useState } from "react"

/** The actions that ask "are you sure?" first. Mark verified doesn't. */
export type ConfirmKind = "sign-out" | "suspend" | "delete"

export function useUserDrawer() {
  // `id` outlives `open` so the closing animation still has content
  const [drawer, setDrawer] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })
  const [confirm, setConfirm] = useState<{ open: boolean; kind: ConfirmKind }>({
    open: false,
    kind: "delete",
  })

  const open = (id: string) => setDrawer({ open: true, id })

  const onOpenChange = (next: boolean) =>
    setDrawer((d) => ({ ...d, open: next }))

  /** After a delete: close, and stop the detail query asking for a deleted id. */
  const forget = (id: string) => {
    setDrawer((d) => (d.id === id ? { open: false, id: null } : d))
    setConfirm((c) => ({ ...c, open: false }))
  }

  const ask = (kind: ConfirmKind) => setConfirm({ open: true, kind })
  const closeConfirm = () => setConfirm((c) => ({ ...c, open: false }))

  return {
    open: drawer.open,
    id: drawer.id,
    openUser: open,
    onOpenChange,
    forget,
    confirm,
    ask,
    closeConfirm,
  }
}

export type UserDrawerApi = ReturnType<typeof useUserDrawer>
