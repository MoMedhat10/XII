"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { errorMessage, unwrap } from "../../../_utils/action-client"
import {
  deleteUser,
  markEmailVerified,
  setSuspended,
  signOutEverywhere,
} from "../_actions/users"
import { userKeys } from "../_utils/keys"
import { overviewKeys } from "../../_utils/overview-keys"

/** Who the action is for, so toasts can name them. */
type Target = { id: string; username: string }

/**
 * The user actions. None are optimistic: they're rare and deliberate, so
 * the buttons show pending state and the lists refetch once the server is
 * done. Toasts live here, so every caller gets them.
 */
export function useUserActions({
  onDeleted,
}: {
  /** runs before the cache is cleaned up, e.g. to close the drawer first */
  onDeleted?: (id: string) => void
} = {}) {
  const queryClient = useQueryClient()
  // returned from onSettled, so each mutation stays pending until the
  // refetch is done and the drawer never shows stale data
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: userKeys.all() }),
      // sign-ups, unverified count and user totals on the overview
      queryClient.invalidateQueries({ queryKey: overviewKeys.all() }),
    ])
  const onError = (error: Error) =>
    toast.error(errorMessage(error, "That didn't work. Please try again."))

  const signOut = useMutation({
    mutationKey: userKeys.all(),
    mutationFn: async (t: Target) =>
      unwrap(await signOutEverywhere({ id: t.id })),
    onSuccess: (res, t) => toast.success(`${res.message} · ${t.username}`),
    onError,
    onSettled: refresh,
  })

  const verify = useMutation({
    mutationKey: userKeys.all(),
    mutationFn: async (t: Target) =>
      unwrap(await markEmailVerified({ id: t.id })),
    onSuccess: (res, t) => toast.success(`${res.message} · ${t.username}`),
    onError,
    onSettled: refresh,
  })

  const suspend = useMutation({
    mutationKey: userKeys.all(),
    mutationFn: async (t: Target & { suspended: boolean }) =>
      unwrap(await setSuspended({ id: t.id, suspended: t.suspended })),
    onSuccess: (res, t) => toast.success(`${res.message} · ${t.username}`),
    onError,
    onSettled: refresh,
  })

  const remove = useMutation({
    mutationKey: userKeys.all(),
    mutationFn: async (t: Target) => unwrap(await deleteUser({ id: t.id })),
    onSuccess: (res, t) => {
      onDeleted?.(t.id)
      // don't refetch a user that's gone (it would just 404)
      queryClient.removeQueries({ queryKey: userKeys.detail(t.id) })
      const kept = res.data.ordersKept
      toast.success(
        `${res.message} · ${t.username}` +
          (kept ? ` · ${kept} order${kept === 1 ? "" : "s"} kept` : "")
      )
    },
    onError,
    onSettled: refresh,
  })

  return { signOut, verify, suspend, remove }
}

export type UserActions = ReturnType<typeof useUserActions>
