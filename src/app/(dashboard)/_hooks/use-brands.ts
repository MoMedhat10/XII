"use client"

import { startTransition, useActionState, useRef, useState } from "react"
import { toast } from "sonner"

import type { BrandDialogState, DeleteTarget, FormResult } from "./types"

import type { AdminBrand } from "../_data/types"
import { uploadBrandLogo } from "../_utils/brand-upload"
import type { BrandFormInput } from "../_utils/brand-schema"
import { errorMessage } from "../_utils/watches-client"
import { createBrand, deleteBrand, updateBrand } from "../actions/brands"
import type { WatchFiltersApi } from "./use-watch-filters"

type SavePayload = {
  values: BrandFormInput
  state: BrandDialogState
  openId: number
}

const logoRequired = {
  message: "Logo is required.",
  fieldErrors: { logoUrl: "Logo is required." },
}

export function useBrands({ filters }: { filters: WatchFiltersApi }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  // `openId` tells this opening's server errors apart from an earlier one's
  const [dialog, setDialog] = useState<{
    open: boolean
    state: BrandDialogState
    openId: number
  }>({ open: false, state: { brand: null, fromWatch: false }, openId: 0 })
  // `saving` stays true until the action and its refresh are done
  const [saveResult, dispatchSave, saving] = useActionState(saveBrand, {
    openId: -1,
  })
  const [freshId, setFreshId] = useState<string | null>(null)
  /** set when the dialog was opened from the watch drawer: selects the new brand there */
  const selectInWatchDrawer = useRef<((brand: AdminBrand) => void) | null>(null)

  const openWith = (state: BrandDialogState) =>
    setDialog((d) => ({ open: true, state, openId: d.openId + 1 }))

  const openNew = (select?: (brand: AdminBrand) => void) => {
    selectInWatchDrawer.current = select ?? null
    openWith({ brand: null, fromWatch: !!select })
  }

  const openEdit = (brand: AdminBrand) => {
    selectInWatchDrawer.current = null
    openWith({ brand, fromWatch: false })
  }

  const onDialogOpenChange = (open: boolean) => {
    if (saving) return
    if (!open) selectInWatchDrawer.current = null
    setDialog((d) => ({ ...d, open }))
  }

  async function saveBrand(
    _prev: FormResult,
    { values, state, openId }: SavePayload
  ): Promise<FormResult> {
    const { brand: existing, fromWatch } = state
    try {
      if (!existing && !values.logoFile) {
        return { openId, error: logoRequired }
      }
      const newKey = values.logoFile
        ? await uploadBrandLogo(values.logoFile)
        : null

      const res = existing
        ? await updateBrand({
            id: existing.id,
            name: values.name,
            description: values.description,
            logo: newKey
              ? { action: "replace", key: newKey }
              : { action: "keep" },
          })
        : await createBrand({
            name: values.name,
            description: values.description,
            logoKey: newKey!,
          })
      if (!res.success) {
        const { logoKey, ...rest } = res.fieldErrors ?? {}
        // the form's field for the logo is logoUrl
        const fieldErrors = logoKey ? { ...rest, logoUrl: logoKey } : rest
        return { openId, error: { message: res.message, fieldErrors } }
      }
      const saved = res.data

      // the brand list itself comes back with the action's refresh; these
      // land in the same commit
      startTransition(() => {
        if (!existing) {
          setFreshId(saved.id)
          if (fromWatch) selectInWatchDrawer.current?.(saved)
        }
        selectInWatchDrawer.current = null
        setDialog((d) => ({ ...d, open: false }))
      })
      toast.success(`${res.message} · ${saved.name}`)
      return { openId }
    } catch (error) {
      return { openId, error: { message: errorMessage(error, "Save failed.") } }
    }
  }

  const save = (values: BrandFormInput) =>
    startTransition(() =>
      dispatchSave({ values, state: dialog.state, openId: dialog.openId })
    )

  /** Only errors from this opening of the dialog. */
  const serverError =
    saveResult.openId === dialog.openId ? saveResult.error : undefined

  const remove = async (target: Extract<DeleteTarget, { kind: "brand" }>) => {
    const res = await deleteBrand(target.id)
    if (!res.success) throw new Error(res.message)
    if (filters.filters.brand === target.id) {
      filters.updateFilters({ brand: "" })
    }
    return `Brand deleted · ${target.name}`
  }

  return {
    drawerOpen,
    setDrawerOpen,
    dialog,
    saving,
    serverError,
    freshId,
    openNew,
    openEdit,
    onDialogOpenChange,
    save,
    remove,
  }
}
