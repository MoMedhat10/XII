"use client"

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import {
  simulateRequest,
  type AdminBrand,
  type AdminWatch,
  type AdminWatchImage,
} from "@/app/(dashboard)/_data/mock-watches"
import {
  MAX_WATCH_IMAGES,
  WATCH_IMAGE_TYPES,
  parsePriceInput,
  watchImageFileSchema,
  type BrandFormInput,
  type WatchFilters,
  type WatchFormInput,
} from "@/app/(dashboard)/_utils/watch-schema"

import { BrandDialog, type BrandDialogState } from "./brand-dialog"
import { BrandsDrawer } from "./brands-drawer"
import { ConfirmDeleteDialog, type DeleteTarget } from "./confirm-delete-dialog"
import { WatchDrawer, type WatchDrawerState } from "./watch-drawer"
import { PAGE_SIZE, filterWatches } from "./watch-utils"
import { WatchesHeader } from "./watches-header"
import { WatchesPagination } from "./watches-pagination"
import { WatchesEmpty, WatchesNoResults } from "./watches-states"
import { WatchesTable, type WatchRowHandlers } from "./watches-table"
import { WatchesToolbar } from "./watches-toolbar"

const DEFAULT_FILTERS: WatchFilters = {
  q: "",
  brand: "",
  status: "all",
  page: 1,
}

/** Keeps filters shareable and reload-safe without re-running the page. */
function syncFiltersToUrl(filters: WatchFilters) {
  const params = new URLSearchParams(window.location.search)
  for (const key of Object.keys(DEFAULT_FILTERS) as (keyof WatchFilters)[]) {
    const value = filters[key]
    if (value === DEFAULT_FILTERS[key] || value === "") params.delete(key)
    else params.set(key, String(value))
  }
  const query = params.toString()
  window.history.replaceState(
    null,
    "",
    query ? `?${query}` : window.location.pathname
  )
}

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

