"use client"

import { useTransition } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { TableHead, tableColumns } from "./watches-table"
import { btn, btnGold, btnOutline } from "./watch-utils"

const panel =
  "relative flex min-h-[460px] flex-col items-center justify-center gap-4 overflow-hidden border-b-2 border-surface-variant px-4 py-12 text-center sm:min-h-[520px]"
const kicker = "relative font-mono text-xs tracking-[1px] text-gold uppercase"
const title =
  "relative max-w-[560px] font-heading text-[clamp(32px,4vw,48px)] leading-[1.05] font-bold tracking-[-0.02em] text-pretty"
const body =
  "relative max-w-[440px] text-base leading-6 text-pretty text-muted-foreground"
const dial =
  "circle absolute aspect-square w-[min(420px,90vw)] border-2 border-dashed border-surface-variant"

export function WatchesError({ onRetry }: { onRetry: () => void }) {
  const [retrying, startTransition] = useTransition()

  return (
    <div role="alert" className={panel}>
      <div aria-hidden="true" className={dial} />
      <div
        aria-hidden="true"
        className="absolute h-[170px] w-1 origin-bottom -translate-y-[85px] -rotate-[52deg] bg-gold"
      />
      <div
        aria-hidden="true"
        className="absolute h-[120px] w-1 origin-bottom -translate-y-[60px] rotate-[122deg] bg-foreground"
      />
      <span className={kicker}>ERR · 503 — Inventory unavailable</span>
      <h2 className={title}>We couldn&apos;t load the watches.</h2>
      <p className={body}>
        The catalog service didn&apos;t respond. Nothing was changed — your
        inventory is safe.
      </p>
      <div className="relative mt-2 flex flex-wrap justify-center gap-3">
        <Button
          type="button"
          disabled={retrying}
          onClick={() => startTransition(onRetry)}
          className={cn(btn, btnGold, "px-7")}
        >
          <span aria-hidden="true" className={cn(retrying && "animate-spin")}>
            ↻
          </span>
          {retrying ? "Retrying…" : "Retry"}
        </Button>
        <Link
          href="/"
          className={cn(
            btn,
            btnOutline,
            "inline-flex items-center border-4 transition-colors"
          )}
        >
          View store
        </Link>
      </div>
    </div>
  )
}

export function WatchesEmpty({
  hasBrands,
  onNewWatch,
  onNewBrand,
  onOpenBrands,
}: {
  hasBrands: boolean
  onNewWatch: () => void
  onNewBrand: () => void
  onOpenBrands: () => void
}) {
  return (
    <div className={panel}>
      <div
        aria-hidden="true"
        className={cn(dial, "animate-[spin_60s_linear_infinite]")}
      />
      <div
        aria-hidden="true"
        className="relative flex size-16 items-center justify-center border-4 font-heading text-[28px] font-bold"
      >
        +
      </div>
      <span className={kicker}>Inventory · 00 References</span>
      <h2 className={title}>The vault is empty.</h2>
      <p className={body}>
        {hasBrands
          ? "No references yet. Add your first watch — upload its images right from the table once it's created."
          : "Watches belong to a brand. Create your first maison, then add references to it."}
      </p>
      <div className="relative mt-2 flex flex-wrap justify-center gap-3">
        {hasBrands ? (
          <>
            <Button
              type="button"
              onClick={onNewWatch}
              className={cn(btn, btnGold, "px-7")}
            >
              + Add first watch
            </Button>
            <Button
              type="button"
              onClick={onOpenBrands}
              className={cn(btn, btnOutline)}
            >
              Manage brands
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={onNewBrand}
            className={cn(btn, btnGold, "px-7")}
          >
            + Create a brand
          </Button>
        )}
      </div>
    </div>
  )
}

export function WatchesNoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <span className="font-mono text-xs tracking-[1px] text-gold">
        00 RESULTS
      </span>
      <h2 className="font-heading text-[32px] leading-[1.1] font-bold">
        No references match.
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

export function WatchesLoading() {
  return (
    <div aria-busy="true" aria-label="Loading inventory">
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-surface-variant py-5">
        <div className="h-12 flex-[1_1_260px] border-2 border-surface-variant" />
        <div className="h-12 w-[180px] flex-1 border-2 border-surface-variant sm:flex-none" />
        <div className="h-12 w-[190px] border-2 border-surface-variant max-sm:w-full" />
      </div>
      <TableHead muted />
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 150}ms` }}
          className={cn(
            tableColumns,
            "grid animate-[xii-pulse_1.4s_ease-in-out_infinite] grid-cols-[minmax(0,1fr)_auto] gap-4 border-b-2 border-surface-variant py-[18px] lg:items-center"
          )}
        >
          <div className="col-span-2 row-start-3 flex gap-1.5 lg:col-span-1 lg:row-start-auto">
            <div className={cn(sk, "size-12")} />
            <div className={cn(sk, "size-12")} />
            <div className="size-12 border-2 border-dashed border-surface-variant" />
          </div>
          <div className="flex flex-col gap-2">
            <div className={cn(sk, "h-[18px] w-[70%]")} />
            <div className={cn(sk, "h-2.5 w-[40%]")} />
          </div>
          <div className={cn(sk, "hidden h-3 w-[65%] lg:block")} />
          <div className="col-span-2 row-start-2 flex items-center justify-between lg:contents">
            <div className={cn(sk, "h-4 w-20 lg:justify-self-end")} />
            <div className={cn(sk, "h-3.5 w-[34px] lg:justify-self-end")} />
            <div className="h-7 w-[52px] border-2 border-surface-variant" />
          </div>
          <div className="col-start-2 row-start-1 size-11 justify-self-end border-2 border-surface-variant lg:col-start-auto lg:row-start-auto" />
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-7">
        <span className="flex items-center gap-2.5 font-mono text-xs tracking-[1px] text-gold uppercase">
          <span
            aria-hidden="true"
            className="circle size-3.5 animate-spin border-2 border-gold border-t-transparent"
          />
          Loading inventory…
        </span>
        <div className="h-[52px] w-[260px] border-4 border-surface-variant max-sm:w-full" />
      </div>
    </div>
  )
}
