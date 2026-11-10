"use client"

import { useBrands } from "@/app/(dashboard)/dashboard/watches/_hooks/use-brands"
import { useDeleteConfirm } from "@/app/(dashboard)/dashboard/watches/_hooks/use-delete-confirm"
import { useWatchDrawer } from "@/app/(dashboard)/dashboard/watches/_hooks/use-watch-drawer"
import { useWatchFilters } from "@/app/(dashboard)/dashboard/watches/_hooks/use-watch-filters"
import { useWatchImages } from "@/app/(dashboard)/dashboard/watches/_hooks/use-watch-images"
import { useWatchList } from "@/app/(dashboard)/dashboard/watches/_hooks/use-watch-list"
import { cn } from "@/lib/utils"

import { BrandDialog } from "./brand-dialog"
import { BrandsDrawer } from "./brands-drawer"
import { ConfirmDeleteDialog } from "./confirm-delete-dialog"
import { WatchDrawer } from "./watch-drawer"
import { WatchImageInput } from "./watch-image-input"
import { WatchesHeader } from "./watches-header"
import { AdminPagination } from "../admin-pagination"
import {
  WatchesEmpty,
  WatchesError,
  WatchesLoading,
  WatchesNoResults,
} from "./watches-states"
import { WatchesTable, type WatchRowHandlers } from "./watches-table"
import { WatchesToolbar } from "./watches-toolbar"

/**
 * The admin watches page. All data comes from the TanStack Query cache: the
 * server page prefetches the first screen into it, and from then on filters,
 * pages and writes go through queries and mutations.
 */
export function WatchesManager() {
  const filters = useWatchFilters()
  const list = useWatchList({ filters })
  const watch = useWatchDrawer()

  const { setFileInput, ...images } = useWatchImages({ list })
  const brands = useBrands({ filters })
  const confirm = useDeleteConfirm({
    run: { watch: watch.remove, brand: brands.remove, image: images.remove },
  })

  const openNewWatch = () => {
    brands.setDrawerOpen(false)
    watch.openNew(filters.filters.brand)
  }

  const askDeleteWatch = (w: { id: string; name: string }) =>
    confirm.ask({ kind: "watch", id: w.id, name: w.name })

  const rowHandlers: WatchRowHandlers = {
    onOpen: watch.openEdit,
    onDelete: askDeleteWatch,
    onToggle: watch.toggleLive,
    onAddImages: images.pick,
    onRemoveImage: (w, image) => confirm.ask(images.deleteTarget(w, image)),
    onSetCover: images.setCover,
  }

  const { data } = list

  // Only without any rows to show: the first load failed, or is still going
  // (the server prefetch normally fills the cache, so this is rare).
  if (!data) {
    return (
      <>
        <WatchesHeader total={null} brandCount={null} disabled />
        {list.pageQuery.isError ? (
          <WatchesError onRetry={() => void list.pageQuery.refetch()} />
        ) : (
          <WatchesLoading />
        )}
      </>
    )
  }

  return (
    <>
      <WatchesHeader
        total={data.inventoryTotal}
        brandCount={list.brandsQuery.data ? list.brands.length : null}
        onOpenBrands={() => brands.setDrawerOpen(true)}
        onNewWatch={openNewWatch}
      />

      {data.inventoryTotal === 0 ? (
        <WatchesEmpty
          hasBrands={list.brands.length > 0}
          onNewWatch={openNewWatch}
          onNewBrand={() => brands.openNew()}
          onOpenBrands={() => brands.setDrawerOpen(true)}
        />
      ) : (
        <>
          <WatchesToolbar
            filters={{ ...filters.filters, q: filters.search }}
            brands={list.brands}
            onChange={(patch) =>
              patch.q !== undefined
                ? filters.changeSearch(patch.q)
                : filters.updateFilters(patch)
            }
            onClear={filters.clearFilters}
          />
          <div
            aria-busy={list.stale || undefined}
            className={cn(
              "transition-opacity",
              list.stale && "pointer-events-none opacity-50"
            )}
          >
            {data.total === 0 ? (
              <WatchesNoResults onClear={filters.clearFilters} />
            ) : (
              <>
                <WatchesTable
                  watches={list.watches}
                  brands={list.brands}
                  pendingIds={list.pendingIds}
                  imageBusyIds={list.imageBusyIds}
                  handlers={rowHandlers}
                />
                <AdminPagination
                  page={data.page}
                  pageCount={data.pageCount}
                  total={data.total}
                  pageSize={data.pageSize}
                  onPageChange={filters.goToPage}
                />
              </>
            )}
          </div>
        </>
      )}

      <WatchImageInput ref={setFileInput} onFiles={images.onFilesPicked} />

      <WatchDrawer
        open={watch.drawer.open}
        state={watch.drawer.state}
        brands={list.brands}
        saving={watch.saving}
        serverError={watch.serverError}
        onOpenChange={watch.onOpenChange}
        onSubmit={watch.save}
        onCreateBrand={(select) => brands.openNew(select)}
        onDelete={askDeleteWatch}
      />

      <BrandsDrawer
        open={brands.drawerOpen}
        brands={list.brands}
        freshId={brands.freshId}
        onOpenChange={brands.setDrawerOpen}
        onNewBrand={() => brands.openNew()}
        onEditBrand={brands.openEdit}
        onDeleteBrand={(brand) =>
          confirm.ask({ kind: "brand", id: brand.id, name: brand.name })
        }
        onFilterBrand={(brand) => {
          filters.updateFilters({ brand: brand.id })
          brands.setDrawerOpen(false)
        }}
      />

      <BrandDialog
        open={brands.dialog.open}
        state={brands.dialog.state}
        brands={list.brands}
        saving={brands.saving}
        serverError={brands.serverError}
        onOpenChange={brands.onDialogOpenChange}
        onSubmit={brands.save}
      />

      <ConfirmDeleteDialog
        open={confirm.open}
        target={confirm.target}
        pending={confirm.deleting}
        onOpenChange={confirm.onOpenChange}
        onConfirm={confirm.confirmDelete}
      />
    </>
  )
}
