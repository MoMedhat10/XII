"use client"

import { useState } from "react"

/** The dialogs the drawer opens: a form for ship, "are you sure?" for the rest. */
export type OrderDialogKind = "ship" | "deliver" | "cancel"

export function useOrderDrawer() {
  // `id` outlives `open` so the closing animation still has content
  const [drawer, setDrawer] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })
  const [dialog, setDialog] = useState<{
    open: boolean
    kind: OrderDialogKind
  }>({ open: false, kind: "ship" })

  const openOrder = (id: string) => setDrawer({ open: true, id })

  const onOpenChange = (next: boolean) =>
    setDrawer((d) => ({ ...d, open: next }))

  const ask = (kind: OrderDialogKind) => setDialog({ open: true, kind })
  const closeDialog = () => setDialog((d) => ({ ...d, open: false }))

  return {
    open: drawer.open,
    id: drawer.id,
    openOrder,
    onOpenChange,
    dialog,
    ask,
    closeDialog,
  }
}

export type OrderDrawerApi = ReturnType<typeof useOrderDrawer>
