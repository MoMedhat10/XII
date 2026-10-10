import { ImageFallback } from "@/components/image-fallback"

import { Reveal } from "./reveal"
import { SectionHeader } from "./section-header"
import { gutter } from "./styles"
import { cn } from "@/lib/utils"

const drop = [
  {
    ref: "Reference 101",
    name: "Chronograph I",
    price: "$12,400",
    chip: "New Arrival",
    caliber: "XII-01 Automatic",
    case: "316L Brushed Steel",
    image: "/images/watch-chronograph.jpg",
  },
  {
    ref: "Reference 207",
    name: "Tourbillon II",
    price: "$48,000",
    chip: "Rare",
    caliber: "XII-T2 Flying Tourbillon",
    case: "Grade 5 Titanium",
  },
  {
    ref: "Reference 312",
    name: "Automatic III",
    price: "$8,900",
    chip: "New Arrival",
    caliber: "XII-03 Micro-rotor",
    case: "Blackened Steel",
  },
]

export function CuratedDrop() {
  return (
    <section id="drop" className={cn(gutter, "py-32")}>
      <Reveal>
        <SectionHeader
          eyebrowText="02 — Curated Drop"
          title="The Autumn Exhibit"
          href="/#drop"
          linkLabel="View all timepieces →"
        />
      </Reveal>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-8">
        {drop.map((w, i) => (
          <Reveal key={w.name} delay={i * 120} className="h-full">
            <article className="h-full cursor-pointer border-4 bg-card text-foreground transition-colors duration-200 hover:bg-foreground hover:text-black">
              <ImageFallback
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                src={w.image}
                alt={w.name}
                chip={w.chip}
                wrapperClassName="aspect-[4/5] border-b-4"
                className="object-cover"
              />
              <div className="flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="block font-sans text-sm leading-5 tracking-[0.1em] uppercase">
                      {w.ref}
                    </span>
                    <h3 className="font-heading text-[28px] leading-[34px] font-semibold">
                      {w.name}
                    </h3>
                  </div>
                  <span className="font-heading text-lg leading-6 font-bold tracking-[1.5px] whitespace-nowrap text-gold">
                    {w.price}
                  </span>
                </div>
                <dl className="flex flex-col gap-2 border-t-2 border-current pt-4 font-sans text-base leading-[26px]">
                  <div className="flex justify-between">
                    <dt>Caliber</dt>
                    <dd className="font-semibold">{w.caliber}</dd>
                  </div>
                  <div className="flex justify-between border-t-2 border-current pt-2">
                    <dt>Case</dt>
                    <dd className="font-semibold">{w.case}</dd>
                  </div>
                </dl>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
