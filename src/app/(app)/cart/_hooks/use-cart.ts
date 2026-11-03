"use client"

import {
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react"
import { toast } from "sonner"

import {
  addToBag,
  removeFromCart,
  saveForLater as saveForLaterAction,
  setCartQuantity,
} from "../_actions/cart"
import type { CartLine, CartPage } from "../_data/types"
import { sumPieces, sumSubtotal } from "../_utils/cart-lines"
import { QTY_SAVE_DELAY_MS } from "../_utils/cart-schema"

type QtyOverride = { quantity: number; max: number }
type PendingSave = { timer: ReturnType<typeof setTimeout>; quantity: number }

const removeLine = (lines: CartLine[], id: string) =>
  lines.filter((l) => l.id !== id)

/** Bumps and returns a line's save counter. */
function bump(seq: Map<string, number>, id: string) {
  const n = (seq.get(id) ?? 0) + 1
  seq.set(id, n)
  return n
}

/** Bag lines, totals and the quantity / remove / save / add actions. */
export function useCart({ lines: serverLines, picks }: CartPage) {
  // Remove / Save for later: optimistic until their refresh() lands.
  const [optimisticLines, applyRemove] = useOptimistic(serverLines, removeLine)
  const [pending, startTransition] = useTransition()

  // Quantities are owned by the client: a click changes the number at once,
  // and one save goes out after the clicks stop. No refresh, no re-render.
  const [overrides, setOverrides] = useState<Record<string, QtyOverride>>({})
  const pendingSaves = useRef(new Map<string, PendingSave>())
  // last quantity the server confirmed, to roll back to on failure
  const confirmed = useRef(new Map<string, number>())
  // newest save per line; older replies are ignored
  const saveSeq = useRef(new Map<string, number>())

  const lines = optimisticLines.map((line) => {
    const o = overrides[line.id]
    if (!o) return line
    // a later server render may know about a lower stock than the override
    const max = Math.min(o.max, line.max)
    return { ...line, max, quantity: Math.min(o.quantity, max) }
  })

  const save = useCallback(async (id: string, quantity: number) => {
    const n = bump(saveSeq.current, id)
    const res = await setCartQuantity({ watchId: id, quantity })
    // A newer click or save for this line will settle it instead.
    if (saveSeq.current.get(id) !== n || pendingSaves.current.has(id)) return

    if (!res.success) {
      toast.error(res.message)
      const last = confirmed.current.get(id)
      setOverrides(({ [id]: current, ...rest }) =>
        last === undefined || !current
          ? rest // back to the server's value
          : { ...rest, [id]: { ...current, quantity: last } }
      )
      return
    }
    confirmed.current.set(id, res.data.quantity)
    setOverrides((o) => ({ ...o, [id]: res.data }))
    if (res.message) toast(res.message) // the server clamped to stock
  }, [])

  /** Sends every waiting save now. Await it before reading the cart. */
  const flushQuantities = useCallback(() => {
    const saves = [...pendingSaves.current].map(([id, p]) => {
      clearTimeout(p.timer)
      pendingSaves.current.delete(id)
      return save(id, p.quantity)
    })
    return Promise.all(saves)
  }, [save])

  // Don't lose an edit made in the last few hundred ms: save on client
  // navigation away (unmount) and, best effort, when the tab closes.
  useEffect(() => {
    const onPageHide = () => void flushQuantities()
    window.addEventListener("pagehide", onPageHide)
    return () => {
      window.removeEventListener("pagehide", onPageHide)
      void flushQuantities()
    }
  }, [flushQuantities])

  const setQty = (line: CartLine, quantity: number) => {
    if (quantity < 1 || quantity > line.max) return
    setOverrides((o) => ({ ...o, [line.id]: { quantity, max: line.max } }))

    clearTimeout(pendingSaves.current.get(line.id)?.timer)
    const timer = setTimeout(() => {
      pendingSaves.current.delete(line.id)
      void save(line.id, quantity)
    }, QTY_SAVE_DELAY_MS)
    pendingSaves.current.set(line.id, { timer, quantity })
  }

  // The line is leaving the bag: drop its unsaved quantity and ignore any
  // save still in flight. If the removal fails, the server's value returns.
  const forgetQuantity = (id: string) => {
    clearTimeout(pendingSaves.current.get(id)?.timer)
    pendingSaves.current.delete(id)
    confirmed.current.delete(id)
    bump(saveSeq.current, id)
    setOverrides((o) => {
      const next = { ...o }
      delete next[id]
      return next
    })
  }

  const drop = (
    line: CartLine,
    action: typeof removeFromCart,
    successMessage: string
  ) => {
    forgetQuantity(line.id)
    startTransition(async () => {
      applyRemove(line.id)
      const res = await action({ watchId: line.id })
      if (!res.success) return void toast.error(res.message)
      toast.success(successMessage)
    })
  }

  const remove = (line: CartLine) =>
    drop(line, removeFromCart, `${line.name} removed`)

  const saveForLater = (line: CartLine) =>
    drop(line, saveForLaterAction, `${line.name} moved to your wishlist`)

  const addPick = (watchId: string) =>
    startTransition(async () => {
      const res = await addToBag({ watchIds: [watchId] })
      toast[res.success ? "success" : "error"](res.message)
    })

  return {
    lines,
    picks,
    pieces: sumPieces(lines),
    subtotalCents: sumSubtotal(lines),
    /** Remove / Save for later / Add in flight (not quantity saves) */
    pending,
    setQty,
    remove,
    saveForLater,
    addPick,
    flushQuantities,
  }
}
