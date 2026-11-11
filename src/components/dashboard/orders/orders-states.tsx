"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { btn, btnGold } from "../styles"
import { OrdersTableHead, orderColumns } from "./orders-table"

const panel =
  "relative flex min-h-[420px] flex-col items-center justify-center gap-4 overflow-hidden border-b-2 border-surface-variant px-4 py-12 text-center"
const kicker = "relative font-mono text-xs tracking-[1px] uppercase"
const title =
  "relative max-w-[560px] font-heading text-[clamp(32px,4vw,48px)] leading-[1.05] font-bold tracking-[-0.02em] text-pretty"
const body =
  "relative max-w-[440px] text-base leading-6 text-pretty text-muted-foreground"

export function OrdersError({
  message,
  retrying,
  onRetry,
}: {
  message?: string
  retrying: boolean
  onRetry: () => void
}) {
  return (
    <div role="alert" className={panel}>
      <span className={cn(kicker, "text-danger")}>
        ERR — Orders unavailable
      </span>
      <h2 className={title}>We couldn&apos;t load the orders.</h2>
      <p className={body}>
        {message ?? "The server didn't respond."} Nothing was changed.
      </p>
      <Button
        type="button"
        disabled={retrying}
        onClick={onRetry}
        className={cn(btn, btnGold, "relative mt-2 px-7")}
      >
        <span aria-hidden="true" className={cn(retrying && "animate-spin")}>
          ↻
        </span>
        {retrying ? "Retrying…" : "Retry"}
      </Button>
    </div>
  )
}

export function OrdersNoResults({
  filtered,
  onClear,
}: {
  /** false when there are no orders at all yet */
  filtered: boolean
  onClear: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <span className="font-mono text-xs tracking-[1px] text-gold">
        00 RESULTS
      </span>
      <h2 className="font-heading text-[32px] leading-[1.1] font-bold">
        {filtered ? "No orders match." : "No orders yet."}
      </h2>
      {filtered && (
        <button
          type="button"
          onClick={onClear}
          className="border-b-2 border-foreground pb-0.5 font-sans text-[13px] font-bold tracking-[1.5px] uppercase transition-colors hover:border-gold hover:text-gold"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

const sk = "bg-card"

export function OrdersLoading() {
  return (
    <div aria-busy="true" aria-label="Loading orders">
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-surface-variant py-5">
        <div className="h-12 flex-[1_1_240px] border-2 border-surface-variant" />
        <div className="h-12 w-[420px] border-2 border-surface-variant max-sm:w-full" />
        <div className="h-12 w-[160px] border-2 border-surface-variant" />
        <div className="h-12 w-[160px] border-2 border-surface-variant" />
      </div>
      <OrdersTableHead muted />
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 150}ms` }}
          className={cn(
            orderColumns,
            "grid animate-[xii-pulse_1.4s_ease-in-out_infinite] grid-cols-2 gap-4 border-b-2 border-surface-variant py-[18px]"
          )}
        >
          <div className="flex flex-col gap-2">
            <div className={cn(sk, "h-4 w-28")} />
            <div className={cn(sk, "h-2.5 w-20")} />
          </div>
          <div className="flex flex-col gap-2 max-xl:col-span-2">
            <div className={cn(sk, "h-4 w-[55%]")} />
            <div className={cn(sk, "h-2.5 w-[70%]")} />
          </div>
          <div className="flex items-center gap-3 max-xl:col-span-2">
            <div className={cn(sk, "size-11")} />
            <div className={cn(sk, "h-3 w-[60%]")} />
          </div>
          <div className={cn(sk, "h-5 w-20")} />
          <div className={cn(sk, "h-4 w-24 xl:justify-self-end")} />
        </div>
      ))}
    </div>
  )
}
