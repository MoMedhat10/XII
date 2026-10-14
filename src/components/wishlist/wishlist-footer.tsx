import { cn } from "@/lib/utils"

import { gutter } from "../home/styles"

export function WishlistFooter() {
  return (
    <footer id="footer" className="border-t-4 bg-background">
      <div className="border-t-4">
        <div
          className={cn(
            gutter,
            "flex flex-wrap justify-between gap-4 py-6 font-mono text-[11px] tracking-[.2em] text-muted-foreground uppercase"
          )}
        >
          <span>© 2026 XII — The Luxury Timepiece Archive</span>
          <span>Saved pieces are held for 30 days</span>
          <span>USD $ · EUR € · GBP £ · CHF Fr · JPY ¥</span>
        </div>
      </div>
    </footer>
  )
}
