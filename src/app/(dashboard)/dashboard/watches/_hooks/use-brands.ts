"use client"

import { useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { BrandDialogState, DeleteTarget } from "./types"

import type { AdminBrand } from "../_data/types"
import { adminKeys } from "../_utils/admin-keys"
import { uploadBrandLogo } from "../_utils/brand-upload"
import type { BrandFormInput } from "../_utils/brand-schema"
import { createBrand, updateBrand } from "../_actions/brands"
import {
  ActionFailure,
  toServerError,
  unwrap,
} from "../../../_utils/action-client"
import { useDeleteBrand } from "./admin-mutations"
import type { WatchFiltersApi } from "./use-watch-filters"

const logoRequired = new ActionFailure("Logo is required.", {
  logoUrl: "Logo is required.",
})

/** Uploads the logo (if a new one was picked), then creates or updates the brand. */
async function saveBrand({
  values,
  existing,
}: {
  values: BrandFormInput
  existing: AdminBrand | null
}) {
  if (!existing && !values.logoFile) throw logoRequired
  const newKey = values.logoFile ? await uploadBrandLogo(values.logoFile) : null

  const res = existing
    ? await updateBrand({
        id: existing.id,
        name: values.name,
        description: values.description,
        logo: newKey ? { action: "replace", key: newKey } : { action: "keep" },
      })
    : await createBrand({
        name: values.name,
        description: values.description,
        logoKey: newKey!,
      })

  if (!res.success) {
    // the form's field for the logo is logoUrl
    const { logoKey, ...rest } = res.fieldErrors ?? {}
    throw new ActionFailure(
      res.message,
      logoKey ? { ...rest, logoUrl: logoKey } : rest
    )
  }
  return unwrap(res)
}

export function useBrands({ filters }: { filters: WatchFiltersApi }) {
  const queryClient = useQueryClient()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dialog, setDialog] = useState<{
    open: boolean
    state: BrandDialogState
  }>({ open: false, state: { brand: null, fromWatch: false } })
  const [freshId, setFreshId] = useState<string | null>(null)
  /** set when the dialog was opened from the watch drawer: selects the new brand there */
  const selectInWatchDrawer = useRef<((brand: AdminBrand) => void) | null>(null)

  const saveMutation = useMutation({
    mutationFn: saveBrand,
    // returned, so the dialog stays "saving" until the brand list is fresh
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: adminKeys.brands() }),
  })
  const deleteMutation = useDeleteBrand()

  const openWith = (state: BrandDialogState) => {
    saveMutation.reset()
    setDialog({ open: true, state })
  }

  const openNew = (select?: (brand: AdminBrand) => void) => {
    selectInWatchDrawer.current = select ?? null
    openWith({ brand: null, fromWatch: !!select })
  }

  const openEdit = (brand: AdminBrand) => {
    selectInWatchDrawer.current = null
    openWith({ brand, fromWatch: false })
  }

  const onDialogOpenChange = (open: boolean) => {
    if (saveMutation.isPending) return
    if (!open) selectInWatchDrawer.current = null
    setDialog((d) => ({ ...d, open }))
  }

  const save = (values: BrandFormInput) => {
    const { brand: existing, fromWatch } = dialog.state
    saveMutation.mutate(
      { values, existing },
      {
        onSuccess: ({ message, data: saved }) => {
          if (!existing) {
            setFreshId(saved.id)
            if (fromWatch) selectInWatchDrawer.current?.(saved)
          }
          selectInWatchDrawer.current = null
          setDialog((d) => ({ ...d, open: false }))
          toast.success(`${message} · ${saved.name}`)
        },
      }
    )
  }

  const remove = async (target: Extract<DeleteTarget, { kind: "brand" }>) => {
    await deleteMutation.mutateAsync({ id: target.id })
    if (filters.filters.brand === target.id) {
      filters.updateFilters({ brand: "" })
    }
    return `Brand deleted · ${target.name}`
  }

  return {
    drawerOpen,
    setDrawerOpen,
    dialog,
    saving: saveMutation.isPending,
    serverError: toServerError(saveMutation.error),
    freshId,
    openNew,
    openEdit,
    onDialogOpenChange,
    save,
    remove,
  }
}
