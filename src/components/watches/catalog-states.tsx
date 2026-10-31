import { cn } from "@/lib/utils"

import { button } from "../home/styles"

export const catalogGrid =
  "grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6"

export function CardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="animate-[xii-pulse_1.4s_ease-in-out_infinite] border-4 border-surface-variant"
    >
      <div className="aspect-[4/5] border-b-4 border-surface-variant bg-card" />
      <div className="flex flex-col gap-2.5 px-5 pt-4 pb-5">
        <span className="h-3 w-2/5 bg-card" />
        <span className="h-6 w-3/4 bg-card" />
      </div>
    </div>
  )
}

export function CatalogLoading() {
  return (
    <div aria-busy="true" aria-label="Loading watches" className={catalogGrid}>
      {Array.from({ length: 6 }, (_, i) => (
        <CardSkeleton key={i} delay={i * 150} />
      ))}
    </div>
  )
}

function Dial() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
      className="absolute top-1/2 left-1/2 -mt-60 -ml-60 w-[480px] animate-[xii-spin_90s_linear_infinite] opacity-[0.14]"
    >
      <circle cx="200" cy="200" r="185" />
      <circle cx="200" cy="200" r="172" strokeDasharray="4 4" />
      <circle cx="200" cy="200" r="120" strokeDasharray="6 3" />
      <circle cx="200" cy="200" r="10" stroke="var(--gold)" strokeWidth="2" />
    </svg>
  )
}

const panel =
  "relative flex flex-col items-center gap-5 overflow-hidden border-4 bg-[#141515] px-8 py-24 text-center"
const panelEyebrow =
  "relative font-heading text-sm leading-6 font-bold tracking-[1.5px] text-gold uppercase"
const panelTitle =
  "relative font-heading text-[clamp(36px,4vw,56px)] leading-[1.05] font-bold tracking-[-0.02em] text-balance"
const panelBody =
  "relative max-w-[460px] font-sans text-xl leading-[30px] text-pretty text-muted-foreground"
const panelButton = cn(
  button,
  "relative cursor-pointer border-foreground bg-gold text-white hover:bg-black disabled:opacity-70"
)

export function CatalogNoMatch({
  query,
  onClear,
}: {
  query: string
  onClear: () => void
}) {
  return (
    <div className={panel}>
      <Dial />
      <span className={panelEyebrow}>0 results</span>
      <h2 className={panelTitle}>
        {query
          ? `Nothing matches “${query}”.`
          : "No pieces match these filters."}
      </h2>
      <p className={panelBody}>
        Try a different name, widen the price range, or remove a brand filter.
      </p>
      <button type="button" onClick={onClear} className={panelButton}>
        Clear all filters
      </button>
    </div>
  )
}

export function CatalogError({
  retrying,
  onRetry,
}: {
  retrying: boolean
  onRetry: () => void
}) {
  return (
    <div role="alert" className={cn(panel, "border-gold")}>
      <span className={panelEyebrow}>Error 503 · Movement stopped</span>
      <h2 className={panelTitle}>The catalog couldn&apos;t be loaded.</h2>
      <p className={panelBody}>
        Check your connection and try again in a moment.
      </p>
      <button
        type="button"
        disabled={retrying}
        onClick={onRetry}
        className={panelButton}
      >
        {retrying ? "Retrying…" : "Retry"}
      </button>
    </div>
  )
}

/** Suspense fallback for the whole page while the URL is read on the client. */
export function CatalogPageFallback() {
  return (
    <div className="mx-auto max-w-[1440px] px-[clamp(24px,4.4vw,64px)] pt-20 pb-30 sm:pt-28">
      <div className="mb-8 flex flex-col gap-3">
        <span className="h-6 w-32 animate-[xii-pulse_1.4s_ease-in-out_infinite] bg-card" />
        <span className="h-[clamp(48px,6vw,88px)] w-[min(520px,80vw)] animate-[xii-pulse_1.4s_ease-in-out_infinite] bg-card" />
      </div>
      <div className="mb-10 h-[72px] border-4 border-surface-variant" />
      <CatalogLoading />
    </div>
  )
}
