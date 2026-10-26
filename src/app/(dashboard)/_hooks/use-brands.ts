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

export function useBrands({
  list,
  filters,
}: {
  list: WatchList
  filters: WatchFiltersApi
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dialog, setDialog] = useState<{
    open: boolean
    state: BrandDialogState
  }>({ open: false, state: { brand: null, fromWatch: false } })
  const [saving, setSaving] = useState(false)
  const [freshId, setFreshId] = useState<string | null>(null)
  /** set when the dialog was opened from the watch drawer: selects the new brand there */
  const selectInWatchDrawer = useRef<((brand: AdminBrand) => void) | null>(null)

  const openNew = (select?: (brand: AdminBrand) => void) => {
    selectInWatchDrawer.current = select ?? null
    setDialog({ open: true, state: { brand: null, fromWatch: !!select } })
  }

  const openEdit = (brand: AdminBrand) => {
    selectInWatchDrawer.current = null
    setDialog({ open: true, state: { brand, fromWatch: false } })
  }

  const onDialogOpenChange = (open: boolean) => {
    if (saving) return
    if (!open) selectInWatchDrawer.current = null
    setDialog((d) => ({ ...d, open }))
  }

  const save = async (values: BrandFormInput) => {
    const { brand: existing, fromWatch } = dialog.state
    setSaving(true)
    try {
      if (!existing && !values.logoFile) throw new Error("Logo is required.")
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

      if (!res.success) throw new Error(res.message)
      const saved = res.data

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
