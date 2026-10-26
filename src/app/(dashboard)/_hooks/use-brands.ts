"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"

import type { BrandDialogState } from "@/components/dashboard/watches/brand-dialog"
import type { DeleteTarget } from "@/components/dashboard/watches/confirm-delete-dialog"

import type { AdminBrand } from "../_data/types"
import { uploadBrandLogo } from "../_utils/brand-upload"
import type { BrandFormInput } from "../_utils/watch-schema"
import { createBrand, deleteBrand, updateBrand } from "../actions/brands"
import type { WatchFiltersApi } from "./use-watch-filters"
import type { WatchList } from "./use-watch-list"

/** The brands drawer, the create/edit brand dialog, and brand deletes. */
export function useBrands({
  list,
  filters,
}: {
  list: WatchList
  filters: WatchFiltersApi
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Keeps its last subject while closing, like the watch drawer.
  const [dialog, setDialog] = useState<{
    open: boolean
    state: BrandDialogState
  }>({ open: false, state: { brand: null, fromWatch: false } })
  const [saving, setSaving] = useState(false)
  /** the brand created most recently, highlighted in the drawer */
  const [freshId, setFreshId] = useState<string | null>(null)
  /** set when the dialog was opened from the watch drawer: selects the new brand there */
  const selectInWatchDrawer = useRef<((brand: AdminBrand) => void) | null>(null)

  /** Pass `select` when opening from the watch drawer. */
  const openNew = (select?: (brand: AdminBrand) => void) => {
    selectInWatchDrawer.current = select ?? null
    setDialog({ open: true, state: { brand: null, fromWatch: !!select } })
  }

  const openEdit = (brand: AdminBrand) => {
    selectInWatchDrawer.current = null
    setDialog({ open: true, state: { brand, fromWatch: false } })
  }

  /** Ignored while saving, so the dialog can't close mid-request. */
  const onDialogOpenChange = (open: boolean) => {
    if (saving) return
    if (!open) selectInWatchDrawer.current = null
    setDialog((d) => ({ ...d, open }))
  }

  /** Resolves when saved; throws to keep the dialog open. */
  const save = async (values: BrandFormInput) => {
    const { brand: existing, fromWatch } = dialog.state
    setSaving(true)
    try {
      // 1. bytes → storage (only if a new file was picked)
      if (!existing && !values.logoFile) throw new Error("Logo is required.")
      const newKey = values.logoFile
        ? await uploadBrandLogo(values.logoFile)
        : null

      // 2. record → database
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

      if (!res.success) throw new Error(res.message) // dialog stays open + toast
      const saved = res.data // real id, real logo URL

      list.setBrands((brands) =>
        existing
          ? brands.map((b) => (b.id === saved.id ? saved : b))
          : [saved, ...brands]
      )
      if (!existing) {
        setFreshId(saved.id)
        if (fromWatch) selectInWatchDrawer.current?.(saved)
      }
      selectInWatchDrawer.current = null
      setDialog((d) => ({ ...d, open: false }))
      toast.success(`${res.message} · ${saved.name}`)
    } finally {
      setSaving(false)
    }
  }

  /** Run by the delete confirmation. Clears the brand filter if it was this brand. */
  const remove = async (target: Extract<DeleteTarget, { kind: "brand" }>) => {
    const res = await deleteBrand(target.id)
    if (!res.success) throw new Error(res.message)
    list.setBrands((brands) => brands.filter((b) => b.id !== target.id))
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
    freshId,
    openNew,
    openEdit,
    onDialogOpenChange,
    save,
    remove,
  }
}
