"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useFavorites, useSetFavorite } from "./use-catalog"

/** The heart on each card: saved state, plus a sign-in prompt for guests. */
export function useFavoriteToggle() {
  const router = useRouter()
  const favorites = useFavorites()
  const setFavorite = useSetFavorite()

  const savedIds = favorites.data?.watchIds ?? []
  const isSaved = (watchId: string) => savedIds.includes(watchId)

  const toggle = (watchId: string) => {
    if (!favorites.data?.signedIn) {
      toast("Sign in to save pieces to your vitrine", {
        action: { label: "Sign in", onClick: () => router.push("/login") },
      })
      return
    }
    setFavorite.mutate(
      { watchId, saved: !isSaved(watchId) },
      { onError: (error) => toast.error(error.message) }
    )
  }

  return { isSaved, toggle }
}
