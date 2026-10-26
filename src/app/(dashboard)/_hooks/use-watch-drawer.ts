"use client"

import { useState } from "react"
import { toast } from "sonner"

import type { DeleteTarget } from "@/components/dashboard/watches/confirm-delete-dialog"
import type { WatchDrawerState } from "@/components/dashboard/watches/watch-drawer"

import type { AdminWatch } from "../_data/types"
import type { WatchFormInput } from "../_utils/watch-schema"
import { errorMessage } from "../_utils/watches-client"
import {
  createWatch,
  deleteWatch,
  setWatchActive,
  updateWatch,
} from "../actions/watches"
import type { WatchList } from "./use-watch-list"

/** The create/edit drawer, plus the other watch-level actions. */
export function useWatchDrawer({ list }: { list: WatchList }) {
  // Keeps its last subject while closing, so the exit animation never
  // renders empty content.
  const [drawer, setDrawer] = useState<{
    open: boolean
    state: WatchDrawerState
  }>({ open: false, state: { mode: "create", brandId: "" } })
  const [saving, setSaving] = useState(false)

  const openNew = (brandId: string) =>
    setDrawer({ open: true, state: { mode: "create", brandId } })

  const openEdit = (watch: AdminWatch) =>
    setDrawer({ open: true, state: { mode: "edit", watch } })

  const close = () => setDrawer((d) => ({ ...d, open: false }))

  /** Ignored while saving, so the drawer can't close mid-request. */
  const onOpenChange = (open: boolean) => {
    if (!saving) setDrawer((d) => ({ ...d, open }))
  }

  const createDraft = async (values: WatchFormInput) => {
    // always created as a draft with no images; both are added from the row.
    // The action's refresh shows it in the list when it matches the filters.
    const res = await createWatch(values)
    if (!res.success) throw new Error(res.message) // drawer stays open + toast
    close()
    toast.success(`${res.message} · ${res.data.name}`)
  }

  const editWatch = async (existing: AdminWatch, values: WatchFormInput) => {
    const res = await updateWatch({
      ...values,
      id: existing.id,
      // the version the drawer opened, so concurrent saves are caught
      updatedAt: existing.updatedAt,
    })
    if (!res.success) throw new Error(res.message)
    const saved = res.data
    list.patchWatch(existing.id, (w) => ({
      ...saved,
      // keep upload placeholders that started while the drawer was open
      images: list.imageBusyIds.has(w.id) ? w.images : saved.images,
    }))
    close()
    toast.success(`${res.message} · ${saved.name}`)
  }

  /** Resolves when saved; throws to keep the drawer open. */
  const save = async (values: WatchFormInput) => {
    const { state } = drawer
    setSaving(true)
    try {
      if (state.mode === "edit") await editWatch(state.watch, values)
      else await createDraft(values)
    } finally {
      setSaving(false)
    }
  }

  const toggleLive = async (watch: AdminWatch) => {
    const next = !watch.isActive
    list.patchWatch(watch.id, (w) => ({ ...w, isActive: next }))
    list.setPending(watch.id, true)
    try {
      // the server refuses to publish a watch without images
      const res = await setWatchActive({ id: watch.id, isActive: next })
      if (!res.success) throw new Error(res.message)
      toast.success(`${res.message} · ${watch.name}`)
    } catch (error) {
      list.patchWatch(watch.id, (w) => ({ ...w, isActive: !next }))
      toast.error(errorMessage(error, "Couldn't update the watch."))
    } finally {
      list.setPending(watch.id, false)
    }
  }

  /**
   * Run by the delete confirmation. Also removes the watch's images; brand
   * counts and the page refill come back with the action's refresh.
   */
  const remove = async (target: Extract<DeleteTarget, { kind: "watch" }>) => {
    const res = await deleteWatch({ id: target.id })
    if (!res.success) throw new Error(res.message)
    list.removeWatch(target.id)
    setDrawer((d) =>
      d.state.mode === "edit" && d.state.watch.id === target.id
        ? { ...d, open: false }
        : d
    )
    return `Deleted · ${target.name}`
  }

  return {
    drawer,
    saving,
    openNew,
    openEdit,
    onOpenChange,
    save,
    toggleLive,
    remove,
  }
}
