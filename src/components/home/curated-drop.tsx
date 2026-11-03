import type { CatalogWatch } from "@/app/(app)/watches/_data/types"
import { WatchCard } from "@/components/watches/watch-card"
import { cn } from "@/lib/utils"

import { Reveal } from "./reveal"
import { SectionHeader } from "./section-header"
import { gutter } from "./styles"

export function CuratedDrop({ watches }: { watches: CatalogWatch[] }) {
  return (
    <section id="drop" className={cn(gutter, "py-32")}>
      <Reveal>
        <SectionHeader
          eyebrowText="02 — Curated Drop"
          title="The Autumn Exhibit"
          href="/watches"
          linkLabel="View all timepieces →"
        />
      </Reveal>

      {watches.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-8">
          {watches.map((w, i) => (
            <Reveal key={w.id} delay={i * 120} className="h-full">
              <WatchCard watch={w} sizes="(min-width: 1024px) 33vw, 100vw" />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}
