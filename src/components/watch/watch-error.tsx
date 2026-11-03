import { button, eyebrow, gutter } from "@/components/home/styles"
import { cn } from "@/lib/utils"

/** The page failed to load, e.g. the database is unreachable. */
export function WatchError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className={cn(gutter, "pt-20 pb-30 sm:pt-28")}>
      <div className="flex flex-col items-center gap-5 border-4 border-foreground bg-[#141515] px-8 py-24 text-center">
        <span className={eyebrow}>Something went wrong</span>
        <h2 className="font-heading text-[clamp(32px,3.4vw,48px)] leading-[1.05] font-bold tracking-[-0.02em] text-balance">
          This piece couldn&apos;t be loaded.
        </h2>
        <p className="max-w-[460px] font-sans text-lg leading-7 text-pretty text-muted-foreground">
          Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            button,
            "cursor-pointer border-foreground bg-foreground text-black hover:bg-background hover:text-foreground"
          )}
        >
          Retry
        </button>
      </div>
    </section>
  )
}
