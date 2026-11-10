"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { btn, btnGold } from "../styles"
import { UsersTableHead, userColumns } from "./users-table"

const panel =
  "relative flex min-h-[420px] flex-col items-center justify-center gap-4 overflow-hidden border-b-2 border-surface-variant px-4 py-12 text-center"
const kicker = "relative font-mono text-xs tracking-[1px] uppercase"
const title =
  "relative max-w-[560px] font-heading text-[clamp(32px,4vw,48px)] leading-[1.05] font-bold tracking-[-0.02em] text-pretty"
const body =
  "relative max-w-[440px] text-base leading-6 text-pretty text-muted-foreground"

export function UsersError({
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
      <span className={cn(kicker, "text-danger")}>ERR — Users unavailable</span>
      <h2 className={title}>We couldn&apos;t load the users.</h2>
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

export function UsersNoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <span className="font-mono text-xs tracking-[1px] text-gold">
        00 RESULTS
      </span>
      <h2 className="font-heading text-[32px] leading-[1.1] font-bold">
        No users match.
      </h2>
      <button
        type="button"
        onClick={onClear}
        className="border-b-2 border-foreground pb-0.5 font-sans text-[13px] font-bold tracking-[1.5px] uppercase transition-colors hover:border-gold hover:text-gold"
      >
        Clear filters
      </button>
    </div>
  )
}

const sk = "bg-card"

export function UsersLoading() {
  return (
    <div aria-busy="true" aria-label="Loading users">
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-surface-variant py-5">
        <div className="h-12 flex-[1_1_240px] border-2 border-surface-variant" />
        <div className="h-12 w-[160px] border-2 border-surface-variant" />
        <div className="h-12 w-[330px] border-2 border-surface-variant max-sm:w-full" />
      </div>
      <UsersTableHead muted />
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 150}ms` }}
          className={cn(
            userColumns,
            "grid animate-[xii-pulse_1.4s_ease-in-out_infinite] grid-cols-2 gap-4 border-b-2 border-surface-variant py-[18px]"
          )}
        >
          <div className="col-span-2 flex flex-col gap-2 xl:col-span-1">
            <div className={cn(sk, "h-[18px] w-[55%]")} />
            <div className={cn(sk, "h-2.5 w-[70%]")} />
          </div>
          <div className={cn(sk, "h-4 w-20")} />
          <div className={cn(sk, "h-3 w-20")} />
          <div className={cn(sk, "h-4 w-8 xl:justify-self-end")} />
          <div className={cn(sk, "h-4 w-20 xl:justify-self-end")} />
          <div className={cn(sk, "h-3 w-20 xl:justify-self-end")} />
        </div>
      ))}
    </div>
  )
}
