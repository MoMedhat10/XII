import { gutter } from "@/components/home/styles"
import { cn } from "@/lib/utils"

const pulse = "animate-[xii-pulse_1.4s_ease-in-out_infinite] bg-surface-dim"

/** Skeleton in the shape of the gallery and buy panel. */
export function WatchLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading watch"
      className={cn(
        gutter,
        "flex flex-col gap-10 pt-20 pb-30 sm:pt-28 lg:flex-row lg:items-start"
      )}
    >
      <div className="flex min-w-0 gap-4 lg:flex-1">
        <div className="flex w-16 shrink-0 flex-col gap-3 sm:w-24">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 150}ms` }}
              className={cn(pulse, "aspect-square")}
            />
          ))}
        </div>
        <div
          className={cn(
            pulse,
            "aspect-4/5 max-h-[calc(100vh-220px)] flex-1 border-4 border-surface-variant"
          )}
        />
      </div>

      <div
        style={{ animationDelay: "200ms" }}
        className="flex w-full max-w-[440px] animate-[xii-pulse_1.4s_ease-in-out_infinite] flex-col gap-3.5 border-4 border-surface-variant p-7 lg:w-[clamp(340px,30vw,440px)]"
      >
        <span className="h-3.5 w-[30%] bg-surface-dim" />
        <span className="h-12 w-[85%] bg-surface-dim" />
        <span className="h-3 w-[40%] bg-surface-dim" />
        <span className="mt-3 h-8 w-[45%] bg-surface-dim" />
        <span className="mt-6 h-[60px] bg-surface-dim" />
        <span className="h-14 bg-surface-dim" />
      </div>
    </section>
  )
}
