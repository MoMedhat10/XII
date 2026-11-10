"use client"

import { useState } from "react"
import { toast } from "sonner"

import type { DeleteTarget, WatchDrawerState } from "./types"

import type { AdminWatch } from "../_data/types"
import type { WatchFormInput } from "../_utils/watch-schema"
import { toServerError } from "../../../_utils/action-client"
import {
  useDeleteWatch,
  useSaveWatch,
  useSetWatchActive,
} from "./admin-mutations"

export function useWatchDrawer() {
  // Keeps its last subject while closing, so the exit animation never
  // renders empty content.
  const [drawer, setDrawer] = useState<{
    open: boolean
    state: WatchDrawerState
  }>({ open: false, state: { mode: "create", brandId: "" } })

  // `isPending` stays true until the action *and* the list refetch are done,
  // so the drawer can't be submitted twice or close before the list updates
  const saveMutation = useSaveWatch()
  const setActive = useSetWatchActive()
  const deleteMutation = useDeleteWatch()

  const openWith = (state: WatchDrawerState) => {
    saveMutation.reset() // forget the previous opening's error
    setDrawer({ open: true, state })
  }

  const openNew = (brandId: string) => openWith({ mode: "create", brandId })
  const openEdit = (watch: AdminWatch) => openWith({ mode: "edit", watch })

  const onOpenChange = (open: boolean) => {
    if (!saveMutation.isPending) setDrawer((d) => ({ ...d, open }))
  }

  const save = (values: WatchFormInput) =>
    saveMutation.mutate(
      { values, state: drawer.state },
      {
        onSuccess: (res) => {
          setDrawer((d) => ({ ...d, open: false }))
          toast.success(`${res.message} · ${res.data.name}`)
        },
      }
    )

  const toggleLive = (watch: AdminWatch) =>
    setActive.mutate({ watch, isActive: !watch.isActive })

  /** Run by the delete confirmation; resolves once the list has refetched. */
  const remove = async (target: Extract<DeleteTarget, { kind: "watch" }>) => {
    await deleteMutation.mutateAsync({ id: target.id })
    setDrawer((d) =>
      d.state.mode === "edit" && d.state.watch.id === target.id
        ? { ...d, open: false }
        : d
    )
    return `Deleted · ${target.name}`
  }

  return {
    drawer,
    saving: saveMutation.isPending,
    serverError: toServerError(saveMutation.error),
    openNew,
    openEdit,
    onOpenChange,
    save,
    toggleLive,
    remove,
  }
}