export function WatchesManager({
  initialWatches,
  initialBrands,
  initialFilters,
}: {
  initialWatches: AdminWatch[]
  initialBrands: AdminBrand[]
  initialFilters: WatchFilters
}) {
  const [watches, setWatches] = useState(initialWatches)
  const [brands, setBrands] = useState(initialBrands)
  const [filters, setFilters] = useState(initialFilters)
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set())

  // Overlays keep their last subject while closing, so exit animations
  // never render empty content.
  const [watchDrawer, setWatchDrawer] = useState<{
    open: boolean
    state: WatchDrawerState
  }>({ open: false, state: { mode: "create", brandId: "" } })
  const [savingWatch, setSavingWatch] = useState(false)
  const [brandsOpen, setBrandsOpen] = useState(false)
  const [brandDialog, setBrandDialog] = useState<{
    open: boolean
    state: BrandDialogState
  }>({ open: false, state: { brand: null, fromWatch: false } })
  const [savingBrand, setSavingBrand] = useState(false)
  const [freshBrandId, setFreshBrandId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{
    open: boolean
    target: DeleteTarget | null
  }>({ open: false, target: null })
  const [deleting, setDeleting] = useState(false)

  const selectBrandInDrawer = useRef<((brand: AdminBrand) => void) | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const uploadTarget = useRef<string | null>(null)
  const uploadTimers = useRef(new Set<ReturnType<typeof setInterval>>())

  useEffect(() => syncFiltersToUrl(filters), [filters])
  useEffect(() => {
    const timers = uploadTimers.current
    return () => timers.forEach((timer) => clearInterval(timer))
  }, [])

  const deferredFilters = useDeferredValue(filters)
  const filtered = useMemo(
    () => filterWatches(watches, deferredFilters),
    [watches, deferredFilters]
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(filters.page, pageCount)
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const updateFilters = (patch: Partial<WatchFilters>) =>
    setFilters((current) => ({ ...current, page: 1, ...patch }))

  const patchWatch = (id: string, update: (watch: AdminWatch) => AdminWatch) =>
    setWatches((list) => list.map((w) => (w.id === id ? update(w) : w)))

  const setPending = (id: string, pending: boolean) =>
    setPendingIds((current) => {
      const next = new Set(current)
      if (pending) next.add(id)
      else next.delete(id)
      return next
    })

  // -------------------------------------------------------------------------
  // Watches
  // -------------------------------------------------------------------------

  const openNewWatch = () => {
    setBrandsOpen(false)
    setWatchDrawer({
      open: true,
      state: { mode: "create", brandId: filters.brand },
    })
  }

  const openEditWatch = (watch: AdminWatch) =>
    setWatchDrawer({ open: true, state: { mode: "edit", watch } })

  const saveWatch = async (values: WatchFormInput) => {
    const existing =
      watchDrawer.state.mode === "edit" ? watchDrawer.state.watch : undefined
    const now = new Date().toISOString()
    const fields = {
      name: values.name,
      model: values.model,
      brandId: values.brandId,
      priceCents: parsePriceInput(values.price) * 100,
      stock: values.stock,
      description: values.description,
      updatedAt: now,
    }

    setSavingWatch(true)
    try {
      await simulateRequest(null, { delay: 900 })
      setWatches((list) =>
        existing
          ? // Merge into the live row so live status and images uploaded
            // while the drawer was open are kept.
            list.map((w) => (w.id === existing.id ? { ...w, ...fields } : w))
          : [
              {
                ...fields,
                id: crypto.randomUUID(),
                // New watches start as drafts, matching the DB default.
                isActive: false,
                images: [],
                createdAt: now,
              },
              ...list,
            ]
      )
      setWatchDrawer((d) => ({ ...d, open: false }))
      toast.success(`${existing ? "Saved" : "Created"} · ${values.name}`)
    } finally {
      setSavingWatch(false)
    }
  }

  const toggleLive = async (watch: AdminWatch) => {
    const next = !watch.isActive
    patchWatch(watch.id, (w) => ({ ...w, isActive: next }))
    setPending(watch.id, true)
    try {
      await simulateRequest(null, { delay: 500 })
      toast.success(`${next ? "Live" : "Hidden"} · ${watch.name}`)
    } catch (error) {
      patchWatch(watch.id, (w) => ({ ...w, isActive: !next }))
      toast.error(errorMessage(error, "Couldn't update the watch."))
    } finally {
      setPending(watch.id, false)
    }
  }

  // -------------------------------------------------------------------------
  // Row image uploads (simulated progress)
  // -------------------------------------------------------------------------

  const pickImages = (watch: AdminWatch) => {
    uploadTarget.current = watch.id
    fileInput.current?.click()
  }

  const uploadImages = (watchId: string, fileList: FileList | null) => {
    const watch = watches.find((w) => w.id === watchId)
    if (!watch || !fileList?.length) return

    const room = MAX_WATCH_IMAGES - watch.images.length
    const files = Array.from(fileList)
    if (files.length > room) {
      toast.error(
        `Only ${room} more image${room === 1 ? "" : "s"} can be added.`
      )
    }

    const added: AdminWatchImage[] = []
    for (const file of files.slice(0, room)) {
      const result = watchImageFileSchema.safeParse(file)
      if (!result.success) {
        toast.error(`${file.name}: ${result.error.issues[0]?.message}`)
        continue
      }
      added.push({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        alt: `${watch.name}, view ${watch.images.length + added.length + 1}`,
        progress: 0,
      })
    }
    if (!added.length) return

    patchWatch(watchId, (w) => ({ ...w, images: [...w.images, ...added] }))

    // Progress lives in this batch's closure; each tick copies it into state.
    const progress = new Map(added.map((image) => [image.id, 0]))
    const timer = setInterval(() => {
      for (const [id, value] of progress) {
        progress.set(id, Math.min(100, value + 14 + Math.random() * 18))
      }
      patchWatch(watchId, (w) => ({
        ...w,
        images: w.images.map((image) =>
          progress.has(image.id)
            ? { ...image, progress: progress.get(image.id)! }
            : image
        ),
      }))
      if ([...progress.values()].every((value) => value >= 100)) {
        clearInterval(timer)
        uploadTimers.current.delete(timer)
        toast.success(`Images uploaded · ${watch.name}`)
      }
    }, 140)
    uploadTimers.current.add(timer)
  }

  const removeImage = (watch: AdminWatch, imageId: string) => {
    const image = watch.images.find((i) => i.id === imageId)
    if (image?.url.startsWith("blob:")) URL.revokeObjectURL(image.url)
    patchWatch(watch.id, (w) => ({
      ...w,
      images: w.images.filter((i) => i.id !== imageId),
    }))
    toast.success(`Image deleted · ${watch.name}`)
  }

  // -------------------------------------------------------------------------
  // Brands
  // -------------------------------------------------------------------------

  const openNewBrand = (fromWatch = false) =>
    setBrandDialog({ open: true, state: { brand: null, fromWatch } })

  const saveBrand = async (values: BrandFormInput) => {
    const { brand: existing, fromWatch } = brandDialog.state
    const saved: AdminBrand = {
      id: existing?.id ?? crypto.randomUUID(),
      name: values.name,
      description: values.description,
      logoUrl: values.logoUrl,
    }

    setSavingBrand(true)
    try {
      await simulateRequest(null, { delay: 700 })
      setBrands((list) =>
        existing
          ? list.map((b) => (b.id === saved.id ? saved : b))
          : [saved, ...list]
      )
      if (!existing) {
        setFreshBrandId(saved.id)
        if (fromWatch) selectBrandInDrawer.current?.(saved)
      }
      selectBrandInDrawer.current = null
      setBrandDialog((d) => ({ ...d, open: false }))
      toast.success(`Brand ${existing ? "updated" : "created"} · ${saved.name}`)
    } finally {
      setSavingBrand(false)
    }
  }

  // -------------------------------------------------------------------------
  // Deletes
  // -------------------------------------------------------------------------

  const askDelete = (target: DeleteTarget) => setConfirm({ open: true, target })

  const confirmDelete = async () => {
    const target = confirm.target
    if (!target) return
    setDeleting(true)
    try {
      await simulateRequest(null, { delay: 800 })
      if (target.kind === "watch") {
        setWatches((list) => list.filter((w) => w.id !== target.id))
        setWatchDrawer((d) =>
          d.state.mode === "edit" && d.state.watch.id === target.id
            ? { ...d, open: false }
            : d
        )
      } else {
        setBrands((list) => list.filter((b) => b.id !== target.id))
        setFilters((f) => (f.brand === target.id ? { ...f, brand: "" } : f))
      }
      setConfirm((c) => ({ ...c, open: false }))
      toast.success(
        `${target.kind === "brand" ? "Brand deleted" : "Deleted"} · ${target.name}`
      )
    } catch (error) {
      toast.error(errorMessage(error, "Delete failed."))
    } finally {
      setDeleting(false)
    }
  }

  const rowHandlers: WatchRowHandlers = {
    onOpen: openEditWatch,
    onDelete: (watch) =>
      askDelete({ kind: "watch", id: watch.id, name: watch.name }),
    onToggle: toggleLive,
    onAddImages: pickImages,
    onRemoveImage: removeImage,
  }

  return (
    <>
      <WatchesHeader
        total={watches.length}
        brandCount={brands.length}
        onOpenBrands={() => setBrandsOpen(true)}
        onNewWatch={openNewWatch}
      />

      {watches.length === 0 ? (
        <WatchesEmpty
          hasBrands={brands.length > 0}
          onNewWatch={openNewWatch}
          onNewBrand={() => openNewBrand()}
          onOpenBrands={() => setBrandsOpen(true)}
        />
      ) : (
        <>
          <WatchesToolbar
            filters={filters}
            brands={brands}
            onChange={updateFilters}
          />
          {filtered.length === 0 ? (
            <WatchesNoResults onClear={() => setFilters(DEFAULT_FILTERS)} />
          ) : (
            <>
              <WatchesTable
                watches={visible}
                brands={brands}
                pendingIds={pendingIds}
                handlers={rowHandlers}
              />
              <WatchesPagination
                page={page}
                pageCount={pageCount}
                total={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={(next) =>
                  setFilters((current) => ({ ...current, page: next }))
                }
              />
            </>
          )}
        </>
      )}

      <input
        ref={fileInput}
        type="file"
        multiple
        accept={WATCH_IMAGE_TYPES.join(",")}
        aria-hidden="true"
        tabIndex={-1}
        className="hidden"
        onChange={(event) => {
          if (uploadTarget.current) {
            uploadImages(uploadTarget.current, event.target.files)
          }
          event.target.value = ""
        }}
      />

      <WatchDrawer
        open={watchDrawer.open}
        state={watchDrawer.state}
        brands={brands}
        saving={savingWatch}
        onOpenChange={(open) => {
          if (!savingWatch) setWatchDrawer((d) => ({ ...d, open }))
        }}
        onSubmit={saveWatch}
        onCreateBrand={(select) => {
          selectBrandInDrawer.current = select
          openNewBrand(true)
        }}
        onDelete={(watch) =>
          askDelete({ kind: "watch", id: watch.id, name: watch.name })
        }
      />

      <BrandsDrawer
        open={brandsOpen}
        brands={brands}
        watches={watches}
        freshId={freshBrandId}
        onOpenChange={setBrandsOpen}
        onNewBrand={() => openNewBrand()}
        onEditBrand={(brand) =>
          setBrandDialog({ open: true, state: { brand, fromWatch: false } })
        }
        onDeleteBrand={(brand) =>
          askDelete({ kind: "brand", id: brand.id, name: brand.name })
        }
        onFilterBrand={(brand) => {
          updateFilters({ brand: brand.id })
          setBrandsOpen(false)
        }}
      />

      <BrandDialog
        open={brandDialog.open}
        state={brandDialog.state}
        brands={brands}
        saving={savingBrand}
        onOpenChange={(open) => {
          if (savingBrand) return
          if (!open) selectBrandInDrawer.current = null
          setBrandDialog((d) => ({ ...d, open }))
        }}
        onSubmit={saveBrand}
      />

      <ConfirmDeleteDialog
        open={confirm.open}
        target={confirm.target}
        pending={deleting}
        onOpenChange={(open) => {
          if (!deleting) setConfirm((c) => ({ ...c, open }))
        }}
        onConfirm={confirmDelete}
      />
    </>
  )
}
