import { cn } from "@/lib/utils"

import { gutter } from "../home/styles"

/** The closing strip on every customer page. */
export function SiteFooter() {
  return (
    <footer className="border-t-4 bg-background">
      <div
        className={cn(
          gutter,
          "flex flex-wrap justify-between gap-4 py-6 font-mono text-[11px] tracking-[.2em] text-muted-foreground uppercase"
        )}
      >
        <span>© 2026 XII — The Luxury Timepiece Archive</span>
        <span>Armored courier · Ferrari Group / Malca-Amit</span>
        <span>USD $ · EUR € · GBP £ · CHF Fr · JPY ¥</span>
      </div>
    </footer>
  )
}
