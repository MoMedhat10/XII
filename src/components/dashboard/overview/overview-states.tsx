"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { btn, btnGold } from "../styles"

export function OverviewError({
  message,
  retrying,
  onRetry,
}: {
  message?: string
  retrying: boolean
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      className="flex min-h-[420px] flex-col items-center justify-center gap-4 border-b-2 border-surface-variant px-4 py-12 text-center"
    >
      <span className="font-mono text-xs tracking-[1px] text-danger uppercase">
        ERR — Overview unavailable
      </span>
      <h2 className="max-w-[560px] font-heading text-[clamp(32px,4vw,48px)] leading-[1.05] font-bold tracking-[-0.02em] text-pretty">
        We couldn&apos;t load the overview.
      </h2>
      <p className="max-w-[440px] text-base leading-6 text-pretty text-muted-foreground">
        {message ?? "The server didn't respond."}
      </p>
      <Button
        type="button"
        disabled={retrying}
        onClick={onRetry}
        className={cn(btn, btnGold, "mt-2 px-7")}
      >
        <span aria-hidden="true" className={cn(retrying && "animate-spin")}>
          ↻
        </span>
        {retrying ? "Retrying…" : "Retry"}
      </Button>
    </div>
  )
}

const pulse = "animate-[xii-pulse_1.4s_ease-in-out_infinite] bg-card"

export function OverviewLoading() {
  return (
    <div aria-busy="true" aria-label="Loading overview">
      <div className="grid grid-cols-2 border-b-2 border-surface-variant xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3 py-6 pr-4">
            <div className={cn(pulse, "h-2.5 w-20")} />
            <div className={cn(pulse, "h-10 w-36")} />
            <div className={cn(pulse, "h-2.5 w-28")} />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 border-b-2 border-surface-variant py-6">
        <div className={cn(pulse, "h-2.5 w-48")} />
        <div className={cn(pulse, "h-[280px]")} />
      </div>
      <div className="grid gap-10 py-8 xl:grid-cols-2">
        <div className={cn(pulse, "h-64")} />
        <div className={cn(pulse, "h-64")} />
      </div>
    </div>
  )
}
