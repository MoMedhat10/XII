"use client"

import { startTransition, useActionState, useState } from "react"
import { toast } from "sonner"

import type { DeleteTarget, FormResult, WatchDrawerState } from "./types"

import type { AdminWatch } from "../_data/types"
import {
  EDITABLE_WATCH_FIELDS,
  type WatchFormInput,
} from "../_utils/watch-schema"
import { errorMessage, pick } from "../_utils/watches-client"
import {
  createWatch,
  deleteWatch,
  setWatchActive,
  updateWatch,
} from "../actions/watches"
import type { WatchList } from "./use-watch-list"

type SavePayload = {
  values: WatchFormInput
  state: WatchDrawerState
  openId: number
}

export function useWatchDrawer({ list }: { list: WatchList }) {
  // Keeps its last subject while closing, so the exit animation never
  // renders empty content.
  // `openId` tells this opening's server errors apart from an earlier one's
  const [drawer, setDrawer] = useState<{
    open: boolean
    state: WatchDrawerState
    openId: number
  }>({ open: false, state: { mode: "create", brandId: "" }, openId: 0 })

  // `saving` stays true until the action *and* its refresh are done, so the
  // drawer can't be submitted twice or closed before the list updates
  const [saveResult, dispatchSave, saving] = useActionState(saveWatch, {
    openId: -1,
  })

  const openNew = (brandId: string) =>
    setDrawer((d) => ({
      open: true,
      state: { mode: "create", brandId },
      openId: d.openId + 1,
    }))

  const openEdit = (watch: AdminWatch) =>
    setDrawer((d) => ({
      open: true,
      state: { mode: "edit", watch },
      openId: d.openId + 1,
    }))

  const close = () => setDrawer((d) => ({ ...d, open: false }))

  const onOpenChange = (open: boolean) => {
    if (!saving) setDrawer((d) => ({ ...d, open }))
  }

  async function saveWatch(
    _prev: FormResult,
    { values, state, openId }: SavePayload
  ): Promise<FormResult> {
    try {
      // new watches are always drafts; the refresh shows them when they
      // match the filters
      const res =
        state.mode === "edit"
          ? await updateWatch({
              ...values,
              id: state.watch.id,
              // the fields as the drawer opened them, so concurrent edits are caught
              original: pick(state.watch, EDITABLE_WATCH_FIELDS),
            })
          : await createWatch(values)
      if (!res.success) {
        return {
          openId,
          error: { message: res.message, fieldErrors: res.fieldErrors },
        }
      }
      // closes in the same commit as the refreshed list
      startTransition(close)
      toast.success(`${res.message} · ${res.data.name}`)
      return { openId }
    } catch (error) {
      return { openId, error: { message: errorMessage(error, "Save failed.") } }
    }
  }

  const save = (values: WatchFormInput) =>
    startTransition(() =>
      dispatchSave({ values, state: drawer.state, openId: drawer.openId })
    )

  /** Only errors from this opening of the drawer. */
  const serverError =
    saveResult.openId === drawer.openId ? saveResult.error : undefined

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
    serverError,
    openNew,
    openEdit,
    onOpenChange,
    save,
    toggleLive,
    remove,
  }
}
