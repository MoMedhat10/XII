"use client"

import { startTransition, useState, useTransition } from "react"
import { toast } from "sonner"

import type { DeleteTarget, WatchDrawerState } from "./types"

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

export function useWatchDrawer({ list }: { list: WatchList }) {
  // Keeps its last subject while closing, so the exit animation never
  // renders empty content.
  const [drawer, setDrawer] = useState<{
    open: boolean
    state: WatchDrawerState
  }>({ open: false, state: { mode: "create", brandId: "" } })
  // pending until the action *and* its refresh are done, so the drawer
  // can't be submitted twice or closed before the list shows the result
  const [saving, startSaving] = useTransition()

  const openNew = (brandId: string) =>
    setDrawer({ open: true, state: { mode: "create", brandId } })

  const openEdit = (watch: AdminWatch) =>
    setDrawer({ open: true, state: { mode: "edit", watch } })

  const close = () => setDrawer((d) => ({ ...d, open: false }))

  const onOpenChange = (open: boolean) => {
    if (!saving) setDrawer((d) => ({ ...d, open }))
  }

  /** Resolves when saved; rejects to keep the drawer open (it toasts). */
  const save = (values: WatchFormInput) =>
    new Promise<void>((resolve, reject) => {
      const { state } = drawer
      startSaving(async () => {
        try {
          // new watches are always drafts; the refresh shows them when
          // they match the filters
          const res =
            state.mode === "edit"
              ? await updateWatch({
                  ...values,
                  id: state.watch.id,
                  // the version the drawer opened, so concurrent saves are caught
                  updatedAt: state.watch.updatedAt,
                })
              : await createWatch(values)
          if (!res.success) throw new Error(res.message)
          // closes in the same commit as the refreshed list
          startSaving(close)
          toast.success(`${res.message} · ${res.data.name}`)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })

  const toggleLive = (watch: AdminWatch) => {
    const next = !watch.isActive
    list.setPending(watch.id, true)
    startTransition(async () => {
      list.applyOptimistic({ type: "active", id: watch.id, isActive: next })
      try {
        // the server refuses to publish a watch without images
        const res = await setWatchActive({ id: watch.id, isActive: next })
        if (!res.success) throw new Error(res.message)
        toast.success(`${res.message} · ${watch.name}`)
      } catch (error) {
        // no manual undo: the optimistic value drops when this ends
        toast.error(errorMessage(error, "Couldn't update the watch."))
      } finally {
        startTransition(() => list.setPending(watch.id, false))
      }
    })
  }

  /** Run by the delete confirmation. The refresh removes the row. */
  const remove = async (target: Extract<DeleteTarget, { kind: "watch" }>) => {
    const res = await deleteWatch({ id: target.id })
    if (!res.success) throw new Error(res.message)
    startTransition(() =>
      setDrawer((d) =>
        d.state.mode === "edit" && d.state.watch.id === target.id
          ? { ...d, open: false }
          : d
      )
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
