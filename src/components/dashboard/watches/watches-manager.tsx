"use client"

import type { AdminBrand, AdminWatchPage } from "@/app/(dashboard)/_data/types"
import { useBrands } from "@/app/(dashboard)/_hooks/use-brands"
import { useDeleteConfirm } from "@/app/(dashboard)/_hooks/use-delete-confirm"
import { useWatchDrawer } from "@/app/(dashboard)/_hooks/use-watch-drawer"
import { useWatchFilters } from "@/app/(dashboard)/_hooks/use-watch-filters"
import { useWatchImages } from "@/app/(dashboard)/_hooks/use-watch-images"
import { useWatchList } from "@/app/(dashboard)/_hooks/use-watch-list"
import type { WatchFilters } from "@/app/(dashboard)/_utils/watch-schema"
import { cn } from "@/lib/utils"

import { BrandDialog } from "./brand-dialog"
import { BrandsDrawer } from "./brands-drawer"
import { ConfirmDeleteDialog } from "./confirm-delete-dialog"
import { WatchDrawer } from "./watch-drawer"
import { WatchImageInput } from "./watch-image-input"
import { WatchesHeader } from "./watches-header"
import { WatchesPagination } from "./watches-pagination"
import { WatchesEmpty, WatchesNoResults } from "./watches-states"
import { WatchesTable, type WatchRowHandlers } from "./watches-table"
import { WatchesToolbar } from "./watches-toolbar"

export function WatchesManager({
  data,
  brands: serverBrands,
  filters: serverFilters,
}: {
  data: AdminWatchPage
  brands: AdminBrand[]
  filters: WatchFilters
}) {
  const list = useWatchList({ data, brands: serverBrands })
  const filters = useWatchFilters({ serverFilters })
  const watch = useWatchDrawer({ list })
 
  const { setFileInput, ...images } = useWatchImages({ list })
  const brands = useBrands({ list, filters })
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

  return (
    <>
      <WatchesHeader
        total={data.inventoryTotal}
        brandCount={list.brands.length}
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
          {/* the previous results stay visible, dimmed, while the next load */}
          <div
            aria-busy={filters.navigating || undefined}
            className={cn(
              "transition-opacity",
              filters.navigating && "pointer-events-none opacity-50"
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
                <WatchesPagination
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
