"use client"

import {
  useMutation,
  useMutationState,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query"
import { toast } from "sonner"

import type { WatchDrawerState } from "./types"

import type { AdminWatch, AdminWatchPage } from "../_data/types"
import { errorMessage, unwrap } from "../../../_utils/action-client"
import { adminKeys, adminMutationKeys } from "../_utils/admin-keys"
import { overviewKeys } from "../../_utils/overview-keys"
import {
  EDITABLE_WATCH_FIELDS,
  type WatchFormInput,
} from "../_utils/watch-schema"
import { pick } from "../_utils/watches-client"
import { deleteBrand } from "../_actions/brands"
import {
  createWatch,
  deleteWatch,
  setWatchActive,
  updateWatch,
} from "../_actions/watches"
import {
  addWatchImages,
  deleteWatchImage,
  reorderWatchImages,
} from "../_actions/watch-images"

// ── Cache helpers ──────────────────────────────────────────────────────────

type ListSnapshot = [QueryKey, AdminWatchPage | undefined][]

/** Changes one watch in every cached list it appears in (any filters/page). */
function patchCachedWatch(
  queryClient: QueryClient,
  id: string,
  update: (watch: AdminWatch) => AdminWatch
) {
  queryClient.setQueriesData<AdminWatchPage>(
    { queryKey: adminKeys.watchLists() },
    (page) =>
      page && {
        ...page,
        watches: page.watches.map((w) => (w.id === id ? update(w) : w)),
      }
  )
}

/** Stops in-flight list fetches (they'd overwrite the optimistic change) and saves the lists for rollback. */
async function snapshotLists(queryClient: QueryClient): Promise<ListSnapshot> {
  await queryClient.cancelQueries({ queryKey: adminKeys.watchLists() })
  return queryClient.getQueriesData<AdminWatchPage>({
    queryKey: adminKeys.watchLists(),
  })
}

function restoreLists(queryClient: QueryClient, snapshot?: ListSnapshot) {
  for (const [key, data] of snapshot ?? []) queryClient.setQueryData(key, data)
}

/**
 * Refetches the watch lists once the *last* watch write in flight settles.
 * Refetching earlier would replace the optimistic state of a write that's
 * still running (toggle row A, then row B: A's refetch would undo B).
 * Returned so TanStack waits for it: the mutation stays pending until the
 * fresh list is in.
 */
function refreshWatches(queryClient: QueryClient, { brands = false } = {}) {
  const last =
    queryClient.isMutating({ mutationKey: adminMutationKeys.watches() }) === 1
  return Promise.all([
    last && queryClient.invalidateQueries({ queryKey: adminKeys.watches() }),
    // watch counts per brand change when watches are created, moved or deleted
    brands && queryClient.invalidateQueries({ queryKey: adminKeys.brands() }),
    // stock alerts and catalog counts on the overview (only marked stale:
    // nothing on this page shows it)
    queryClient.invalidateQueries({ queryKey: overviewKeys.all() }),
  ])
}

// ── Pending state, read from the mutation cache ────────────────────────────

/** Ids of watches with a publish/hide in flight. */
export function useTogglePendingIds() {
  return useMutationState({
    filters: { mutationKey: adminMutationKeys.setActive(), status: "pending" },
    select: (m) => (m.state.variables as { watch: AdminWatch }).watch.id,
  })
}

/** Ids of watches with an image add, reorder or delete in flight. */
export function useImagePendingIds() {
  return useMutationState({
    filters: { mutationKey: adminMutationKeys.images(), status: "pending" },
    select: (m) => (m.state.variables as { watchId: string }).watchId,
  })
}

// ── Watches ────────────────────────────────────────────────────────────────

export function useSaveWatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: adminMutationKeys.watches(),
    mutationFn: async ({
      values,
      state,
    }: {
      values: WatchFormInput
      state: WatchDrawerState
    }) =>
      unwrap(
        state.mode === "edit"
          ? await updateWatch({
              ...values,
              id: state.watch.id,
              // the fields as the drawer opened them, so concurrent edits are caught
              original: pick(state.watch, EDITABLE_WATCH_FIELDS),
            })
          : // new watches are always drafts
            await createWatch(values)
      ),
    onSuccess: (res, { state }) => {
      if (state.mode === "edit")
        patchCachedWatch(queryClient, res.data.id, () => res.data)
    },
    onSettled: () => refreshWatches(queryClient, { brands: true }),
  })
}

