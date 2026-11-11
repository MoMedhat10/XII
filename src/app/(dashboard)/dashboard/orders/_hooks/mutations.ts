"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  ActionFailure,
  errorMessage,
  unwrap,
} from "../../../_utils/action-client"
import { userKeys } from "../../users/_utils/keys"
import { overviewKeys } from "../../_utils/overview-keys"
import {
  cancelOrderAsAdmin,
  markDelivered,
  shipOrder,
} from "../_actions/orders"
import type { ShipOrderInput } from "../_utils/order-schema"
import { orderKeys } from "../_utils/keys"

/**
 * The order actions. None are optimistic: they're deliberate and can email
 * the customer, so the buttons show pending state and the lists refetch once
 * the server is done. Toasts live here, so every caller gets them.
 */
export function useOrderActions() {
  const queryClient = useQueryClient()
  // returned from onSettled, so each mutation stays pending until the
  // refetch is done and the drawer never shows stale data
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: orderKeys.all() }),
      // a user's order history and spend are shown on the Users page too
      queryClient.invalidateQueries({ queryKey: userKeys.all() }),
      // revenue, "to ship" and top sellers on the overview
      queryClient.invalidateQueries({ queryKey: overviewKeys.all() }),
    ])
  const onError = (error: Error) =>
    toast.error(errorMessage(error, "That didn't work. Please try again."))

  const ship = useMutation({
    mutationKey: orderKeys.all(),
    mutationFn: async (input: ShipOrderInput) => unwrap(await shipOrder(input)),
    onSuccess: (res) =>
      toast.success(
        `${res.message} · ${res.data.trackingNumber} · customer emailed`
      ),
    // field errors are shown in the ship form instead
    onError: (error) => {
      const fields = error instanceof ActionFailure && error.fieldErrors
      if (!fields || !Object.keys(fields).length) onError(error)
    },
    onSettled: refresh,
  })

  const deliver = useMutation({
    mutationKey: orderKeys.all(),
    mutationFn: async (id: string) => unwrap(await markDelivered({ id })),
    onSuccess: (res) => toast.success(res.message),
    onError,
    onSettled: refresh,
  })

  const cancel = useMutation({
    mutationKey: orderKeys.all(),
    mutationFn: async (id: string) => unwrap(await cancelOrderAsAdmin({ id })),
    onSuccess: (res) => {
      const n = res.data.restocked
      toast.success(
        `${res.message} · ${n} ${n === 1 ? "piece" : "pieces"} back in stock · customer emailed`
      )
    },
    onError,
    onSettled: refresh,
  })

  return { ship, deliver, cancel }
}

export type OrderActions = ReturnType<typeof useOrderActions>
