"use client"

import { useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { addToBag as addToBagAction } from "../../../cart/_actions/cart"
import { setFavorite } from "../../_actions/favorites"
import { catalogKeys } from "../../_hooks/use-catalog"
import type { WatchViewer } from "../_data/types"

type ViewerState = Pick<WatchViewer, "saved" | "inBag">

/**
 * Bag and save actions for one watch. Server props are the source of truth;
 * both actions call refresh(), and the optimistic layer bridges the wait.
 */
export function useWatchActions(
  watchId: string,
  viewer: WatchViewer,
  soldOut: boolean
) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [state, patch] = useOptimistic(
    { saved: viewer.saved, inBag: viewer.inBag },
    (s: ViewerState, change: Partial<ViewerState>) => ({ ...s, ...change })
  )
  const [bagPending, startBag] = useTransition()
  const [savePending, startSave] = useTransition()

  const requireSignIn = (message: string) => {
    if (viewer.signedIn) return false
    toast(message, {
      action: { label: "Sign in", onClick: () => router.push("/login") },
    })
    return true
  }

  const addToBag = () => {
    if (requireSignIn("Sign in to use your bag")) return
    if (soldOut || state.inBag || bagPending) return
    startBag(async () => {
      patch({ inBag: true })
      const res = await addToBagAction({ watchIds: [watchId] })
      if (!res.success) {
        toast.error(res.message)
        // stock may have run out since the page loaded
        router.refresh()
        return
      }
      toast.success(res.message)
    })
  }

  const toggleSave = () => {
    if (requireSignIn("Sign in to save pieces to your vitrine")) return
    if (savePending) return
    const saved = !state.saved
    startSave(async () => {
      patch({ saved })
      const res = await setFavorite({ watchId, saved })
      if (!res.success) return void toast.error(res.message)
      toast.success(res.message)
      // keep the catalog's hearts in sync for when the user goes back
      queryClient.invalidateQueries({ queryKey: catalogKeys.favorites })
    })
  }

  return { ...state, bagPending, savePending, addToBag, toggleSave }
}