export function useSetWatchActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: adminMutationKeys.setActive(),
    mutationFn: async ({
      watch,
      isActive,
    }: {
      watch: AdminWatch
      isActive: boolean
    }) => unwrap(await setWatchActive({ id: watch.id, isActive })),
    // flip the switch now; put it back if the server refuses
    // (e.g. publishing a watch without images)
    onMutate: async ({ watch, isActive }) => {
      const snapshot = await snapshotLists(queryClient)
      patchCachedWatch(queryClient, watch.id, (w) => ({ ...w, isActive }))
      return { snapshot }
    },
    onError: (error, _vars, context) => {
      restoreLists(queryClient, context?.snapshot)
      toast.error(errorMessage(error, "Couldn't update the watch."))
    },
    onSuccess: (res, { watch }) =>
      toast.success(`${res.message} · ${watch.name}`),
    onSettled: () => refreshWatches(queryClient),
  })
}

export function useDeleteWatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: adminMutationKeys.watches(),
    mutationFn: async ({ id }: { id: string }) =>
      unwrap(await deleteWatch({ id })),
    onSettled: () => refreshWatches(queryClient, { brands: true }),
  })
}

// ── Images ─────────────────────────────────────────────────────────────────
// Each image action returns the watch's fresh images (or what changed), so
// the row is patched straight from the response, then refetched to be sure.

export function useAddWatchImages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: adminMutationKeys.images(),
    mutationFn: async (vars: {
      watchId: string
      watchName: string
      imageKeys: string[]
    }) =>
      unwrap(
        await addWatchImages({
          watchId: vars.watchId,
          imageKeys: vars.imageKeys,
        })
      ),
    onSuccess: (res, { watchId, watchName }) => {
      patchCachedWatch(queryClient, watchId, (w) => ({
        ...w,
        images: res.data,
      }))
      toast.success(`${res.message} · ${watchName}`)
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Couldn't add the images.")),
    onSettled: () => refreshWatches(queryClient),
  })
}

export function useSetCover() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: adminMutationKeys.images(),
    mutationFn: async (vars: {
      watchId: string
      watchName: string
      /** the full new order, first = cover */
      imageIds: string[]
    }) =>
      unwrap(
        await reorderWatchImages({
          watchId: vars.watchId,
          imageIds: vars.imageIds,
        })
      ),
    onMutate: async ({ watchId, imageIds }) => {
      const snapshot = await snapshotLists(queryClient)
      patchCachedWatch(queryClient, watchId, (w) => ({
        ...w,
        images: imageIds
          .map((id) => w.images.find((i) => i.id === id))
          .filter((i) => i !== undefined),
      }))
      return { snapshot }
    },
    onError: (error, _vars, context) => {
      restoreLists(queryClient, context?.snapshot)
      toast.error(errorMessage(error, "Couldn't change the cover."))
    },
    onSuccess: (res, { watchId, watchName }) => {
      patchCachedWatch(queryClient, watchId, (w) => ({
        ...w,
        images: res.data,
      }))
      toast.success(`${res.message} · ${watchName}`)
    },
    onSettled: () => refreshWatches(queryClient),
  })
}

/** The last image of a live watch also unpublishes it (the server decides). */
export function useDeleteWatchImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: adminMutationKeys.images(),
    mutationFn: async (vars: { id: string; watchId: string }) =>
      unwrap(await deleteWatchImage({ id: vars.id })),
    onSuccess: (res, { id, watchId }) =>
      patchCachedWatch(queryClient, watchId, (w) => ({
        ...w,
        isActive: res.data.isActive,
        images: w.images.filter((i) => i.id !== id),
      })),
    onSettled: () => refreshWatches(queryClient),
  })
}

// ── Brands ─────────────────────────────────────────────────────────────────
// Saving a brand also uploads its logo first, so that mutation lives in
// use-brands.ts next to the dialog it drives.

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => unwrap(await deleteBrand(id)),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: adminKeys.brands() }),
        queryClient.invalidateQueries({ queryKey: overviewKeys.all() }),
      ]),
  })
}
